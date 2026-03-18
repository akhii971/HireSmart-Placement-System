import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../redux/user/authSlice";
import axios from "axios";

const CHECK_INTERVAL = 10_000; // check every 10 seconds
const API_BASE = import.meta.env.VITE_API_URL || "https://hiresmart-placement-system.onrender.com/api";

/**
 * Wraps routes that require the user to be authenticated.
 * - Not logged in  → redirects to /user/signin
 * - Blocked (live) → logs out & redirects to /user/blocked
 * - Authenticated  → renders child routes
 */
export default function ProtectedRoute() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const intervalRef = useRef(null);

    // 🔴 Live status check — polls the server every 10s using the USER's own token
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkStatus = async () => {
            try {
                // Read token directly from the user's localStorage key (not admin/recruiter)
                const stored = localStorage.getItem("authUser");
                if (!stored) return;

                const token = JSON.parse(stored).token;
                if (!token) return;

                const { data } = await axios.get(`${API_BASE}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data.status === "Blocked") {
                    dispatch(logout());
                    navigate("/user/blocked", { replace: true });
                }
            } catch (err) {
                const status = err.response?.status;
                if (status === 403 && err.response?.data?.blocked) {
                    // Blocked by admin
                    dispatch(logout());
                    navigate("/user/blocked", { replace: true });
                } else if (status === 401) {
                    // Token invalid/expired
                    dispatch(logout());
                    navigate("/user/signin", { replace: true });
                }
            }
        };

        // Check immediately on mount
        checkStatus();

        // Then check every 10 seconds
        intervalRef.current = setInterval(checkStatus, CHECK_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAuthenticated, dispatch, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/user/signin" replace />;
    }

    if (user?.status === "Blocked") {
        return <Navigate to="/user/blocked" replace />;
    }

    return <Outlet />;
}
