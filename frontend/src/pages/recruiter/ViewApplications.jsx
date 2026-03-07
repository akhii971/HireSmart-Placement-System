import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaFileAlt,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";
import api from "../../api/axios";

export default function ViewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  // ─── Fetch all applications for recruiter ───
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications/recruiter/all");
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // ─── Pipeline Stats ───
  const pipeline = useMemo(() => {
    return {
      Pending: applications.filter((a) => a.status === "Pending").length,
      Reviewed: applications.filter((a) => a.status === "Reviewed").length,
      Shortlisted: applications.filter((a) => a.status === "Shortlisted")
        .length,
      Hired: applications.filter((a) => a.status === "Hired").length,
      Rejected: applications.filter((a) => a.status === "Rejected").length,
    };
  }, [applications]);

  // ─── Filter ───
  const filtered = applications.filter((a) => {
    const userName = a.user?.name || "";
    const jobTitle = a.job?.title || "";

    const matchSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "All" ? true : a.status === status;

    return matchSearch && matchStatus;
  });

  // ─── Update Status ───
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const { data } = await api.put(`/applications/${appId}/status`, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, status: data.application.status } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Reviewed":
        return "bg-blue-100 text-blue-700";
      case "Shortlisted":
        return "bg-emerald-100 text-emerald-700";
      case "Hired":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const pipelineColors = {
    Pending: "from-yellow-500 to-amber-500",
    Reviewed: "from-blue-500 to-cyan-500",
    Shortlisted: "from-emerald-500 to-teal-500",
    Hired: "from-green-500 to-emerald-600",
    Rejected: "from-red-500 to-orange-500",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Applications Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Review candidates and manage application statuses
          </p>
        </div>

        {/* PIPELINE */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(pipeline).map(([key, val], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStatus(status === key ? "All" : key)}
              className={`rounded-2xl p-4 text-white shadow-lg cursor-pointer bg-gradient-to-r ${pipelineColors[key]
                } ${status === key ? "ring-4 ring-offset-2 ring-slate-400" : ""}`}
            >
              <p className="text-xs opacity-90">{key}</p>
              <p className="text-2xl font-bold">{val}</p>
            </motion.div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 w-full">
            <FaSearch className="text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              placeholder="Search by candidate name or job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Reviewed</option>
            <option>Shortlisted</option>
            <option>Hired</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* APPLICATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((app, i) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg border overflow-hidden"
              >
                {/* Card Header with User Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow">
                        {app.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {app.user?.name || "Unknown"}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <FaEnvelope /> {app.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${statusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Job Applied For */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-3 text-sm">
                    <p className="text-xs text-slate-400 font-semibold mb-1">
                      Applied For
                    </p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <FaBriefcase className="text-emerald-500" />
                      {app.job?.title || "Job Deleted"}
                    </p>
                    {app.job?.company && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt />
                        {app.job.company} • {app.job.location}
                      </p>
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    {app.user?.phone && (
                      <p className="flex items-center gap-2">
                        <FaPhone className="text-slate-400" /> {app.user.phone}
                      </p>
                    )}
                    {app.user?.college && (
                      <p className="flex items-center gap-2">
                        <FaGraduationCap className="text-slate-400" />{" "}
                        {app.user.college}
                      </p>
                    )}
                    {app.user?.experience && (
                      <p className="flex items-center gap-2">
                        <FaUser className="text-slate-400" /> Exp:{" "}
                        {app.user.experience}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  {app.user?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {app.user.skills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                      {app.user.skills.length > 5 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                          +{app.user.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Resume Link */}
                  {app.user?.resumeUrl && (
                    <a
                      href={app.user.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <FaFileAlt /> View Resume <FaExternalLinkAlt />
                    </a>
                  )}

                  {/* Applied Date */}
                  <p className="text-[10px] text-slate-400 mt-3">
                    Applied: {new Date(app.createdAt).toLocaleDateString()} at{" "}
                    {new Date(app.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Card Footer — Actions */}
                <div className="border-t p-4 bg-slate-50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app._id, e.target.value)
                      }
                      disabled={updatingId === app._id}
                      className="border rounded-lg px-2 py-1.5 text-xs font-semibold flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[
                        "Pending",
                        "Reviewed",
                        "Shortlisted",
                        "Rejected",
                        "Hired",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <Link
                      to={`/recruiter/candidates/${app._id}`}
                      className="nounderline px-4 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 border border-emerald-500 hover:bg-emerald-500 hover:text-white transition"
                    >
                      View Details
                    </Link>

                    {(app.status === "Shortlisted" || app.status === "Reviewed") && (
                      <Link
                        to="/recruiter/interview"
                        className="nounderline px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition flex items-center gap-1 shadow"
                      >
                        <FaCalendarAlt /> Schedule Interview
                      </Link>
                    )}

                    <button
                      onClick={() => navigate("/recruiter/messages", {
                        state: {
                          autoOpenChat: {
                            _id: app.user?._id,
                            name: app.user?.name,
                            model: "User"
                          }
                        }
                      })}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <FaComments /> Message
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <FaUser className="text-slate-400 text-2xl" />
              </div>
              <p className="text-slate-500 text-lg font-semibold">
                No applications found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Applications will appear here when candidates apply to your jobs
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
