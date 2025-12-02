import * as pdfjsLib from 'pdfjs-dist';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { getCachedPDFDocument, getCachedPDFPage } from '../utils/pdfPreloader';

// Set worker source for pdfjs - menggunakan local file dari public folder
if (typeof window !== 'undefined') {
  // Gunakan worker dari public folder (localhost)
  // Vite akan serve file dari public folder di path /pdf.worker.min.mjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
}

const PDFViewer = ({ pdfUrl, pageNumber, onLoadComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRendered, setIsRendered] = useState(false);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  
  // Reset rendered state when page changes
  useEffect(() => {
    setIsRendered(false);
    setLoading(true);
  }, [pdfUrl, pageNumber]);

  useEffect(() => {
    let isMounted = true;
    let renderTask = null;

    const loadPDFPage = async () => {
      if (!pdfUrl || !pageNumber || !canvasRef.current) return;

      // Check cache first (from preloader)
      const cachedCanvas = getCachedPDFPage(pdfUrl, pageNumber);
      
      if (cachedCanvas && isMounted) {
        // Use cached canvas - instant display, no loading
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = cachedCanvas.width;
        canvas.height = cachedCanvas.height;
        context.drawImage(cachedCanvas, 0, 0);
        setLoading(false);
        setIsRendered(true);
        if (onLoadComplete) {
          onLoadComplete();
        }
        return;
      }

      try {
        // Only show loading if not already rendered and not cached
        if (!isRendered) {
          setLoading(true);
        }
        setError(null);

        // Load PDF document (use cache if available)
        let pdf = getCachedPDFDocument(pdfUrl);
        
        if (!pdf) {
          const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            httpHeaders: {},
            withCredentials: false
          });
          pdf = await loadingTask.promise;
        }
        
        pdfDocRef.current = pdf;
        
        if (!isMounted) return;

        // Get the specific page
        const page = await pdf.getPage(pageNumber);
        
        // Set up canvas
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Calculate scale to fit container (max width 1000px, maintain aspect ratio)
        const viewport = page.getViewport({ scale: 1.5 });
        const maxWidth = 1000;
        const scale = Math.min(maxWidth / viewport.width, 2.5); // Max scale 2.5 for quality
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (isMounted) {
          setLoading(false);
          setIsRendered(true);
          if (onLoadComplete) {
            onLoadComplete();
          }
        }
      } catch (err) {
        console.error('Error loading PDF page:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load PDF page');
          setLoading(false);
        }
      }
    };

    if (pdfUrl && pageNumber) {
      loadPDFPage();
    }

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfUrl, pageNumber, onLoadComplete]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-8">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error loading PDF</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center">
      {loading && !isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-theme-secondary bg-opacity-50 rounded-lg z-10 min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-theme-secondary">Loading PDF page {pageNumber}...</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-auto border border-theme rounded-lg shadow-lg bg-white"
        style={{ display: loading && !isRendered ? 'none' : 'block' }}
      />
    </div>
  );
};

PDFViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  pageNumber: PropTypes.number.isRequired,
  onLoadComplete: PropTypes.func
};

export default PDFViewer;
