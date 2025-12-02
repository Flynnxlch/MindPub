import PropTypes from 'prop-types';
import { useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

const AuthOverlay = ({ onClose, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData);
    } else {
      onRegister(formData);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-theme-secondary text-2xl font-bold transition-colors"
        >
          ×
        </button>

        {/* Header */}
        <div className="p-8 pb-6">
          <h2 className="text-3xl font-bold text-theme-primary mb-2">
            {isLogin ? 'Selamat Datang Kembali!' : 'Daftar Sekarang'}
          </h2>
          <p className="text-theme-secondary">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru untuk memulai'}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex border-b border-theme px-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 font-semibold transition-all ${
              isLogin
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-theme-tertiary hover:text-theme-secondary'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 font-semibold transition-all ${
              !isLogin
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-theme-tertiary hover:text-theme-secondary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-theme-primary text-sm font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Masukkan username"
                required={!isLogin}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-theme-primary text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-theme-primary text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-5 h-5" />
                ) : (
                  <IoEyeOutline className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-theme-primary text-sm font-semibold mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Konfirmasi password"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline className="w-5 h-5" />
                  ) : (
                    <IoEyeOutline className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-theme-secondary">Ingat Saya</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Lupa Password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {isLogin ? 'Masuk' : 'Daftar'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-theme-secondary text-sm">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? 'Daftar' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

AuthOverlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired
};

export default AuthOverlay;

