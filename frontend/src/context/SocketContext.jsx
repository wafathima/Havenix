import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

// Create and export the context
export const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    console.log('Attempting to connect to Socket.IO...');
    
    const newSocket = io('http://localhost:5050', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully! ID:', newSocket.id);
      newSocket.emit('user-authenticated', user._id);
    });

    newSocket.on('connected', (data) => {
      console.log('Server confirmation:', data);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('user-online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user-offline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on('message-notification', (data) => {
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-[#8B7355] flex items-center justify-center text-white font-semibold">
                  {data.sender?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {data.sender?.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = `/dashboard?chat=${data.chatId}`;
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#8B7355] hover:text-[#6B5A45] focus:outline-none"
            >
              View
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right',
      });
    });

    newSocket.on('user-typing', ({ chatId, userId, userName }) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: { userId, userName }
      }));
    });

    newSocket.on('user-stopped-typing', ({ chatId }) => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[chatId];
        return newTyping;
      });
    });

    newSocket.on('messages-read-receipt', ({ chatId, userId, messageIds }) => {
      // Update message read status in your UI
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leave-chat', chatId);
    }
  };

  const sendMessage = (chatId, message) => {
    if (socket) {
      socket.emit('send-message', { chatId, message });
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing-start', {
        chatId,
        userId: user?._id,
        userName: user?.name
      });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('typing-stop', {
        chatId,
        userId: user?._id
      });
    }
  };

  const markMessagesRead = (chatId, messageIds) => {
    if (socket) {
      socket.emit('messages-read', {
        chatId,
        userId: user?._id,
        messageIds
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;