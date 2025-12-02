import { useMemo, useState, useEffect } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import BookDetailOverlay from './BookDetailOverlay';
import { bookService, bookmarkService } from '../services';

const AllBooks = ({ filters, onStartReading }) => {
  const [bookmarked, setBookmarked] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const booksPerPage = 20;

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Load books from backend
  useEffect(() => {
    loadBooks();
    if (userId) {
      loadBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentPage, filters]);

  // Auto-refresh books every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadBooks();
      if (userId) {
        loadBookmarks();
      }
    }, 60000); // Refresh every 60 seconds

    return () => {
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentPage, filters]);

  // Listen for book upload events to refresh immediately
  useEffect(() => {
    const handleBookUploaded = () => {
      loadBooks();
      if (userId) {
        loadBookmarks();
      }
    };

    window.addEventListener('bookUploaded', handleBookUploaded);
    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentPage, filters]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const categoryMap = {
        'biologi': 'Biologi',
        'fisika': 'Fisika',
        'kimia': 'Kimia',
        'informatika': 'Informatika',
        'sistem-informasi': 'Sistem Informasi',
        'pertambangan': 'Pertambangan',
        'agribisnis': 'Agribisnis'
      };
      
      const params = {
        page: currentPage,
        limit: booksPerPage,
        category: filters.category !== 'all' ? categoryMap[filters.category] : undefined,
        sort: filters.sort || 'created_at',
        search: filters.search
      };
      
      const result = await bookService.getAllBooks(params);
      
      // Debug: Log cover_url for first book
      if (result.books && result.books.length > 0) {
        console.log('AllBooks - Sample book:', { 
          id: result.books[0].id, 
          title: result.books[0].title, 
          cover_url: result.books[0].cover_url,
          cover_url_type: typeof result.books[0].cover_url
        });
      }
      
      setAllBooks(result.books || []);
    } catch (err) {
      console.error('Error loading books:', err);
      setAllBooks([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const result = await bookmarkService.getUserBookmarks(userId);
      const bookmarksMap = {};
      (result.bookmarks || []).forEach(book => {
        bookmarksMap[book.id] = true;
      });
      setBookmarked(bookmarksMap);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  };

  const toggleBookmark = async (bookId) => {
    if (!userId) {
      alert('Please login to bookmark books');
      return;
    }

    try {
      const result = await bookmarkService.toggleBookmark(userId, bookId);
      setBookmarked(prev => ({
        ...prev,
        [bookId]: result.bookmarked
      }));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert(err.message || 'Failed to update bookmark');
    }
  };

  const getCoverGradient = (category) => {
    const gradients = {
      'Biologi': 'from-green-400 to-green-600',
      'Fisika': 'from-blue-400 to-blue-600',
      'Kimia': 'from-purple-400 to-purple-600',
      'Informatika': 'from-cyan-400 to-cyan-600',
      'Sistem Informasi': 'from-indigo-400 to-indigo-600',
      'Pertambangan': 'from-amber-500 to-orange-600',
      'Agribisnis': 'from-lime-400 to-green-600'
    };
    return gradients[category] || 'from-gray-400 to-gray-600';
  };

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    let result = [...allBooks];

    // Filter by category
    if (filters.category !== 'all') {
      const categoryMap = {
        'biologi': 'Biologi',
        'fisika': 'Fisika',
        'kimia': 'Kimia',
        'informatika': 'Informatika',
        'sistem-informasi': 'Sistem Informasi',
        'pertambangan': 'Pertambangan',
        'agribisnis': 'Agribisnis'
      };
      const selectedCategory = categoryMap[filters.category];
      result = result.filter(book => book.category === selectedCategory);
    }

    // Sort books
    switch (filters.sort) {
      case 'popular':
        // Keep default order (already popular)
        break;
      case 'newest':
        result = result.reverse();
        break;
      case 'rating':
        result.sort((a, b) => (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [allBooks, filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Our Books Collection</h2>
          <p className="text-theme-secondary text-sm mt-1">
            See our Books Collection Freely
          </p>
        </div>

        {/* Pagination Navigation */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <IoChevronBackOutline className="w-5 h-5" />
            </button>

            <span className="text-sm font-semibold text-theme-primary">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-theme-primary text-lg">Loading books...</div>
          <p className="text-theme-secondary text-sm mt-2">Please wait while we fetch the books</p>
        </div>
      ) : currentBooks.length > 0 ? (
        <div className="grid grid-cols-4 gap-6">
          {currentBooks.map((book) => (
          <div 
            key={book.id} 
            className="cursor-pointer group"
            onClick={() => setSelectedBook(book)}
          >
            {/* Book Cover */}
                  {(() => {
                    const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                    return (
                      <div className={`${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${getCoverGradient(book.category)}`} rounded-lg h-64 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                        {hasCover ? (
                          <img 
                            src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                            alt={book.title} 
                            className="w-full h-full object-cover rounded-lg"
                            crossOrigin="anonymous"
                            onLoad={() => {
                              console.log('Image loaded successfully for book:', book.id);
                            }}
                            onError={(e) => {
                              console.error('Image load error for book:', book.id, 'cover_url:', book.cover_url);
                              console.error('Full image URL:', book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`);
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${getCoverGradient(book.category)}`);
                                const fallback = parent.querySelector('.cover-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="cover-fallback text-white text-center absolute inset-0 flex flex-col items-center justify-center" style={{ display: hasCover ? 'none' : 'flex' }}>
                          <div className="text-3xl font-bold mb-2">{book.title?.charAt(0) || 'B'}</div>
                          <div className="text-xs opacity-90">{book.category}</div>
                        </div>
                      </div>
                    );
                  })()}

            {/* Book Info */}
            <div className="flex flex-col">
              {/* Title and Bookmark */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="h-10 flex-1 pr-2">
                  <h3 className="font-bold text-theme-primary text-sm leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {book.title}
                  </h3>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(book.id);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-theme-tertiary rounded transition-colors"
                  aria-label="Bookmark"
                >
                  {bookmarked[book.id] ? (
                    <BsBookmarkFill className="w-4 h-4 text-primary-600" />
                  ) : (
                    <BsBookmark className="w-4 h-4 text-theme-tertiary hover:text-primary-600" />
                  )}
                </button>
              </div>
              
              {/* Category Badge */}
              <div className="h-6 mb-1.5">
                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded truncate ${
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
              
              {/* Author */}
              <div className="h-5 mb-1.5">
                <p className="text-xs text-theme-secondary truncate">
                  {book.author}
                </p>
              </div>
              
              {/* Rating */}
              <div className="h-4 flex items-center space-x-1">
                {[...Array(5)].map((_, index) => (
                  <svg 
                    key={index}
                    className={`w-3 h-3 ${index < Math.floor(book.average_rating || book.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            No books found
          </h3>
          <p className="text-theme-secondary">
            {allBooks.length === 0 
              ? "No books have been uploaded yet. Check back later or upload a book if you're an admin."
              : "Try adjusting your filters to find what you're looking for."}
          </p>
        </div>
      )}

      {/* Book Detail Overlay */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onStartReading={onStartReading}
        />
      )}
    </div>
  );
};

export default AllBooks;

