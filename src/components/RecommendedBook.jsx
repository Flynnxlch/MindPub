import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { bookService, bookmarkService } from '../services'
import BookDetailOverlay from './BookDetailOverlay'

const RecommendedBook = ({ onNavigateToBooks, onStartReading }) => {
  const [bookmarked, setBookmarked] = useState({})
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id

  const loadBookmarks = useCallback(async () => {
    try {
      const result = await bookmarkService.getUserBookmarks(userId)
      const bookmarksMap = {}
      ;(result.bookmarks || []).forEach(book => {
        bookmarksMap[book.id] = true
      })
      setBookmarked(bookmarksMap)
    } catch (err) {
      console.error('Error loading bookmarks:', err)
    }
  }, [userId])

  const loadRecommendedBooks = async () => {
    try {
      setLoading(true)
      // Get all books from database
      const result = await bookService.getAllBooks({ limit: 100 })
      let allBooks = result.books || []
      
      // Debug: Log cover_url for all books
      if (allBooks.length > 0) {
        console.log('Books loaded:', allBooks.map(b => ({ 
          id: b.id, 
          title: b.title, 
          cover_url: b.cover_url,
          hasCover: b.cover_url && b.cover_url !== null && b.cover_url !== undefined && String(b.cover_url).trim() !== ''
        })))
      }
      
      // Shuffle the books array
      for (let i = allBooks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allBooks[i], allBooks[j]] = [allBooks[j], allBooks[i]]
      }
      
      // Take first 7 books (or less if not enough)
      setBooks(allBooks.slice(0, 7))
    } catch (err) {
      console.error('Error loading recommended books:', err)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  // Load books from backend and shuffle them
  useEffect(() => {
    loadRecommendedBooks()
    if (userId) {
      loadBookmarks()
    }
  }, [userId, loadBookmarks])

  // Auto-refresh books every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadRecommendedBooks()
      if (userId) {
        loadBookmarks()
      }
    }, 60000) // Refresh every 60 seconds

    return () => {
      clearInterval(refreshInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Listen for book upload events to refresh immediately
  useEffect(() => {
    const handleBookUploaded = () => {
      loadRecommendedBooks()
      if (userId) {
        loadBookmarks()
      }
    }

    window.addEventListener('bookUploaded', handleBookUploaded)
    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const toggleBookmark = async (bookId, e) => {
    e.stopPropagation()
    if (!userId) {
      alert('Please login to bookmark books')
      return
    }

    try {
      const isBookmarked = bookmarked[bookId]
      if (isBookmarked) {
        await bookmarkService.removeBookmark(userId, bookId)
        setBookmarked(prev => {
          const updated = { ...prev }
          delete updated[bookId]
          return updated
        })
      } else {
        await bookmarkService.addBookmark(userId, bookId)
        setBookmarked(prev => ({
          ...prev,
          [bookId]: true
        }))
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      alert('Failed to update bookmark')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Biologi': 'bg-green-100 text-green-700',
      'Fisika': 'bg-blue-100 text-blue-700',
      'Kimia': 'bg-purple-100 text-purple-700',
      'Informatika': 'bg-cyan-100 text-cyan-700',
      'Sistem Informasi': 'bg-indigo-100 text-indigo-700',
      'Pertambangan': 'bg-orange-100 text-orange-700',
      'Agribisnis': 'bg-lime-100 text-lime-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getCoverGradient = (category) => {
    const gradients = {
      'Biologi': 'bg-gradient-to-br from-green-400 to-green-600',
      'Fisika': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'Kimia': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'Informatika': 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      'Sistem Informasi': 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'Pertambangan': 'bg-gradient-to-br from-amber-500 to-orange-600',
      'Agribisnis': 'bg-gradient-to-br from-lime-400 to-green-600'
    }
    return gradients[category] || 'bg-gradient-to-br from-gray-400 to-gray-600'
  }

  return (
    <section id="books" className="bg-theme-primary py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="mb-2 text-theme-primary">Recommended Books</h2>
            <p className="text-theme-secondary">
              Discover our handpicked selection of the best open-source books
            </p>
          </div>
          <button
            onClick={onNavigateToBooks}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            More book
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-theme-secondary">Loading books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-theme-secondary">No books available</p>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide hover:scrollbar-default">
              {books.map((book) => (
                <div 
                  key={book.id} 
                  className="flex-shrink-0 w-56 cursor-pointer group"
                  onClick={() => setSelectedBook(book)}
                >
                  {/* Book Cover */}
                  {(() => {
                    const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                    return (
                      <div className={`${hasCover ? 'bg-gray-100' : getCoverGradient(book.category)} rounded-lg h-80 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                        {hasCover ? (
                          <img 
                            src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                            alt={book.title} 
                            className="w-full h-full object-cover rounded-lg"
                            crossOrigin="anonymous"
                            onLoad={() => {
                              console.log('Image loaded successfully for book:', book.id, 'cover_url:', book.cover_url);
                            }}
                            onError={(e) => {
                              console.error('Image load error for book:', book.id, 'cover_url:', book.cover_url);
                              console.error('Full image URL:', book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`);
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.className = parent.className.replace('bg-gray-100', getCoverGradient(book.category));
                                const fallback = parent.querySelector('.cover-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className="cover-fallback text-white text-center absolute inset-0 flex flex-col items-center justify-center" 
                          style={{ display: hasCover ? 'none' : 'flex' }}
                        >
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
                        onClick={(e) => toggleBookmark(book.id, e)}
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
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded truncate ${getCategoryColor(book.category)}`}>
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
                          className={`w-3 h-3 ${index < Math.floor(Number(book.average_rating) || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} 
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
  )
}

RecommendedBook.propTypes = {
  onNavigateToBooks: PropTypes.func.isRequired,
  onStartReading: PropTypes.func.isRequired
}

export default RecommendedBook

