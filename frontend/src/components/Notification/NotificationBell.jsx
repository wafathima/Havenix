import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrash,
  HiOutlineCheck
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationBell({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications?unreadOnly=true&limit=1');
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/notifications?limit=10');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkSingleAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await handleMarkAsRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'message':
        return <HiOutlineChat className={`${iconClass} text-blue-500`} />;
      case 'enquiry':
        return <HiOutlineMail className={`${iconClass} text-yellow-500`} />;
      case 'enquiry_accepted':
        return <HiOutlineCheckCircle className={`${iconClass} text-green-500`} />;
      case 'enquiry_rejected':
        return <HiOutlineXCircle className={`${iconClass} text-red-500`} />;
      case 'project_update':
      case 'milestone_update':
        return <HiOutlineDocumentText className={`${iconClass} text-purple-500`} />;
      default:
        return <HiOutlineBell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,115,85,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <HiOutlineBell style={{ fontSize: '22px', color: '#8B7355' }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#C4503C',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
              border: '2px solid #F5F0E8'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '380px',
            maxHeight: '500px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(139,115,85,0.1)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(139,115,85,0.1)',
              background: '#F9F9F7'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18' }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    background: '#C4503C',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8B7355',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HiOutlineCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List - REMOVED onClick from the div */}
          <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(139,115,85,0.05)',
                    transition: 'background 0.2s ease',
                    background: notification.isRead ? 'white' : '#FEF9E6',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'white' : '#FEF9E6'}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flexShrink: 0 }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E1C18', marginBottom: '4px' }}>
                          {notification.title}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkSingleAsRead(notification._id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#8B7355',
                                opacity: 0.6,
                                transition: 'opacity 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                              title="Mark as read"
                            >
                              <HiOutlineCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              color: '#C4503C',
                              opacity: 0.6,
                              transition: 'opacity 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#6B6355', marginBottom: '4px' }}>
                        {notification.message}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: '#A89880' }}>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {notification.sender && (
                        <p style={{ fontSize: '0.65rem', color: '#8B7355', marginTop: '4px' }}>
                          From: {notification.sender.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#C4503C'
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <HiOutlineBell style={{ fontSize: '48px', color: '#C4A97A', opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ color: '#8B7355', fontSize: '0.875rem' }}>No notifications yet</p>
                <p style={{ color: '#A89880', fontSize: '0.75rem', marginTop: '4px' }}>
                  We'll notify you when something important happens
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(139,115,85,0.1)',
                textAlign: 'center',
                background: '#F9F9F7'
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8B7355',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}