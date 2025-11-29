import { useState } from 'react';
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
import LogoutConfirmation from './LogoutConfirmation';

const AdminDashboard = ({ onClose, onLogout, userName = "Admin" }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profile] = useState({
    name: userName,
    email: 'admin@mindpub.com',
    role: 'Administrator'
  });

  // Admin Statistics
  const [adminStats] = useState({
    totalBooks: 48,
    totalUsers: 1250,
    booksUploaded: 12
  });

  // Books data
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'Algoritma & Struktur Data',
      author: 'Ir. Dewi Lestari',
      description: 'Fondasi algoritma dan struktur data untuk programmer.',
      coverUrl: '',
      coverColor: 'from-cyan-400 to-cyan-600',
      category: 'Informatika',
      pages: 300,
      uploadDate: '2025-11-20',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Fisika Kuantum Modern',
      author: 'Prof. Siti Rahayu',
      description: 'Eksplorasi mendalam tentang fisika kuantum dan aplikasinya.',
      coverUrl: '',
      coverColor: 'from-blue-400 to-blue-600',
      category: 'Fisika',
      pages: 420,
      uploadDate: '2025-11-15',
      status: 'Published'
    },
    {
      id: 3,
      title: 'Biologi Molekuler',
      author: 'Dr. Ahmad Santoso',
      description: 'Panduan lengkap memahami biologi molekuler dan genetika.',
      coverUrl: '',
      coverColor: 'from-green-400 to-green-600',
      category: 'Biologi',
      pages: 350,
      uploadDate: '2025-11-10',
      status: 'Published'
    }
  ]);

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
    fileUploaded: false
  });

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulasi parsing file untuk mendapatkan pages dan metadata
      // Dalam implementasi real, ini akan parse EPUB/PDF
      const simulatedPages = Math.floor(Math.random() * 500) + 100;
      
      // Simulasi data yang diparsing dari EPUB/PDF
      const parsedData = {
        title: 'The Art of ' + file.name.split('.')[0],
        author: 'John Doe',
        description: 'A comprehensive guide about ' + file.name.split('.')[0] + '. This book covers fundamental concepts and advanced techniques.',
        pages: simulatedPages
      };
      
      setNewBook({
        ...newBook,
        title: parsedData.title,
        author: parsedData.author,
        description: parsedData.description,
        pages: parsedData.pages,
        fileUploaded: true
      });
      
      alert(`File successfully uploaded!\n\nDetected:\n- ${simulatedPages} pages\n- Title: ${parsedData.title}\n- Author: ${parsedData.author}\n\nYou can edit this information before saving.`);
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
            coverPreview: reader.result
          });
        } else {
          setNewBook({
            ...newBook,
            coverUrl: reader.result,
            coverPreview: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBook = (e) => {
    e.preventDefault();
    const bookData = {
      id: books.length + 1,
      title: newBook.title,
      author: newBook.author,
      description: newBook.description,
      coverUrl: newBook.coverUrl,
      coverColor: 'from-indigo-500 to-purple-600',
      category: newBook.category,
      pages: newBook.pages,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    setBooks([bookData, ...books]);
    setShowUploadModal(false);
    setNewBook({ title: '', author: '', description: '', category: '', coverUrl: '', pages: 0 });
    alert('Book successfully uploaded!');
  };

  const handleEditBook = (book) => {
    setEditingBook({ ...book });
    setShowUploadModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setBooks(books.map(book => book.id === editingBook.id ? editingBook : book));
    setShowUploadModal(false);
    setEditingBook(null);
    alert('Changes successfully saved!');
  };

  const handleDeleteBook = (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setEditingBook(null);
    setNewBook({ title: '', author: '', description: '', category: '', coverUrl: '', coverPreview: '', pages: 0, fileUploaded: false });
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
              onClick={() => setActiveMenu('upload')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'upload'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoCloudUploadOutline className="text-xl" />
              <span>Upload New Book</span>
            </button>
            <button
              onClick={() => setActiveMenu('allbooks')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'allbooks'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoLibraryOutline className="text-xl" />
              <span>Manage Books</span>
            </button>
            <button
              onClick={() => setActiveMenu('tickets')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeMenu === 'tickets'
                  ? 'bg-theme-card bg-opacity-20 font-semibold'
                  : 'hover:bg-theme-card hover:bg-opacity-10'
              }`}
            >
              <IoTicketOutline className="text-xl" />
              <span>Manage Tickets</span>
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
              <span>Manage Profile</span>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors text-red-200 hover:text-white mt-8 flex items-center space-x-3"
            >
              <IoLogOutOutline className="text-xl" />
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
              className="text-gray-400 hover:text-theme-secondary text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-theme-secondary">
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
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
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoBookOutline className="text-3xl" />
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
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoPeopleOutline className="text-3xl" />
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
                      <div className="w-12 h-12 bg-theme-card bg-opacity-20 rounded-lg flex items-center justify-center">
                        <IoCheckmarkCircleOutline className="text-3xl" />
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
                    {books.slice(0, 3).map((book) => (
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
                            By {book.author} • {book.pages} pages
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              book.status === 'Published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {book.status}
                            </span>
                            <span className="text-gray-400 text-xs">{book.uploadDate}</span>
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
                    ))}
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
                            <p>• Title: {newBook.title}</p>
                            <p>• Author: {newBook.author}</p>
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
                              className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                              className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
                              placeholder="Enter author name"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-theme-primary font-semibold mb-2">
                            Description *
                          </label>
                          <textarea
                            name="description"
                            value={newBook.description}
                            onChange={handleNewBookChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                            className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                              <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-md border-2 border-theme">
                                <img 
                                  src={newBook.coverPreview} 
                                  alt="Cover Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setNewBook({ ...newBook, coverPreview: '', coverUrl: '' })}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
                          : 'bg-gray-300 text-theme-tertiary cursor-not-allowed'
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

                  <div className="divide-y divide-gray-200">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="p-6 hover:bg-theme-secondary transition-colors"
                      >
                        <div className="flex items-start space-x-6">
                          {/* Book Cover */}
                          <div className={`w-24 h-32 bg-gradient-to-br ${book.coverColor} rounded-lg shadow-md flex-shrink-0`}></div>

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
                                book.status === 'Published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {book.status}
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
                    ))}
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
                          3 Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {[
                      {
                        id: 1,
                        user: 'Dr. Ahmad Santoso',
                        userAvatar: 'AS',
                        subject: 'Cannot access book download',
                        category: 'Technical Issue',
                        message: 'I am unable to download the book "Fisika Kuantum". The download button is not working.',
                        date: '2025-11-29 10:30',
                        status: 'Pending'
                      },
                      {
                        id: 2,
                        user: 'Prof. Siti Rahayu',
                        userAvatar: 'SR',
                        subject: 'Missing pages in book',
                        category: 'Book Related',
                        message: 'The book "Biologi Molekuler" seems to be missing pages 45-50.',
                        date: '2025-11-29 09:15',
                        status: 'Pending'
                      },
                      {
                        id: 3,
                        user: 'Ir. Dewi Lestari',
                        userAvatar: 'DL',
                        subject: 'Request for new category',
                        category: 'Feature Request',
                        message: 'Can we add a category for Machine Learning and AI books?',
                        date: '2025-11-28 16:45',
                        status: 'Pending'
                      },
                      {
                        id: 4,
                        user: 'M. Andi Pratama',
                        userAvatar: 'AP',
                        subject: 'Bookmark not saving',
                        category: 'Technical Issue',
                        message: 'My bookmarks are not being saved properly.',
                        date: '2025-11-28 14:20',
                        status: 'Resolved'
                      },
                      {
                        id: 5,
                        user: 'Dr. Rudi Hartono',
                        userAvatar: 'RH',
                        subject: 'Profile picture upload issue',
                        category: 'Account Issue',
                        message: 'Unable to upload profile picture, getting error message.',
                        date: '2025-11-27 11:00',
                        status: 'Resolved'
                      }
                    ].map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-6 hover:bg-theme-secondary transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          {/* User Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                            {ticket.userAvatar}
                          </div>

                          {/* Ticket Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-theme-primary">
                                  {ticket.subject}
                                </h3>
                                <p className="text-sm text-theme-secondary mt-1">
                                  From: <span className="font-semibold">{ticket.user}</span>
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                ticket.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {ticket.status}
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
                                <span>{ticket.date}</span>
                              </div>
                              
                              {ticket.status === 'Pending' && (
                                <div className="flex space-x-2">
                                  <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                                    Resolve
                                  </button>
                                  <button className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold">
                                    Reply
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                className="text-gray-400 hover:text-theme-secondary text-2xl font-bold"
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
                    className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                    className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-primary font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={editingBook.description}
                  onChange={handleNewBookChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                  className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-purple-500"
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
                    <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-md border-2 border-theme">
                      <img 
                        src={editingBook.coverPreview || editingBook.coverUrl} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingBook({ ...editingBook, coverPreview: '', coverUrl: '' })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold mb-3">
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
                <p className="text-xs text-blue-700 mt-3">
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
                  className="flex-1 bg-gray-200 text-theme-primary py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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

