import { useState, useEffect, useRef } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline, IoSwapHorizontalOutline, IoChevronUpOutline, IoChevronDownOutline } from 'react-icons/io5';
import { bookService } from '../services';
import PDFViewer from './PDFViewer';
import { preloadPDFPages } from '../utils/pdfPreloader';

const ViewPage = ({ book, onPageChange, displayMode, onDisplayModeChange, userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [pageContent, setPageContent] = useState({}); // Store page content by page number (for EPUB)
  const [loadingPage, setLoadingPage] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // Store PDF URL for PDFViewer
  const [preloadedPages, setPreloadedPages] = useState(new Set()); // Track preloaded PDF pages
  const scrollContainerRef = useRef(null);
  const pageRefs = useRef({});
  const dropdownRef = useRef(null);
  const currentPageRef = useRef(1); // Track current page without causing re-renders
  const isScrollingRef = useRef(false); // Prevent updates during programmatic scroll

  const totalPages = book?.pages || 143;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPageDropdown(false);
      }
    };

    if (showPageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPageDropdown]);

  // Set PDF URL when book changes (for PDF files)
  useEffect(() => {
    if (book?.file_type === 'pdf' && book?.file_url) {
      const url = book.file_url.startsWith('http') 
        ? book.file_url 
        : `http://localhost:5000${book.file_url}`;
      setPdfUrl(url);
      // Reset preloaded pages when book changes
      setPreloadedPages(new Set());
    } else {
      setPdfUrl(null);
    }
  }, [book?.file_type, book?.file_url]);

  // Preload PDF pages (20 pages at a time) when current page changes
  useEffect(() => {
    if (book?.file_type === 'pdf' && pdfUrl && totalPages > 0) {
      const preloadPages = async () => {
        const pagesToPreload = [];
        const startPage = Math.max(1, currentPage - 10);
        const endPage = Math.min(totalPages, currentPage + 10);
        
        for (let i = startPage; i <= endPage; i++) {
          if (!preloadedPages.has(i)) {
            pagesToPreload.push(i);
          }
        }
        
        // Mark pages as preloading to prevent duplicate requests
        if (pagesToPreload.length > 0) {
          setPreloadedPages(prev => {
            const newSet = new Set(prev);
            pagesToPreload.forEach(p => newSet.add(p));
            return newSet;
          });
          
          // Actually preload the pages in background
          preloadPDFPages(pdfUrl, pagesToPreload).catch(err => {
            console.warn('Error preloading PDF pages:', err);
          });
        }
      };
      
      preloadPages();
    }
  }, [book?.file_type, pdfUrl, currentPage, totalPages]);

  // Load page content when page changes (for EPUB files)
  useEffect(() => {
    if (book?.id && currentPage && book?.file_type !== 'pdf') {
      // Only load content for EPUB, PDF uses PDFViewer
      if (!pageContent[currentPage]) {
        loadPageContent(currentPage);
      }
    }
  }, [book?.id, book?.file_type, currentPage]);

  // Load multiple pages for scroll mode (for EPUB files)
  useEffect(() => {
    if (displayMode === 'scroll' && book?.id && book?.file_type !== 'pdf') {
      // Only load content for EPUB, PDF uses PDFViewer which handles its own loading
      const pagesToLoad = Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1);
      pagesToLoad.forEach(pageNum => {
        if (!pageContent[pageNum]) {
          loadPageContent(pageNum);
        }
      });
    }
  }, [displayMode, book?.id, book?.file_type, totalPages]);

  // Load page content from backend (for EPUB files)
  const loadPageContent = async (pageNumber) => {
    if (!book?.id || pageContent[pageNumber]) return; // Already loaded
    
    try {
      setLoadingPage(true);
      const result = await bookService.getBookPage(book.id, pageNumber);
      if (result.success && result.page) {
        setPageContent(prev => ({
          ...prev,
          [pageNumber]: {
            content: result.page.content || `Page ${pageNumber} content not available.`,
            fileType: result.page.fileType || book.file_type,
            fileUrl: result.page.fileUrl || book.file_url
          }
        }));
      }
    } catch (err) {
      console.error(`Error loading page ${pageNumber}:`, err);
      setPageContent(prev => ({
        ...prev,
        [pageNumber]: {
          content: `Error loading page ${pageNumber}. Please try again.`,
          fileType: book?.file_type,
          fileUrl: book?.file_url
        }
      }));
    } finally {
      setLoadingPage(false);
    }
  };

  // Update parent when page changes
  useEffect(() => {
    currentPageRef.current = currentPage;
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  // Track scroll position for scroll mode with debouncing
  useEffect(() => {
    if (displayMode === 'scroll' && scrollContainerRef.current) {
      let scrollTimeout;
      let rafId = null;

      const handleScroll = () => {
        // Cancel previous animation frame
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        // Use requestAnimationFrame for smooth tracking
        rafId = requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (!container || isScrollingRef.current) return;
          
          const scrollTop = container.scrollTop;
          const containerHeight = container.clientHeight;
          const scrollBottom = scrollTop + containerHeight;
          const viewportCenter = scrollTop + containerHeight / 2;
          
          // Find the page that is most visible in the viewport
          let visiblePage = currentPageRef.current; // Default to current page
          let maxVisibleArea = 0;

          // Check all pages to find the one with most visible area
          for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const pageElement = pageRefs.current[pageNum];
            if (pageElement) {
              const pageTop = pageElement.offsetTop;
              const pageBottom = pageTop + pageElement.offsetHeight;
              
              // Calculate visible area of this page
              const visibleTop = Math.max(scrollTop, pageTop);
              const visibleBottom = Math.min(scrollBottom, pageBottom);
              const visibleArea = Math.max(0, visibleBottom - visibleTop);
              
              // Also check if page center is near viewport center
              const pageCenter = pageTop + (pageBottom - pageTop) / 2;
              const distanceFromCenter = Math.abs(pageCenter - viewportCenter);
              
              // Prefer pages with more visible area and closer to center
              const score = visibleArea * (1 - distanceFromCenter / containerHeight);
              
              if (score > maxVisibleArea && visibleArea > 0) {
                maxVisibleArea = score;
                visiblePage = pageNum;
              }
            }
          }

          // Only update if we found a valid page and it's significantly different
          if (visiblePage >= 1 && visiblePage <= totalPages && 
              visiblePage !== currentPageRef.current &&
              Math.abs(visiblePage - currentPageRef.current) <= 5) { // Prevent large jumps
            setCurrentPage(visiblePage);
          }
        });
      };

      const container = scrollContainerRef.current;
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initial check after refs are ready
      const initTimeout = setTimeout(() => {
        handleScroll();
      }, 500);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(scrollTimeout);
        clearTimeout(initTimeout);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [displayMode, totalPages]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      isScrollingRef.current = true;
      setCurrentPage(newPage);
      
      // Scroll to page in scroll mode
      if (displayMode === 'scroll' && pageRefs.current[newPage]) {
        pageRefs.current[newPage].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      } else {
        isScrollingRef.current = false;
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      isScrollingRef.current = true;
      setCurrentPage(newPage);
      
      // Scroll to page in scroll mode
      if (displayMode === 'scroll' && pageRefs.current[newPage]) {
        pageRefs.current[newPage].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      } else {
        isScrollingRef.current = false;
      }
    }
  };

  const scrollToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageSearchQuery(''); // Clear search when page is selected
      if (onPageChange) {
        onPageChange(pageNum);
      }
      
      // Scroll to page in scroll mode
      if (displayMode === 'scroll' && pageRefs.current[pageNum]) {
        isScrollingRef.current = true;
        pageRefs.current[pageNum].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
      
      setShowPageDropdown(false);
    }
  };

  // Generate page options with search filter
  const allPageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);
  const filteredPageOptions = pageSearchQuery
    ? allPageOptions.filter(page => 
        page.toString().includes(pageSearchQuery) || 
        `Page ${page}`.toLowerCase().includes(pageSearchQuery.toLowerCase())
      )
    : allPageOptions;

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-xl overflow-hidden">
      {/* Header with Mode Toggle */}
      <div className="bg-theme-tertiary border-b border-theme p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-theme-secondary">Mode:</span>
          <button
            onClick={onDisplayModeChange}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            <IoSwapHorizontalOutline className="w-5 h-5" />
            <span className="font-semibold">
              {displayMode === 'pagination' ? 'Switch to Scroll' : 'Switch to Page'}
            </span>
          </button>
          
          {/* Page Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowPageDropdown(!showPageDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-theme-card border border-theme rounded-lg hover:opacity-80 transition-all text-theme-primary"
            >
              <span className="font-medium">Page {currentPage}</span>
              <div className="flex flex-col">
                <IoChevronUpOutline className="w-3 h-3" />
                <IoChevronDownOutline className="w-3 h-3 -mt-1" />
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showPageDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-theme-card border border-theme rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-theme">
                  <input
                    type="text"
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    placeholder="Search page..."
                    className="w-full px-3 py-2 text-sm border border-theme rounded bg-theme-primary text-theme-primary focus:outline-none focus:border-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredPageOptions.length > 0 ? (
                    filteredPageOptions.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => scrollToPage(pageNum)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-theme-tertiary transition-colors ${
                          pageNum === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-theme-primary'
                        }`}
                      >
                        Page {pageNum}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-theme-secondary text-center">
                      No pages found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-theme-primary">
            Page {currentPage} of {totalPages}
          </p>
          <p className="text-sm text-theme-secondary">
            {Math.round((currentPage / totalPages) * 100)}% Complete
          </p>
        </div>
      </div>

      {displayMode === 'pagination' ? (
        // Pagination Mode
        <div className="relative">
          {/* Book Page Display */}
          <div className="min-h-[600px] lg:min-h-[800px] bg-theme-secondary p-8 flex items-center justify-center">
            <div className="max-w-3xl w-full">
              {/* Actual Book Content */}
              <div className="prose prose-lg max-w-none text-theme-primary">
                {book?.file_type === 'pdf' && pdfUrl ? (
                  // PDF: Display using PDFViewer component
                  <PDFViewer 
                    pdfUrl={pdfUrl} 
                    pageNumber={currentPage}
                    onLoadComplete={() => {
                      // Only set loading to false once, don't show loading again if already rendered
                      if (loadingPage) {
                        setLoadingPage(false);
                      }
                    }}
                  />
                ) : (
                  // EPUB: Display as text
                  <>
                    {loadingPage ? (
                      <div className="text-center py-12">
                        <p className="text-theme-secondary">Loading page {currentPage}...</p>
                      </div>
                    ) : (
                      <div className="text-theme-primary leading-relaxed whitespace-pre-wrap epub-text-justify">
                        {pageContent[currentPage] ? (
                          <div 
                            className="epub-text-justify"
                            dangerouslySetInnerHTML={{ __html: (typeof pageContent[currentPage] === 'string' ? pageContent[currentPage] : pageContent[currentPage].content || '').replace(/\n/g, '<br />') }} 
                          />
                        ) : (
                          <p className="text-theme-secondary">Page {currentPage} content is loading...</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="bg-theme-tertiary border-t border-theme p-4 flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <IoChevronBackOutline className="w-5 h-5" />
              <span className="font-semibold">Previous</span>
            </button>

            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">
                Page {currentPage} / {totalPages}
              </p>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-semibold">Next</span>
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Scroll Mode
        <div 
          ref={scrollContainerRef}
          className="max-h-[800px] overflow-y-auto p-8"
        >
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Actual pages from database */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                ref={(el) => (pageRefs.current[pageNum] = el)}
                className="prose prose-lg max-w-none"
              >
                <div className="border-b border-theme pb-8 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-theme-primary">Page {pageNum}</h3>
                    <span className="text-sm text-theme-tertiary">of {totalPages}</span>
                  </div>
                  {book?.file_type === 'pdf' && pdfUrl ? (
                    // PDF: Display using PDFViewer component
                    <div className="mb-8">
                      <PDFViewer 
                        pdfUrl={pdfUrl} 
                        pageNumber={pageNum}
                        onLoadComplete={() => {}}
                      />
                    </div>
                  ) : pageContent[pageNum] ? (
                    // EPUB: Display as text with justify alignment
                    (() => {
                      const content = typeof pageContent[pageNum] === 'string' ? pageContent[pageNum] : pageContent[pageNum].content || '';
                      // Extract chapter info if present
                      const chapterMatch = content.match(/^\[CHAPTER:\s*(.+?)\]\n\n/);
                      const chapterTitle = chapterMatch ? chapterMatch[1] : null;
                      const displayContent = chapterMatch ? content.replace(/^\[CHAPTER:\s*(.+?)\]\n\n/, '') : content;
                      
                      return (
                        <div>
                          {chapterTitle && (
                            <div className="mb-6 pb-4 border-b-2 border-primary-500">
                              <h2 className="text-2xl font-bold text-primary-600 mb-2">{chapterTitle}</h2>
                              <p className="text-sm text-theme-secondary">Chapter {chapterTitle.match(/CHAPTER\s+([IVX]+|[0-9]+)/i)?.[1] || ''}</p>
                            </div>
                          )}
                          <div 
                            className="text-theme-primary leading-relaxed whitespace-pre-wrap epub-text-justify"
                            dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, '<br />') }}
                          />
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-theme-secondary leading-relaxed">
                      Loading page {pageNum}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPage;

