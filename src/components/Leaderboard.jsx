import { useState, useEffect, useMemo } from 'react';
import { IoCloseOutline, IoBookOutline } from 'react-icons/io5';
import BookDetailOverlay from './BookDetailOverlay';
import { leaderboardService } from '../services';

const Leaderboard = ({ onStartReading }) => {
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'users'
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [booksData, setBooksData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper functions - must be defined before useMemo
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

  const getAvatarColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-700',
      'bg-gradient-to-br from-sky-500 to-sky-700',
      'bg-gradient-to-br from-violet-500 to-violet-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
      'bg-gradient-to-br from-purple-600 to-purple-800'
    ];
    return colors[index % colors.length];
  };

  // Load leaderboard data from backend
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Auto-refresh leaderboard every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadLeaderboardData();
    }, 60000); // Refresh every 60 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Listen for book upload events to refresh immediately
  useEffect(() => {
    const handleBookUploaded = () => {
      loadLeaderboardData();
    };

    window.addEventListener('bookUploaded', handleBookUploaded);
    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded);
    };
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const [booksResult, usersResult] = await Promise.all([
        leaderboardService.getTopBooks(20),
        leaderboardService.getTopUsers(20)
      ]);
      
      setBooksData(booksResult.books || []);
      setUsersData(usersResult.users || []);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setBooksData([]);
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort books by rating (descending), then by ratingCount (descending) as tiebreaker
  const sortedBooks = useMemo(() => {
    return [...booksData].sort((a, b) => {
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      const countA = a.rating_count || 0;
      const countB = b.rating_count || 0;
      
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return countB - countA;
    }).map((book, index) => ({
      ...book,
      rank: index + 1,
      rating: book.average_rating || 0,
      ratingCount: book.rating_count || 0,
      cover: getCoverGradient(book.category)
    }));
  }, [booksData]);

  // Sort users by totalPagesRead (descending)
  const sortedUsers = useMemo(() => {
    return [...usersData].sort((a, b) => {
      const pagesA = a.total_pages_read || 0;
      const pagesB = b.total_pages_read || 0;
      return pagesB - pagesA;
    }).map((user, index) => {
      const initials = (user.username || user.name || 'U').substring(0, 2).toUpperCase();
      return {
        ...user,
        rank: index + 1,
        name: user.username || user.name || 'Unknown User',
        avatar: initials,
        avatarColor: getAvatarColor(index),
        totalPagesRead: user.total_pages_read || 0
      };
    });
  }, [usersData]);

  const topBooks = sortedBooks.slice(0, 5);
  const allBooks = sortedBooks;
  const topUsers = sortedUsers.slice(0, 5);
  const allUsers = sortedUsers;

  const getRankBadgeColor = (rank) => {
    switch(rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-300';
      case 2:
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/50 ring-2 ring-gray-300';
      case 3:
        return 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 ring-2 ring-orange-300';
      default:
        return 'bg-theme-tertiary text-theme-primary';
    }
  };

  const getRankBadgeElement = (rank) => {
    if (rank <= 3) {
      return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm relative ${getRankBadgeColor(rank)}`}>
          <div className="absolute inset-0 rounded-full bg-white opacity-20"></div>
          <span className="relative z-10">{rank}</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm bg-theme-tertiary text-theme-primary">
        {rank}
      </div>
    );
  };

  const getUserLevel = (rank) => {
    if (rank === 1) return 'Master Reader';
    if (rank >= 2 && rank <= 3) return 'Expert Reader';
    if (rank >= 4 && rank <= 5) return 'Superb Reader';
    if (rank >= 6 && rank <= 10) return 'Advanced Reader';
    if (rank >= 11 && rank <= 20) return 'Elite Reader';
    return 'Reader';
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-theme-primary">Leaderboard</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-theme-tertiary p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'books'
              ? 'bg-theme-card text-primary-600 shadow-sm'
              : 'text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'users'
              ? 'bg-theme-card text-primary-600 shadow-sm'
              : 'text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Users
        </button>
      </div>
      
      {/* Books Leaderboard */}
      {activeTab === 'books' && (
        <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-theme-secondary">Loading...</p>
          </div>
        ) : topBooks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-theme-secondary">No books available</p>
          </div>
        ) : (
          topBooks.map((book) => (
          <div
            key={book.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
            onClick={() => setSelectedBook(book)}
          >
            {/* Rank Badge */}
            {getRankBadgeElement(book.rank)}

            {/* Book Cover */}
                  {(() => {
                    const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                    return (
                      <div className={`w-12 h-16 ${hasCover ? 'bg-gray-100' : getCoverGradient(book.category)} rounded flex-shrink-0 shadow-md flex items-center justify-center relative overflow-hidden`}>
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
              <h4 className="font-semibold text-theme-primary text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-theme-secondary truncate">
                {book.author}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-xs font-semibold text-theme-primary">
                    {book.rating}({book.ratingCount})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )))}
        </div>
      )}

      {/* Users Leaderboard */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-theme-secondary">Loading...</p>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-theme-secondary">No users available</p>
            </div>
          ) : (
            topUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
              onClick={() => console.log('View user profile:', user.id)}
            >
              {/* Rank Badge */}
              {getRankBadgeElement(user.rank)}

              {/* User Avatar Circle */}
              <div className={`w-12 h-12 ${user.avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold text-sm`}>
                {user.avatar}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-theme-primary text-sm truncate group-hover:text-primary-600 transition-colors">
                  {user.name}
                </h4>
                <p className="text-xs text-theme-secondary">
                  {getUserLevel(user.rank)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <IoBookOutline className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-semibold text-theme-primary">
                      {user.totalPagesRead.toLocaleString()} pages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* View All Button */}
      <button 
        onClick={() => setShowFullLeaderboard(true)}
        className="w-full mt-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
      >
        View Full Leaderboard
      </button>

      {/* Full Leaderboard Overlay */}
      {showFullLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-theme flex items-center justify-between">
              <h2 className="text-2xl font-bold text-theme-primary">Full Leaderboard</h2>
              <button
                onClick={() => setShowFullLeaderboard(false)}
                className="text-theme-tertiary hover:text-theme-secondary text-2xl font-bold transition-colors"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="flex gap-2 bg-theme-tertiary p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'books'
                      ? 'bg-theme-card text-primary-600 shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Books
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'users'
                      ? 'bg-theme-card text-primary-600 shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Users
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Books Leaderboard - 20 items */}
              {activeTab === 'books' && (
                <div className="space-y-3">
                  {allBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedBook(book);
                        setShowFullLeaderboard(false);
                      }}
                    >
                      {/* Rank Badge */}
                      {getRankBadgeElement(book.rank)}

                      {/* Book Cover */}
                      <div className={`w-12 h-16 ${book.cover || getCoverGradient(book.category)} rounded flex-shrink-0 shadow-md flex items-center justify-center`}>
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className="text-white text-xs font-bold">{book.title?.charAt(0) || 'B'}</div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-theme-primary text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-theme-secondary truncate">
                          {book.author}
                        </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span className="text-xs font-semibold text-theme-primary">
                                {Number(book.rating || book.average_rating || 0).toFixed(1)}({book.ratingCount || book.rating_count || 0})
                              </span>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Users Leaderboard - 20 items */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
                      onClick={() => console.log('View user profile:', user.id)}
                    >
                      {/* Rank Badge */}
                      {getRankBadgeElement(user.rank)}

                      {/* User Avatar Circle */}
                      <div className={`w-12 h-12 ${user.avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold text-sm`}>
                        {user.avatar}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-theme-primary text-sm truncate group-hover:text-primary-600 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-xs text-theme-secondary">
                          {getUserLevel(user.rank)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <IoBookOutline className="w-3 h-3 text-primary-600" />
                            <span className="text-xs font-semibold text-theme-primary">
                              {user.totalPagesRead.toLocaleString()} pages
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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

export default Leaderboard;

