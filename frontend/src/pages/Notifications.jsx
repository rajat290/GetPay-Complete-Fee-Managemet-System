import { useEffect, useState } from "react";
import api from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchNotifications();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Notifications</h1>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4"
            >
              <p className="font-semibold">{note.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{note.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
}
