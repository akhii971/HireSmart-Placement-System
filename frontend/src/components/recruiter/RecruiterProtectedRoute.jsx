import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { recruiterSetStatus, recruiterLogout } from "../../redux/recruiter/recruiterAuthSlice";

const CHECK_INTERVAL = 10_000;          // poll every 10 s
const API_BASE = "http://localhost:5000/api";
const STORAGE_KEY = "recruiterUser";

/**
 * Guards the recruiter dashboard.
 * - Not logged in         → /recruiter/signin
 * - Pending / Rejected / Blocked  → /recruiter/pending
 * - Approved              → renders child routes
 *
 * 🔴 LIVE POLL: also checks status every 10 s so that
 *    if admin approves/rejects while recruiter is sitting
 *    on the pending page or dashboard, it reacts immediately.
 */
export default function RecruiterProtectedRoute() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, recruiter } = useSelector((s) => s.recruiterAuth);
    const intervalRef = useRef(null);

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

                const newStatus = data.status;
                const currentStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").status;

                if (newStatus !== currentStatus) {
                    // Status changed — update Redux + localStorage
                    dispatch(recruiterSetStatus(newStatus));

                    if (newStatus === "Approved") {
                        // Was pending/rejected on pending page, now approved → go to dashboard
                        navigate("/recruiter/dashboard", { replace: true });
                    } else {
                        // Was approved on dashboard, now blocked/rejected → go to pending page
                        navigate("/recruiter/pending", { replace: true });
                    }
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    dispatch(recruiterLogout());
                    navigate("/recruiter/signin", { replace: true });
                }
                if (err.response?.status === 403) {
                    dispatch(recruiterSetStatus("Blocked"));
                    navigate("/recruiter/pending", { replace: true });
                }
            }
        };

        pollStatus();
        intervalRef.current = setInterval(pollStatus, CHECK_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [isAuthenticated, dispatch, navigate]);

    if (!isAuthenticated || !recruiter) {
        return <Navigate to="/recruiter/signin" replace />;
    }

    if (recruiter.status !== "Approved") {
        return <Navigate to="/recruiter/pending" replace />;
    }

    return <Outlet />;
}
