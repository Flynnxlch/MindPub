const fs = require('fs').promises;
const path = require('path');
const JSZip = require('jszip');
const xml2js = require('xml2js');

class EPUBParser {
  /**
   * Parse EPUB file dan extract metadata + content per halaman
   */
  static async parse(filePath) {
    try {
      // Verify file exists
      try {
        await fs.access(filePath);
      } catch (err) {
        throw new Error(`EPUB file not found: ${filePath}`);
      }
      
      // Read EPUB file (EPUB is a ZIP file)
      const buffer = await fs.readFile(filePath);
      console.log('EPUB file size:', buffer.length, 'bytes');
      
      if (buffer.length === 0) {
        throw new Error('EPUB file is empty');
      }
      
      // Add timeout for ZIP loading
      const zipPromise = JSZip.loadAsync(buffer);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('EPUB loading timeout after 30 seconds')), 30000);
      });
      
      const zip = await Promise.race([zipPromise, timeoutPromise]);
      
      // Read META-INF/container.xml to find OPF file
      const containerXml = await zip.file('META-INF/container.xml').async('string');
      const container = await xml2js.parseStringPromise(containerXml);
      const opfPath = container.container.rootfiles[0].rootfile[0].$['full-path'];
      console.log('OPF path:', opfPath);
      
      // Read OPF file (package.opf)
      const opfXml = await zip.file(opfPath).async('string');
      const opf = await xml2js.parseStringPromise(opfXml);
      
      // Extract metadata - support all EPUB metadata fields
      const metadataObj = opf.package.metadata[0];
      
      // Debug: log raw metadata structure
      console.log('Raw metadata object keys:', Object.keys(metadataObj));
      if (metadataObj.title) {
        console.log('Raw title:', JSON.stringify(metadataObj.title, null, 2));
      }
      if (metadataObj.creator) {
        console.log('Raw creator:', JSON.stringify(metadataObj.creator, null, 2));
      }
      
      // Extract identifier (usually UUID or ISBN)
      const identifier = this.getMetadataValue(metadataObj, 'identifier') || null;
      
      // Try multiple methods to extract title and author
      let title = this.getMetadataValue(metadataObj, 'title');
      if (!title || title === 'Unknown Title') {
        // Try dc:title or just title
        title = this.getMetadataValue(metadataObj, 'dc:title') || title;
      }
      
      let author = this.getMetadataValue(metadataObj, 'creator');
      if (!author || author === 'Unknown Author') {
        // Try dc:creator or just creator
        author = this.getMetadataValue(metadataObj, 'dc:creator') || author;
        // Sometimes author is in a different format
        if (!author || author === 'Unknown Author') {
          const creators = this.getMetadataArray(metadataObj, 'creator');
          if (creators && creators.length > 0) {
            author = creators[0];
          }
        }
      }
      
      const metadata = {
        title: title || 'Unknown Title',
        author: author || 'Unknown Author',
        description: this.getMetadataValue(metadataObj, 'description') || this.getMetadataValue(metadataObj, 'dc:description') || '',
        language: this.getMetadataValue(metadataObj, 'language') || this.getMetadataValue(metadataObj, 'dc:language') || 'en',
        publisher: this.getMetadataValue(metadataObj, 'publisher') || this.getMetadataValue(metadataObj, 'dc:publisher') || '',
        published: this.getMetadataValue(metadataObj, 'date') || this.getMetadataValue(metadataObj, 'dc:date') || null,
        subject: this.getMetadataValue(metadataObj, 'subject') || this.getMetadataValue(metadataObj, 'dc:subject') || '',
        rights: this.getMetadataValue(metadataObj, 'rights') || this.getMetadataValue(metadataObj, 'dc:rights') || '',
        identifier: identifier,
        // Handle multiple subjects/tags
        tags: this.getMetadataArray(metadataObj, 'subject') || this.getMetadataArray(metadataObj, 'dc:subject') || []
      };
      console.log('EPUB metadata extracted:', {
        title: metadata.title,
        author: metadata.author,
        publisher: metadata.publisher,
        published: metadata.published,
        description: metadata.description ? metadata.description.substring(0, 100) + '...' : '',
        identifier: metadata.identifier
      });
      
      // SKIP SPINE - Extract all HTML/XHTML files directly from ZIP
      // This ensures we get all chapters, not just what's in the spine
      console.log('Scanning all files in EPUB for HTML/XHTML content...');
      
      const allFiles = Object.keys(zip.files);
      console.log('Total files in EPUB:', allFiles.length);
      
      // Find all HTML/XHTML files (excluding cover, toc, nav, etc.)
      // But be more lenient - only skip obvious non-content files
      const htmlFiles = allFiles.filter(filePath => {
        const lowerPath = filePath.toLowerCase();
        const fileName = path.basename(lowerPath);
        
        // Skip non-HTML files
        if (!lowerPath.endsWith('.html') && !lowerPath.endsWith('.xhtml') && !lowerPath.endsWith('.htm')) {
          return false;
        }
        
        // Skip only obvious non-content files (cover images, navigation, etc.)
        // Be more lenient to include all chapter content
        const skipPatterns = [
          'cover-image', 'coverimg', 'nav.xhtml', 'toc.ncx', 'ncx'
        ];
        
        // Only skip if it's clearly a navigation/cover file, not a chapter
        const shouldSkip = skipPatterns.some(pattern => 
          fileName.toLowerCase() === pattern || 
          (lowerPath.includes('/nav') && fileName.includes('nav')) ||
          (lowerPath.includes('toc.ncx'))
        );
        
        // Include all other HTML files as potential content
        return !shouldSkip;
      }).sort(); // Sort to ensure consistent order
      
      console.log(`Found ${htmlFiles.length} HTML/XHTML content files (excluding cover/toc/nav)`);
      
      // Extract each chapter separately - each chapter starts on a new page
      const chapters = [];
      
      for (let i = 0; i < htmlFiles.length; i++) {
        const filePath = htmlFiles[i];
        console.log(`Extracting content ${i + 1}/${htmlFiles.length}: ${filePath}`);
        
        try {
          const contentFile = zip.file(filePath);
          if (contentFile) {
            const htmlContent = await contentFile.async('string');
            const cleanContent = this.cleanHTML(htmlContent);
            
            if (cleanContent.trim().length > 0) {
              // Extract chapter title from HTML if possible
              let chapterTitle = `Chapter ${i + 1}`;
              let chapterNumber = i + 1;
              
              try {
                // Try to extract chapter number and title from HTML first
                let titleMatch = htmlContent.match(/<h1[^>]*>(?:CHAPTER|Chapter)\s+([IVX]+|[0-9]+)\.?\s*(.+?)<\/h1>/i) ||
                               htmlContent.match(/<h2[^>]*>(?:CHAPTER|Chapter)\s+([IVX]+|[0-9]+)\.?\s*(.+?)<\/h2>/i) ||
                               htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                
                if (titleMatch) {
                  if (titleMatch[1] && titleMatch[2]) {
                    // Has both number and title from HTML
                    chapterTitle = `CHAPTER ${titleMatch[1]}. ${titleMatch[2].trim()}`;
                    chapterNumber = this.parseChapterNumber(titleMatch[1]);
                  } else if (titleMatch[1]) {
                    // Just title from HTML
                    chapterTitle = titleMatch[1].trim();
                  }
                } else {
                  // Try to extract from clean content text
                  const chapterMatch = cleanContent.match(/(?:CHAPTER|Chapter)\s+([IVX]+|[0-9]+)\.?\s*(.+?)(?:\n|$)/i) ||
                                     cleanContent.match(/^([IVX]+|[0-9]+)\.\s*(.+?)(?:\n|$)/i);
                  
                  if (chapterMatch) {
                    if (chapterMatch[2]) {
                      // Has both number and title
                      chapterTitle = `CHAPTER ${chapterMatch[1]}. ${chapterMatch[2].trim()}`;
                      chapterNumber = this.parseChapterNumber(chapterMatch[1]);
                    } else if (chapterMatch[1]) {
                      // Just number
                      chapterTitle = `CHAPTER ${chapterMatch[1]}`;
                      chapterNumber = this.parseChapterNumber(chapterMatch[1]);
                    }
                  }
                }
              } catch (e) {
                // Ignore title extraction errors
                console.warn('Error extracting chapter title:', e.message);
              }
              
              chapters.push({
                number: chapterNumber,
                title: chapterTitle,
                content: cleanContent
              });
              
              const wordCount = this.countWords(cleanContent);
              console.log(`✓ Extracted: "${chapterTitle}" (${wordCount} words, ${cleanContent.length} chars)`);
            } else {
              console.warn(`Empty content in file: ${filePath}`);
            }
          } else {
            console.warn(`File not found in ZIP: ${filePath}`);
          }
        } catch (contentError) {
          console.error(`Error reading file ${filePath}:`, contentError.message);
        }
      }
      
      // Count total words
      const totalWords = chapters.reduce((sum, ch) => sum + this.countWords(ch.content), 0);
      console.log(`Total content extracted: ${totalWords} words from ${chapters.length} chapters`);
      
      // Split each chapter into pages with 300 words per page
      // Each chapter starts on a new page (chapter boundary preserved)
      const wordsPerPage = 300;
      const pages = [];
      let pageNumber = 1;
      
      for (const chapter of chapters) {
        const chapterPages = this.splitContentByWords(chapter.content, wordsPerPage, chapter.title, chapter.number);
        
        // Update page numbers and add chapter info
        for (const page of chapterPages) {
          page.pageNumber = pageNumber++;
          page.chapterNumber = chapter.number;
          page.chapterTitle = chapter.title;
          // Add chapter info at the beginning of content for display
          page.content = `[CHAPTER: ${chapter.title}]\n\n${page.content}`;
          pages.push(page);
        }
        
        console.log(`Chapter "${chapter.title}" split into ${chapterPages.length} pages`);
      }
      
      console.log(`Total pages created: ${pages.length} (${wordsPerPage} words per page, ${chapters.length} chapters)`);
      
      // For EPUB, total "pages" = number of pages after splitting by words
      const totalPages = pages.length;
      console.log('EPUB parsed successfully:', {
        totalPages,
        pagesExtracted: pages.length,
        htmlFilesFound: htmlFiles.length,
        totalWords: totalWords
      });
      
      // Try to extract cover image
      let coverImageBuffer = null;
      let coverImagePath = null;
      try {
        // Get manifest for cover extraction
        const manifest = opf.package.manifest[0].item || [];
        const manifestMap = {};
        manifest.forEach(item => {
          manifestMap[item.$.id] = {
            href: item.$.href,
            mediaType: item.$['media-type']
          };
        });
        
        const basePath = path.dirname(opfPath);
        
        // Look for cover in metadata
        let coverId = null;
        
        if (metadataObj.meta) {
          const coverMeta = metadataObj.meta.find(m => m.$ && m.$.name === 'cover');
          if (coverMeta) {
            coverId = coverMeta.$.content;
          }
        }
        
        // Also check for cover-image in manifest
        if (!coverId) {
          const coverItem = manifest.find(item => 
            item.$.id === 'cover-image' || 
            item.$.id === 'cover' ||
            (item.$['media-type'] && item.$['media-type'].startsWith('image/'))
          );
          if (coverItem) {
            coverId = coverItem.$.id;
          }
        }
        
        if (coverId) {
          const manifestItem = manifestMap[coverId];
          if (manifestItem) {
            const coverPath = path.join(basePath, manifestItem.href).replace(/\\/g, '/');
            const coverFile = zip.file(coverPath);
            
            if (coverFile) {
              coverImageBuffer = await coverFile.async('nodebuffer');
              coverImagePath = coverPath;
              console.log('Cover image extracted from EPUB:', coverPath);
            }
          }
        }
      } catch (coverError) {
        console.warn('Could not extract cover image:', coverError.message);
      }
      
      if (totalPages === 0) {
        console.warn('WARNING: EPUB has 0 pages extracted!');
        console.warn('Debug info:', {
          htmlFilesFound: htmlFiles.length,
          totalFilesInZip: allFiles.length,
          totalWords: totalWords
        });
        
        if (htmlFiles.length > 0 && totalPages === 0) {
          throw new Error(`EPUB parsing failed: Found ${htmlFiles.length} HTML files but could not extract content. File structure may be non-standard.`);
        } else if (totalPages === 0) {
          throw new Error('EPUB has no extractable content. File may be corrupted or empty.');
        }
      }
      
      return {
        metadata,
        pages,
        totalPages: totalPages,
        coverImage: coverImageBuffer,
        coverImagePath: coverImagePath
      };
      
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error(`Failed to parse EPUB: ${error.message}`);
    }
  }

  /**
   * Helper untuk extract metadata value
   */
  static getMetadataValue(metadataObj, key) {
    if (!metadataObj) return null;
    
    // Try exact key first
    let value = this.extractValueFromItem(metadataObj[key]);
    if (value) return value;
    
    // Try with 'dc:' prefix
    if (!key.startsWith('dc:')) {
      value = this.extractValueFromItem(metadataObj[`dc:${key}`]);
      if (value) return value;
    }
    
    // Try without 'dc:' prefix if key has it
    if (key.startsWith('dc:')) {
      const keyWithoutPrefix = key.replace('dc:', '');
      value = this.extractValueFromItem(metadataObj[keyWithoutPrefix]);
      if (value) return value;
    }
    
    return null;
  }
  
  /**
   * Extract value from a metadata item (handles various XML formats)
   */
  static extractValueFromItem(item) {
    if (!item) return null;
    
    // Handle array
    const items = Array.isArray(item) ? item : [item];
    if (items.length === 0) return null;
    
    // Get first item
    const firstItem = items[0];
    
    // Direct string value
    if (typeof firstItem === 'string') {
      return firstItem.trim();
    }
    
    // Object with text content in various formats
    if (typeof firstItem === 'object' && firstItem !== null) {
      // Try _ property (xml2js text content)
      if (firstItem._ && typeof firstItem._ === 'string') {
        return firstItem._.trim();
      }
      
      // Try $ property with value
      if (firstItem.$ && firstItem.$.value) {
        return String(firstItem.$.value).trim();
      }
      
      // Try direct string properties
      if (firstItem.value) {
        return String(firstItem.value).trim();
      }
      
      // Try to find any string property
      for (const prop in firstItem) {
        if (typeof firstItem[prop] === 'string' && prop !== '$') {
          const val = firstItem[prop].trim();
          if (val) return val;
        }
      }
    }
    
    return null;
  }

  /**
   * Helper untuk extract metadata array (for multiple values like subjects/tags)
   */
  static getMetadataArray(metadataObj, key) {
    if (!metadataObj) return [];
    
    // Try exact key first
    let items = metadataObj[key];
    if (!items) {
      // Try with 'dc:' prefix
      if (!key.startsWith('dc:')) {
        items = metadataObj[`dc:${key}`];
      }
      // Try without 'dc:' prefix if key has it
      if (!items && key.startsWith('dc:')) {
        items = metadataObj[key.replace('dc:', '')];
      }
    }
    
    if (!items) return [];
    
    const itemsArray = Array.isArray(items) ? items : [items];
    
    return itemsArray.map(item => {
      const value = this.extractValueFromItem(item);
      return value;
    }).filter(Boolean);
  }

  /**
   * Clean HTML tags dari content
   */
  static cleanHTML(html) {
    if (!html) return '';
    
    // Remove HTML tags tapi preserve line breaks
    let text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Remove multiple spaces and newlines
    text = text
      .replace(/ +/g, ' ')
      .replace(/\n\n+/g, '\n\n')
      .trim();
    
    return text;
  }

  /**
   * Count words in text
   */
  static countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    // Remove extra whitespace and split by spaces
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Parse chapter number from Roman numeral or Arabic number
   */
  static parseChapterNumber(numStr) {
    if (!numStr) return 1;
    
    // If it's a number, return it
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) return num;
    
    // If it's a Roman numeral, convert it
    const romanMap = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
    return romanMap[numStr.toUpperCase()] || 1;
  }

  /**
   * Split content menjadi pages berdasarkan jumlah kata (300 kata per page)
   * Each page includes chapter information
   */
  static splitContentByWords(content, wordsPerPage = 300, chapterTitle = null, chapterNumber = null) {
    if (!content || content.trim().length === 0) {
      return [];
    }
    
    const pages = [];
    const words = content.trim().split(/\s+/);
    const totalWords = words.length;
    
    // Split into pages
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, Math.min(i + wordsPerPage, words.length));
      const pageContent = pageWords.join(' ');
      
      pages.push({
        pageNumber: pages.length + 1, // Will be updated later
        content: pageContent.trim(),
        title: chapterTitle || `Page ${pages.length + 1}`,
        chapterNumber: chapterNumber,
        chapterTitle: chapterTitle
      });
    }
    
    return pages;
  }

  /**
   * Split content menjadi chunks berdasarkan max length (legacy method, kept for compatibility)
   */
  static splitContent(content, maxLength = 2000) {
    if (content.length <= maxLength) {
      return [content];
    }
    
    const chunks = [];
    let currentChunk = '';
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Extract cover image dari EPUB
   */
  static async extractCover(filePath, outputPath) {
    try {
      const buffer = await fs.readFile(filePath);
      const zip = await JSZip.loadAsync(buffer);
      
      // Try to find cover image in manifest
      const containerXml = await zip.file('META-INF/container.xml').async('string');
      const container = await xml2js.parseStringPromise(containerXml);
      const opfPath = container.container.rootfiles[0].rootfile[0].$['full-path'];
      
      const opfXml = await zip.file(opfPath).async('string');
      const opf = await xml2js.parseStringPromise(opfXml);
      
      // Look for cover in metadata
      const metadataObj = opf.package.metadata[0];
      let coverId = null;
      
      if (metadataObj.meta) {
        const coverMeta = metadataObj.meta.find(m => m.$ && m.$.name === 'cover');
        if (coverMeta) {
          coverId = coverMeta.$.content;
        }
      }
      
      if (coverId) {
        const manifest = opf.package.manifest[0].item || [];
        const coverItem = manifest.find(item => item.$.id === coverId);
        
        if (coverItem) {
          const basePath = path.dirname(opfPath);
          const coverPath = path.join(basePath, coverItem.$.href).replace(/\\/g, '/');
          const coverFile = zip.file(coverPath);
          
          if (coverFile) {
            const coverBuffer = await coverFile.async('nodebuffer');
            await fs.writeFile(outputPath, coverBuffer);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error extracting cover:', error);
      return false;
    }
  }
}

module.exports = EPUBParser;

