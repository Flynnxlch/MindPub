import { IoLogOutOutline, IoCloseOutline } from 'react-icons/io5';

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-6 border-b border-theme">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <IoLogOutOutline className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary">Logout</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-theme-tertiary hover:text-theme-primary transition-colors"
              aria-label="Close"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-theme-secondary text-lg mb-6">
            Apakah Anda yakin ingin logout? Anda akan perlu login kembali untuk mengakses dashboard.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-theme-tertiary text-theme-primary rounded-lg hover:opacity-80 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center space-x-2"
            >
              <IoLogOutOutline className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;

