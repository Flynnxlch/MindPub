import { useState, useEffect } from 'react';
import BookDetailOverlay from './BookDetailOverlay';
import { readingService } from '../services';

const RecentReadBooks = ({ onStartReading }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Load recent reads from backend
  useEffect(() => {
    if (userId) {
      loadRecentReads();
    }
  }, [userId]);

  const loadRecentReads = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const result = await readingService.getRecentReads(userId, 6);
      setRecentBooks(result.books || []);
    } catch (err) {
      console.error('Error loading recent reads:', err);
      setRecentBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const getCoverGradient = (category) => {
    const gradients = {
      'Biologi': 'bg-gradient-to-br from-green-400 to-green-600',
      'Fisika': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'Kimia': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'Informatika': 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      'Sistem Informasi': 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'Pertambangan': 'bg-gradient-to-br from-amber-500 to-orange-600',
      'Agribisnis': 'bg-gradient-to-br from-lime-400 to-green-600'
    };
    return gradients[category] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  const formatLastRead = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-theme-primary">Recent Read</h3>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-theme-secondary text-sm">Loading...</p>
          </div>
        ) : !userId ? (
          <div className="text-center py-4">
            <p className="text-theme-secondary text-sm">Please login to see recent reads</p>
          </div>
        ) : recentBooks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-theme-secondary text-sm">No recent reads</p>
          </div>
        ) : (
          recentBooks.map((book) => {
            const progress = book.total_pages && book.current_page 
              ? Math.round((book.current_page / book.total_pages) * 100) 
              : 0;
            
            return (
              <div
                key={book.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
                onClick={() => setSelectedBook(book)}
              >
                {/* Book Cover */}
                  {(() => {
                    const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                    return (
                      <div className={`w-10 h-14 ${hasCover ? 'bg-gray-100' : getCoverGradient(book.category)} rounded flex-shrink-0 shadow-sm flex items-center justify-center relative overflow-hidden`}>
                        {hasCover ? (
                          <img 
                            src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                            alt={book.title} 
                            className="w-full h-full object-cover rounded"
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
                                parent.className = parent.className.replace('bg-gray-100', getCoverGradient(book.category));
                                const fallback = parent.querySelector('.cover-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="cover-fallback text-white text-xs font-bold absolute inset-0 flex items-center justify-center" style={{ display: hasCover ? 'none' : 'flex' }}>
                          {book.title?.charAt(0) || 'B'}
                        </div>
                      </div>
                    );
                  })()}

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-theme-primary text-xs line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-theme-secondary truncate">
                    {book.author}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-theme-tertiary">
                        {formatLastRead(book.last_read_at || book.updated_at)}
                      </span>
                      <span className="text-xs font-semibold text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-theme-tertiary rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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

export default RecentReadBooks;

