import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaCalendarPlus,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaClock,
  FaSearch,
  FaFilter,
  FaTimes,
  FaExternalLinkAlt,
  FaUser,
  FaBriefcase,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../api/axios";
import {
  scheduleNewInterview,
  fetchRecruiterInterviews,
  updateInterviewStatus as apiUpdateStatus,
} from "../../services/interviewService";

/* ─── colour helpers ───────────────────────────────── */
const statusConfig = {
  Scheduled: {
    bg: "linear-gradient(135deg,#6366f1,#818cf8)",
    text: "#fff",
    icon: <FaClock />,
    glow: "rgba(99,102,241,.35)",
  },
  Completed: {
    bg: "linear-gradient(135deg,#10b981,#34d399)",
    text: "#fff",
    icon: <FaCheckCircle />,
    glow: "rgba(16,185,129,.35)",
  },
  Canceled: {
    bg: "linear-gradient(135deg,#ef4444,#f87171)",
    text: "#fff",
    icon: <FaTimesCircle />,
    glow: "rgba(239,68,68,.35)",
  },
  Rescheduled: {
    bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    text: "#fff",
    icon: <FaRedo />,
    glow: "rgba(245,158,11,.35)",
  },
};

const typeColors = {
  Technical: { bg: "#ede9fe", text: "#7c3aed" },
  HR: { bg: "#dbeafe", text: "#2563eb" },
  Managerial: { bg: "#fef3c7", text: "#d97706" },
  General: { bg: "#f0fdf4", text: "#16a34a" },
};

/* ─── date helpers ─────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isToday = (d) => {
  const t = new Date();
  const x = new Date(d);
  return (
    t.getFullYear() === x.getFullYear() &&
    t.getMonth() === x.getMonth() &&
    t.getDate() === x.getDate()
  );
};

/* ═══════════════════════════════════════════════════ */
export default function ScheduleInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  /* schedule modal */
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: "",
    date: "",
    time: "",
    type: "General",
    meetingLink: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  /* ─── fetch on mount ─────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const [intRes, appRes] = await Promise.all([
          fetchRecruiterInterviews(),
          api.get("/applications/recruiter/all"),
        ]);
        setInterviews(intRes.data.interviews || []);
        // API returns a plain array, not { applications: [...] }
        const apps = Array.isArray(appRes.data) ? appRes.data : appRes.data.applications || [];
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── toast auto-clear ──────────────────────────────  */
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);

  /* ─── shortlisted / reviewed apps for scheduling ──── */
  const eligibleApps = applications.filter(
    (a) => a.status !== "Rejected"
  );

  /* ─── filters ────────────────────────────────────── */
  const filtered = useMemo(() => {
    return interviews.filter((iv) => {
      const s = search.toLowerCase();
      const name = iv.studentId?.name?.toLowerCase() || "";
      const job = iv.jobId?.title?.toLowerCase() || "";
      const matchSearch = !s || name.includes(s) || job.includes(s);
      const matchStatus =
        statusFilter === "All" || iv.status === statusFilter;
      const matchType = typeFilter === "All" || iv.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [interviews, search, statusFilter, typeFilter]);

  /* ─── stats ──────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i) => i.status === "Scheduled").length;
    const completed = interviews.filter((i) => i.status === "Completed").length;
    const todayCount = interviews.filter(
      (i) => i.status === "Scheduled" && isToday(i.date)
    ).length;
    return { total, scheduled, completed, todayCount };
  }, [interviews]);

  /* ─── schedule handler ──────────────────────────── */
  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const app = applications.find((a) => a._id === formData.applicationId);
      if (!app) throw new Error("Select an application");
      const payload = {
        studentId: app.user?._id || app.user,
        applicationId: app._id,
        jobId: app.job?._id || app.job,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        meetingLink: formData.meetingLink,
        notes: formData.notes,
      };
      const { data } = await scheduleNewInterview(payload);
      /* refetch to get populated data */
      const fresh = await fetchRecruiterInterviews();
      setInterviews(fresh.data.interviews || []);
      setToast({ type: "success", msg: "Interview scheduled successfully!" });
      setModal(false);
      setFormData({
        applicationId: "",
        date: "",
        time: "",
        type: "General",
        meetingLink: "",
        notes: "",
      });
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Failed to schedule interview",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── status update handler ─────────────────────── */
  const handleStatusChange = async (id, status) => {
    try {
      await apiUpdateStatus(id, status);
      setInterviews((prev) =>
        prev.map((iv) => (iv._id === id ? { ...iv, status } : iv))
      );
      setToast({
        type: "success",
        msg: `Interview marked as ${status}`,
      });
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Failed to update status",
      });
    }
  };

  /* ════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#f0f4ff 0%,#e2e8f0 100%)",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{
            width: 48,
            height: 48,
            border: "4px solid #e2e8f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f0f4ff 0%,#e2e8f0 100%)",
        padding: "96px 24px 48px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      {/* ─── TOAST ─────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            style={{
              position: "fixed",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              padding: "14px 28px",
              borderRadius: 16,
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              background:
                toast.type === "success"
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "linear-gradient(135deg,#ef4444,#dc2626)",
              boxShadow: "0 8px 32px rgba(0,0,0,.18)",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ─── HEADER ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              <FaCalendarAlt
                style={{ marginRight: 10, verticalAlign: "middle" }}
              />
              Interview Manager
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
              Schedule, track &amp; manage all your candidate interviews
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              boxShadow: "0 6px 24px rgba(99,102,241,.35)",
            }}
          >
            <FaCalendarPlus /> Schedule Interview
          </motion.button>
        </motion.div>

        {/* ─── STAT CARDS ──────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            {
              label: "Total Interviews",
              value: stats.total,
              bg: "linear-gradient(135deg,#6366f1,#818cf8)",
              glow: "rgba(99,102,241,.25)",
            },
            {
              label: "Scheduled",
              value: stats.scheduled,
              bg: "linear-gradient(135deg,#3b82f6,#60a5fa)",
              glow: "rgba(59,130,246,.25)",
            },
            {
              label: "Completed",
              value: stats.completed,
              bg: "linear-gradient(135deg,#10b981,#34d399)",
              glow: "rgba(16,185,129,.25)",
            },
            {
              label: "Today",
              value: stats.todayCount,
              bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              glow: "rgba(245,158,11,.25)",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{
                background: s.bg,
                borderRadius: 18,
                padding: "24px 28px",
                color: "#fff",
                boxShadow: `0 8px 32px ${s.glow}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  opacity: 0.85,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ─── SEARCH + FILTERS ────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 250px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate or job title..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 40px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                outline: "none",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                transition: "border .2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#818cf8")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Types</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Managerial">Managerial</option>
            <option value="General">General</option>
          </select>
        </motion.div>

        {/* ─── INTERVIEW CARDS ─────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 16px rgba(0,0,0,.04)",
            }}
          >
            <FaCalendarAlt
              style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 12 }}
            />
            <h3 style={{ color: "#64748b", fontWeight: 600 }}>
              No interviews found
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              {interviews.length === 0
                ? "Click 'Schedule Interview' to get started!"
                : "Try adjusting your search or filter criteria."}
            </p>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
              gap: 20,
            }}
          >
            {filtered.map((iv, i) => {
              const st = statusConfig[iv.status] || statusConfig.Scheduled;
              const tc = typeColors[iv.type] || typeColors.General;
              return (
                <motion.div
                  key={iv._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6, boxShadow: `0 12px 40px ${st.glow}` }}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,.06)",
                    border: "1px solid #f1f5f9",
                    transition: "all .3s",
                  }}
                >
                  {/* card header */}
                  <div
                    style={{
                      background: st.bg,
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: st.text,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {st.icon}  {iv.status}
                    </div>
                    <span
                      style={{
                        background: tc.bg,
                        color: tc.text,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {iv.type}
                    </span>
                  </div>

                  {/* card body */}
                  <div style={{ padding: "20px 20px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg,#6366f1,#8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {(iv.studentId?.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#1e293b",
                          }}
                        >
                          {iv.studentId?.name || "Unknown Student"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          {iv.studentId?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 16,
                        marginBottom: 14,
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <FaBriefcase style={{ color: "#6366f1" }} />
                        {iv.jobId?.title || "N/A"}
                      </span>
                      <span
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <FaCalendarAlt style={{ color: "#10b981" }} />
                        {fmtDate(iv.date)}
                      </span>
                      <span
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <FaClock style={{ color: "#f59e0b" }} />
                        {iv.time}
                      </span>
                    </div>

                    {iv.notes && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          margin: "0 0 14px",
                          padding: "8px 12px",
                          background: "#f8fafc",
                          borderRadius: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        {iv.notes}
                      </p>
                    )}

                    {/* meeting link */}
                    {iv.meetingLink && (
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 10,
                          background: "#ede9fe",
                          color: "#6366f1",
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: "none",
                          marginBottom: 14,
                          transition: "background .2s",
                        }}
                      >
                        <FaVideo /> Join Meeting <FaExternalLinkAlt size={10} />
                      </a>
                    )}
                  </div>

                  {/* card footer / actions */}
                  <div
                    style={{
                      padding: "12px 20px 16px",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {iv.status === "Scheduled" && (
                      <>
                        <ActionBtn
                          label="Complete"
                          color="#10b981"
                          onClick={() =>
                            handleStatusChange(iv._id, "Completed")
                          }
                        />
                        <ActionBtn
                          label="Cancel"
                          color="#ef4444"
                          onClick={() =>
                            handleStatusChange(iv._id, "Canceled")
                          }
                        />
                      </>
                    )}
                    {iv.status === "Rescheduled" && (
                      <>
                        <ActionBtn
                          label="Complete"
                          color="#10b981"
                          onClick={() =>
                            handleStatusChange(iv._id, "Completed")
                          }
                        />
                        <ActionBtn
                          label="Cancel"
                          color="#ef4444"
                          onClick={() =>
                            handleStatusChange(iv._id, "Canceled")
                          }
                        />
                      </>
                    )}
                    {iv.status === "Canceled" && (
                      <ActionBtn
                        label="Reschedule"
                        color="#6366f1"
                        onClick={() =>
                          handleStatusChange(iv._id, "Scheduled")
                        }
                      />
                    )}
                    {iv.status === "Completed" && (
                      <span
                        style={{
                          fontSize: 13,
                          color: "#10b981",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FaCheckCircle /> Interview completed
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
         SCHEDULE MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,.55)",
              backdropFilter: "blur(6px)",
              zIndex: 9000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 24,
                width: "100%",
                maxWidth: 560,
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 80px rgba(0,0,0,.2)",
              }}
            >
              {/* modal header */}
              <div
                style={{
                  padding: "24px 28px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <FaCalendarPlus
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />
                  Schedule Interview
                </h2>
                <button
                  onClick={() => setModal(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: 10,
                    padding: 8,
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: 16,
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* form */}
              <form
                onSubmit={handleSchedule}
                style={{ padding: "20px 28px 28px" }}
              >
                {/* application */}
                <label style={labelStyle}>
                  Select Candidate Application
                </label>
                <select
                  required
                  value={formData.applicationId}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationId: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="">-- Choose application --</option>
                  {eligibleApps.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.user?.name || "Student"} — {a.job?.title || "Job"} (
                      {a.status})
                    </option>
                  ))}
                </select>

                {/* date + time */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Time</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* type */}
                <label style={labelStyle}>Interview Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Managerial">Managerial</option>
                </select>

                {/* meeting link */}
                <label style={labelStyle}>Meeting Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  style={inputStyle}
                />

                {/* notes */}
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Anything the candidate should know..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  style={{ ...inputStyle, resize: "vertical" }}
                />

                {/* submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={submitting}
                  type="submit"
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: "14px 0",
                    borderRadius: 14,
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    background: submitting
                      ? "#a5b4fc"
                      : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "0 6px 24px rgba(99,102,241,.3)",
                  }}
                >
                  {submitting ? "Scheduling..." : "Schedule Interview"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── tiny action button ──────────────────────────── */
function ActionBtn({ label, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: 10,
        border: `1.5px solid ${color}`,
        background: "transparent",
        color,
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      {label}
    </motion.button>
  );
}

/* ─── shared styles ───────────────────────────────── */
const selectStyle = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  marginBottom: 14,
  transition: "border .2s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};
