import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';
import { FaPaperPlane, FaArrowLeft, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChatInterface = ({ chatId, property, project, onClose, onDelete }) => {
  const { user } = useContext(AuthContext);
  const { 
    socket, 
    onlineUsers, 
    typingUsers,
    joinChat, 
    leaveChat, 
    sendMessage, 
    startTyping, 
    stopTyping,
    markMessagesRead 
  } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const messageIdsSet = useRef(new Set()); // Track message IDs to prevent duplicates

  const otherParticipant = property?.seller || project?.builder || messages[0]?.sender;
  const isOtherOnline = onlineUsers.has(otherParticipant?._id);
  const typingUser = typingUsers[chatId];

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/chats/${chatId}/messages`);
      if (data.success) {
        // Clear the set of message IDs
        messageIdsSet.current.clear();
        
        // Add all message IDs to the set
        data.messages.forEach(msg => {
          messageIdsSet.current.add(msg._id);
        });
        
        setMessages(data.messages);
        
        // Mark unread messages as read
        const unreadMessageIds = data.messages
          .filter(m => m.sender._id !== user?._id && !m.readBy?.includes(user?._id))
          .map(m => m._id);
        
        if (unreadMessageIds.length > 0) {
          markMessagesRead(chatId, unreadMessageIds);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      fetchMessages();

      return () => {
        leaveChat(chatId);
        // Clear the message IDs set when leaving chat
        messageIdsSet.current.clear();
      };
    }
  }, [chatId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Check if message already exists to prevent duplicates
      if (messageIdsSet.current.has(message._id)) {
        console.log("Message already exists, skipping:", message._id);
        return;
      }
      
      // Add to set and update messages
      messageIdsSet.current.add(message._id);
      setMessages(prev => [...prev, message]);
      
      // Mark as read if it's from someone else
      if (message.sender._id !== user?._id) {
        markMessagesRead(chatId, [message._id]);
      }
    };

    const handleReadReceipt = ({ messageIds }) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, readBy: [...(msg.readBy || []), user?._id] }
            : msg
        )
      );
    };

    socket.on('new-message', handleNewMessage);
    socket.on('messages-read-receipt', handleReadReceipt);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('messages-read-receipt', handleReadReceipt);
    };
  }, [socket, chatId, user?._id, markMessagesRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200;
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    // Create temporary message for optimistic update
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage = {
      _id: tempId,
      content: newMessage.trim(),
      sender: {
        _id: user?._id,
        name: user?.name,
        email: user?.email
      },
      createdAt: new Date().toISOString(),
      readBy: [user?._id],
      isTemp: true
    };
    
    // Add temporary message to UI immediately
    messageIdsSet.current.add(tempId);
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    stopTyping(chatId);
    scrollToBottom();

    try {
      const response = await API.post(`/chats/${chatId}/messages`, {
        content: newMessage.trim()
      });

      const realMessage = response.data.message;
      
      // Replace temporary message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? realMessage : msg
        )
      );
      
      // Update message IDs set
      messageIdsSet.current.delete(tempId);
      messageIdsSet.current.add(realMessage._id);
      
      // Emit via socket for real-time delivery
      sendMessage(chatId, realMessage);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      messageIdsSet.current.delete(tempId);
      
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      startTyping(chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(chatId);
      }
    }, 1000);
  };

  const handleDeleteChat = async () => {
    setDeleting(true);
    try {
      await API.delete(`/chats/${chatId}`);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(chatId);
      }
      onClose();
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  };

  const MessageStatus = ({ message }) => {
    if (message.sender._id !== user?._id) return null;
    
    if (message.readBy?.length > 1) {
      return <FaCheckDouble className="text-blue-500 text-xs" />;
    }
    return <FaCheck className="text-gray-400 text-xs" />;
  };

  const getDisplayInfo = () => {
    if (property) {
      return {
        title: property.title,
        location: property.location,
        image: property.images?.[0]
      };
    } else if (project) {
      return {
        title: project.name,
        location: project.location,
        image: project.images?.[0]
      };
    }
    return {
      title: 'Chat',
      location: '',
      image: null
    };
  };

  const displayInfo = getDisplayInfo();

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-[#8B7355]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{displayInfo.title}</h3>
                <span className={`w-2 h-2 rounded-full ${isOtherOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              {displayInfo.location && (
                <p className="text-xs text-[#8B7355]">{displayInfo.location}</p>
              )}
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title="Delete chat"
          >
            <FaTrash className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isOwn = message.sender._id === user?._id;
            const showDate = index === 0 || 
              new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={message._id}>
                {showDate && !message.isTemp && (
                  <div className="text-center my-4">
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && !message.isTemp && (
                      <p className="text-xs text-[#8B7355] mb-1 ml-1">{message.sender.name}</p>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        isOwn
                          ? message.isTemp 
                            ? 'bg-[#8B7355] text-white opacity-70' 
                            : 'bg-[#1E1C18] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        isOwn ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!message.isTemp && <MessageStatus message={message} />}
                        {message.isTemp && <span className="text-xs">Sending...</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          
          {/* Typing indicator */}
          {typingUser && typingUser.userId !== user?._id && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B7355] transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-3 bg-[#1E1C18] text-white rounded-lg hover:bg-[#2C2A26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Chat</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;
