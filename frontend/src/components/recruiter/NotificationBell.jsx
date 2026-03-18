import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    // Only fetch if recruiter token exists
    const tokenStr = localStorage.getItem("recruiterUser");
    if (!tokenStr) return;
    try {
      const { data } = await api.get("/recruiter-notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/recruiter-notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = (notif) => {
    if (!notif.read) {
      api.put(`/recruiter-notifications/${notif._id}/read`).catch(() => { });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const tabs = ["All", "application_received", "interview_scheduled", "interview_updated", "interview_canceled"];

  const displayLabels = {
    "All": "All",
    "application_received": "Applications",
    "interview_scheduled": "Interviews",
    "interview_updated": "Updates",
    "interview_canceled": "Canceled"
  };

  const filtered = filter === "All" ? notifications : notifications.filter((n) => n.type === filter);

  const fmtTime = (d) => {
    const now = new Date();
    const diff = now - new Date(d);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <FaBell className="text-slate-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full font-bold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-16 left-[5vw] right-[5vw] sm:absolute sm:top-auto sm:left-auto sm:right-0 mt-2 w-[90vw] sm:w-[380px] md:w-[420px] max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-base">
                Recruiter Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b bg-white no-scrollbar pb-3">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition ${filter === t
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {displayLabels[t] || t}
                </button>
              ))}
            </div>

            <div className="max-h-80 overflow-y-auto bg-white">
              {filtered.length > 0 ? (
                filtered.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`px-4 py-3 border-b cursor-pointer hover:bg-slate-50 transition ${!n.read ? "bg-emerald-50/40" : ""
                      }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      {fmtTime(n.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FaBell className="text-slate-200 text-2xl" />
                  </div>
                  <p className="text-slate-500 text-[15px] font-medium">
                    No {filter !== "All" ? displayLabels[filter].toLowerCase() : ""} notifications yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
