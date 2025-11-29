import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import BooksPage from './pages/BooksPage';
import ReadPage from './pages/ReadPage';
import AuthOverlay from './components/AuthOverlay';
import SuccessPopup from './components/SuccessPopup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'books', or 'read'
  const [showAuth, setShowAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [readingBook, setReadingBook] = useState(null);

  const handleLogin = (formData) => {
    // Simulasi login - cek apakah user adalah admin
    const isAdmin = formData.email.toLowerCase().includes('admin');
    
    const userData = {
      name: formData.username || formData.email.split('@')[0],
      email: formData.email,
      isAdmin: isAdmin
    };
    
    setUser(userData);
    setShowAuth(false);
    
    // Buka dashboard sesuai role
    if (isAdmin) {
      setShowAdminDashboard(true);
    } else {
      setShowUserDashboard(true);
    }
  };

  const handleRegister = (formData) => {
    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }
    
    // Simulasi register
    const userData = {
      name: formData.username,
      email: formData.email,
      isAdmin: false
    };
    
    setUser(userData);
    setShowAuth(false);
    setShowSuccess(true);
  };

  const handleGoToDashboard = () => {
    setShowSuccess(false);
    if (user.isAdmin) {
      setShowAdminDashboard(true);
    } else {
      setShowUserDashboard(true);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccess(false);
    setShowAuth(true);
  };

  const handleLogout = () => {
    setUser(null);
    setShowUserDashboard(false);
    setShowAdminDashboard(false);
  };

  const openAuthOverlay = () => {
    setShowAuth(true);
  };

  const openDashboard = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      if (user.isAdmin) {
        setShowAdminDashboard(true);
      } else {
        setShowUserDashboard(true);
      }
    }
  };

  const handleStartReading = (book) => {
    setReadingBook(book);
    setCurrentPage('read');
  };

  const handleCloseReader = () => {
    setReadingBook(null);
    setCurrentPage('books');
  };

  return (
    <>
      {currentPage === 'home' && (
        <LandingPage 
          onOpenAuth={openAuthOverlay}
          onOpenDashboard={openDashboard}
          onNavigateToBooks={() => setCurrentPage('books')}
          onStartReading={handleStartReading}
          isLoggedIn={!!user}
          userName={user?.name}
        />
      )}
      
      {currentPage === 'books' && (
        <BooksPage 
          onOpenAuth={openAuthOverlay}
          onOpenDashboard={openDashboard}
          onNavigateToHome={() => setCurrentPage('home')}
          onStartReading={handleStartReading}
          isLoggedIn={!!user}
          userName={user?.name}
        />
      )}

      {currentPage === 'read' && readingBook && (
        <ReadPage 
          book={readingBook}
          onClose={handleCloseReader}
          onOpenAuth={openAuthOverlay}
          onOpenDashboard={openDashboard}
          isLoggedIn={!!user}
          userName={user?.name}
        />
      )}
      
      {showAuth && (
        <AuthOverlay
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
      
      {showSuccess && (
        <SuccessPopup
          onGoToDashboard={handleGoToDashboard}
          onGoToLogin={handleGoToLogin}
        />
      )}
      
      {showUserDashboard && (
        <UserDashboard
          onClose={() => setShowUserDashboard(false)}
          onLogout={handleLogout}
          userName={user?.name}
        />
      )}
      
      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
          onLogout={handleLogout}
          userName={user?.name}
        />
      )}
    </>
  );
}

export default App;

