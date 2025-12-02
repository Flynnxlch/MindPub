import { useEffect, useState } from 'react'
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5'
import brainIcon from '../assets/images/brain-line-icon.svg'
import { useTheme } from '../context/ThemeContext'

const Navbar = ({ onOpenAuth, onOpenDashboard, onNavigateToHome, onNavigateToBooks, isLoggedIn, userName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userAvatar, setUserAvatar] = useState(null)
  const { theme, toggleTheme, isDark } = useTheme()

  // Load user avatar from localStorage
  useEffect(() => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.avatar_url) {
        const avatarUrl = user.avatar_url.startsWith('http') 
          ? user.avatar_url 
          : `http://localhost:5000${user.avatar_url}`
        setUserAvatar(avatarUrl)
      } else {
        setUserAvatar(null)
      }
    } else {
      setUserAvatar(null)
    }
  }, [isLoggedIn])

  // Listen for avatar updates
  useEffect(() => {
    const handleStorageChange = () => {
      if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.avatar_url) {
          const avatarUrl = user.avatar_url.startsWith('http') 
            ? user.avatar_url 
            : `http://localhost:5000${user.avatar_url}`
          setUserAvatar(avatarUrl)
        } else {
          setUserAvatar(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profileUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleStorageChange)
    }
  }, [isLoggedIn])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-theme-primary shadow-md border-b border-theme' 
        : 'bg-theme-secondary'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button 
            onClick={onNavigateToHome}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={brainIcon} 
                alt="MindPub Logo" 
                className="w-full h-full object-contain svg-primary"
              />
            </div>
            <span className="text-2xl font-bold transition-colors text-theme-primary">
              MindPub
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={onNavigateToHome}
              className="transition-colors font-medium text-theme-primary hover:text-primary-600"
            >
              Home
            </button>
            <button
              onClick={onNavigateToBooks}
              className="transition-colors font-medium text-theme-primary hover:text-primary-600"
            >
              Books
            </button>
            <a 
              href="#help" 
              className="transition-colors font-medium text-theme-primary hover:text-primary-600"
            >
              Help
            </a>
            
            {/* Theme Toggle Button - Circular with Animation */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              style={{ backgroundColor: isDark ? '#1e40af' : '#94a3b8' }}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                  isDark ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {isDark ? (
                  <IoMoonOutline className="w-4 h-4 text-blue-700" />
                ) : (
                  <IoSunnyOutline className="w-4 h-4 text-yellow-500" />
                )}
              </span>
            </button>
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onOpenDashboard}
                  className="btn-primary"
                >
                  Dashboard
                </button>
                <button 
                  onClick={onOpenDashboard}
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-primary-700 transition-colors overflow-hidden relative"
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName || 'User'} 
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const parent = e.target.parentElement
                        if (parent) {
                          const fallback = parent.querySelector('.avatar-fallback')
                          if (fallback) fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <span className="avatar-fallback" style={{ display: userAvatar ? 'none' : 'block' }}>
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn-primary"
              >
                Join Us
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md transition-colors text-theme-primary hover:bg-theme-tertiary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-theme">
            <button
              onClick={() => {
                onNavigateToHome();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-theme-primary hover:text-primary-600 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigateToBooks();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-theme-primary hover:text-primary-600 transition-colors font-medium"
            >
              Books
            </button>
            <a
              href="#help"
              className="block text-theme-primary hover:text-primary-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Help
            </a>
            
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between w-full">
              <span className="text-theme-primary font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none"
                style={{ backgroundColor: isDark ? '#1e40af' : '#94a3b8' }}
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                    isDark ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {isDark ? (
                    <IoMoonOutline className="w-4 h-4 text-blue-700" />
                  ) : (
                    <IoSunnyOutline className="w-4 h-4 text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    onOpenDashboard();
                    setIsMenuOpen(false);
                  }}
                  className="btn-primary flex-1"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    onOpenDashboard();
                    setIsMenuOpen(false);
                  }}
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-primary-700 transition-colors overflow-hidden relative"
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName || 'User'} 
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const parent = e.target.parentElement
                        if (parent) {
                          const fallback = parent.querySelector('.avatar-fallback')
                          if (fallback) fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <span className="avatar-fallback" style={{ display: userAvatar ? 'none' : 'block' }}>
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  onOpenAuth();
                  setIsMenuOpen(false);
                }}
                className="btn-primary w-full"
              >
              Join Us
            </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

