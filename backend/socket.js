// // socket.js
// const Chat = require('./models/Chat');
// const Message = require('./models/Message');
// const socketIO = require('socket.io');
// const jwt = require('jsonwebtoken');

// let io;

// const initializeSocket = (server) => {
//   console.log('Initializing Socket.IO...');
  
//   const io = socketIO(server, {
//     cors: {
//       origin: "http://localhost:4000",
//       methods: ["GET", "POST"],
//       credentials: true,
//       transports: ['websocket', 'polling']
//     },
//     allowEIO3: true,
//     pingTimeout: 60000,
//     pingInterval: 25000
//   });

//   const onlineUsers = new Map();

//   io.on('connection', (socket) => {
//     console.log('✅ New client connected:', socket.id);
    
//     // Send connection confirmation
//     socket.emit('connected', { message: 'Connected to server', socketId: socket.id });

//     // Handle user authentication
//     socket.on('user-authenticated', (userId) => {
//       console.log('User authenticated:', userId);
//       socket.userId = userId;
//       onlineUsers.set(userId, socket.id);
//       socket.join(`user-${userId}`);
//       socket.broadcast.emit('user-online', userId);
//     });

//     // Handle joining chat room
//     socket.on('join-chat', (chatId) => {
//       socket.join(`chat-${chatId}`);
//       console.log(`User ${socket.userId} joined chat: ${chatId}`);
//     });

//     // Handle leaving chat room
//     socket.on('leave-chat', (chatId) => {
//       socket.leave(`chat-${chatId}`);
//       console.log(`User ${socket.userId} left chat: ${chatId}`);
//     });

//     // Handle new message
//     socket.on('send-message', async (data) => {
//       const { chatId, message } = data;
//       console.log('New message received:', chatId, message);
//       io.to(`chat-${chatId}`).emit('new-message', message);
      
//       try {
//         const chat = await Chat.findById(chatId).populate('participants');
//         if (chat) {
//           chat.participants.forEach(participant => {
//             if (participant._id.toString() !== socket.userId) {
//               io.to(`user-${participant._id}`).emit('message-notification', {
//                 chatId,
//                 message: message.content,
//                 sender: message.sender,
//                 chat: chat
//               });
//             }
//           });
//         }
//       } catch (error) {
//         console.error('Error handling message notification:', error);
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
//       console.log('Client disconnected:', socket.id);
//       if (socket.userId) {
//         onlineUsers.delete(socket.userId);
//         socket.broadcast.emit('user-offline', socket.userId);
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

const Chat = require('./models/Chat');
const Message = require('./models/Message');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  console.log('Initializing Socket.IO...');
  
  // Get allowed origins from environment variable
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4000', 'http://localhost:3000'];
  
  const io = socketIO(server, {
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:4000',
        'https://havenixfront.vercel.app'
      ];
      
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Socket CORS blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const onlineUsers = new Map();

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        console.log('Socket authenticated for user:', socket.userId);
      }
      next();
    } catch (err) {
      console.log('Socket authentication error:', err.message);
      // Allow connection even without auth, but user won't have userId
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);
    console.log('User ID from auth:', socket.userId);
    
    // Send connection confirmation
    socket.emit('connected', { 
      message: 'Connected to server', 
      socketId: socket.id,
      userId: socket.userId || null
    });

    // Handle user authentication (fallback for manual auth)
    socket.on('user-authenticated', (userData) => {
      const userId = userData.userId || userData;
      console.log('User authenticated via event:', userId);
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      socket.broadcast.emit('user-online', { userId });
      
      // Send current online users to the newly authenticated user
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit('online-users', onlineUsersList);
    });

    // Handle joining chat room
    socket.on('join-chat', (chatId) => {
      if (!chatId) {
        console.log('Invalid chatId received');
        return;
      }
      socket.join(`chat-${chatId}`);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
      socket.emit('chat-joined', { chatId });
    });

    // Handle leaving chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat-${chatId}`);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      const { chatId, message } = data;
      console.log('New message received for chat:', chatId);
      
      // Emit to all users in the chat room
      io.to(`chat-${chatId}`).emit('new-message', message);
      
      try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (chat && chat.participants) {
          // Notify other participants
          chat.participants.forEach(participant => {
            const participantId = participant._id || participant;
            if (participantId.toString() !== socket.userId) {
              io.to(`user-${participantId}`).emit('message-notification', {
                chatId,
                message: message.content || message.text,
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
