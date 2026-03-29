import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineArrowLeft
} from "react-icons/hi";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/notifications?page=${page}&limit=20`);
      if (data.success) {
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
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
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-6 h-6";
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

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(139,115,85,0.1);
        }
        .notif-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid rgba(139,115,85,0.1);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        .notif-item:hover {
          border-color: rgba(139,115,85,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateX(4px);
        }
        .notif-item.unread {
          background: #FEF9E6;
          border-left: 3px solid #C4503C;
        }
        .notif-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #F5F0E8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-content {
          flex: 1;
        }
        .notif-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: #1E1C18;
        }
        .notif-message {
          font-size: 0.85rem;
          color: #6B6355;
          margin-bottom: 8px;
        }
        .notif-time {
          font-size: 0.7rem;
          color: #A89880;
        }
        .notif-sender {
          font-size: 0.7rem;
          color: #8B7355;
          margin-top: 4px;
        }
        .notif-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .notif-delete {
          background: none;
          border: none;
          cursor: pointer;
          color: #C4503C;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        .notif-delete:hover {
          opacity: 1;
          background: rgba(196,80,60,0.1);
        }
        .notif-mark-read {
          background: none;
          border: none;
          cursor: pointer;
          color: #8B7355;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        .notif-mark-read:hover {
          opacity: 1;
          background: rgba(139,115,85,0.1);
        }
        .btn-mark-all {
          background: none;
          border: 1px solid rgba(139,115,85,0.3);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #8B7355;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .btn-mark-all:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }
        .btn-back {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8B7355;
          font-size: 0.85rem;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .btn-back:hover {
          background: rgba(139,115,85,0.1);
        }
      `}</style>

      <button onClick={() => navigate(-1)} className="btn-back">
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="notif-header">
        <div>
          <h1 className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 300, marginBottom: 4 }}>
            Notifications
          </h1>
          {getUnreadCount() > 0 && (
            <p style={{ color: '#C4503C', fontSize: '0.8rem' }}>
              {getUnreadCount()} unread notification{getUnreadCount() !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {getUnreadCount() > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-mark-all">
            <HiOutlineCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div>
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notif-item ${!notification.isRead ? 'unread' : ''}`}
              // REMOVED onClick handler
            >
              <div className="notif-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notif-content">
                <div className="notif-title">{notification.title}</div>
                <div className="notif-message">{notification.message}</div>
                <div className="notif-time">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
                {notification.sender && (
                  <div className="notif-sender">
                    From: {notification.sender.name}
                  </div>
                )}
              </div>
              <div className="notif-actions">
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    className="notif-mark-read"
                    title="Mark as read"
                  >
                    <HiOutlineCheck className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                  className="notif-delete"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="btn-mark-all"
                style={{ padding: '10px 24px' }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px' }}>
          <HiOutlineBell style={{ fontSize: '64px', color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No notifications yet</h3>
          <p style={{ color: '#8B7355' }}>We'll notify you when something important happens</p>
        </div>
      )}
    </div>
  );
}