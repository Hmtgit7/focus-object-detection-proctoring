import { useEffect, useRef, useCallback, useState } from "react";
import socketService from "../services/socketService";
import useAuth from "./useAuth";

const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const listenersRef = useRef(new Map());

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("authToken");
      if (token) {
        console.log("🔌 Initializing socket connection...");
        socketService.connect(token);
      }
    }

    return () => {
      if (!isAuthenticated) {
        console.log("🔌 Disconnecting socket...");
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Set up connection status listeners
  useEffect(() => {
    const handleConnectionStatus = ({ connected, reason }) => {
      setIsConnected(connected);
      if (!connected && reason) {
        setConnectionError(reason);
      } else {
        setConnectionError(null);
      }
    };

    const handleConnectionError = ({ error }) => {
      setConnectionError(error);
      setIsConnected(false);
    };

    socketService.on("connection_status", handleConnectionStatus);
    socketService.on("connection_error", handleConnectionError);

    return () => {
      socketService.off("connection_status", handleConnectionStatus);
      socketService.off("connection_error", handleConnectionError);
    };
  }, []);

  // Join interview room
  const joinInterview = useCallback(
    (interviewId) => {
      if (isConnected) {
        socketService.joinInterview(interviewId);
      }
    },
    [isConnected]
  );

  // Leave interview room
  const leaveInterview = useCallback(
    (interviewId) => {
      if (isConnected) {
        socketService.leaveInterview(interviewId);
      }
    },
    [isConnected]
  );

  // Emit detection event
  const emitDetectionEvent = useCallback(
    (detectionData) => {
      if (isConnected) {
        socketService.emitDetectionEvent(detectionData);
      }
    },
    [isConnected]
  );

  // Emit video status
  const emitVideoStatus = useCallback(
    (statusData) => {
      if (isConnected) {
        socketService.emitVideoStatus(statusData);
      }
    },
    [isConnected]
  );

  // Emit interviewer action
  const emitInterviewerAction = useCallback(
    (actionData) => {
      if (isConnected) {
        socketService.emitInterviewerAction(actionData);
      }
    },
    [isConnected]
  );

  // Generic event listener
  const on = useCallback((event, callback) => {
    socketService.on(event, callback);

    // Keep track of listeners for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);
  }, []);

  // Remove event listener
  const off = useCallback((event, callback) => {
    socketService.off(event, callback);

    if (listenersRef.current.has(event)) {
      listenersRef.current.get(event).delete(callback);
    }
  }, []);

  // Cleanup all listeners
  useEffect(() => {
    return () => {
      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          socketService.off(event, callback);
        });
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    socket: socketService.socket,
    isConnected,
    connectionError,
    joinInterview,
    leaveInterview,
    emitDetectionEvent,
    emitVideoStatus,
    emitInterviewerAction,
    on,
    off,
  };
};

export default useSocket;
