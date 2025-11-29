const SuccessPopup = ({ onGoToDashboard, onGoToLogin }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Pendaftaran Berhasil!
        </h3>
        <p className="text-theme-secondary mb-8">
          Akun Anda telah berhasil dibuat. Silakan pilih untuk melanjutkan.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoToDashboard}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Langsung ke Dashboard
          </button>
          <button
            onClick={onGoToLogin}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;

