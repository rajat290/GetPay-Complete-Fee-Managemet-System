import { useEffect, useState } from "react";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  XCircle, 
  CheckCheck,
  Calendar,
  Clock,
  Inbox
} from "lucide-react";
import api from "../services/api";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Skeleton from "../components/common/Skeleton";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const config = {
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    error: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Card noPadding>
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Stream</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stay updated with the latest alerts and announcements.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={CheckCheck} onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </div>

      <Card noPadding className="overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => {
              const typeConfig = config[notification.type] || config.info;
              const Icon = typeConfig.icon;
              
              return (
                <div 
                  key={notification._id} 
                  className={`p-6 transition-premium flex gap-5 group ${
                    !notification.isRead 
                      ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${typeConfig.bg} ${typeConfig.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-bold text-slate-900 dark:text-white ${!notification.isRead ? 'text-md' : 'text-sm'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <Badge variant="primary" className="px-1.5 py-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:bg-primary/10"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Read
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inbox Zero!</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">You've cleared all your notifications. Enjoy the silence.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
