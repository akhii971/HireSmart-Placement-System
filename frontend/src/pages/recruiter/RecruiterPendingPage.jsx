import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaHourglassHalf, FaEnvelope, FaSignOutAlt, FaTimesCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { recruiterLogout, recruiterSetStatus } from "../../redux/recruiter/recruiterAuthSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CHECK_INTERVAL = 8_000;  // poll every 8 s
const API_BASE = import.meta.env.VITE_API_URL || "https://hiresmart-placement-system.onrender.com/api";
const STORAGE_KEY = "recruiterUser";

export default function RecruiterPendingPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { recruiter, isAuthenticated } = useSelector((s) => s.recruiterAuth);
    const intervalRef = useRef(null);

    const isRejected = recruiter?.status === "Rejected";
    const isBlocked = recruiter?.status === "Blocked";

    // 🔴 Live poll — auto-redirect when admin approves
    useEffect(() => {
        if (!isAuthenticated) return;

        const pollStatus = async () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) return;
                const token = JSON.parse(stored).token;
                if (!token) return;

                const { data } = await axios.get(`${API_BASE}/recruiters/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data.status === "Approved") {
                    dispatch(recruiterSetStatus("Approved"));
                    navigate("/recruiter/dashboard", { replace: true });
                } else if (data.status !== recruiter?.status) {
                    // Status updated (e.g., Pending → Rejected) — refresh store
                    dispatch(recruiterSetStatus(data.status));
                }
            } catch (_) { /* network error — just retry next tick */ }
        };

        // Check immediately
        pollStatus();
        intervalRef.current = setInterval(pollStatus, CHECK_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [isAuthenticated, recruiter?.status, dispatch, navigate]);

    const handleLogout = () => {
        dispatch(recruiterLogout());
        navigate("/recruiter/signin", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-4">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-lg text-center"
            >
                {/* Animated Icon */}
                <motion.div
                    animate={
                        isRejected || isBlocked
                            ? { scale: [1, 1.05, 1] }
                            : { rotate: [0, -10, 10, -10, 0] }
                    }
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className={`w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${isRejected || isBlocked
                            ? "bg-gradient-to-br from-red-500 to-rose-600"
                            : "bg-gradient-to-br from-amber-400 to-orange-500"
                        }`}
                >
                    {isRejected || isBlocked
                        ? <FaTimesCircle className="text-white text-5xl" />
                        : <FaHourglassHalf className="text-white text-5xl" />
                    }
                </motion.div>

                {/* Glass card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10"
                >
                    <h1 className="text-3xl font-extrabold text-white mb-3">
                        {isBlocked
                            ? "Account Blocked"
                            : isRejected
                                ? "Application Rejected"
                                : "Awaiting Approval"}
                    </h1>

                    <p className="text-slate-300 text-base leading-relaxed mb-2">
                        {isBlocked ? (
                            <>Your recruiter account has been <span className="text-red-400 font-semibold">blocked</span> by the administrator.</>
                        ) : isRejected ? (
                            <>Your recruiter application has been <span className="text-red-400 font-semibold">rejected</span>. Please contact support.</>
                        ) : (
                            <>
                                Hi <span className="text-amber-400 font-semibold">{recruiter?.name || "Recruiter"}</span>! Your account for{" "}
                                <span className="text-blue-400 font-semibold">{recruiter?.company}</span> is{" "}
                                <span className="text-amber-400 font-semibold">pending admin review</span>.
                            </>
                        )}
                    </p>

                    {/* Live polling indicator for pending */}
                    {!isRejected && !isBlocked && (
                        <div className="flex items-center justify-center gap-2 mb-6 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                            </span>
                            <p className="text-slate-400 text-xs">Checking approval status automatically…</p>
                        </div>
                    )}

                    {/* Progress steps (pending only) */}
                    {!isRejected && !isBlocked && (
                        <div className="flex items-center justify-center gap-3 mb-8">
                            {[
                                { label: "Registered", done: true, active: false },
                                { label: "Under Review", done: true, active: true },
                                { label: "Approved", done: false, active: false },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${step.active ? "bg-amber-400 ring-2 ring-amber-400/40"
                                            : step.done ? "bg-emerald-400"
                                                : "bg-slate-600"
                                        }`} />
                                    <span className={`text-xs font-semibold ${step.active ? "text-amber-400"
                                            : step.done ? "text-emerald-400"
                                                : "text-slate-500"
                                        }`}>
                                        {step.label}
                                    </span>
                                    {i < 2 && <div className="w-6 h-px bg-slate-600" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contact Support */}
                    <a
                        href="mailto:support@hiresmart.com"
                        className="flex items-center justify-center gap-2 w-full py-3 mb-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition font-semibold no-underline"
                    >
                        <FaEnvelope /> Contact Support
                    </a>

                    {/* Sign Out */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition font-semibold"
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
