import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/user/authSlice";
import {
  FaUserCircle,
  FaHome,
  FaBriefcase,
  FaComments,
  FaClipboardList,
  FaBrain,
  FaCalendarAlt,
  FaSignOutAlt,
  FaIdCard,
} from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function UserNavbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Home", path: "/user/dashboard", icon: <FaHome /> },
    { name: "Jobs", path: "/user/jobs", icon: <FaBriefcase /> },
    { name: "Applications", path: "/user/applications", icon: <FaClipboardList /> },
    { name: "Interviews", path: "/user/interviews", icon: <FaCalendarAlt /> },
    { name: "AI Assistant", path: "/user/ai", icon: <FaBrain /> },
    { name: "Messages", path: "/user/messages", icon: <FaComments /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/user/signin", { replace: true });
  };

  return (
    <>
      {/* ===== TOP NAVBAR ===== */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-lg"
      >
        <div className=" nounderline max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/user/dashboard" className="no-underline">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wide m-0">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Hire
                </span>
                <span className="text-slate-900 ml-1">Smart</span>
              </h1>
            </motion.div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2 bg-white/60 backdrop-blur-lg p-2 rounded-full border shadow-inner">
            {navItems.map((item) => (
              <NavLink key={item.name} to={item.path} className="no-underline">
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    {item.name}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className=" rounded flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md text-sm font-bold"
              >
                {user?.name?.[0]?.toUpperCase() || <FaUserCircle size={20} />}
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur rounded-2xl shadow-xl border p-2"
                  >
                    {/* User info */}
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/user/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 transition no-underline text-slate-700 text-sm"
                    >
                      <FaIdCard /> My Profile
                    </Link>

                    <Link
                      to="/user/feedback"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 transition no-underline text-slate-700 text-sm"
                    >
                      <FaComments /> Feedback & Report
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 text-red-600 transition text-sm text-left"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <div className=" nounderline md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-t shadow-lg">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center text-xs no-underline"
              >
                <div className={`text-lg ${active ? "text-emerald-500" : "text-slate-500"}`}>
                  {item.icon}
                </div>
                <span className={`${active ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
                  {item.name.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
