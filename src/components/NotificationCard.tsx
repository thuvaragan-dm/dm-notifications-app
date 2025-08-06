import React from 'react';
import { Notification } from '../hooks/useWebSocket';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-green-500 bg-green-50';
    case 'warning':
      return 'border-yellow-500 bg-yellow-50';
    case 'error':
      return 'border-red-500 bg-red-50';
    default:
      return 'border-blue-500 bg-blue-50';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return 'ℹ️';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => {
  return (
    <div className={`notification-card border-l-4 p-4 mb-4 rounded-r-lg shadow-sm ${getTypeColor(notification.type || 'info')}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-lg mt-1">
            {getTypeIcon(notification.type || 'info')}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {notification.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {notification.message}
            </p>
            <div className="text-xs text-gray-500 mt-2">
              {formatTimestamp(notification.timestamp)}
            </div>
            {onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 px-2 py-1 rounded mt-2 transition-colors"
              >
                Mark as Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 