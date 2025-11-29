import { useState, useMemo } from 'react';
import { IoCloseOutline, IoBookOutline } from 'react-icons/io5';
import BookDetailOverlay from './BookDetailOverlay';

const Leaderboard = ({ onStartReading }) => {
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'users'
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Books data with rating and rating count
  const booksData = [
    { id: 1, title: 'Fisika Kuantum Modern', author: 'Prof. Siti Rahayu', rating: 4.9, ratingCount: 245, cover: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: 2, title: 'Manajemen Basis Data', author: 'M. Andi Pratama', rating: 4.9, ratingCount: 198, cover: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
    { id: 3, title: 'Teori Relativitas Einstein', author: 'Prof. Dr. Bambang', rating: 4.9, ratingCount: 156, cover: 'bg-gradient-to-br from-slate-400 to-slate-600' },
    { id: 4, title: 'Data Mining', author: 'Dr. Rahmat Hidayat', rating: 4.9, ratingCount: 142, cover: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { id: 5, title: 'Mekanika Kuantum', author: 'Prof. Joko Susilo', rating: 4.9, ratingCount: 128, cover: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { id: 6, title: 'Machine Learning', author: 'Ir. Tommy Chen', rating: 4.9, ratingCount: 115, cover: 'bg-gradient-to-br from-cyan-500 to-cyan-700' },
    { id: 7, title: 'Biologi Molekuler', author: 'Dr. Ahmad Santoso', rating: 4.8, ratingCount: 312, cover: 'bg-gradient-to-br from-green-400 to-green-600' },
    { id: 8, title: 'Geologi Pertambangan', author: 'Dr. Rudi Hartono', rating: 4.8, ratingCount: 287, cover: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { id: 9, title: 'Kimia Anorganik', author: 'Dr. Lisa Permata', rating: 4.8, ratingCount: 234, cover: 'bg-gradient-to-br from-violet-400 to-violet-600' },
    { id: 10, title: 'Teknologi Pasca Panen', author: 'Prof. Siti Aminah', rating: 4.8, ratingCount: 189, cover: 'bg-gradient-to-br from-green-500 to-green-700' },
    { id: 11, title: 'Cloud Computing', author: 'M. Rizki Pratama', rating: 4.8, ratingCount: 167, cover: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
    { id: 12, title: 'Kimia Organik Dasar', author: 'Dr. Budi Wijaya', rating: 4.7, ratingCount: 298, cover: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { id: 13, title: 'Agribisnis Modern', author: 'Ir. Yuni Safitri', rating: 4.7, ratingCount: 256, cover: 'bg-gradient-to-br from-lime-400 to-green-600' },
    { id: 14, title: 'Pemrograman Web', author: 'Andi Wijaya S.Kom', rating: 4.7, ratingCount: 223, cover: 'bg-gradient-to-br from-teal-400 to-teal-600' },
    { id: 15, title: 'Genetika Molekuler', author: 'Dr. Rina Kusuma', rating: 4.7, ratingCount: 201, cover: 'bg-gradient-to-br from-green-300 to-green-500' },
    { id: 16, title: 'Algoritma & Struktur Data', author: 'Ir. Dewi Lestari', rating: 4.6, ratingCount: 345, cover: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
    { id: 17, title: 'Kalkulus Lanjutan', author: 'Prof. Hendra M.', rating: 4.6, ratingCount: 278, cover: 'bg-gradient-to-br from-sky-400 to-sky-600' },
    { id: 18, title: 'Metalurgi Ekstraktif', author: 'Ir. Budi Santoso', rating: 4.6, ratingCount: 198, cover: 'bg-gradient-to-br from-orange-400 to-orange-600' },
    { id: 19, title: 'Mikrobiologi Terapan', author: 'Dr. Sinta Dewi', rating: 4.5, ratingCount: 267, cover: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    { id: 20, title: 'Kimia Fisika', author: 'Dr. Dian Purnama', rating: 4.5, ratingCount: 189, cover: 'bg-gradient-to-br from-pink-400 to-pink-600' }
  ];

  // Sort books by rating (descending), then by ratingCount (descending) as tiebreaker
  const sortedBooks = useMemo(() => {
    return [...booksData].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.ratingCount - a.ratingCount;
    }).map((book, index) => ({
      ...book,
      rank: index + 1
    }));
  }, []);

  const topBooks = sortedBooks.slice(0, 5);
  const allBooks = sortedBooks;

  // Users data with total pages read
  const usersData = [
    { id: 1, name: 'Dr. Ahmad Santoso', avatar: 'AS', avatarColor: 'bg-gradient-to-br from-blue-500 to-blue-600', totalPagesRead: 2450 },
    { id: 2, name: 'Prof. Siti Rahayu', avatar: 'SR', avatarColor: 'bg-gradient-to-br from-purple-500 to-purple-600', totalPagesRead: 2280 },
    { id: 3, name: 'Ir. Dewi Lestari', avatar: 'DL', avatarColor: 'bg-gradient-to-br from-pink-500 to-pink-600', totalPagesRead: 2100 },
    { id: 4, name: 'M. Andi Pratama', avatar: 'AP', avatarColor: 'bg-gradient-to-br from-green-500 to-green-600', totalPagesRead: 1950 },
    { id: 5, name: 'Dr. Rudi Hartono', avatar: 'RH', avatarColor: 'bg-gradient-to-br from-orange-500 to-orange-600', totalPagesRead: 1720 },
    { id: 6, name: 'Dr. Sinta Dewi', avatar: 'SD', avatarColor: 'bg-gradient-to-br from-emerald-500 to-emerald-700', totalPagesRead: 1580 },
    { id: 7, name: 'Prof. Hendra M.', avatar: 'HM', avatarColor: 'bg-gradient-to-br from-sky-500 to-sky-700', totalPagesRead: 1450 },
    { id: 8, name: 'Dr. Lisa Permata', avatar: 'LP', avatarColor: 'bg-gradient-to-br from-violet-500 to-violet-700', totalPagesRead: 1320 },
    { id: 9, name: 'Andi Wijaya S.Kom', avatar: 'AW', avatarColor: 'bg-gradient-to-br from-teal-500 to-teal-700', totalPagesRead: 1200 },
    { id: 10, name: 'Dr. Rahmat Hidayat', avatar: 'RH2', avatarColor: 'bg-gradient-to-br from-purple-600 to-purple-800', totalPagesRead: 1100 },
    { id: 11, name: 'Ir. Budi Santoso', avatar: 'BS', avatarColor: 'bg-gradient-to-br from-orange-500 to-orange-700', totalPagesRead: 1020 },
    { id: 12, name: 'Prof. Siti Aminah', avatar: 'SA', avatarColor: 'bg-gradient-to-br from-green-600 to-green-800', totalPagesRead: 980 },
    { id: 13, name: 'Dr. Rina Kusuma', avatar: 'RK', avatarColor: 'bg-gradient-to-br from-green-400 to-green-600', totalPagesRead: 920 },
    { id: 14, name: 'Prof. Joko Susilo', avatar: 'JS', avatarColor: 'bg-gradient-to-br from-blue-600 to-blue-800', totalPagesRead: 860 },
    { id: 15, name: 'Dr. Dian Purnama', avatar: 'DP', avatarColor: 'bg-gradient-to-br from-pink-500 to-pink-700', totalPagesRead: 800 },
    { id: 16, name: 'Ir. Tommy Chen', avatar: 'TC', avatarColor: 'bg-gradient-to-br from-cyan-600 to-cyan-800', totalPagesRead: 750 },
    { id: 17, name: 'M. Rizki Pratama', avatar: 'RP', avatarColor: 'bg-gradient-to-br from-indigo-600 to-indigo-800', totalPagesRead: 700 },
    { id: 18, name: 'Dr. Fitri Handayani', avatar: 'FH', avatarColor: 'bg-gradient-to-br from-rose-500 to-rose-700', totalPagesRead: 650 },
    { id: 19, name: 'Prof. Agus Setiawan', avatar: 'AS2', avatarColor: 'bg-gradient-to-br from-amber-500 to-amber-700', totalPagesRead: 600 },
    { id: 20, name: 'Ir. Sari Indah', avatar: 'SI', avatarColor: 'bg-gradient-to-br from-lime-500 to-lime-700', totalPagesRead: 560 }
  ];

  // Sort users by totalPagesRead (descending)
  const sortedUsers = useMemo(() => {
    return [...usersData].sort((a, b) => b.totalPagesRead - a.totalPagesRead).map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }, []);

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
        {topBooks.map((book) => (
          <div
            key={book.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
            onClick={() => setSelectedBook(book)}
          >
            {/* Rank Badge */}
            {getRankBadgeElement(book.rank)}

            {/* Book Cover */}
            <div className={`w-12 h-16 ${book.cover} rounded flex-shrink-0 shadow-md`}></div>

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
        ))}
        </div>
      )}

      {/* Users Leaderboard */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {topUsers.map((user) => (
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
                      <div className={`w-12 h-16 ${book.cover} rounded flex-shrink-0 shadow-md`}></div>

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

