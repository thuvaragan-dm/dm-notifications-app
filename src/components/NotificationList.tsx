import React from 'react';
import { Notification } from '../hooks/useWebSocket';
import { NotificationCard } from './NotificationCard';

interface NotificationListProps {
  notifications: Notification[];
  onClearAll: () => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onClearAll,
  onMarkAsRead
}) => {
  if (notifications.length === 0) {
    return (
      <div className="notification-list w-full">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500">Notifications will appear here when they arrive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-list w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Notifications ({notifications.length})
        </h2>
        <button
          onClick={onClearAll}
          className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
}; 