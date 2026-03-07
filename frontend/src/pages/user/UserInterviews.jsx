import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCalendarAlt,
    FaVideo,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaRedo,
    FaBriefcase,
    FaBuilding,
    FaExternalLinkAlt,
    FaSearch,
} from "react-icons/fa";
import { fetchStudentInterviews } from "../../services/interviewService";

/* ─── status config ────────────────────────────────── */
const statusConfig = {
    Scheduled: {
        bg: "linear-gradient(135deg,#6366f1,#818cf8)",
        icon: <FaClock />,
        label: "Scheduled",
        glow: "rgba(99,102,241,.3)",
    },
    Completed: {
        bg: "linear-gradient(135deg,#10b981,#34d399)",
        icon: <FaCheckCircle />,
        label: "Completed",
        glow: "rgba(16,185,129,.3)",
    },
    Canceled: {
        bg: "linear-gradient(135deg,#ef4444,#f87171)",
        icon: <FaTimesCircle />,
        label: "Canceled",
        glow: "rgba(239,68,68,.3)",
    },
    Rescheduled: {
        bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
        icon: <FaRedo />,
        label: "Rescheduled",
        glow: "rgba(245,158,11,.3)",
    },
};

const typeColors = {
    Technical: { bg: "#ede9fe", text: "#7c3aed" },
    HR: { bg: "#dbeafe", text: "#2563eb" },
    Managerial: { bg: "#fef3c7", text: "#d97706" },
    General: { bg: "#f0fdf4", text: "#16a34a" },
};

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
        weekday: "short",
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
export default function UserInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await fetchStudentInterviews();
                setInterviews(data.interviews || []);
            } catch (err) {
                console.error("Error fetching interviews:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ─── stats ──────────────────────────────────────── */
    const stats = useMemo(() => {
        const total = interviews.length;
        const upcoming = interviews.filter(
            (i) => i.status === "Scheduled" || i.status === "Rescheduled"
        ).length;
        const completed = interviews.filter((i) => i.status === "Completed").length;
        const todayCount = interviews.filter(
            (i) =>
                (i.status === "Scheduled" || i.status === "Rescheduled") &&
                isToday(i.date)
        ).length;
        return { total, upcoming, completed, todayCount };
    }, [interviews]);

    /* ─── filter ─────────────────────────────────────── */
    const filtered = useMemo(() => {
        return interviews.filter((iv) => {
            const s = search.toLowerCase();
            const company =
                iv.recruiterId?.companyName?.toLowerCase() ||
                iv.recruiterId?.name?.toLowerCase() ||
                "";
            const job = iv.jobId?.title?.toLowerCase() || "";
            const matchSearch = !s || company.includes(s) || job.includes(s);
            const matchStatus =
                statusFilter === "All" || iv.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [interviews, search, statusFilter]);

    /* ─── loading ────────────────────────────────────── */
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
                        borderTopColor: "#10b981",
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
                padding: "96px 24px 80px",
                fontFamily: "'Inter','Segoe UI',sans-serif",
            }}
        >
            <div style={{ maxWidth: 1100, margin: "0 auto" }} >
                {/* ─── HEADER ──────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}
                >
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 800,
                            background: "linear-gradient(135deg,#10b981,#059669)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            margin: 0,
                        }}
                    >
                       
                        My Interviews
                    </h1>
                    <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
                        View and track all your upcoming and past interviews
                    </p>
                </motion.div>

                {/* ─── STAT CARDS ──────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                        gap: 14,
                        marginBottom: 28,
                    }}
                >
                    {[
                        {
                            label: "Total",
                            value: stats.total,
                            bg: "linear-gradient(135deg,#6366f1,#818cf8)",
                            glow: "rgba(99,102,241,.25)",
                        },
                        {
                            label: "Upcoming",
                            value: stats.upcoming,
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
                                padding: "22px 24px",
                                color: "#fff",
                                boxShadow: `0 8px 32px ${s.glow}`,
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 12,
                                    opacity: 0.85,
                                    fontWeight: 500,
                                }}
                            >
                                {s.label}
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 800 }}>
                                {s.value}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* ─── FILTERS ─────────────────────────────── */}
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
                    <div style={{ position: "relative", flex: "1 1 240px" }}>
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
                            placeholder="Search by company or job title..."
                            style={{
                                width: "100%",
                                padding: "12px 16px 12px 40px",
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                fontSize: 14,
                                outline: "none",
                                background: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            fontSize: 14,
                            outline: "none",
                            background: "#fff",
                            color: "#334155",
                            cursor: "pointer",
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                        <option value="Rescheduled">Rescheduled</option>
                    </select>
                </motion.div>

                {/* ─── INTERVIEW LIST ──────────────────────── */}
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
                            No interviews yet
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: 14 }}>
                            When recruiters schedule interviews with you, they'll appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
                            gap: 18,
                        }}
                    >
                        {filtered.map((iv, i) => {
                            const st = statusConfig[iv.status] || statusConfig.Scheduled;
                            const tc = typeColors[iv.type] || typeColors.General;
                            const today = isToday(iv.date);

                            return (
                                <motion.div
                                    key={iv._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{
                                        y: -6,
                                        boxShadow: `0 12px 40px ${st.glow}`,
                                    }}
                                    style={{
                                        background: "#fff",
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 20px rgba(0,0,0,.06)",
                                        border: today
                                            ? "2px solid #10b981"
                                            : "1px solid #f1f5f9",
                                        position: "relative",
                                    }}
                                >
                                    {/* today badge */}
                                    {today && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 14,
                                                right: 14,
                                                background: "#10b981",
                                                color: "#fff",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                zIndex: 2,
                                            }}
                                        >
                                            TODAY
                                        </div>
                                    )}

                                    {/* card header */}
                                    <div
                                        style={{
                                            background: st.bg,
                                            padding: "14px 20px",
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
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: 14,
                                            }}
                                        >
                                            {st.icon} {iv.status}
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
                                    <div style={{ padding: "20px" }}>
                                        {/* company info */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 16,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 12,
                                                    background:
                                                        "linear-gradient(135deg,#10b981,#059669)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#fff",
                                                    fontWeight: 800,
                                                    fontSize: 16,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {(
                                                    iv.recruiterId?.companyName ||
                                                    iv.recruiterId?.name ||
                                                    "?"
                                                )[0].toUpperCase()}
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
                                                    {iv.recruiterId?.companyName ||
                                                        iv.recruiterId?.name ||
                                                        "Company"}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: 12,
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    Recruiter
                                                </p>
                                            </div>
                                        </div>

                                        {/* details */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 14,
                                                marginBottom: 14,
                                                fontSize: 13,
                                                color: "#475569",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <FaBriefcase style={{ color: "#6366f1" }} />
                                                {iv.jobId?.title || "N/A"}
                                            </span>
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <FaCalendarAlt style={{ color: "#10b981" }} />
                                                {fmtDate(iv.date)}
                                            </span>
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <FaClock style={{ color: "#f59e0b" }} />
                                                {iv.time}
                                            </span>
                                        </div>

                                        {/* notes */}
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
                                                💬 {iv.notes}
                                            </p>
                                        )}

                                        {/* meeting link */}
                                        {iv.meetingLink &&
                                            (iv.status === "Scheduled" ||
                                                iv.status === "Rescheduled") && (
                                                <a
                                                    href={iv.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        padding: "10px 20px",
                                                        borderRadius: 12,
                                                        background:
                                                            "linear-gradient(135deg,#10b981,#059669)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        textDecoration: "none",
                                                        boxShadow: "0 4px 16px rgba(16,185,129,.3)",
                                                        transition: "transform .2s",
                                                    }}
                                                >
                                                    <FaVideo /> Join Meeting{" "}
                                                    <FaExternalLinkAlt size={10} />
                                                </a>
                                            )}

                                        {iv.status === "Completed" && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    color: "#10b981",
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}
                                            >
                                                <FaCheckCircle /> Interview completed
                                            </div>
                                        )}

                                        {iv.status === "Canceled" && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    color: "#ef4444",
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}
                                            >
                                                <FaTimesCircle /> This interview was canceled
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
