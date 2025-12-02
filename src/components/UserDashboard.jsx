import { useState, useEffect } from 'react';
import { IoBookOutline, IoBookmarkOutline, IoCheckmarkDoneCircleOutline, IoLogOutOutline, IoPersonOutline, IoStatsChartOutline } from 'react-icons/io5';
import brainIcon from '../assets/images/brain-line-icon.svg';
import LogoutConfirmation from './LogoutConfirmation';
import { userService, bookmarkService, readingService } from '../services';

const UserDashboard = ({ onClose, onLogout, userName = "User" }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  
  const [profile, setProfile] = useState({
    name: userName,
    email: user.email || 'user@example.com',
    bio: user.bio || 'Seorang pembaca yang antusias',
    avatar_url: user.avatar_url || null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  
  // User statistics data
  const [userStats, setUserStats] = useState({
    pagesRead: 0,
    bookmarksCount: 0,
    booksFinished: 0
  });
  
  const [recentlyRead, setRecentlyRead] = useState([]);

  // Load data from backend
  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId, activeMenu]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeMenu]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (activeMenu === 'dashboard') {
        // Load user stats
        const stats = await userService.getStats(userId);
        setUserStats({
          pagesRead: stats.stats?.total_pages_read || 0,
          bookmarksCount: stats.stats?.bookmarks_count || 0,
          booksFinished: stats.stats?.books_finished || 0
        });
        
        // Load recent reads
        const recent = await readingService.getRecentReads(userId, 4);
        setRecentlyRead(recent.books || []);
      } else if (activeMenu === 'bookmarks') {
        // Load bookmarks
        const bookmarksData = await bookmarkService.getUserBookmarks(userId);
        setBookmarks(bookmarksData.bookmarks || []);
      } else if (activeMenu === 'profile') {
        // Load profile
        const profileData = await userService.getProfile(userId);
        if (profileData.user) {
          const avatarUrl = profileData.user.avatar_url 
            ? (profileData.user.avatar_url.startsWith('http') 
                ? profileData.user.avatar_url 
                : `http://localhost:5000${profileData.user.avatar_url}`)
            : null;
          setProfile({
            name: profileData.user.username || userName,
            email: profileData.user.email || user.email,
            bio: profileData.user.bio || '',
            avatar_url: avatarUrl
          });
          setAvatarPreview(avatarUrl);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.');
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB.');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const profileData = {
        username: profile.name,
        bio: profile.bio
      };
      
      // Add avatar file if selected
      if (avatarFile) {
        profileData.avatar = avatarFile;
      }
      
      const result = await userService.updateProfile(userId, profileData);
      
      if (result.success) {
        alert('Profil berhasil disimpan!');
        
        // Update profile state with new avatar URL
        if (result.user && result.user.avatar_url) {
          const avatarUrl = result.user.avatar_url.startsWith('http') 
            ? result.user.avatar_url 
            : `http://localhost:5000${result.user.avatar_url}`;
          setProfile(prev => ({
            ...prev,
            avatar_url: avatarUrl
          }));
          setAvatarPreview(avatarUrl);
        }
        
        // Update localStorage
        const updatedUser = { 
          ...user, 
          username: profile.name, 
          bio: profile.bio,
          avatar_url: result.user?.avatar_url || user.avatar_url
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger event for Navbar to update avatar
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Reset avatar file
        setAvatarFile(null);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      alert(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookId) => {
    if (confirm('Hapus bookmark ini?')) {
      try {
        setLoading(true);
        const result = await bookmarkService.removeBookmark(userId, bookId);
        
        if (result.success) {
          // Reload bookmarks
          await loadDashboardData();
        }
      } catch (err) {
        console.error('Remove bookmark error:', err);
        alert(err.message || 'Failed to remove bookmark. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'dashboard'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoStatsChartOutline className="text-xl text-white" />
              <span className="text-white">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveMenu('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'profile'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoPersonOutline className="text-xl text-white" />
              <span className="text-white">Customize Profile</span>
            </button>
            <button
              onClick={() => setActiveMenu('bookmarks')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'bookmarks'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoBookmarkOutline className="text-xl text-white" />
              <span className="text-white">Bookmarked Books</span>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors text-red-200 hover:text-white mt-8 flex items-center space-x-3"
            >
              <IoLogOutOutline className="text-xl text-red-200 hover:text-white" />
              <span className="text-red-200 hover:text-white">Logout</span>
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
              className="text-theme-secondary hover:text-theme-primary text-3xl font-bold transition-colors"
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
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
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
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
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
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
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
                    <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                      Lihat Semua
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentlyRead.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-theme-secondary transition-colors border border-theme"
                      >
                        {/* Book Cover */}
                        {(() => {
                          const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                          return (
                            <div className={`w-16 h-20 ${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${book.cover_color || 'from-blue-500 to-purple-600'}`} rounded-lg shadow-md flex-shrink-0 relative overflow-hidden`}>
                              {hasCover ? (
                                <img 
                                  src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                                  alt={book.title} 
                                  className="w-full h-full object-cover rounded-lg"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentElement;
                                    if (parent) {
                                      parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${book.cover_color || 'from-blue-500 to-purple-600'}`);
                                    }
                                  }}
                                />
                              ) : null}
                              {!hasCover && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                                  {book.title?.charAt(0) || 'B'}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-theme-primary truncate">
                            {book.title}
                          </h3>
                          <p className="text-theme-secondary text-sm">
                            Oleh {book.author}
                          </p>
                          <p className="text-theme-secondary text-xs mt-1">
                            Terakhir dibaca: {book.last_read_at ? new Date(book.last_read_at).toLocaleString('id-ID') : 'Belum pernah'}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-theme-secondary">Progress</span>
                              <span className="text-xs font-semibold text-primary-600">{book.progress_percentage || 0}%</span>
                            </div>
                            <div className="w-full bg-theme-tertiary rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${book.progress_percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex-shrink-0">
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
                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.avatar-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="avatar-fallback w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold"
                        style={{ display: avatarPreview ? 'none' : 'flex' }}
                      >
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <label className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      {avatarFile ? 'Foto Baru Dipilih' : 'Ganti Foto'}
                    </label>
                    {avatarFile && (
                      <button
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(profile.avatar_url);
                        }}
                        className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Batal
                      </button>
                    )}
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
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:border-primary-500"
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
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:border-primary-500"
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
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
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
                          {(() => {
                            const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                            return (
                              <div className={`w-12 h-16 ${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${book.cover_color || 'from-blue-500 to-purple-600'}`} rounded relative overflow-hidden`}>
                                {hasCover ? (
                                  <img 
                                    src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover rounded"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const parent = e.target.parentElement;
                                      if (parent) {
                                        parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${book.cover_color || 'from-blue-500 to-purple-600'}`);
                                      }
                                    }}
                                  />
                                ) : null}
                                {!hasCover && (
                                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                                    {book.title?.charAt(0) || 'B'}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="text-lg font-semibold text-theme-primary">
                              {book.title}
                            </h3>
                            <p className="text-theme-secondary text-sm">
                              Oleh {book.author}
                            </p>
                            <p className="text-theme-secondary text-xs mt-1">
                              Ditandai: {book.bookmarked_at ? new Date(book.bookmarked_at).toLocaleDateString('id-ID') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
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

