import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import BooksPage from './pages/BooksPage';
import ReadPage from './pages/ReadPage';
import AuthOverlay from './components/AuthOverlay';
import SuccessPopup from './components/SuccessPopup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { authService } from './services';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'books', or 'read'
  const [showAuth, setShowAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Don't auto-open dashboard on page load - let user decide
        // Dashboard state is managed separately and won't persist across refreshes
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          name: response.user.username,
          email: response.user.email,
          role: response.user.role,
          isAdmin: response.user.role === 'admin',
          bio: response.user.bio || '',
          avatar_url: response.user.avatar_url || null
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setShowAuth(false);
        
        // Buka dashboard sesuai role
        if (userData.isAdmin) {
          setShowAdminDashboard(true);
        } else {
          setShowUserDashboard(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      alert(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          name: response.user.username,
          email: response.user.email,
          role: response.user.role,
          isAdmin: response.user.role === 'admin',
          bio: response.user.bio || '',
          avatar_url: response.user.avatar_url || null
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setShowAuth(false);
        setShowSuccess(true);
        
        // Jangan langsung buka dashboard - biarkan user pilih dari popup
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      alert(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear localStorage
      localStorage.removeItem('user');
      setUser(null);
      setShowUserDashboard(false);
      setShowAdminDashboard(false);
    }
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

