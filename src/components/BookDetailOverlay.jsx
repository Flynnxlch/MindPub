import { useState } from 'react';
import { IoCloseOutline, IoBookmarkOutline, IoBookmarkSharp, IoArrowForwardOutline } from 'react-icons/io5';
import StarRating from './StarRating';

const BookDetailOverlay = ({ book, onClose, onStartReading }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);

  if (!book) return null;

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleStartReading = () => {
    if (onStartReading) {
      onStartReading(book);
      onClose();
    }
  };

  const handleRatingChange = (rating) => {
    setUserRating(rating);
    console.log('User rated:', rating);
    // In real app, this would save to backend
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
              <div className={`${book.cover} rounded-xl h-96 flex items-center justify-center shadow-xl`}>
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-2">{book.title?.charAt(0)}</div>
                  <div className="text-lg opacity-90">{book.category}</div>
                </div>
              </div>
            </div>

            {/* Right: Book Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-3xl font-bold text-theme-primary mb-2">
                  {book.title}
                </h2>
                <p className="text-lg text-theme-secondary">
                  by {book.author}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Description
                </h3>
                <p className="text-theme-secondary leading-relaxed">
                  {book.description || 'No description available for this book.'}
                </p>
              </div>

              {/* Book Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme">
                  <p className="text-sm text-theme-secondary mb-1">Released Date</p>
                  <p className="text-lg font-semibold text-theme-primary">
                    {book.releaseDate || book.released || 'N/A'}
                  </p>
                </div>
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme">
                  <p className="text-sm text-theme-secondary mb-1">Pages</p>
                  <p className="text-lg font-semibold text-theme-primary">
                    {book.pages || 'N/A'}
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
                    book.category === 'Biologi' ? 'bg-green-100 text-green-700' :
                    book.category === 'Fisika' ? 'bg-blue-100 text-blue-700' :
                    book.category === 'Kimia' ? 'bg-purple-100 text-purple-700' :
                    book.category === 'Informatika' ? 'bg-cyan-100 text-cyan-700' :
                    book.category === 'Sistem Informasi' ? 'bg-indigo-100 text-indigo-700' :
                    book.category === 'Pertambangan' ? 'bg-orange-100 text-orange-700' :
                    book.category === 'Agribisnis' ? 'bg-lime-100 text-lime-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {book.category}
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
                    <StarRating rating={book.rating || 0} editable={false} size="md" />
                    <span className="text-xl font-bold text-theme-primary">
                      {book.rating || '0.0'}
                    </span>
                    <span className="text-sm text-theme-secondary">
                      / 5.0
                    </span>
                    {book.ratingCount && (
                      <span className="text-sm text-theme-tertiary">
                        ({book.ratingCount} ratings)
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
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isBookmarked
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-theme-tertiary text-theme-primary hover:bg-theme-tertiary/80'
            }`}
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

