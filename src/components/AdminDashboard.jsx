import { useEffect, useState } from 'react';
import {
    IoBookOutline,
    IoCheckmarkCircleOutline,
    IoCloudUploadOutline,
    IoLibraryOutline,
    IoLogOutOutline,
    IoPeopleOutline,
    IoPersonOutline,
    IoStatsChartOutline,
    IoTicketOutline
} from 'react-icons/io5';
import brainIcon from '../assets/images/brain-line-icon.svg';
import { useNotification } from '../context/NotificationContext';
import { bookService, leaderboardService, ticketService } from '../services';
import LogoutConfirmation from './LogoutConfirmation';

// eslint-disable-next-line react/prop-types
const AdminDashboard = ({ onClose, onLogout, userName = "Admin" }) => {
  const { showNotification } = useNotification();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  
  const [profile] = useState({
    name: userName,
    email: user.email || 'admin@mindpub.com',
    role: 'Administrator'
  });

  // Admin Statistics
  const [adminStats, setAdminStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    booksUploaded: 0
  });

  // Books data
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    coverUrl: '',
    coverPreview: '',
    pages: 0,
    fileUploaded: false,
    bookFile: null,
    coverFile: null,
    release_date: null
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (activeMenu === 'dashboard') {
        // Load platform stats
        const stats = await leaderboardService.getPlatformStats();
        setAdminStats({
          totalBooks: stats.stats?.totalBooks || 0,
          totalUsers: stats.stats?.totalUsers || 0,
          booksUploaded: stats.stats?.totalBooks || 0
        });
      } else if (activeMenu === 'allbooks') {
        // Load all books
        const booksData = await bookService.getAllBooks({ page: 1, limit: 100 });
        setBooks(booksData.books || []);
      } else if (activeMenu === 'tickets') {
        // Load tickets
        const ticketsData = await ticketService.getAllTickets();
        setTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data from backend
  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Listen for book upload/update events to refresh immediately
  useEffect(() => {
    const handleBookUploaded = () => {
      loadDashboardData();
    };

    window.addEventListener('bookUploaded', handleBookUploaded);
    window.addEventListener('bookUpdated', handleBookUploaded);
    window.addEventListener('bookRatingUpdated', handleBookUploaded);
    
    return () => {
      window.removeEventListener('bookUploaded', handleBookUploaded);
      window.removeEventListener('bookUpdated', handleBookUploaded);
      window.removeEventListener('bookRatingUpdated', handleBookUploaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewBookChange = (e) => {
    if (editingBook) {
      setEditingBook({
        ...editingBook,
        [e.target.name]: e.target.value
      });
    } else {
      setNewBook({
        ...newBook,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Preview file to get metadata
        const formData = new FormData();
        formData.append('book', file);
        
        const previewResult = await bookService.previewFile(formData);
        
        if (previewResult.success) {
          setNewBook({
            ...newBook,
            bookFile: file,
            fileUploaded: true,
            title: previewResult.metadata.title || '',
            author: previewResult.metadata.author || '',
            description: previewResult.metadata.description || '',
            pages: previewResult.metadata.pages || 0,
            fileType: previewResult.fileType,
            release_date: previewResult.metadata.published || null
          });
        } else {
          alert('Failed to preview file. Please try again.');
        }
      } catch (err) {
        console.error('Preview error:', err);
        alert(err.message || 'Failed to preview file. Please try again.');
        // Still allow upload even if preview fails
        setNewBook({
          ...newBook,
          bookFile: file,
          fileUploaded: true
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingBook) {
          setEditingBook({
            ...editingBook,
            coverUrl: reader.result,
            coverPreview: reader.result,
            coverFile: file
          });
        } else {
          setNewBook({
            ...newBook,
            coverUrl: reader.result,
            coverPreview: reader.result,
            coverFile: file
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBook = async (e) => {
    e.preventDefault();
    
    if (!newBook.bookFile) {
      alert('Please upload a book file (EPUB or PDF)');
      return;
    }
    
    if (!newBook.category) {
      alert('Please select a category');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('book', newBook.bookFile);
      if (newBook.coverFile) {
        formData.append('cover', newBook.coverFile);
      }
      formData.append('title', newBook.title || '');
      formData.append('author', newBook.author || '');
      formData.append('description', newBook.description || '');
      formData.append('category', newBook.category);
      if (newBook.release_date) {
        formData.append('release_date', newBook.release_date);
      }
      formData.append('user_id', userId);
      
      const result = await bookService.uploadBook(formData);
      
      if (result.success) {
        // Show notification
        showNotification(
          `Book "${result.book?.title || 'Book'}" successfully uploaded! (${result.parsedData?.totalPages || 0} pages)`,
          'success',
          5000
        );
        
        setShowUploadModal(false);
        setNewBook({ 
          title: '', 
          author: '', 
          description: '', 
          category: '', 
          coverUrl: '', 
          coverPreview: '', 
          pages: 0, 
          fileUploaded: false,
          bookFile: null,
          coverFile: null,
          release_date: null
        });
        
        // Reload books
        await loadDashboardData();
        
        // Trigger refresh event for other components
        window.dispatchEvent(new CustomEvent('bookUploaded', { 
          detail: { book: result.book } 
        }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = (book) => {
    // Set cover preview URL if cover exists
    const coverPreview = book.cover_url 
      ? (book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`)
      : '';
    
    setEditingBook({ 
      ...book, 
      coverPreview: coverPreview,
      coverUrl: coverPreview,
      coverFile: null // Reset cover file when editing
    });
    setShowUploadModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', editingBook.title);
      formData.append('author', editingBook.author);
      formData.append('description', editingBook.description);
      formData.append('category', editingBook.category);
      if (editingBook.coverFile) {
        formData.append('cover', editingBook.coverFile);
      }
      
      const result = await bookService.updateBook(editingBook.id, formData);
      
      if (result.success) {
        // Show notification
        showNotification(
          `Book "${result.book?.title || 'Book'}" updated successfully!`,
          'success',
          3000
        );
        
        setShowUploadModal(false);
        setEditingBook(null);
        // Reload books
        await loadDashboardData();
        
        // Trigger refresh event for other components
        window.dispatchEvent(new CustomEvent('bookUploaded', { 
          detail: { book: result.book } 
        }));
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err.message || 'Failed to update book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        setLoading(true);
        const result = await bookService.deleteBook(id);
        
        if (result.success) {
          alert('Book successfully deleted!');
          // Reload books
          await loadDashboardData();
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert(err.message || 'Failed to delete book. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setEditingBook(null);
    setNewBook({ 
      title: '', 
      author: '', 
      description: '', 
      category: '', 
      coverUrl: '', 
      coverPreview: '', 
      pages: 0, 
      fileUploaded: false,
      bookFile: null,
      coverFile: null,
      release_date: null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-purple-600 to-indigo-800 text-white p-6">
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
              <p className="text-purple-200 text-xs">Admin Dashboard</p>
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
              onClick={() => setActiveMenu('upload')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'upload'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoCloudUploadOutline className="text-xl text-white" />
              <span className="text-white">Upload New Book</span>
            </button>
            <button
              onClick={() => setActiveMenu('allbooks')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'allbooks'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoLibraryOutline className="text-xl text-white" />
              <span className="text-white">Manage Books</span>
            </button>
            <button
              onClick={() => setActiveMenu('tickets')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-white ${
                activeMenu === 'tickets'
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <IoTicketOutline className="text-xl text-white" />
              <span className="text-white">Manage Tickets</span>
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
              <span className="text-white">Manage Profile</span>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors text-red-200 hover:text-white mt-8 flex items-center space-x-3"
            >
              <IoLogOutOutline className="text-xl text-red-200 hover:text-white" />
              <span>Log Out</span>
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
                {activeMenu === 'upload' && 'Upload New Book'}
                {activeMenu === 'allbooks' && 'All Books'}
                {activeMenu === 'tickets' && 'Manage Tickets'}
                {activeMenu === 'profile' && 'Manage Profile'}
              </h1>
              <p className="text-theme-secondary text-sm mt-1">
                {activeMenu === 'dashboard' && 'Statistics and overview of the platform'}
                {activeMenu === 'upload' && 'Upload new book to the platform'}
                {activeMenu === 'allbooks' && 'Manage all books available'}
                {activeMenu === 'tickets' && 'Manage tickets and support from users'}
                {activeMenu === 'profile' && 'Manage admin profile information'}
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
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-theme-primary text-lg">Loading...</div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && !loading && (
              <div>
                {/* Welcome Message */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-theme-primary">
                      Welcome, {profile.name}!
                  </h2>
                  <p className="text-theme-secondary mt-2">
                    This is the summary of the MindPub platform statistics.
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Books Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoBookOutline className="text-3xl text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-purple-100 text-sm">Total</p>
                        <p className="text-3xl font-bold">{adminStats.totalBooks}</p>
                      </div>
                    </div>
                    <p className="text-purple-100 font-medium">Total Books</p>
                  </div>

                  {/* Total Users Card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoPeopleOutline className="text-3xl text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-100 text-sm">Total</p>
                        <p className="text-3xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-indigo-100 font-medium">Total Registered Users</p>
                  </div>

                  {/* Books Uploaded Card */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoCheckmarkCircleOutline className="text-3xl text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-green-100 text-sm">This Month</p>
                        <p className="text-3xl font-bold">{adminStats.booksUploaded}</p>
                      </div>
                    </div>
                    <p className="text-green-100 font-medium">Books Uploaded</p>
                  </div>
                </div>

                {/* Recent Books */}
                <div className="bg-theme-card rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-theme-primary">Recent Books</h2>
                    <button 
                      onClick={() => setActiveMenu('allbooks')}
                      className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                    >
                        View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {books.length === 0 ? (
                      <div className="text-center py-8 text-theme-secondary">
                        No books available yet
                      </div>
                    ) : (
                      books.slice(0, 3).map((book) => (
                        <div
                          key={book.id}
                          className="flex items-center space-x-4 p-4 rounded-lg hover:bg-theme-secondary transition-colors border border-theme"
                        >
                        {/* Book Cover */}
                        {(() => {
                          const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                          return (
                            <div className={`w-16 h-20 ${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`} rounded-lg shadow-md flex-shrink-0 relative overflow-hidden`}>
                              {hasCover ? (
                                <img 
                                  src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                                  alt={book.title} 
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentElement;
                                    if (parent) {
                                      parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`);
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
                            By {book.author} • {book.pages} pages
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              book.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {book.status || 'published'}
                            </span>
                            <span className="text-theme-secondary text-xs">
                              {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button 
                          onClick={() => handleEditBook(book)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex-shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Book View */}
            {activeMenu === 'upload' && (
              <div className="max-w-3xl">
                <div className="bg-theme-card rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-theme-primary mb-6">Upload New Book</h2>
                  
                  <form onSubmit={handleUploadBook} className="space-y-6">
                    {/* File Upload */}
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Book File (EPUB/PDF) *
                      </label>
                      <input
                        type="file"
                        accept=".epub,.pdf"
                        onChange={handleFileUpload}
                        className="w-full px-4 py-3 border-2 border-dashed border-theme rounded-lg focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                        required
                      />
                      <p className="text-theme-tertiary text-sm mt-2">
                        Upload file EPUB or PDF. Metadata will be automatically detected.
                      </p>
                      {newBook.fileUploaded && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-700 font-semibold mb-2">File successfully uploaded!</p>
                          <div className="text-sm text-green-600 space-y-1">
                            <p>• Pages: {newBook.pages} pages</p>
                            <p>• Title: {newBook.title || 'Not detected'}</p>
                            <p>• Author: {newBook.author || 'Not detected'}</p>
                            {newBook.release_date && (
                              <p>• Date: {new Date(newBook.release_date).toLocaleDateString()}</p>
                            )}
                            {newBook.description && (
                              <p>• Description: {newBook.description.substring(0, 100)}{newBook.description.length > 100 ? '...' : ''}</p>
                            )}
                            <p className="text-xs text-green-500 mt-2">* You can edit the information below before saving</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {newBook.fileUploaded && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-theme-primary font-semibold mb-2">
                              Book Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={newBook.title}
                              onChange={handleNewBookChange}
                              className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                              placeholder="Enter book title"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-theme-primary font-semibold mb-2">
                              Author *
                            </label>
                            <input
                              type="text"
                              name="author"
                              value={newBook.author}
                              onChange={handleNewBookChange}
                              className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                              placeholder="Enter author name"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-theme-primary font-semibold">
                              Description *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
                                setNewBook({
                                  ...newBook,
                                  description: loremIpsum
                                });
                              }}
                              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                              title="Fill with Lorem ipsum text"
                            >
                              Fill Lorem Ipsum
                            </button>
                          </div>
                          <textarea
                            name="description"
                            value={newBook.description}
                            onChange={handleNewBookChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                            placeholder="Enter book description"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-theme-primary font-semibold mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={newBook.category}
                            onChange={handleNewBookChange}
                            className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-purple-500"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="Biologi">Biologi</option>
                            <option value="Fisika">Fisika</option>
                            <option value="Kimia">Kimia</option>
                            <option value="Informatika">Informatika</option>
                            <option value="Sistem Informasi">Sistem Informasi</option>
                            <option value="Pertambangan">Pertambangan</option>
                            <option value="Agribisnis">Agribisnis</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-theme-primary font-semibold mb-2">
                            Book Cover (Optional)
                          </label>
                          <div className="space-y-3">
                            {newBook.coverPreview && (
                              <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-md border-2 border-green-500 border-dashed">
                                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                                  Preview
                                </div>
                                <img 
                                  src={newBook.coverPreview} 
                                  alt="Cover Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setNewBook({ ...newBook, coverPreview: '', coverUrl: '', coverFile: null })}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                                  title="Remove cover"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="w-full px-4 py-3 border-2 border-dashed border-theme rounded-lg focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                            />
                            <p className="text-theme-tertiary text-sm">
                              Upload book cover image. If empty, default gradient cover will be used.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={!newBook.fileUploaded}
                      className={`w-full py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg ${
                        newBook.fileUploaded
                          ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                          : 'bg-theme-secondary text-theme-tertiary cursor-not-allowed border border-theme'
                      }`}
                    >
                      {newBook.fileUploaded ? 'Upload Book' : 'Please upload EPUB/PDF file first'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* All Books View */}
            {activeMenu === 'allbooks' && (
              <div>
                <div className="bg-theme-card rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-theme">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-theme-primary">List of All Books</h2>
                        <p className="text-theme-secondary text-sm mt-1">Total: {books.length} books</p>
                      </div>
                      <button
                        onClick={() => setActiveMenu('upload')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        + Upload New Book
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-theme">
                    {books.length === 0 ? (
                      <div className="p-6 text-center text-theme-secondary">
                        No books available. Upload your first book!
                      </div>
                    ) : (
                      books.map((book) => (
                      <div
                        key={book.id}
                        className="p-6 hover:bg-theme-secondary transition-colors"
                      >
                        <div className="flex items-start space-x-6">
                          {/* Book Cover */}
                          {(() => {
                            const hasCover = book.cover_url && book.cover_url !== null && book.cover_url !== undefined && String(book.cover_url).trim() !== '';
                            return (
                              <div className={`w-24 h-32 ${hasCover ? 'bg-gray-100' : `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`} rounded-lg shadow-md flex-shrink-0 relative overflow-hidden`}>
                                {hasCover ? (
                                  <img 
                                    src={book.cover_url.startsWith('http') ? book.cover_url : `http://localhost:5000${book.cover_url}`} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const parent = e.target.parentElement;
                                      if (parent) {
                                        parent.className = parent.className.replace('bg-gray-100', `bg-gradient-to-br ${book.cover_color || 'from-indigo-500 to-purple-600'}`);
                                      }
                                    }}
                                  />
                                ) : null}
                                {!hasCover && (
                                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                                    {book.title?.charAt(0) || 'B'}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-theme-primary mb-2">
                              {book.title}
                            </h3>
                            <p className="text-theme-secondary mb-3">
                              By {book.author}
                            </p>
                            <p className="text-theme-secondary text-sm mb-3 line-clamp-2">
                              {book.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-theme-tertiary">
                                <strong>Pages:</strong> {book.pages}
                              </span>
                              <span className="text-theme-tertiary">
                                <strong>Category:</strong> {book.category}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                book.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {book.status || 'published'}
                            </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tickets View */}
            {activeMenu === 'tickets' && (
              <div>
                <div className="bg-theme-card rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-theme">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-theme-primary">User Support Tickets</h2>
                        <p className="text-theme-secondary text-sm mt-1">Manage user submissions and support requests</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          {tickets.filter(t => (t.status || 'pending').toLowerCase() === 'pending').length} Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-theme">
                    {loading ? (
                      <div className="p-6 text-center text-theme-secondary">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                      <div className="p-6 text-center text-theme-secondary">No tickets available</div>
                    ) : (
                      tickets.map((ticket) => {
                        const userInitials = (ticket.user?.username || ticket.user?.name || 'U').substring(0, 2).toUpperCase();
                        return (
                          <div
                            key={ticket.id}
                            className="p-6 hover:bg-theme-secondary transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              {/* User Avatar */}
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                {userInitials}
                              </div>

                              {/* Ticket Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-bold text-theme-primary">
                                      {ticket.subject}
                                    </h3>
                                    <p className="text-sm text-theme-secondary mt-1">
                                      From: <span className="font-semibold">{ticket.user?.username || ticket.user?.name || 'Unknown User'}</span>
                                    </p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    (ticket.status || 'pending').toLowerCase() === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {ticket.status || 'Pending'}
                                  </span>
                                </div>
                                
                                <p className="text-theme-primary text-sm mb-3">
                                  {ticket.message}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-theme-tertiary">
                                    <span className="px-2 py-1 bg-theme-tertiary rounded">
                                      {ticket.category}
                                    </span>
                                    <span>{new Date(ticket.created_at || ticket.date).toLocaleString()}</span>
                                  </div>
                                  
                                  <div className="flex space-x-2 mt-2">
                                    {(ticket.status || 'pending').toLowerCase() === 'pending' && (
                                      <>
                                        <button 
                                          onClick={async () => {
                                            try {
                                              await ticketService.updateTicket(userId, ticket.id, { status: 'resolved' });
                                              loadDashboardData();
                                            } catch (err) {
                                              console.error('Error resolving ticket:', err);
                                              alert('Failed to resolve ticket');
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                        >
                                          Resolve
                                        </button>
                                        <button className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold">
                                          Reply
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
                                          try {
                                            await ticketService.deleteTicket(ticket.id);
                                            loadDashboardData();
                                          } catch (err) {
                                            console.error('Error deleting ticket:', err);
                                            alert('Failed to delete ticket');
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile View */}
            {activeMenu === 'profile' && (
              <div className="max-w-2xl">
                <div className="bg-theme-card rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-theme-primary">{profile.name}</h3>
                      <p className="text-theme-secondary">{profile.role}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-purple-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-purple-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        User Role
                      </label>
                      <input
                        type="text"
                        value={profile.role}
                        className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-secondary text-theme-primary"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Book Modal */}
      {showUploadModal && editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-theme flex items-center justify-between">
              <h2 className="text-2xl font-bold text-theme-primary">Edit Book</h2>
              <button
                onClick={closeModal}
                className="text-theme-secondary hover:text-theme-primary text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-6 overflow-y-auto">
              {/* Book Preview */}
              <div className="bg-theme-secondary rounded-lg p-4 flex items-center space-x-4">
                <div className={`w-20 h-28 bg-gradient-to-br ${editingBook.coverColor} rounded-lg shadow-md flex-shrink-0`}></div>
                <div>
                  <p className="text-sm text-theme-secondary mb-1">Current Book</p>
                  <h3 className="font-bold text-theme-primary">{editingBook.title}</h3>
                  <p className="text-sm text-theme-secondary">By {editingBook.author}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-primary font-semibold mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editingBook.title}
                    onChange={handleNewBookChange}
                    className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-theme-primary font-semibold mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={editingBook.author}
                    onChange={handleNewBookChange}
                    className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-theme-primary font-semibold">
                    Description *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
                      setEditingBook({
                        ...editingBook,
                        description: loremIpsum
                      });
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    title="Fill with Lorem ipsum text"
                  >
                    Fill Lorem Ipsum
                  </button>
                </div>
                <textarea
                  name="description"
                  value={editingBook.description}
                  onChange={handleNewBookChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-purple-500"
                  placeholder="Enter book description"
                  required
                />
              </div>

              <div>
                <label className="block text-theme-primary font-semibold mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={editingBook.category}
                  onChange={handleNewBookChange}
                  className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Biologi">Biologi</option>
                  <option value="Fisika">Fisika</option>
                  <option value="Kimia">Kimia</option>
                  <option value="Informatika">Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Pertambangan">Pertambangan</option>
                  <option value="Agribisnis">Agribisnis</option>
                </select>
              </div>

              <div>
                <label className="block text-theme-primary font-semibold mb-2">
                  Book Cover
                </label>
                <div className="space-y-3">
                  {(editingBook.coverPreview || editingBook.coverUrl) && (
                    <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-md border-2 border-purple-500 border-dashed">
                      <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-2 py-1 rounded z-10">
                        {editingBook.coverFile ? 'New Preview' : 'Current Cover'}
                      </div>
                      <img 
                        src={editingBook.coverPreview || editingBook.coverUrl} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingBook({ ...editingBook, coverPreview: '', coverUrl: '', coverFile: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                        title="Remove cover"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full px-4 py-3 border-2 border-dashed border-theme rounded-lg focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  />
                  <p className="text-theme-tertiary text-sm">
                    Upload new cover image for the book.
                  </p>
                </div>
              </div>

              {/* Read-only Fields */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 font-semibold mb-3">
                  Information Cannot Be Changed
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-primary">Pages:</span>
                    <span className="font-semibold text-theme-primary">{editingBook.pages} pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-primary">Upload Date:</span>
                    <span className="font-semibold text-theme-primary">{editingBook.uploadDate}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                  * Pages are derived from parsing EPUB/PDF and cannot be changed
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-theme-secondary text-theme-primary py-3 rounded-lg font-semibold hover:bg-theme-tertiary transition-colors border border-theme"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AdminDashboard;

