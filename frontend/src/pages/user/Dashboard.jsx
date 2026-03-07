import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaRocket,
  FaTrophy,
  FaSearch,
  FaUserCircle,
  FaBrain,
  FaCalendarAlt,
  FaBuilding,
  FaVideo,
  FaChevronRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlay,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import api from "../../api/axios";

// Helper component for count up animation
function CountUp({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace("%", ""));
    if (start === end) return;

    const incrementTime = 16;
    const totalSteps = Math.floor(duration / incrementTime);
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{value.toString().includes("%") ? `${count}%` : count}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function UserDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [profilePercent, setProfilePercent] = useState(0);
  const [counts, setCounts] = useState({
    applications: 0,
    atsScore: 0,
    skillMatch: 0,
    interviews: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/users/dashboard-stats");
        setProfilePercent(data.profileCompleteness || 0);
        setCounts((prev) => ({
          ...prev,
          applications: data.applications || 0,
          interviews: data.interviews || 0,
          atsScore: data.atsScore || 0,
        }));
        setRecentApplications(data.recentApplications || []);
        setUpcomingInterviews(data.upcomingInterviews || []);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      title: "Applications",
      value: counts.applications,
      icon: <FaFileAlt />,
      color: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20"
    },
    {
      title: "ATS Compatibility Score",
      value: `${counts.atsScore}%`,
      icon: <FaCheckCircle />,
      color: "from-blue-400 to-cyan-500",
      shadow: "shadow-blue-500/20"
    },
    {
      title: "Skill Match",
      value: `${counts.skillMatch}%`,
      icon: <FaBrain />,
      color: "from-yellow-400 to-orange-500",
      shadow: "shadow-orange-500/20"
    },
    {
      title: "Interviews",
      value: counts.interviews,
      icon: <FaCalendarAlt />,
      color: "from-purple-400 to-pink-500",
      shadow: "shadow-purple-500/20"
    },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">

      {/* Ambient Deep Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[80%] w-[30%] h-[30%] rounded-full bg-emerald-200/30 blur-[100px] pointer-events-none" />

      <div className="px-4 sm:px-6 md:px-10 pt-24 pb-20 relative z-10 max-w-7xl mx-auto mt-2 space-y-8">

        {/* ===== HEADER ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                {getGreeting()},
              </span>{" "}
              <span className="text-slate-900">
                {user?.name?.split(" ")[0] || "Student"}
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-500 max-w-2xl font-medium mt-1">
              Track applications, ace interviews, and land your dream role.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <Link to="/user/jobs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl text-sm shadow-[0_4px_14px_rgb(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
                <FaSearch size={14} className="text-emerald-400 relative z-10" />
                <span className="relative z-10">Explore Opportunities</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ===== MAIN CONTENT DASHBOARD ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >

          {/* TOP ROW: Profile + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* PROFILE CARD */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="lg:col-span-4 relative group"
            >
              <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 pointer-events-none" />

              <div className="relative p-6 flex flex-col items-center text-center h-full">
                {/* Profile Ring */}
                <div className="relative w-28 h-28 mb-5 z-10 filter drop-shadow-sm">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                    {!loading && (
                      <motion.circle
                        cx="50" cy="50" r="46"
                        stroke="url(#profileGrad)"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="289.02"
                        strokeDashoffset={289.02 - (289.02 * profilePercent) / 100}
                        initial={{ strokeDashoffset: 289.02 }}
                        animate={{ strokeDashoffset: 289.02 - (289.02 * profilePercent) / 100 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <defs>
                      <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[88px] h-[88px] rounded-full bg-white flex items-center justify-center text-slate-300 text-3xl overflow-hidden shadow-sm border-[3px] border-white/50">
                      {user?.profilePic && !loading ? (
                        <img src={user.profilePic} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                  </div>

                  {!loading && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.5, type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute -bottom-2 right-0 bg-slate-900 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow border-2 border-white tracking-wider"
                    >
                      {Math.round(profilePercent)}%
                    </motion.div>
                  )}
                </div>

                {loading ? (
                  <div className="w-full flex justify-center flex-col items-center pb-2 animate-pulse space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
                    <div className="h-3 w-5/6 bg-slate-200 rounded-md" />
                  </div>
                ) : (
                  <div className="relative z-10 w-full mt-1">
                    <h3 className="font-extrabold text-xl text-slate-900 truncate tracking-tight">
                      {user?.name || "Student"}
                    </h3>
                    <p className="text-slate-500 font-semibold text-xs mt-1.5 flex items-center justify-center gap-1.5">
                      {user?.degree || "Student"} <span className="w-1 h-1 rounded-full bg-slate-300" /> {user?.branch || "Computer Science"}
                    </p>
                    <div className="mt-3.5 bg-slate-100/60 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-sm backdrop-blur-md">
                      <FaBuilding className="text-slate-400 text-[10px]" />
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-[1px]">
                        {user?.college || "University"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 w-full relative z-20">
                  <Link to="/user/profile" className="block w-full">
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "#fff" }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-white/70 border border-slate-200 text-slate-900 font-bold text-xs shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] transition-all focus:outline-none"
                    >
                      Complete Profile
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* STATS GRID */}
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-5 ">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5 flex flex-col justify-between min-h-[140px]">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                    <div className="space-y-2 animate-pulse mt-4">
                      <div className="w-12 h-2.5 bg-slate-200 rounded" />
                      <div className="w-1/2 h-6 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
                : stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative group bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col justify-between min-h-[140px] overflow-hidden"
                  >
                    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.06] blur-xl group-hover:scale-150 transition-transform duration-500`} />

                    <div className="relative z-10 flex justify-between items-start">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-white bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-md group-hover:-translate-y-1 transition-transform duration-300 ease-out text-sm`}>
                        {stat.icon}
                      </div>
                    </div>

                    <div className="relative z-10 mt-5 md:mt-6">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">{stat.title}</p>
                      <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        <CountUp value={stat.value} />
                      </h2>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* SECOND ROW: Recent Apps & Interviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* RECENT APPLICATIONS */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300 p-6 flex flex-col h-[380px] group"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Applications</h2>
                <Link to="/user/applications" className="text-slate-500 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1 focus:outline-none">
                  View All <FaChevronRight size={8} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 flex-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white/40 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="w-2/3 h-3.5 bg-slate-200 rounded" />
                        <div className="w-1/3 h-2.5 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-80">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/50 flex items-center justify-center mb-3 shadow-sm">
                    <FaFileAlt className="text-xl text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">No applications yet</p>
                  <p className="text-[11px] mt-1 text-center max-w-[180px] leading-relaxed font-medium">Start applying to jobs to track your progress here.</p>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar -mr-1">
                  {recentApplications.map((app) => (
                    <Link to={`/user/jobs/${app.job?._id}`} key={app._id} className="group/item flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-white hover:bg-white/80 transition-all hover:shadow-[0_2px_12px_rgb(0,0,0,0.04)] relative overflow-hidden">
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full -translate-x-full group-hover/item:translate-x-0 transition-transform" />
                      <div className="flex items-center gap-3 overflow-hidden pl-1">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover/item:shadow transition-shadow p-1">
                          {app.recruiter?.companyLogo ? (
                            <img src={app.recruiter.companyLogo} className="w-full h-full object-contain" alt="logo" />
                          ) : (
                            <FaBuilding className="text-slate-300 text-lg" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate group-hover/item:text-emerald-600 transition-colors">
                            {app.job?.title || "Role"}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5 tracking-wide">
                            {app.recruiter?.companyName || "Company"} <span className="mx-1 font-normal">•</span> {formatDate(app.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${app.status === "Pending" ? "bg-slate-100 text-slate-600" :
                        app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-600" :
                          app.status === "Rejected" ? "bg-red-50 text-red-600" :
                            "bg-blue-50 text-blue-600"
                        }`}>
                        {app.status}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* UPCOMING INTERVIEWS */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300 p-6 flex flex-col h-[380px] group"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Upcoming Interviews</h2>
                <Link to="/user/interviews" className="text-slate-500 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1 focus:outline-none">
                  Calendar <FaChevronRight size={8} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 flex-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white/40 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="w-2/3 h-3.5 bg-slate-200 rounded" />
                        <div className="w-1/3 h-2.5 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingInterviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-80">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/50 flex items-center justify-center mb-3 shadow-sm">
                    <FaCalendarAlt className="text-xl text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Schedule is clear</p>
                  <p className="text-[11px] mt-1 text-center max-w-[180px] font-medium leading-relaxed">Keep applying to land your first interview.</p>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar -mr-1">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview._id} className="group/item relative flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/80 hover:border-white transition-all hover:shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden">
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-blue-400 to-cyan-500 rounded-r-full -translate-x-full group-hover/item:translate-x-0 transition-transform" />

                      <div className="min-w-0 pr-3 z-10 pl-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {interview.jobId?.title || "Role"}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1 truncate flex items-center gap-1.5 tracking-wide">
                          <FaBuilding className="text-slate-400" /> {interview.recruiterId?.companyName || "Company"}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="flex items-center gap-1 text-[10px] text-slate-700 font-bold uppercase tracking-wider bg-slate-100/80 px-2 py-1 rounded border border-slate-200/50 shadow-sm">
                            <FaCalendarAlt className="text-slate-400" size={8} /> {formatDate(interview.date)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-700 font-bold uppercase tracking-wider bg-slate-100/80 px-2 py-1 rounded border border-slate-200/50 shadow-sm">
                            🕒 {interview.time}
                          </span>
                        </div>
                      </div>

                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.15)] shrink-0 z-10 group-hover/item:-translate-y-0.5"
                        >
                          <FaVideo size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* THIRD ROW: AI Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Resume Health */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="relative overflow-hidden bg-[white/60] backdrop-blur-xl rounded-xl border border-white/60 shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.05)] transition-all duration-300 p-6 flex flex-col h-full"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-100/30 blur-[40px] pointer-events-none" />

              <h3 className="font-extrabold text-base text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FaFileAlt size={12} />
                </div>
                Resume Health
              </h3>

              <div className="relative z-10 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-end justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">System Match</span>
                      <span className="font-[900] text-slate-800 text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{Math.round(counts.atsScore || 0)}%</span>
                    </div>
                    <ProgressBar value={counts.atsScore || 0} color={counts.atsScore >= 70 ? "from-emerald-400 to-teal-500" : counts.atsScore >= 50 ? "from-yellow-400 to-orange-500" : "from-red-400 to-pink-500"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                  <div className="p-3.5 rounded-lg border border-slate-200/50 bg-white/40 backdrop-blur-sm shadow-[0_1px_4px_rgb(0,0,0,0.01)]">
                    <p className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Document</p>
                    <p className={`flex items-center gap-1.5 text-xs font-bold ${user?.resumeUrl ? "text-emerald-500" : "text-red-500"}`}>
                      {user?.resumeUrl ? <><FaCheckCircle size={10} /> Uploaded</> : <><FaExclamationCircle size={10} /> Missing</>}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200/50 bg-white/40 backdrop-blur-sm shadow-[0_1px_4px_rgb(0,0,0,0.01)]">
                    <p className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Keywords</p>
                    <p className={`flex items-center gap-1.5 text-xs font-bold ${user?.skills?.length >= 5 ? "text-emerald-500" : "text-yellow-500"}`}>
                      {user?.skills?.length >= 5 ? <><FaCheckCircle size={10} /> Strong</> : <><FaExclamationCircle size={10} /> Weak</>}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mock Interview */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="relative overflow-hidden bg-[white/60] backdrop-blur-xl rounded-xl border border-white/60 shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.05)] transition-all duration-300 p-6 flex flex-col h-full"
            >
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-100/30 blur-[40px] pointer-events-none" />

              <h3 className="font-extrabold text-base text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <FaRocket size={12} />
                </div>
                Mock Interview
              </h3>

              <div className="relative z-10 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium max-w-sm">
                    Hone your skills with our AI. You are currently indexing at{" "}
                    <strong className="text-slate-900 font-extrabold">{counts.skillMatch || 0}% readiness</strong> for technical rounds.
                  </p>

                  <div className="space-y-1.5 mt-8">
                    <div className="flex items-end justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Confidence Index</span>
                      <span className="font-[900] text-slate-800 text-xl tracking-tighter">{Math.round(counts.skillMatch || 0)}%</span>
                    </div>
                    <ProgressBar value={counts.skillMatch || 0} color="from-purple-400 to-pink-500" shadow="shadow-purple-500/30" />
                  </div>
                </div>

                <Link to="/user/ai/mock" className="mt-auto pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <FaPlay size={8} className="relative z-10" />
                    <span className="relative z-10">Initialize Mock Session</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>


        </motion.div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function ProgressBar({ value, color, shadow = "" }) {
  return (
    <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner flex items-center">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${color} ${shadow}`}
      />
    </div>
  );
}
