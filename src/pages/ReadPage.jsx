import { useState, useEffect } from 'react';
import { IoCloseOutline, IoBookmarkOutline, IoBookmarkSharp } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import ViewPage from '../components/ViewPage';
import ReadingProgress from '../components/ReadingProgress';
import ReadingTime from '../components/ReadingTime';
import QuickNotes from '../components/QuickNotes';

const ReadPage = ({ book, onClose, onOpenAuth, onOpenDashboard, isLoggedIn, userName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [furthestPage, setFurthestPage] = useState(1); // Track furthest page read
  const [displayMode, setDisplayMode] = useState('pagination'); // 'pagination' or 'scroll'
  const [readingTime, setReadingTime] = useState(0); // in seconds
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Simulate pages (in real app, this would be from PDF/EPUB parser)
  const totalPages = book?.pages || 143;

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update furthest page only if we've read further
    if (page > furthestPage) {
      setFurthestPage(page);
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
              onClick={() => setIsBookmarked(!isBookmarked)}
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
                <QuickNotes />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadPage;

