# WebSocket Notification Electron App

A desktop application built with Electron that provides real-time notifications via WebSocket connections. The app connects to a notification service using a user ID and displays incoming notifications in a modern card-based UI.

## Features

- **Real-time Notifications**: Connect to WebSocket server and receive live notifications
- **Card-based UI**: Modern, clean interface for displaying notifications
- **Connection Status**: Visual indicator showing WebSocket connection status
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Notification Types**: Support for different notification types (info, success, warning, error)
- **Clear All**: Option to clear all notifications at once

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. (Optional) Start the test WebSocket server for testing:
   ```bash
   node test-server.js
   ```

The app will automatically connect to the WebSocket server at `wss://dm-notification-web-socket-server-238037281416.europe-west1.run.app` using a JWT token.

## Development

### Project Structure

```
src/
├── components/
│   ├── ConnectionStatus.tsx    # WebSocket connection indicator
│   ├── NotificationCard.tsx    # Individual notification display
│   └── NotificationList.tsx    # Container for notifications
├── hooks/
│   └── useWebSocket.ts         # WebSocket connection management
├── App.tsx                     # Main application component
└── App.css                     # Styling
```

### WebSocket Message Format

The app expects notifications in the following JSON format:

```json
{
  "type": "notification",
  "id": "unique-id",
  "title": "Notification Title",
  "message": "Notification message content",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "notificationType": "info|success|warning|error"
}
```

### Configuration

- **JWT Token**: Enter your JWT token in the app interface
- **WebSocket URL**: Defaults to `wss://dm-notification-web-socket-server-238037281416.europe-west1.run.app` in `useWebSocket.ts`

## Building for Production

```bash
npm run build
```

This will create a distributable Electron application.

## Test Server

The included `test-server.js` provides a simple WebSocket server for testing:

- Runs on port 8000
- Sends welcome message on connection
- Sends random test notifications every 10 seconds
- Supports user ID parameter in connection URL

## Technologies Used

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **WebSocket**: Real-time communication
- **Vite**: Build tool and development server

## License

MIT
