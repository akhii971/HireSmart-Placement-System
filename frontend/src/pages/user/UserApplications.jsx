import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaCalendarAlt,
  FaTrash,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaUserCheck,
  FaTimesCircle,
  FaBriefcase,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ===== STATUS CONFIG =====
const STATUS_STEPS = ["Pending", "Reviewed", "Shortlisted", "Hired"];

const statusConfig = {
  Pending: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <FaClock />,
    gradient: "from-yellow-500 to-amber-500",
  },
  Reviewed: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <FaEye />,
    gradient: "from-blue-500 to-cyan-500",
  },
  Shortlisted: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <FaUserCheck />,
    gradient: "from-emerald-500 to-teal-500",
  },
  Rejected: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <FaTimesCircle />,
    gradient: "from-red-500 to-orange-500",
  },
  Hired: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <FaCheckCircle />,
    gradient: "from-green-500 to-emerald-500",
  },
};

export default function UserApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeId, setActiveId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  // ─── Fetch Applications ───
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications/my");
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // ─── Analytics ───
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "Pending").length;
    const shortlisted = applications.filter(
      (a) => a.status === "Shortlisted"
    ).length;
    const hired = applications.filter((a) => a.status === "Hired").length;
    const rejected = applications.filter(
      (a) => a.status === "Rejected"
    ).length;
    const successRate =
      total > 0 ? Math.round(((shortlisted + hired) / total) * 100) : 0;
    return { total, pending, shortlisted, hired, rejected, successRate };
  }, [applications]);

  // ─── Filter ───
  const filtered = applications.filter((a) => {
    const title = a.job?.title || "";
    const company = a.job?.company || "";

    const matchText =
      title.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filter === "All" ? true : a.status === filter;

    return matchText && matchStatus;
  });

  // ─── Withdraw Handler ───
  const handleWithdraw = async (appId) => {
    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    )
      return;

    setWithdrawing(appId);
    try {
      await api.delete(`/applications/${appId}`);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to withdraw");
    } finally {
      setWithdrawing(null);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-6 pb-24 mt-20">
        {/* ===== HEADER ===== */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Applications
          </h1>
          <p className="text-slate-500">
            Track your application status and progress
          </p>
        </div>

        {/* ===== ANALYTICS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "from-slate-600 to-slate-800",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "from-yellow-500 to-amber-500",
            },
            {
              label: "Shortlisted",
              value: stats.shortlisted,
              color: "from-emerald-500 to-teal-500",
            },
            {
              label: "Hired",
              value: stats.hired,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "from-red-500 to-orange-500",
            },
            {
              label: "Success Rate",
              value: stats.successRate + "%",
              color: "from-indigo-500 to-violet-500",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className={`rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r ${s.color}`}
            >
              <p className="text-xs opacity-90">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ===== SEARCH & FILTER ===== */}
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 w-full">
            <FaSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            {["All", "Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"].map(
              (f) => (
                <option key={f}>{f}</option>
              )
            )}
          </select>
        </div>

        {/* ===== LIST ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((app, i) => {
            const isOpen = activeId === app._id;
            const config = statusConfig[app.status] || statusConfig.Pending;

            return (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow border relative overflow-hidden"
              >
                {/* Status indicator strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`}
                />

                {/* HEADER */}
                <div
                  onClick={() => setActiveId(isOpen ? null : app._id)}
                  className="cursor-pointer pt-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {app.job?.title || "Job Deleted"}
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <FaBriefcase className="text-xs" />
                        {app.job?.company || "N/A"} •{" "}
                        {app.job?.location || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold border flex items-center gap-1 ${config.color}`}
                    >
                      {config.icon} {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> Applied:{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    {app.job?.type && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100">
                        {app.job.type}
                      </span>
                    )}
                    {app.job?.salary && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100">
                        💰 {app.job.salary}
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4 overflow-hidden"
                    >
                      {/* STATUS TIMELINE */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-600 mb-3">
                          Application Progress
                        </p>
                        <div className="flex justify-between items-center">
                          {STATUS_STEPS.map((step, idx) => {
                            const activeIndex = STATUS_STEPS.indexOf(
                              app.status === "Rejected"
                                ? "Pending"
                                : app.status
                            );
                            const done = idx <= activeIndex;
                            const isRejected = app.status === "Rejected";

                            return (
                              <div key={step} className="flex-1 text-center">
                                <div
                                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all ${done && !isRejected
                                      ? "bg-emerald-500 text-white"
                                      : isRejected
                                        ? "bg-red-100 text-red-500"
                                        : "bg-slate-200 text-slate-400"
                                    }`}
                                >
                                  {idx + 1}
                                </div>
                                <p
                                  className={`text-xs mt-1 ${done && !isRejected
                                      ? "text-emerald-600 font-bold"
                                      : "text-slate-400"
                                    }`}
                                >
                                  {step}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        {app.status === "Rejected" && (
                          <p className="text-center text-xs text-red-500 font-semibold mt-2">
                            ❌ Application was rejected
                          </p>
                        )}
                      </div>

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Your Cover Letter
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex gap-3 flex-wrap">
                        {app.job && (
                          <button
                            onClick={() =>
                              navigate(`/user/jobs/${app.job._id}`)
                            }
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-200 transition"
                          >
                            <FaExternalLinkAlt /> View Job
                          </button>
                        )}

                        {app.status === "Pending" && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            disabled={withdrawing === app._id}
                            className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm flex items-center gap-2 hover:bg-red-200 transition disabled:opacity-50"
                          >
                            <FaTrash />
                            {withdrawing === app._id
                              ? "Withdrawing..."
                              : "Withdraw"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FaBriefcase className="text-slate-400 text-2xl" />
            </div>
            <p className="text-slate-500 text-lg font-semibold">
              No applications found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Start applying to jobs to see your applications here
            </p>
            <button
              onClick={() => navigate("/user/jobs")}
              className="mt-4 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
