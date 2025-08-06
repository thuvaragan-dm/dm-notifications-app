import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  onReconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  error,
  onReconnect
}) => {
  const getStatusColor = () => {
    if (isConnected) return 'text-green-600 bg-green-100';
    if (isConnecting) return 'text-yellow-600 bg-yellow-100';
    if (error) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    if (error) return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnected) return '🟢';
    if (isConnecting) return '🟡';
    if (error) return '🔴';
    return '⚪';
  };

  return (
    <div className="connection-status">
      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
        <span className="mr-2">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        {error && (
          <button
            onClick={onReconnect}
            className="ml-3 px-2 py-1 text-xs bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}; 