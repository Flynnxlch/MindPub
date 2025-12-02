import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
}

// Cache untuk PDF documents dan pages
const pdfDocumentCache = new Map();
const pdfPageCache = new Map();

/**
 * Preload PDF pages in background
 * @param {string} pdfUrl - URL of the PDF file
 * @param {number[]} pageNumbers - Array of page numbers to preload
 */
export const preloadPDFPages = async (pdfUrl, pageNumbers) => {
  if (!pdfUrl || !pageNumbers || pageNumbers.length === 0) return;

  try {
    // Load PDF document (use cache if available)
    let pdf = pdfDocumentCache.get(pdfUrl);
    
    if (!pdf) {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        httpHeaders: {},
        withCredentials: false
      });
      pdf = await loadingTask.promise;
      pdfDocumentCache.set(pdfUrl, pdf);
    }

    // Preload each page
    const preloadPromises = pageNumbers.map(async (pageNumber) => {
      const cacheKey = `${pdfUrl}-${pageNumber}`;
      
      // Skip if already cached
      if (pdfPageCache.has(cacheKey)) {
        return;
      }

      try {
        const page = await pdf.getPage(pageNumber);
        
        // Create a temporary canvas to render the page
        const viewport = page.getViewport({ scale: 1.5 });
        const maxWidth = 1000;
        const scale = Math.min(maxWidth / viewport.width, 2.5);
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const context = canvas.getContext('2d');

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        };

        await page.render(renderContext).promise;

        // Cache the rendered canvas
        pdfPageCache.set(cacheKey, canvas);
      } catch (err) {
        console.warn(`Failed to preload page ${pageNumber}:`, err);
      }
    });

    // Preload pages in parallel (but limit concurrency)
    await Promise.all(preloadPromises);
  } catch (err) {
    console.error('Error preloading PDF pages:', err);
  }
};

/**
 * Get cached PDF document
 */
export const getCachedPDFDocument = (pdfUrl) => {
  return pdfDocumentCache.get(pdfUrl);
};

/**
 * Get cached PDF page canvas
 */
export const getCachedPDFPage = (pdfUrl, pageNumber) => {
  const cacheKey = `${pdfUrl}-${pageNumber}`;
  return pdfPageCache.get(cacheKey);
};

/**
 * Clear cache for a specific PDF
 */
export const clearPDFCache = (pdfUrl) => {
  pdfDocumentCache.delete(pdfUrl);
  // Clear all pages for this PDF
  for (const key of pdfPageCache.keys()) {
    if (key.startsWith(pdfUrl)) {
      pdfPageCache.delete(key);
    }
  }
};

