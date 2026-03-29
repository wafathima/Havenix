// const Chat = require('./models/Chat');
// const Message = require('./models/Message');
// const socketIO = require('socket.io');
// const jwt = require('jsonwebtoken');

// let io;

// // const initializeSocket = (server) => {
// //   io = socketIO(server, {
// //     cors: {
// //       origin: "http://localhost:5173", // Your frontend URL
// //       methods: ["GET", "POST"],
// //       credentials: true
// //     }
// //   });

// const initializeSocket = (server) => {
//   const io = socketIO(server, {
//     cors: {
//       origin: "http://localhost:4000", // Your frontend URL
//       methods: ["GET", "POST"],
//       credentials: true,  // Important: allow credentials
//       allowedHeaders: ["my-custom-header"],
//       transports: ['websocket', 'polling'] // Allow both transport methods
//     },
//     allowEIO3: true // Allow compatibility with older clients
//   });

//   // Store online users
//   const onlineUsers = new Map();

//   io.on('connection', (socket) => {
//     console.log('New client connected:', socket.id);

//     // Handle user authentication
//     socket.on('user-authenticated', (userId) => {
//       socket.userId = userId;
//       onlineUsers.set(userId, socket.id);
      
//       // Join user to their personal room for direct messages
//       socket.join(`user-${userId}`);
      
//       // Broadcast online status to others
//       socket.broadcast.emit('user-online', userId);
      
//       console.log(`User ${userId} is now online`);
//     });

//     // Handle joining chat room
//     socket.on('join-chat', (chatId) => {
//       socket.join(`chat-${chatId}`);
//       console.log(`User ${socket.userId} joined chat room: chat-${chatId}`);
//     });

//     // Handle leaving chat room
//     socket.on('leave-chat', (chatId) => {
//       socket.leave(`chat-${chatId}`);
//       console.log(`User ${socket.userId} left chat room: chat-${chatId}`);
//     });

//     // Handle new message
//     socket.on('send-message', async (data) => {
//       const { chatId, message } = data;
      
//       // Emit to all users in the chat room
//       io.to(`chat-${chatId}`).emit('new-message', message);
      
//       // Also emit notification to other participants
//       const chat = await Chat.findById(chatId).populate('participants');
//       if (chat) {
//         chat.participants.forEach(participant => {
//           if (participant._id.toString() !== socket.userId) {
//             io.to(`user-${participant._id}`).emit('message-notification', {
//               chatId,
//               message: message.content,
//               sender: message.sender,
//               chat: chat
//             });
//           }
//         });
//       }
//     });

//     // Handle typing indicators
//     socket.on('typing-start', ({ chatId, userId, userName }) => {
//       socket.to(`chat-${chatId}`).emit('user-typing', { chatId, userId, userName });
//     });

//     socket.on('typing-stop', ({ chatId, userId }) => {
//       socket.to(`chat-${chatId}`).emit('user-stopped-typing', { chatId, userId });
//     });

//     // Handle message read receipts
//     socket.on('messages-read', ({ chatId, userId, messageIds }) => {
//       io.to(`chat-${chatId}`).emit('messages-read-receipt', { chatId, userId, messageIds });
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       if (socket.userId) {
//         onlineUsers.delete(socket.userId);
//         socket.broadcast.emit('user-offline', socket.userId);
//         console.log(`User ${socket.userId} disconnected`);
//       }
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized');
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIO };

// socket.js
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  console.log('Initializing Socket.IO...');
  
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:4000",
      methods: ["GET", "POST"],
      credentials: true,
      transports: ['websocket', 'polling']
    },
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);
    
    // Send connection confirmation
    socket.emit('connected', { message: 'Connected to server', socketId: socket.id });

    // Handle user authentication
    socket.on('user-authenticated', (userId) => {
      console.log('User authenticated:', userId);
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      socket.broadcast.emit('user-online', userId);
    });

    // Handle joining chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat-${chatId}`);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // Handle leaving chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat-${chatId}`);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      const { chatId, message } = data;
      console.log('New message received:', chatId, message);
      io.to(`chat-${chatId}`).emit('new-message', message);
      
      try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (chat) {
          chat.participants.forEach(participant => {
            if (participant._id.toString() !== socket.userId) {
              io.to(`user-${participant._id}`).emit('message-notification', {
                chatId,
                message: message.content,
                sender: message.sender,
                chat: chat
              });
            }
          });
        }
      } catch (error) {
        console.error('Error handling message notification:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing-start', ({ chatId, userId, userName }) => {
      socket.to(`chat-${chatId}`).emit('user-typing', { chatId, userId, userName });
    });

    socket.on('typing-stop', ({ chatId, userId }) => {
      socket.to(`chat-${chatId}`).emit('user-stopped-typing', { chatId, userId });
    });

    // Handle message read receipts
    socket.on('messages-read', ({ chatId, userId, messageIds }) => {
      io.to(`chat-${chatId}`).emit('messages-read-receipt', { chatId, userId, messageIds });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit('user-offline', socket.userId);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };