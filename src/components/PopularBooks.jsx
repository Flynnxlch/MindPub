import { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { bookService, bookmarkService } from '../services';
import BookDetailOverlay from './BookDetailOverlay';
import SearchBox from './SearchBox';

// eslint-disable-next-line react/prop-types
const PopularBooks = ({ onStartReading }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [bookmarked, setBookmarked] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Load books from backend
  useEffect(() => {
    loadPopularBooks();
    if (userId) {
      loadBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Auto-refresh books every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadPopularBooks();
      if (userId) {
        loadBookmarks();
      }
    }, 60000); // Refresh every 60 seconds

    return () => {
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Listen for book upload events to refresh immediately
  useEffect(() => {
    const handleBookUploaded = () => {
      loadPopularBooks();
      if (userId) {
        loadBookmarks();
      }
    };

    window.addEventListener('bookUploaded', handleBookUploaded);
    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadPopularBooks = async () => {
    try {
      setLoading(true);
      // Get all books from database
      const result = await bookService.getAllBooks({ limit: 100 });
      let allBooks = result.books || [];
      
      // Debug: Log cover_url for first book
      if (allBooks.length > 0) {
        console.log('PopularBooks - Sample book:', { 
          id: allBooks[0].id, 
          title: allBooks[0].title, 
          cover_url: allBooks[0].cover_url,
          cover_url_type: typeof allBooks[0].cover_url
        });
      }
      
      // Shuffle the books array (similar to RecommendedBook)
      for (let i = allBooks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allBooks[i], allBooks[j]] = [allBooks[j], allBooks[i]];
      }
      
      // Take first 6 books (or less if not enough)
      setBooks(allBooks.slice(0, 6));
    } catch (err) {
      console.error('Error loading popular books:', err);
      setBooks([]);
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


  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' }
  ];

  return (
      <section className="py-12 md:py-16 bg-theme-primary">
      <div className="container-custom">
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-theme-primary">Popular Books</h2>
            <div className="hidden md:block">
              <SearchBox compact={true} />
            </div>
          </div>
          
          {/* Mobile Search Box */}
          <div className="mb-4 md:hidden">
            <SearchBox compact={true} />
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 border-b border-theme">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-theme-primary">Loading books...</div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-theme-secondary">No books available</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {books.map((book) => (
            <div 
              key={book.id} 
              className="cursor-pointer group"
              onClick={() => setSelectedBook(book)}
            >
              {/* Book Cover */}
                  {(() => {
                    const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                    return (
                      <div className={`${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`} rounded-lg h-72 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
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
                                parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`);
                                const fallback = parent.querySelector('.cover-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="cover-fallback text-white text-center absolute inset-0 flex flex-col items-center justify-center" style={{ display: hasCover ? 'none' : 'flex' }}>
                          <div className="text-4xl font-bold mb-2">{book.title?.charAt(0) || 'B'}</div>
                          <div className="text-sm opacity-90">{book.category}</div>
                        </div>
                      </div>
                    );
                  })()}

              {/* Book Info Container with Fixed Heights */}
              <div className="flex flex-col">
                {/* Title and Bookmark Container */}
                <div className="flex items-start justify-between mb-1.5">
                  {/* Title Container - Fixed Height */}
                  <div className="h-10 flex-1 pr-2">
                    <h3 className="font-bold text-theme-primary text-sm leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {book.title}
                    </h3>
                  </div>
                  
                  {/* Bookmark Button */}
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
                
                {/* Category Badge Container - Fixed Height */}
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
                
                {/* Author Container - Fixed Height */}
                <div className="h-5 mb-1.5">
                  <p className="text-xs text-theme-secondary truncate">
                    {book.author}
                  </p>
                </div>
                
                {/* Rating Container - Fixed Height */}
                <div className="h-4 flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <svg 
                      key={index}
                      className={`w-3 h-3 ${index < Math.floor(book.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} 
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
        )}
      </div>

      {/* Divider Line - follows PopularBooks container width */}
      <div className="container-custom">
        <div className="border-t border-theme mt-8 mb-4"></div>
      </div>

      {/* Book Detail Overlay */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onStartReading={onStartReading}
        />
      )}
    </section>
  );
};

export default PopularBooks;

