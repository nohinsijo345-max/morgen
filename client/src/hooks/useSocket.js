import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinTicket = (ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ticket', ticketId);
    }
  };

  const leaveTicket = (ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-ticket', ticketId);
    }
  };

  const joinFarmer = (farmerId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-farmer', farmerId);
    }
  };

  const joinAdmin = () => {
    if (socketRef.current) {
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
    joinAdmin,
    onNewMessage,
    onTicketUpdated,
    offNewMessage,
    offTicketUpdated,
  };
};

export default useSocket;