import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Only initialize socket connection on customer support pages
    const currentPath = window.location.pathname;
    const isCustomerSupportPage = currentPath.includes('/customer-support') || 
                                  currentPath.includes('/messages') ||
                                  currentPath.includes('/support');
    
    if (!isCustomerSupportPage) {
      // Don't initialize socket if not on customer support page
      return;
    }

    // Check if server is likely running before attempting connection
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    
    // Create socket with minimal retry attempts
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 3000, // Reduced timeout
      reconnection: true, // Enable reconnection but with limits
      reconnectionAttempts: 3, // Only try 3 times
      reconnectionDelay: 1000, // Wait 1 second between attempts
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error) => {
      // Suppress connection errors but log them for debugging
      console.warn('🔌 Socket.IO connection failed (this is normal if server is offline):', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.warn('🔌 Socket.IO reconnection failed - real-time features disabled');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Provide safe fallbacks for all socket methods
  const joinTicket = (ticketId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-ticket', ticketId);
    }
  };

  const leaveTicket = (ticketId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-ticket', ticketId);
    }
  };

  const joinFarmer = (farmerId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-farmer', farmerId);
    }
  };

  const joinBuyer = (buyerId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-buyer', buyerId);
    }
  };

  const joinAdmin = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-admin');
    }
  };

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  };

  const onTicketUpdated = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('ticket-updated', callback);
    }
  };

  const offNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('new-message', callback);
    }
  };

  const offTicketUpdated = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('ticket-updated', callback);
    }
  };

  return {
    socket: socketRef.current,
    joinTicket,
    leaveTicket,
    joinFarmer,
    joinBuyer,
    joinAdmin,
    onNewMessage,
    onTicketUpdated,
    offNewMessage,
    offTicketUpdated,
  };
};

export default useSocket;