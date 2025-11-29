import { useState, useEffect, useRef } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline, IoSwapHorizontalOutline, IoChevronUpOutline, IoChevronDownOutline } from 'react-icons/io5';

const ViewPage = ({ book, onPageChange, displayMode, onDisplayModeChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
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
              {/* Simulated Book Content */}
              <div className="prose prose-lg max-w-none text-theme-primary">
                <h2 className="text-theme-primary mb-4">Chapter {Math.ceil(currentPage / 10)}</h2>
                <p className="text-theme-secondary leading-relaxed">
                  This is page {currentPage} of {totalPages}. In a real implementation, this would display the actual PDF/EPUB content parsed from the book file.
                  <br /><br />
                  The content would be rendered here with proper formatting, images, and text styling from the original document.
                  <br /><br />
                  You can navigate using the arrow buttons below or switch to scroll mode to view all pages at once.
                  <br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
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
            {/* Simulate multiple pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                ref={(el) => (pageRefs.current[pageNum] = el)}
                className="prose prose-lg max-w-none"
              >
                <div className="border-b border-theme pb-8 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-theme-primary">Page {pageNum}</h3>
                    <span className="text-sm text-theme-tertiary">Chapter {Math.ceil(pageNum / 10)}</span>
                  </div>
                  <p className="text-theme-secondary leading-relaxed">
                    Content for page {pageNum}. In a real implementation, this would display the actual PDF/EPUB content.
                    {pageNum === 1 && (
                      <><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</>
                    )}
                  </p>
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

