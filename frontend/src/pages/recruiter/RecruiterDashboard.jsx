import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaUsers,
  FaStar,
  FaCalendarAlt,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchMyJobs } from "../../redux/recruiter/jobsSlice";
import api from "../../api/axios";

export default function RecruiterDashboard() {
  const dispatch = useDispatch();

  const { myJobs } = useSelector((state) => state.jobs);

  const [dashboardStats, setDashboardStats] = useState({
    jobs: 0,
    applications: 0,
    shortlisted: 0,
    interviews: 0,
  });

  useEffect(() => {
    dispatch(fetchMyJobs());

    const fetchStats = async () => {
      try {
        const { data } = await api.get("/recruiters/dashboard-stats");
        setDashboardStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, [dispatch]);

  const stats = [
    {
      title: "Jobs Posted",
      value: dashboardStats.jobs,
      icon: <FaBriefcase />,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Applications",
      value: dashboardStats.applications,
      icon: <FaUsers />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Shortlisted",
      value: dashboardStats.shortlisted,
      icon: <FaStar />,
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Interviews",
      value: dashboardStats.interviews,
      icon: <FaCalendarAlt />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const actions = [
    { title: "Post New Job", link: "/recruiter/post-job", icon: <FaPlus /> },
    { title: "View Applications", link: "/recruiter/applications", icon: <FaUsers /> },
    { title: "AI Ranking", link: "/recruiter/ranking", icon: <FaStar /> },
    { title: "Shortlist Candidates", link: "/recruiter/shortlist", icon: <FaCheckCircle /> },
    { title: "Schedule Interview / Update Selection", link: "/recruiter/interview", icon: <FaCalendarAlt /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 sm:p-6 pt-24">

      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 flex flex-col gap-3"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent animate-gradient">
            Welcome Back,
          </span>{" "}
          <span className="text-slate-900">Recruiter</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-sm md:text-base text-slate-600 max-w-2xl"
        >
          Manage job postings, shortlist top candidates, and schedule interviews
          with AI-powered insights — all from one powerful dashboard.
        </motion.p>
      </motion.div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
            whileHover={{ y: -6 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-lg hover:shadow-xl transition p-5 flex items-center justify-between"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-r ${stat.color} opacity-20 blur-3xl`} />

            <div className="relative z-10">
              <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
              <h2 className="text-3xl font-bold text-slate-900">{stat.value}</h2>
            </div>

            <div
              className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-xl text-white bg-gradient-to-r ${stat.color} shadow`}
            >
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className=" nounderline bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white p-6"
      >
        <h2 className="text-lg font-semibold mb-6 text-slate-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {actions.map((action, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={action.link}
                className="group flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 transition shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                    {action.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    Go to {action.title.toLowerCase()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}