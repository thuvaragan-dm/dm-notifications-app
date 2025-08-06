import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { ConnectionStatus } from './components/ConnectionStatus';
import { NotificationList } from './components/NotificationList';
import './App.css';

function App() {
  const [token, setToken] = useState<string>('');
  
  const {
    isConnected,
    isConnecting,
    error,
    notifications,
    userId,
    connectionId,
    connect,
    disconnect,
    clearNotifications,
    markAsRead,
    sendPing
  } = useWebSocket(token || null);

  const handleConnect = () => {
    if (token.trim()) {
      connect();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setToken('');
  };

  const handlePing = () => {
    sendPing();
  };

  return (
    <div className="app min-h-screen w-full bg-gray-50">
      <div className="w-full h-full p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notification Center
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {isConnected && userId ? (
                  <>
                    Connected as: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">{userId}</span>
                    {connectionId && (
                      <span className="ml-2 text-xs text-gray-500">
                        (ID: {connectionId.substring(0, 8)}...)
                      </span>
                    )}
                  </>
                ) : token ? (
                  <>
                    Token: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                      {token.substring(0, 10)}...
                    </span>
                  </>
                ) : (
                  'Enter JWT token to connect'
                )}
              </p>
            </div>
            <ConnectionStatus
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={error}
              onReconnect={connect}
            />
          </div>
        </header>

        {/* Token Input Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="token-input" className="block text-sm font-medium text-gray-700 mb-2">
                JWT Token
              </label>
              <input
                id="token-input"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your JWT token here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isConnected}
              />
            </div>
            <div className="flex gap-2">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={!token.trim() || isConnecting}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 transition-colors duration-200"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handlePing}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Ping
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Connection Status Info */}
        {isConnected && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Connected to WebSocket Server
                </p>
                <p className="text-xs text-green-600 mt-1">
                  User ID: {userId} | Connection ID: {connectionId?.substring(0, 12)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only show notifications when connected */}
        {isConnected && (
          <NotificationList
            notifications={notifications}
            onClearAll={clearNotifications}
            onMarkAsRead={markAsRead}
          />
        )}
      </div>
    </div>
  );
}

export default App;
