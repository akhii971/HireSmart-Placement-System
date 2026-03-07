import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { recruiterLogout } from "../../redux/recruiter/recruiterAuthSlice";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaBriefcase,
  FaUsers,
  FaRobot,
  FaCalendarAlt,
  FaComments,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function RecruiterNavbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recruiter } = useSelector((s) => s.recruiterAuth);

  const handleLogout = () => {
    dispatch(recruiterLogout());
    navigate("/recruiter/signin", { replace: true });
  };

  const navItems = [
    { name: "Dashboard", path: "/recruiter/dashboard", icon: <FaHome /> },
    { name: "My Jobs", path: "/recruiter/jobs", icon: <FaBriefcase /> },
    { name: "Applications", path: "/recruiter/applications", icon: <FaUsers /> },
    { name: "AI Ranking", path: "/recruiter/ranking", icon: <FaRobot /> },
    { name: "Interviews", path: "/recruiter/interview", icon: <FaCalendarAlt /> },
    { name: "Messages", path: "/recruiter/messages", icon: <FaComments /> },
  ];

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-lg"
      >
        <div className="nounderline max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/recruiter/dashboard" className="no-underline">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <h1 className="nounderline text-xl font-extrabold tracking-wide m-0">
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
              <NavLink
                key={item.name}
                to={item.path}
                className="no-underline"
              >
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
            {/* Notifications */}
            <NotificationBell />

            {/* Profile */}
            <div className="relative rounded">
              <motion.button
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className=" rounded flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/25 text-sm font-semibold transition-shadow"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 ">
                  <FaUserCircle size={16} />
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{recruiter?.name?.split(" ")[0] || "Recruiter"}</span>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur rounded-xl shadow-xl border p-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-800 text-sm truncate">{recruiter?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{recruiter?.company}</p>
                    </div>
                    <Link
                      to="/recruiter/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition no-underline text-slate-700 text-sm"
                    >
                      <FaUser className="text-blue-500" /> Profile
                    </Link>
                    <Link
                      to="/recruiter/feedback"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition no-underline text-slate-700 text-sm"
                    >
                      <FaComments className="text-emerald-500" /> Feedback
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition text-sm font-semibold"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}

      </motion.nav>

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-t shadow-lg">
        <div className="  nounderline flex justify-around items-center py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center text-xs no-underline"
              >
                <div
                  className={`text-lg ${active ? "text-emerald-500" : "text-slate-500"
                    }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`${active ? "text-emerald-600 font-semibold" : "text-slate-500"
                    }`}
                >
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
