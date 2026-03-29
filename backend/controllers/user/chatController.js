// const Chat = require("../../models/Chat");
// const Message = require("../../models/Message");
// const Property = require("../../models/Property");
// const Project = require("../../models/Project");
// const User = require("../../models/User");


// const getUserChats = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     let filter = { participants: userId };
    
//     const chats = await Chat.find(filter)
//       .populate("participants", "name email role")
//       .populate("property", "title images location price")
//       .populate("project", "name images location price")
//       .populate({
//         path: "lastMessage",
//         select: "content createdAt sender"
//       })
//       .sort("-lastMessageAt");

//     const chatsWithDetails = await Promise.all(chats.map(async (chat) => {
//       const unreadCount = await Message.countDocuments({
//         chat: chat._id,
//         sender: { $ne: userId },
//         readBy: { $nin: [userId] }
//       });

//       // Get other participant
//       const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());

//       const formattedChat = {
//         ...chat.toObject(),
//         unreadCount,
//         otherParticipant,
//         displayName: chat.property?.title || chat.project?.name || 'Chat',
//         displayImage: chat.property?.images?.[0] || chat.project?.images?.[0] || null
//       };

//       return formattedChat;
//     }));

//     const totalUnread = chatsWithDetails.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

//     res.json({
//       success: true,
//       chats: chatsWithDetails,
//       totalUnread
//     });
//   } catch (error) {
//     console.error("Error fetching chats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch chats"
//     });
//   }
// };

// const getOrCreateChat = async (req, res) => {
//   try {
//     const { propertyId, projectId, otherUserId } = req.body;
//     const currentUserId = req.user._id;
//     const currentUserRole = req.user.role;

//     // Validate other user exists
//     const otherUser = await User.findById(otherUserId);
    
//     if (!otherUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Role validation - Allow sellers to chat with builders
//     if (currentUserRole === 'seller' && otherUser.role === 'builder') {
//       // Sellers can chat with builders - allowed
//       console.log("Seller chatting with builder - allowed");
//     } 
//     else if (currentUserRole === 'builder' && otherUser.role === 'seller') {
//       // Builders can chat with sellers - allowed
//       console.log("Builder chatting with seller - allowed");
//     }
//     else if (currentUserRole === 'buyer' && otherUser.role !== 'seller') {
//       return res.status(403).json({
//         success: false,
//         message: "Buyers can only chat with sellers"
//       });
//     }
//     else if (currentUserRole === 'builder' && otherUser.role !== 'seller') {
//       return res.status(403).json({
//         success: false,
//         message: "Builders can only chat with sellers"
//       });
//     }
//     else if (currentUserRole === 'seller' && otherUser.role === 'seller') {
//       return res.status(403).json({
//         success: false,
//         message: "Sellers cannot chat with other sellers"
//       });
//     }

//     // Determine chat type
//     let chatType = '';
//     if (currentUserRole === 'seller' && otherUser.role === 'builder') {
//       chatType = 'seller-builder';
//     } else if (currentUserRole === 'builder' && otherUser.role === 'seller') {
//       chatType = 'seller-builder';
//     } else if (otherUser.role === 'seller') {
//       chatType = currentUserRole === 'buyer' ? 'buyer-seller' : 'seller-builder';
//     }

//     let query = {
//       participants: { $all: [currentUserId, otherUserId] }
//     };

//     if (propertyId) {
//       query.property = propertyId;
//     } else if (projectId) {
//       query.project = projectId;
//     }

//     let chat = await Chat.findOne(query)
//       .populate("participants", "name email role")
//       .populate("property", "title images location price")
//       .populate("project", "name images location price");

//     if (!chat) {
//       const chatData = {
//         participants: [currentUserId, otherUserId],
//         chatType: chatType || 'seller-builder' // Default for seller-builder chats
//       };
      
//       if (propertyId) chatData.property = propertyId;
//       if (projectId) chatData.project = projectId;
      
//       console.log("Creating new chat with data:", chatData);
      
//       chat = await Chat.create(chatData);
      
//       chat = await Chat.findById(chat._id)
//         .populate("participants", "name email role")
//         .populate("property", "title images location price")
//         .populate("project", "name images location price");
//     }

//     res.json({
//       success: true,
//       chat
//     });
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create chat",
//       error: error.message
//     });
//   }
// };


// const getChatMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.user._id;

//     const chat = await Chat.findById(chatId).populate('participants', 'role');
    
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: "Chat not found"
//       });
//     }

//     if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized"
//       });
//     }

//     const messages = await Message.find({ chat: chatId })
//       .populate("sender", "name")
//       .sort("-createdAt")
//       .limit(50);

//     // Mark messages as read
//     await Message.updateMany(
//       {
//         chat: chatId,
//         sender: { $ne: userId },
//         readBy: { $nin: [userId] }
//       },
//       {
//         $addToSet: { readBy: userId }
//       }
//     );

//     res.json({
//       success: true,
//       messages: messages.reverse()
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch messages"
//     });
//   }
// };



// const sendMessage = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { content } = req.body;
//     const userId = req.user._id;

//     if (!content?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Message content is required"
//       });
//     }

//     const chat = await Chat.findById(chatId);
    
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: "Chat not found"
//       });
//     }

//     if (!chat.participants.some(p => p.toString() === userId.toString())) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized"
//       });
//     }

//     const message = await Message.create({
//       chat: chatId,
//       sender: userId,
//       content: content.trim(),
//       readBy: [userId]
//     });

//     chat.lastMessage = message._id;
//     chat.lastMessageAt = new Date();
//     await chat.save();

//     const populatedMessage = await message.populate("sender", "name email");

//     // Get Socket.IO instance and emit the new message
//     const io = req.app.get('io');
//     if (io) {
//       // Emit to the chat room
//       io.to(`chat-${chatId}`).emit('new-message', populatedMessage);
      
//       // Emit notifications to other participants
//       chat.participants.forEach(participantId => {
//         if (participantId.toString() !== userId.toString()) {
//           io.to(`user-${participantId}`).emit('message-notification', {
//             chatId,
//             message: populatedMessage.content,
//             sender: populatedMessage.sender,
//             chat: chat
//           });
//         }
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: populatedMessage
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send message"
//     });
//   }
// };

// const deleteChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.user._id;

//     // Find the chat and check if user is a participant
//     const chat = await Chat.findById(chatId);
    
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: "Chat not found"
//       });
//     }

//     // Check if user is a participant
//     if (!chat.participants.some(p => p.toString() === userId.toString())) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to delete this chat"
//       });
//     }

//     // Delete all messages in this chat
//     await Message.deleteMany({ chat: chatId });

//     // Delete the chat
//     await Chat.findByIdAndDelete(chatId);

//     res.json({
//       success: true,
//       message: "Chat deleted successfully"
//     });

//   } catch (error) {
//     console.error("Error deleting chat:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete chat"
//     });
//   }
// };

// module.exports = {
//   getUserChats,
//   getChatMessages,
//   sendMessage,
//   getOrCreateChat,
//   deleteChat 
// };

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const Property = require("../../models/Property");
const Project = require("../../models/Project");
const User = require("../../models/User");
const { createNotification } = require("../../controllers/user/notificationController");

const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let filter = { participants: userId };
    
    const chats = await Chat.find(filter)
      .populate("participants", "name email role")
      .populate("property", "title images location price")
      .populate("project", "name images location price")
      .populate({
        path: "lastMessage",
        select: "content createdAt sender"
      })
      .sort("-lastMessageAt");

    const chatsWithDetails = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      });

      // Get other participant
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());

      const formattedChat = {
        ...chat.toObject(),
        unreadCount,
        otherParticipant,
        displayName: chat.property?.title || chat.project?.name || 'Chat',
        displayImage: chat.property?.images?.[0] || chat.project?.images?.[0] || null
      };

      return formattedChat;
    }));

    const totalUnread = chatsWithDetails.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

    res.json({
      success: true,
      chats: chatsWithDetails,
      totalUnread
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats"
    });
  }
};

const getOrCreateChat = async (req, res) => {
  try {
    const { propertyId, projectId, otherUserId } = req.body;
    const currentUserId = req.user._id;
    const currentUserRole = req.user.role;

    // Validate other user exists
    const otherUser = await User.findById(otherUserId);
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Role validation - Allow sellers to chat with builders
    if (currentUserRole === 'seller' && otherUser.role === 'builder') {
      // Sellers can chat with builders - allowed
      console.log("Seller chatting with builder - allowed");
    } 
    else if (currentUserRole === 'builder' && otherUser.role === 'seller') {
      // Builders can chat with sellers - allowed
      console.log("Builder chatting with seller - allowed");
    }
    else if (currentUserRole === 'buyer' && otherUser.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: "Buyers can only chat with sellers"
      });
    }
    else if (currentUserRole === 'builder' && otherUser.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: "Builders can only chat with sellers"
      });
    }
    else if (currentUserRole === 'seller' && otherUser.role === 'seller') {
      return res.status(403).json({
        success: false,
        message: "Sellers cannot chat with other sellers"
      });
    }

    // Determine chat type
    let chatType = '';
    if (currentUserRole === 'seller' && otherUser.role === 'builder') {
      chatType = 'seller-builder';
    } else if (currentUserRole === 'builder' && otherUser.role === 'seller') {
      chatType = 'seller-builder';
    } else if (otherUser.role === 'seller') {
      chatType = currentUserRole === 'buyer' ? 'buyer-seller' : 'seller-builder';
    }

    let query = {
      participants: { $all: [currentUserId, otherUserId] }
    };

    if (propertyId) {
      query.property = propertyId;
    } else if (projectId) {
      query.project = projectId;
    }

    let chat = await Chat.findOne(query)
      .populate("participants", "name email role")
      .populate("property", "title images location price")
      .populate("project", "name images location price");

    if (!chat) {
      const chatData = {
        participants: [currentUserId, otherUserId],
        chatType: chatType || 'seller-builder' // Default for seller-builder chats
      };
      
      if (propertyId) chatData.property = propertyId;
      if (projectId) chatData.project = projectId;
      
      console.log("Creating new chat with data:", chatData);
      
      chat = await Chat.create(chatData);
      
      chat = await Chat.findById(chat._id)
        .populate("participants", "name email role")
        .populate("property", "title images location price")
        .populate("project", "name images location price");
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
      error: error.message
    });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId).populate('participants', 'role');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name")
      .sort("-createdAt")
      .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const chat = await Chat.findById(chatId)
      .populate("participants", "name email role")
      .populate("property", "title")
      .populate("project", "name");
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      content: content.trim(),
      readBy: [userId]
    });

    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.save();

    const populatedMessage = await message.populate("sender", "name email");

    // Get the recipient
    const recipient = chat.participants.find(p => p._id.toString() !== userId.toString());
    
    // Determine notification title based on context
    let notificationTitle = "New Message";
    let notificationMessage = `${req.user.name} sent you a message`;
    
    if (chat.property) {
      notificationTitle = `New Message about ${chat.property.title}`;
      notificationMessage = `${req.user.name} messaged you about "${chat.property.title}"`;
    } else if (chat.project) {
      notificationTitle = `New Message about ${chat.project.name}`;
      notificationMessage = `${req.user.name} messaged you about "${chat.project.name}"`;
    }

    // Create notification for recipient
    if (recipient && recipient._id.toString() !== userId.toString()) {
     await createNotification(
       recipient._id,
       req.user._id,
       'message',
       notificationTitle,
       notificationMessage,
      { 
      chatId: chat._id,
      type: 'message'
  }
);
    }

    // Get Socket.IO instance and emit the new message
    const io = req.app.get('io');
    if (io) {
      // Emit to the chat room
      io.to(`chat-${chatId}`).emit('new-message', populatedMessage);
      
      // Emit notifications to other participants
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          io.to(`user-${participantId}`).emit('message-notification', {
            chatId,
            message: populatedMessage.content,
            sender: populatedMessage.sender,
            chat: chat
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find the chat and check if user is a participant
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this chat"
      });
    }

    // Delete all messages in this chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({
      success: true,
      message: "Chat deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat"
    });
  }
};

module.exports = {
  getUserChats,
  getChatMessages,
  sendMessage,
  getOrCreateChat,
  deleteChat 
};