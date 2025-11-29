import { useState } from 'react';
import { IoBookOutline, IoBookmarkOutline, IoCheckmarkDoneCircleOutline, IoLogOutOutline, IoPersonOutline, IoStatsChartOutline } from 'react-icons/io5';
import brainIcon from '../assets/images/brain-line-icon.svg';
import LogoutConfirmation from './LogoutConfirmation';

const UserDashboard = ({ onClose, onLogout, userName = "User" }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profile, setProfile] = useState({
    name: userName,
    email: 'user@example.com',
    bio: 'Seorang pembaca yang antusias'
  });
  const [bookmarks, setBookmarks] = useState([
    { id: 1, title: 'The Art of Programming', author: 'John Doe', date: '2025-11-20' },
    { id: 2, title: 'Design Patterns', author: 'Gang of Four', date: '2025-11-15' },
    { id: 3, title: 'Clean Code', author: 'Robert Martin', date: '2025-11-10' }
  ]);
  
  // User statistics data
  const [userStats] = useState({
    pagesRead: 1247,
    bookmarksCount: bookmarks.length,
    booksFinished: 12
  });
  
  const [recentlyRead] = useState([
    { 
      id: 1, 
      title: 'The Art of Programming', 
      author: 'John Doe', 
      progress: 75,
      lastRead: '2 jam yang lalu',
      coverColor: 'from-blue-500 to-purple-600'
    },
    { 
      id: 2, 
      title: 'Design Patterns', 
      author: 'Gang of Four', 
      progress: 45,
      lastRead: '1 hari yang lalu',
      coverColor: 'from-green-500 to-teal-600'
    },
    { 
      id: 3, 
      title: 'Clean Code', 
      author: 'Robert Martin', 
      progress: 90,
      lastRead: '3 hari yang lalu',
      coverColor: 'from-orange-500 to-red-600'
    },
    { 
      id: 4, 
      title: 'JavaScript: The Good Parts', 
      author: 'Douglas Crockford', 
      progress: 30,
      lastRead: '5 hari yang lalu',
      coverColor: 'from-pink-500 to-rose-600'
    }
  ]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = () => {
    alert('Profil berhasil disimpan!');
  };

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter(book => book.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white p-6">
          <div className="mb-8 flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={brainIcon} 
                alt="MindPub Logo" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">MindPub</h2>
              <p className="text-blue-200 text-xs">User Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'dashboard'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoStatsChartOutline className="text-xl" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveMenu('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'profile'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoPersonOutline className="text-xl" />
              <span>Customize Profile</span>
            </button>
            <button
              onClick={() => setActiveMenu('bookmarks')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'bookmarks'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoBookmarkOutline className="text-xl" />
              <span>Bookmarked Books</span>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors text-red-200 hover:text-white mt-8 flex items-center space-x-3"
            >
              <IoLogOutOutline className="text-xl" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-theme-card border-b border-theme p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">
                {activeMenu === 'dashboard' && 'Dashboard'}
                {activeMenu === 'profile' && 'Customize Profile'}
                {activeMenu === 'bookmarks' && 'Bookmarked Books'}
              </h1>
              <p className="text-theme-secondary text-sm mt-1">
                {activeMenu === 'dashboard' && 'Statistik dan aktivitas membaca Anda'}
                {activeMenu === 'profile' && 'Kelola informasi profil Anda'}
                {activeMenu === 'bookmarks' && 'Daftar buku yang telah Anda tandai'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-theme-secondary text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-theme-secondary">
            {activeMenu === 'dashboard' && (
              <div>
                {/* Welcome Message */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-theme-primary">
                    Selamat datang, {profile.name}!
                  </h2>
                  <p className="text-theme-secondary mt-2">
                    Semangat membaca hari ini! Ini adalah ringkasan aktivitas membaca Anda.
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Pages Read Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoBookOutline className="text-3xl" />
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-sm">Total</p>
                        <p className="text-3xl font-bold">{userStats.pagesRead.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-blue-100 font-medium">Halaman Dibaca</p>
                  </div>

                  {/* Bookmarks Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoBookmarkOutline className="text-3xl" />
                      </div>
                      <div className="text-right">
                        <p className="text-purple-100 text-sm">Total</p>
                        <p className="text-3xl font-bold">{userStats.bookmarksCount}</p>
                      </div>
                    </div>
                    <p className="text-purple-100 font-medium">Buku di-Bookmark</p>
                  </div>

                  {/* Books Finished Card */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoCheckmarkDoneCircleOutline className="text-3xl" />
                      </div>
                      <div className="text-right">
                        <p className="text-green-100 text-sm">Total</p>
                        <p className="text-3xl font-bold">{userStats.booksFinished}</p>
                      </div>
                    </div>
                    <p className="text-green-100 font-medium">Buku Selesai</p>
                  </div>
                </div>

                {/* Recently Read Books */}
                <div className="bg-theme-card rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-theme-primary">Recently Read Books</h2>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      Lihat Semua
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentlyRead.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-theme-secondary transition-colors border border-gray-100"
                      >
                        {/* Book Cover */}
                        <div className={`w-16 h-20 bg-gradient-to-br ${book.coverColor} rounded-lg shadow-md flex-shrink-0`}></div>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-theme-primary truncate">
                            {book.title}
                          </h3>
                          <p className="text-theme-secondary text-sm">
                            Oleh {book.author}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Terakhir dibaca: {book.lastRead}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-theme-secondary">Progress</span>
                              <span className="text-xs font-semibold text-blue-600">{book.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${book.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex-shrink-0">
                          Lanjutkan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="max-w-2xl">
                <div className="bg-theme-card rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Ganti Foto
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'bookmarks' && (
              <div>
                {bookmarks.length === 0 ? (
                  <div className="bg-theme-card rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-2">
                      Belum Ada Bookmark
                    </h3>
                    <p className="text-theme-secondary">
                      Mulai menandai buku favorit Anda!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarks.map((book) => (
                      <div
                        key={book.id}
                        className="bg-theme-card rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                          <div>
                            <h3 className="text-lg font-semibold text-theme-primary">
                              {book.title}
                            </h3>
                            <p className="text-theme-secondary text-sm">
                              Oleh {book.author}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Ditandai: {book.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Baca
                          </button>
                          <button
                            onClick={() => removeBookmark(book.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <LogoutConfirmation
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;

