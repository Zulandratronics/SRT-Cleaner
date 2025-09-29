import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 px-4 py-2 rounded-md text-white flex items-center space-x-2 ${getBackgroundColor()} shadow-lg z-50 animate-in slide-in-from-left-5 duration-300`}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default Notification;