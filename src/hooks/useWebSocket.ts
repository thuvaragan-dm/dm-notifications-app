import { useState, useEffect, useCallback, useRef } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type?: "info" | "success" | "warning" | "error";
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  notifications: Notification[];
  userId?: string;
  connectionId?: string;
}

export const useWebSocket = (
  token: string | null,
  serverUrl: string = "wss://dm-notification-web-socket-server-238037281416.europe-west1.run.app"
) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    notifications: [],
    userId: undefined,
    connectionId: undefined,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingReadAcksRef = useRef<Set<string>>(new Set());
  const connectionStateRef = useRef<{
    userId?: string;
    connectionId?: string;
    isConnected: boolean;
  }>({
    userId: undefined,
    connectionId: undefined,
    isConnected: false,
  });

  const connect = useCallback(() => {
    if (!token) {
      setState((prev) => ({ ...prev, error: "Token is required to connect" }));
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
      userId: undefined,
      connectionId: undefined,
    }));

    try {
      const connectionUrl = `${serverUrl}?token=${encodeURIComponent(token)}`;
      console.log("Connecting to WebSocket:", connectionUrl);
      const ws = new WebSocket(connectionUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection opened");
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: null,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket message:", data);

          switch (data.type) {
            case "welcome":
              handleWelcomeMessage(data);
              break;
            case "notification":
              handleNotificationMessage(data);
              break;
            case "read_ack":
              handleReadAckMessage(data);
              break;
            case "error":
              handleErrorMessage(data);
              break;
            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: event.code !== 1000 ? "Connection closed unexpectedly" : null,
          userId: undefined,
          connectionId: undefined,
        }));

        // Don't auto-reconnect on authentication errors
        if (event.code === 1008) {
          console.log("Authentication failed, not reconnecting");
          return;
        }

        // Attempt to reconnect after 3 seconds for other errors
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: "Connection failed",
        }));
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Failed to create WebSocket connection",
      }));
    }
  }, [token, serverUrl]);

  const handleWelcomeMessage = useCallback((data: any) => {
    const { userId, connectionId, message } = data.data;
    console.log("🎉 Welcome message received:", {
      userId,
      connectionId,
      message,
    });

    // Update the ref immediately
    connectionStateRef.current = {
      userId,
      connectionId,
      isConnected: true,
    };

    setState((prev) => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      error: null,
      userId,
      connectionId,
    }));

    console.log(
      "✅ Connection established with userId:",
      userId,
      "connectionId:",
      connectionId
    );

    // Process any pending read acknowledgments
    if (pendingReadAcksRef.current.size > 0) {
      console.log(
        "📤 Processing pending read acknowledgments:",
        Array.from(pendingReadAcksRef.current)
      );
      pendingReadAcksRef.current.forEach((notificationId) => {
        sendReadAck(notificationId);
      });
      pendingReadAcksRef.current.clear();
    }
  }, []);

  const handleNotificationMessage = useCallback((data: any) => {
    const notificationData = data.data;

    const notification: Notification = {
      id: notificationData.id,
      title: notificationData.title,
      message: notificationData.body || notificationData.message,
      timestamp: new Date().toISOString(),
      type: "info",
    };

    console.log("📨 Notification received:", {
      notificationId: notification.id,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
    });

    setState((prev) => {
      console.log("🔍 Current state when notification received:", {
        isConnected: prev.isConnected,
        userId: prev.userId,
        connectionId: prev.connectionId,
      });

      return {
        ...prev,
        notifications: [notification, ...prev.notifications],
      };
    });

    // Immediately send read acknowledgement
    console.log(
      "📤 Sending immediate read acknowledgment for notification:",
      notification.id
    );
    sendReadAck(notification.id);
  }, []);

  const handleReadAckMessage = useCallback((data: any) => {
    const { notificationId, connectionId, success } = data.data;
    console.log("Read acknowledgment received:", {
      notificationId,
      connectionId,
      success,
    });

    if (!success) {
      console.error("Failed to mark notification as read:", notificationId);
    }
  }, []);

  const handleErrorMessage = useCallback((data: any) => {
    const { error, details } = data.data;
    console.error("WebSocket error message:", error, details);

    setState((prev) => ({
      ...prev,
      error: `${error}: ${details}`,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset the connection state ref
    connectionStateRef.current = {
      userId: undefined,
      connectionId: undefined,
      isConnected: false,
    };

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      userId: undefined,
      connectionId: undefined,
    }));
  }, []);

  const sendReadAck = useCallback((notificationId: string) => {
    const currentConnectionState = connectionStateRef.current;

    console.log(
      "🔍 Attempting to send read acknowledgment for:",
      notificationId
    );
    console.log("🔍 Current connection state (from ref):", {
      wsReady: wsRef.current?.readyState === WebSocket.OPEN,
      connectionId: currentConnectionState.connectionId,
      isConnected: currentConnectionState.isConnected,
    });

    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      currentConnectionState.connectionId &&
      currentConnectionState.isConnected
    ) {
      const message = {
        type: "read",
        data: {
          notificationId,
          connectionId: currentConnectionState.connectionId,
        },
        timestamp: Date.now(),
      };

      console.log("📤 Sending read acknowledgment payload:", {
        messageType: message.type,
        notificationId: message.data.notificationId,
        connectionId: message.data.connectionId,
        timestamp: message.timestamp,
        fullPayload: message,
      });

      wsRef.current.send(JSON.stringify(message));
      console.log(
        "✅ Read acknowledgment sent successfully for notification:",
        notificationId
      );
    } else {
      console.error("❌ Failed to send read acknowledgment:", {
        wsReady: wsRef.current?.readyState === WebSocket.OPEN,
        connectionId: currentConnectionState.connectionId,
        notificationId,
        isConnected: currentConnectionState.isConnected,
      });

      // If not properly connected yet, add to pending queue
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        (!currentConnectionState.connectionId ||
          !currentConnectionState.isConnected)
      ) {
        console.log(
          "⏳ Not fully connected yet, adding to pending queue:",
          notificationId
        );
        pendingReadAcksRef.current.add(notificationId);
      }
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "ping",
        data: {},
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("Sent ping message");
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: [] }));
  }, []);

  useEffect(() => {
    // Only disconnect when token is removed, don't auto-connect
    if (!token) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [disconnect, token]);

  return {
    ...state,
    connect,
    disconnect,
    clearNotifications,
    markAsRead: sendReadAck,
    sendPing,
  };
};
