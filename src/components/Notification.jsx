import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { IoAlertCircleOutline, IoCheckmarkCircleOutline, IoCloseOutline, IoInformationCircleOutline, IoWarningOutline } from 'react-icons/io5';

const Notification = ({ message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircleOutline className="w-6 h-6" />;
      case 'info':
        return <IoInformationCircleOutline className="w-6 h-6" />;
      case 'warning':
        return <IoWarningOutline className="w-6 h-6" />;
      case 'error':
        return <IoAlertCircleOutline className="w-6 h-6" />;
      default:
        return <IoInformationCircleOutline className="w-6 h-6" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${getBgColor()} text-white rounded-lg shadow-2xl z-50 min-w-[300px] max-w-md transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <IoCloseOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  onClose: PropTypes.func,
  duration: PropTypes.number
};

export default Notification;

