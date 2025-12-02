import { useState, useEffect, useRef } from 'react';
import { IoCloseOutline, IoBookmarkOutline, IoBookmarkSharp } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import ViewPage from '../components/ViewPage';
import ReadingProgress from '../components/ReadingProgress';
import ReadingTime from '../components/ReadingTime';
import QuickNotes from '../components/QuickNotes';
import { readingService, bookmarkService } from '../services';

const ReadPage = ({ book, onClose, onOpenAuth, onOpenDashboard, isLoggedIn, userName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [furthestPage, setFurthestPage] = useState(1); // Track furthest page read
  const [displayMode, setDisplayMode] = useState('pagination'); // 'pagination' or 'scroll'
  const [readingTime, setReadingTime] = useState(0); // in seconds
  const [isBookmarked, setIsBookmarked] = useState(false);
  const saveProgressTimeoutRef = useRef(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Simulate pages (in real app, this would be from PDF/EPUB parser)
  const totalPages = book?.pages || book?.total_pages || 143;

  // Load reading progress and bookmark status on mount
  useEffect(() => {
    if (userId && book?.id) {
      loadReadingProgress();
      loadBookmarkStatus();
    }
  }, [userId, book?.id]);

  // Timer effect - always running, no pause/reset buttons
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    // Cleanup on unmount (when user closes reader)
    return () => {
      clearInterval(interval);
      // Timer is automatically paused when component unmounts
    };
  }, []); // Empty dependency array - runs once on mount

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
      if (userId && book?.id && furthestPage > 0) {
        saveReadingProgress(furthestPage);
      }
    };
  }, [userId, book?.id, furthestPage]);

  const loadReadingProgress = async () => {
    if (!userId || !book?.id) return;

    try {
      const result = await readingService.getProgress(userId, book.id);
      if (result.progress) {
        const progress = result.progress;
        setCurrentPage(progress.current_page || 1);
        setFurthestPage(progress.furthest_page || progress.current_page || 1);
      }
    } catch (err) {
      console.error('Error loading reading progress:', err);
    }
  };

  const loadBookmarkStatus = async () => {
    if (!userId || !book?.id) return;

    try {
      const result = await bookmarkService.getUserBookmarks(userId);
      const bookmarks = result.bookmarks || [];
      setIsBookmarked(bookmarks.some(b => b.id === book.id || b.book_id === book.id));
    } catch (err) {
      console.error('Error loading bookmark status:', err);
    }
  };

  const saveReadingProgress = async (page) => {
    if (!userId || !book?.id) return;

    try {
      await readingService.updateProgress(userId, book.id, {
        current_page: page,
        furthest_page: page
      });
      
      // Trigger refresh event for recent reads
      window.dispatchEvent(new CustomEvent('readingProgressUpdated', { 
        detail: { bookId: book.id, page } 
      }));
    } catch (err) {
      console.error('Error saving reading progress:', err);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update furthest page only if we've read further
    if (page > furthestPage) {
      setFurthestPage(page);
      
      // Debounce save progress (save after 2 seconds of no page change)
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
      saveProgressTimeoutRef.current = setTimeout(() => {
        if (userId && book?.id) {
          saveReadingProgress(page);
        }
      }, 2000);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!userId) {
      alert('Please login to bookmark books');
      return;
    }

    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(userId, book.id);
        setIsBookmarked(false);
      } else {
        await bookmarkService.addBookmark(userId, book.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to update bookmark');
    }
  };

  const handleDisplayModeChange = () => {
    setDisplayMode(displayMode === 'pagination' ? 'scroll' : 'pagination');
  };

  if (!book) return null;

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Navbar */}
      <Navbar 
        onOpenAuth={onOpenAuth}
        onOpenDashboard={onOpenDashboard}
        onNavigateToHome={() => {}}
        onNavigateToBooks={() => {}}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />

      {/* Reading Container */}
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-theme-tertiary text-theme-primary rounded-lg hover:opacity-80 transition-all"
            >
              <IoCloseOutline className="w-5 h-5" />
              <span className="font-semibold">Close Reader</span>
            </button>
            <h1 className="text-2xl font-bold text-theme-primary">{book.title}</h1>
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-primary-600 text-white'
                  : 'bg-theme-tertiary text-theme-primary hover:opacity-80'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <IoBookmarkSharp className="w-5 h-5" />
              ) : (
                <IoBookmarkOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Book Content */}
          <div className="lg:col-span-2">
            <ViewPage
              book={book}
              onPageChange={handlePageChange}
              displayMode={displayMode}
              onDisplayModeChange={handleDisplayModeChange}
              userId={userId}
            />
          </div>

          {/* Right: Reading Stats & Notes */}
          <div className="lg:col-span-1 space-y-6">
            <ReadingProgress 
              currentPage={currentPage} 
              furthestPage={furthestPage}
              totalPages={totalPages} 
            />
            {isLoggedIn && (
              <>
                <ReadingTime readingTime={readingTime} />
                <QuickNotes bookId={book.id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadPage;

