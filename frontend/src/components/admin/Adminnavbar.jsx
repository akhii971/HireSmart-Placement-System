import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../redux/admin/adminAuthSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt, FaUsers, FaBriefcase, FaComments,
  FaUserCircle, FaSignOutAlt, FaUser, FaChartBar,
  FaBars, FaTimes,
} from "react-icons/fa";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <FaChartBar /> },
  { name: "Users", path: "/admin/users", icon: <FaUsers /> },
  { name: "Recruiters", path: "/admin/recruiters", icon: <FaBriefcase /> },
  { name: "Jobs", path: "/admin/jobs", icon: <FaBriefcase /> },
  { name: "Feedback", path: "/admin/feedback", icon: <FaComments /> },
];

export default function Adminnavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((s) => s.adminAuth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/signin", { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between nounderline">
        {/* Logo */}
        <Link to="/admin/dashboard" className="no-underline flex items-center gap-2 nounderline" >
          <span className="text-lg font-extrabold m-0">
            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">Admin</span>
            <span className="text-slate-800"> Panel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.name} to={item.path} className="no-underline" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <span className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}>
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right: avatar + profile dropdown */}
        <div className="flex items-center gap-3">
          {/* Profile dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-semibold shadow"
            >
              <FaUserCircle size={18} />
              <span className="hidden sm:inline max-w-[90px] truncate">
                {admin?.name?.split(" ")[0] || "Admin"}
              </span>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{admin?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{admin?.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                      Super Admin
                    </span>
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition no-underline text-slate-700 text-sm" style={{ textDecoration: "none" }}
                  >
                    <FaUser className="text-rose-500" /> My Profile
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-slate-100 px-4 pb-4"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="no-underline" style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl my-1 text-sm font-semibold ${isActive ? "bg-rose-50 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                    }`}>
                    {item.icon} {item.name}
                  </div>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold mt-1"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
