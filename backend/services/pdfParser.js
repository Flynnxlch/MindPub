const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// For rendering PDF page as image (optional, only if canvas is available)
let pdfjsLib = null;
let canvas = null;
try {
  // Try to load pdfjs-dist and canvas for image rendering
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  canvas = require('canvas');
} catch (err) {
  console.warn('pdfjs-dist or canvas not available. PDF cover extraction will be disabled.');
  console.warn('To enable PDF cover extraction, install: npm install pdfjs-dist canvas');
}

class PDFParser {
  /**
   * Parse PDF file dan extract metadata + content per halaman
   */
  static async parse(filePath) {
    try {
      // Verify file exists
      try {
        await fs.access(filePath);
      } catch (err) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
      
      // Read PDF file
      const dataBuffer = await fs.readFile(filePath);
      console.log('PDF file size:', dataBuffer.length, 'bytes');
      
      if (dataBuffer.length === 0) {
        throw new Error('PDF file is empty');
      }
      
      // Try multiple parsing methods to get page count
      let data = null;
      let totalPages = 0;
      
      // Method 1: Parse with pdf-parse
      try {
        const parsePromise = pdf(dataBuffer, {
          max: 0, // Parse all pages
          version: 'default'
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('PDF parsing timeout after 30 seconds')), 30000);
        });
        
        data = await Promise.race([parsePromise, timeoutPromise]);
        
        console.log('PDF parsed successfully:', {
          numpages: data.numpages,
          hasText: !!data.text,
          textLength: data.text?.length || 0,
          info: data.info
        });
        
        totalPages = data.numpages || 0;
      } catch (parseError) {
        console.error('Error parsing PDF with pdf-parse:', parseError);
        throw parseError;
      }
      
      // Method 2: If numpages is 0, try using pdf-lib to get accurate page count
      if (totalPages === 0) {
        console.warn('PDF numpages is 0, attempting to count pages using pdf-lib...');
        try {
          const pdfDoc = await PDFDocument.load(dataBuffer);
          const pageCount = pdfDoc.getPageCount();
          if (pageCount > 0) {
            console.log('Found page count using pdf-lib:', pageCount);
            totalPages = pageCount;
          }
        } catch (pdfLibError) {
          console.warn('Could not get page count using pdf-lib:', pdfLibError.message);
          
          // Fallback: Try to count pages by parsing PDF structure
          try {
            const pdfString = dataBuffer.toString('binary');
            // Look for /Count pattern in PDF structure
            const countMatches = pdfString.match(/\/Count\s+(\d+)/g);
            if (countMatches && countMatches.length > 0) {
              const counts = countMatches.map(m => parseInt(m.match(/\d+/)[0]));
              const maxCount = Math.max(...counts);
              if (maxCount > 0) {
                console.log('Found page count from PDF structure:', maxCount);
                totalPages = maxCount;
              }
            }
            
            // Alternative: Look for /Type /Page pattern
            if (totalPages === 0) {
              const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
              if (pageMatches && pageMatches.length > 0) {
                console.log('Found pages from /Type /Page pattern:', pageMatches.length);
                totalPages = pageMatches.length;
              }
            }
          } catch (structError) {
            console.warn('Could not extract page count from PDF structure:', structError.message);
          }
        }
      }
      
      // Extract metadata
      const metadata = {
        title: data.info?.Title || 'Unknown Title',
        author: data.info?.Author || 'Unknown Author',
        description: data.info?.Subject || '',
        creator: data.info?.Creator || '',
        producer: data.info?.Producer || '',
        created: data.info?.CreationDate || null,
        modified: data.info?.ModDate || null
      };
      
      // Extract text per page
      const pages = await this.extractPages(dataBuffer);
      console.log('Extracted pages:', pages.length);
      
      // If totalPages is still 0 but we have text, try to estimate pages
      if (totalPages === 0 && data.text && data.text.length > 0) {
        console.warn('PDF numpages is 0 but text exists. Estimating pages from text length...');
        // Estimate: average 2000 characters per page
        const estimatedPages = Math.max(1, Math.ceil(data.text.length / 2000));
        totalPages = estimatedPages;
        console.log('Estimated pages from text:', totalPages);
        
        // Re-extract pages with estimated count
        if (pages.length === 0) {
          const estimatedPages = this.splitTextIntoPages(data.text, totalPages);
          pages.push(...estimatedPages);
        }
      }
      
      // Final fallback: use pages array length
      if (totalPages === 0 && pages.length > 0) {
        totalPages = pages.length;
        console.log('Using pages array length as total:', totalPages);
      }
      
      console.log('Final total pages calculated:', totalPages);
      
      if (totalPages === 0) {
        throw new Error('Could not determine page count from PDF. File may be corrupted or empty.');
      }
      
      return {
        metadata,
        pages,
        totalPages: totalPages
      };
      
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Extract first page of PDF as cover image
   * Returns image buffer (PNG format)
   */
  static async extractCoverImage(filePath) {
    try {
      // If pdfjs-dist or canvas not available, return null
      if (!pdfjsLib || !canvas) {
        console.warn('pdfjs-dist or canvas not available. Cannot extract PDF cover.');
        return null;
      }

      // Read PDF file
      const dataBuffer = await fs.readFile(filePath);
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: dataBuffer,
        verbosity: 0
      });
      
      const pdfDocument = await loadingTask.promise;
      
      // Get first page
      const page = await pdfDocument.getPage(1);
      
      // Calculate viewport (use reasonable size for cover)
      const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for good quality
      
      // Create canvas
      const canvasNode = canvas.createCanvas(viewport.width, viewport.height);
      const context = canvasNode.getContext('2d');
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to PNG buffer
      const imageBuffer = canvasNode.toBuffer('image/png');
      
      console.log('PDF cover image extracted successfully, size:', imageBuffer.length, 'bytes');
      
      return imageBuffer;
      
    } catch (error) {
      console.error('Error extracting PDF cover image:', error);
      return null;
    }
  }

  /**
   * Extract text per halaman dari PDF
   */
  static async extractPages(dataBuffer) {
    try {
      // Parse dengan pdf-parse untuk mendapatkan info dasar
      const data = await pdf(dataBuffer);
      let totalPages = data.numpages || 0;
      
      console.log('Extracting pages, total pages from metadata:', totalPages);
      
      // If numpages is 0, try to estimate from text
      if (totalPages === 0 && data.text && data.text.length > 0) {
        console.warn('PDF numpages is 0 but text exists. Estimating from text length...');
        totalPages = Math.max(1, Math.ceil(data.text.length / 2000));
        console.log('Estimated total pages:', totalPages);
      }
      
      if (totalPages === 0) {
        console.warn('WARNING: PDF has 0 pages detected and no text content!');
        // Still try to return at least one page if text exists
        if (data.text && data.text.length > 0) {
          console.log('Creating single page from available text...');
          return [{
            pageNumber: 1,
            content: data.text.substring(0, 5000) // First 5000 chars
          }];
        }
        return [];
      }
      
      const pages = [];
      
      // Untuk performa, kita split full text menjadi pages
      // Karena pdf-parse tidak support native per-page extraction dengan mudah
      if (data.text && data.text.length > 0) {
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const pageContent = this.extractPageContent(data.text, pageNum, totalPages);
          
          pages.push({
            pageNumber: pageNum,
            content: pageContent.trim()
          });
        }
      } else {
        // Jika tidak ada text, buat empty pages
        console.warn('WARNING: PDF has no extractable text content!');
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          pages.push({
            pageNumber: pageNum,
            content: `Page ${pageNum} (No text content available)`
          });
        }
      }
      
      console.log('Extracted', pages.length, 'pages');
      return pages;
      
    } catch (error) {
      console.error('Error extracting pages:', error);
      
      // Fallback: split full text menjadi chunks
      try {
        const data = await pdf(dataBuffer);
        const totalPages = data.numpages || 0;
        if (totalPages > 0 && data.text) {
          return this.splitTextIntoPages(data.text, totalPages);
        }
        return [];
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Extract content untuk page tertentu dari full text
   * (approximation karena pdf-parse tidak support native per-page)
   */
  static extractPageContent(fullText, pageNum, totalPages) {
    // Split text secara merata berdasarkan jumlah halaman
    const avgPageLength = Math.ceil(fullText.length / totalPages);
    const startPos = (pageNum - 1) * avgPageLength;
    const endPos = Math.min(startPos + avgPageLength, fullText.length);
    
    let pageText = fullText.substring(startPos, endPos);
    
    // Try to break at paragraph boundaries
    if (pageNum < totalPages) {
      const lastNewline = pageText.lastIndexOf('\n\n');
      if (lastNewline > avgPageLength * 0.7) { // At least 70% of page
        pageText = pageText.substring(0, lastNewline);
      }
    }
    
    return pageText;
  }

  /**
   * Split full text menjadi pages (fallback method)
   */
  static splitTextIntoPages(fullText, numPages) {
    const pages = [];
    const avgPageLength = Math.ceil(fullText.length / numPages);
    
    let currentPos = 0;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const endPos = Math.min(currentPos + avgPageLength, fullText.length);
      let pageText = fullText.substring(currentPos, endPos);
      
      // Try to break at paragraph boundaries
      if (pageNum < numPages) {
        const lastNewline = pageText.lastIndexOf('\n\n');
        if (lastNewline > avgPageLength * 0.7) {
          pageText = pageText.substring(0, lastNewline);
          currentPos += lastNewline;
        } else {
          currentPos = endPos;
        }
      } else {
        currentPos = endPos;
      }
      
      pages.push({
        pageNumber: pageNum,
        content: pageText.trim()
      });
    }
    
    return pages;
  }

  /**
   * Get page count dari PDF file
   */
  static async getPageCount(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      
      // Try pdf-parse first
      const data = await pdf(dataBuffer, { max: 0 });
      let pageCount = data.numpages || 0;
      console.log('PDF page count from pdf-parse:', pageCount);
      
      // If 0, try pdf-lib
      if (pageCount === 0) {
        try {
          const pdfDoc = await PDFDocument.load(dataBuffer);
          pageCount = pdfDoc.getPageCount();
          console.log('PDF page count from pdf-lib:', pageCount);
        } catch (pdfLibError) {
          console.warn('pdf-lib failed, using pdf-parse result:', pdfLibError.message);
        }
      }
      
      return pageCount;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  }

  /**
   * Extract single page content
   */
  static async getSinglePage(filePath, pageNumber) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      
      const pages = this.splitTextIntoPages(data.text, data.numpages);
      return pages[pageNumber - 1];
      
    } catch (error) {
      console.error('Error getting single page:', error);
      return null;
    }
  }
}

module.exports = PDFParser;

