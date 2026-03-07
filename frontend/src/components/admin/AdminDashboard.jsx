import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  FaUsers, FaBriefcase, FaBuilding, FaCheckCircle,
  FaHourglassHalf, FaUserSlash, FaArrowRight, FaShieldAlt,
} from "react-icons/fa";
import api from "../../api/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, accent, lightBg, sub, delay }) => (
  <motion.div
    {...fadeUp(delay)}
    whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
    className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm cursor-default transition-all"
  >
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${lightBg}`}>
        {icon}
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${lightBg}`}>{sub}</span>
    </div>
    <div>
      <p className="text-3xl font-black text-slate-800">{value ?? "—"}</p>
      <p className="text-sm font-semibold text-slate-400 mt-0.5">{label}</p>
    </div>
    <div className={`h-1 rounded-full ${accent}`} />
  </motion.div>
);

/* ── Quick Link (White Premium) ── */
const QuickCard = ({ to, emoji, label, desc, iconBg, accentBar, delay }) => (
  <motion.div {...fadeUp(delay)} whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.10)" }} className="h-full">
    <Link to={to} className="block h-full no-underline group">
      <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between transition-all">
        <div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${iconBg}`}>
            {emoji}
          </div>
          <h3 className="font-extrabold text-slate-800 text-base leading-tight">{label}</h3>
          <p className="text-slate-400 text-xs mt-1 font-medium">{desc}</p>
        </div>
        <div className="mt-4 flex items-center gap-1 text-rose-500 text-xs font-bold group-hover:gap-2 transition-all">
          Open <FaArrowRight className="group-hover:translate-x-1 transition-transform text-[10px]" />
        </div>
        <div className={`h-1 rounded-full mt-3 ${accentBar}`} />
      </div>
    </Link>
  </motion.div>
);

const DOUGHNUT_OPTS = {
  responsive: true,
  cutout: "74%",
  plugins: {
    legend: {
      position: "bottom",
      labels: { padding: 20, font: { size: 12, weight: "600" }, color: "#64748b" },
    },
  },
};

const BAR_OPTS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11, weight: "600" }, color: "#94a3b8" } },
    y: { grid: { color: "#f8fafc" }, ticks: { color: "#94a3b8" }, beginAtZero: true },
  },
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const doughnutData = {
    labels: ["Active Users", "Blocked Users"],
    datasets: [{
      data: [stats?.activeUsers ?? 0, stats?.blockedUsers ?? 0],
      backgroundColor: ["#6366f1", "#f43f5e"],
      hoverBackgroundColor: ["#4f46e5", "#e11d48"],
      borderWidth: 0,
    }],
  };

  const recruiterBar = {
    labels: ["Approved", "Pending", "Total"],
    datasets: [{
      data: [stats?.approvedRecruiters ?? 0, stats?.pendingRecruiters ?? 0, stats?.totalRecruiters ?? 0],
      backgroundColor: ["#22c55e", "#f59e0b", "#6366f1"],
      borderRadius: 10,
      borderSkipped: false,
    }],
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, accent: "bg-indigo-500", lightBg: "bg-indigo-50 text-indigo-600", icon: <FaUsers />, sub: `${stats?.activeUsers ?? "—"} active`, delay: 0 },
    { label: "Total Recruiters", value: stats?.totalRecruiters, accent: "bg-amber-400", lightBg: "bg-amber-50 text-amber-600", icon: <FaBuilding />, sub: `${stats?.approvedRecruiters ?? "—"} approved`, delay: 0.05 },
    { label: "Total Jobs", value: stats?.totalJobs, accent: "bg-emerald-500", lightBg: "bg-emerald-50 text-emerald-600", icon: <FaBriefcase />, sub: "Active listings", delay: 0.10 },
    { label: "Approved Recruiters", value: stats?.approvedRecruiters, accent: "bg-green-500", lightBg: "bg-green-50 text-green-600", icon: <FaCheckCircle />, sub: "Can post jobs", delay: 0.15 },
    { label: "Pending Approval", value: stats?.pendingRecruiters, accent: "bg-orange-400", lightBg: "bg-orange-50 text-orange-600", icon: <FaHourglassHalf />, sub: "Awaiting review", delay: 0.20 },
    { label: "Blocked Users", value: stats?.blockedUsers, accent: "bg-rose-500", lightBg: "bg-rose-50 text-rose-600", icon: <FaUserSlash />, sub: "Restricted access", delay: 0.25 },
  ];

  const quickLinks = [
    { to: "/admin/users", emoji: "👥", label: "Manage Users", desc: "View, block or remove users", iconBg: "bg-indigo-50", accentBar: "bg-indigo-500", delay: 0.30 },
    { to: "/admin/recruiters", emoji: "🏢", label: "Manage Recruiters", desc: "Approve or reject recruiter accounts", iconBg: "bg-amber-50", accentBar: "bg-amber-400", delay: 0.35 },
    { to: "/admin/jobs", emoji: "💼", label: "Manage Jobs", desc: "Review and moderate job postings", iconBg: "bg-emerald-50", accentBar: "bg-emerald-500", delay: 0.40 },
    { to: "/admin/feedback", emoji: "💬", label: "User Feedback", desc: "Read platform feedback", iconBg: "bg-rose-50", accentBar: "bg-rose-500", delay: 0.45 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Hero ── */}
        <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center">
                  <FaShieldAlt className="text-white text-sm" />
                </div>
                <span className="text-white/80 text-sm font-semibold">Super Administrator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Admin Dashboard</h1>
              <p className="text-white/70 text-sm mt-1 font-medium">Real-time platform overview &amp; management</p>
            </div>
            {/* Live badge */}
            <div className="flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
              </span>
              <span className="text-white text-xs font-bold tracking-wide">System Live</span>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {statCards.map((c) => <StatCard key={c.label} {...c} />)}
          </div>
        )}

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Doughnut */}
          <motion.div {...fadeUp(0.3)}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
              <h3 className="font-extrabold text-slate-700">User Status</h3>
            </div>
            <p className="text-slate-400 text-xs mb-4 ml-4">Active vs blocked</p>
            {loading
              ? <Skeleton className="h-48" />
              : <Doughnut data={doughnutData} options={DOUGHNUT_OPTS} />
            }
          </motion.div>

          {/* Bar */}
          <motion.div {...fadeUp(0.35)}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-amber-400" />
              <h3 className="font-extrabold text-slate-700">Recruiter Breakdown</h3>
            </div>
            <p className="text-slate-400 text-xs mb-4 ml-4">Approved, pending and total cohort</p>
            {loading
              ? <Skeleton className="h-48" />
              : <Bar data={recruiterBar} options={BAR_OPTS} />
            }
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div {...fadeUp(0.4)}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-rose-500" />
            <h3 className="font-extrabold text-slate-700">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickLinks.map((q) => <QuickCard key={q.to} {...q} />)}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
