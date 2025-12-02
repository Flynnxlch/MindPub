import { useState, useEffect } from 'react';
import { IoCloseOutline, IoBookmarkOutline, IoBookmarkSharp, IoArrowForwardOutline } from 'react-icons/io5';
import StarRating from './StarRating';
import { bookmarkService, ratingService, bookService } from '../services';

const BookDetailOverlay = ({ book, onClose, onStartReading }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState(book); // Local state for book data

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Update local book state when prop changes
  useEffect(() => {
    setCurrentBook(book);
  }, [book]);

  // Load bookmark and rating status
  useEffect(() => {
    if (userId && currentBook?.id) {
      loadBookmarkStatus();
      loadUserRating();
    }
  }, [userId, currentBook?.id]);

  const loadBookmarkStatus = async () => {
    if (!userId || !currentBook?.id) return;

    try {
      const result = await bookmarkService.getUserBookmarks(userId);
      const bookmarks = result.bookmarks || [];
      setIsBookmarked(bookmarks.some(b => b.id === currentBook.id || b.book_id === currentBook.id));
    } catch (err) {
      console.error('Error loading bookmark status:', err);
    }
  };

  const loadUserRating = async () => {
    if (!userId || !currentBook?.id) return;

    try {
      const result = await ratingService.getUserRating(userId, currentBook.id);
      if (result.rating) {
        setUserRating(result.rating.rating || 0);
      }
    } catch (err) {
      console.error('Error loading user rating:', err);
    }
  };


  if (!currentBook) return null;

  const handleBookmark = async () => {
    if (!userId) {
      alert('Please login to bookmark books');
      return;
    }

    try {
      setLoading(true);
      if (isBookmarked) {
        await bookmarkService.removeBookmark(userId, currentBook.id);
        setIsBookmarked(false);
      } else {
        await bookmarkService.addBookmark(userId, currentBook.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReading = () => {
    if (onStartReading) {
      onStartReading(currentBook);
      onClose();
    }
  };

  const handleRatingChange = async (rating) => {
    if (!userId) {
      alert('Please login to rate books');
      return;
    }

    try {
      setLoading(true);
      await ratingService.upsertRating(userId, currentBook.id, rating);
      setUserRating(rating);
      
      // Fetch updated book data to get new average_rating
      const result = await bookService.getBookById(currentBook.id);
      if (result.success && result.book) {
        setCurrentBook(result.book);
      }
      
      // Trigger refresh event for other components
      window.dispatchEvent(new CustomEvent('bookRatingUpdated', { 
        detail: { bookId: currentBook.id } 
      }));
    } catch (err) {
      console.error('Error saving rating:', err);
      alert('Failed to save rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Close Button */}
        <div className="flex justify-end p-4 border-b border-theme">
          <button
            onClick={onClose}
            className="text-theme-tertiary hover:text-theme-primary transition-colors"
            aria-label="Close"
          >
            <IoCloseOutline className="w-8 h-8" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Book Cover */}
            <div className="md:col-span-1">
              {(() => {
                const hasCover = currentBook.cover_url && currentBook.cover_url !== null && currentBook.cover_url !== undefined && String(currentBook.cover_url).trim() !== '';
                return (
                  <div className={`${hasCover ? 'bg-gray-100' : (currentBook.cover_color || 'bg-gradient-to-br from-gray-400 to-gray-600')} rounded-xl h-96 flex items-center justify-center shadow-xl relative overflow-hidden`}>
                    {hasCover ? (
                      <img 
                        src={currentBook.cover_url.startsWith('http') ? currentBook.cover_url : `http://localhost:5000${currentBook.cover_url}`} 
                        alt={currentBook.title} 
                        className="w-full h-full object-cover rounded-xl"
                        crossOrigin="anonymous"
                        onLoad={() => {
                          console.log('Image loaded successfully for book:', currentBook.id);
                        }}
                        onError={(e) => {
                          console.error('Image load error for book:', currentBook.id, 'cover_url:', currentBook.cover_url);
                          console.error('Full image URL:', currentBook.cover_url.startsWith('http') ? currentBook.cover_url : `http://localhost:5000${currentBook.cover_url}`);
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.className = parent.className.replace('bg-gray-100', currentBook.cover_color || 'bg-gradient-to-br from-gray-400 to-gray-600');
                            const fallback = parent.querySelector('.cover-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="cover-fallback text-white text-center absolute inset-0 flex flex-col items-center justify-center" style={{ display: hasCover ? 'none' : 'flex' }}>
                      <div className="text-6xl font-bold mb-2">{currentBook.title?.charAt(0) || 'B'}</div>
                      <div className="text-lg opacity-90">{currentBook.category}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: Book Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-3xl font-bold text-theme-primary mb-2">
                  {currentBook.title}
                </h2>
                <p className="text-lg text-theme-secondary">
                  by {currentBook.author}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Description
                </h3>
                <p className="text-theme-secondary leading-relaxed">
                  {currentBook.description || 'No description available for this book.'}
                </p>
              </div>

              {/* Book Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme">
                  <p className="text-sm text-theme-secondary mb-1">Released Date</p>
                  <p className="text-lg font-semibold text-theme-primary">
                    {currentBook.release_date || currentBook.releaseDate || currentBook.released || 'N/A'}
                  </p>
                </div>
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme">
                  <p className="text-sm text-theme-secondary mb-1">Pages</p>
                  <p className="text-lg font-semibold text-theme-primary">
                    {currentBook.pages || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-theme-secondary mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    currentBook.category === 'Biologi' ? 'bg-green-100 text-green-700' :
                    currentBook.category === 'Fisika' ? 'bg-blue-100 text-blue-700' :
                    currentBook.category === 'Kimia' ? 'bg-purple-100 text-purple-700' :
                    currentBook.category === 'Informatika' ? 'bg-cyan-100 text-cyan-700' :
                    currentBook.category === 'Sistem Informasi' ? 'bg-indigo-100 text-indigo-700' :
                    currentBook.category === 'Pertambangan' ? 'bg-orange-100 text-orange-700' :
                    currentBook.category === 'Agribisnis' ? 'bg-lime-100 text-lime-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {currentBook.category}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-theme-secondary mb-2">
                  Rating
                </h3>
                <div className="space-y-4">
                  {/* Average Rating */}
                  <div className="flex items-center space-x-2">
                    <StarRating rating={Number(currentBook.average_rating || currentBook.rating || 0)} editable={false} size="md" />
                    <span className="text-xl font-bold text-theme-primary">
                      {Number(currentBook.average_rating || currentBook.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-theme-secondary">
                      / 5.0
                    </span>
                    {(currentBook.rating_count || currentBook.ratingCount) && (
                      <span className="text-sm text-theme-tertiary">
                        ({(currentBook.rating_count || currentBook.ratingCount || 0)} ratings)
                      </span>
                    )}
                  </div>
                  
                  {/* User Rating */}
                  <div>
                    <p className="text-sm text-theme-secondary mb-2">Your Rating:</p>
                    <StarRating 
                      rating={userRating} 
                      onRatingChange={handleRatingChange}
                      editable={true} 
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-theme p-6 flex items-center justify-between bg-theme-secondary">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={loading || !userId}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isBookmarked
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-theme-tertiary text-theme-primary hover:bg-theme-tertiary/80'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isBookmarked ? (
              <IoBookmarkSharp className="w-5 h-5" />
            ) : (
              <IoBookmarkOutline className="w-5 h-5" />
            )}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Start Reading Button */}
          <button
            onClick={handleStartReading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <span>Start Reading</span>
            <IoArrowForwardOutline className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailOverlay;

