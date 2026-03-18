import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError } from "../../redux/user/authSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
    const { token } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [forms, setForms] = useState({ password: "", confirmPassword: "" });
    const [success, setSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate("/user/signin");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        if (forms.password !== forms.confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }
        
        const res = await dispatch(resetPassword({ token, password: forms.password }));
        if (!res.error) {
            setSuccess(true);
            dispatch({ type: "userNotifications/addNotification", payload: { message: "Password has been successfully reset!" } });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-wide mb-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            Hire
                        </span>
                        <span className="text-slate-800">Smart</span>
                    </h1>
                    <h2 className="text-xl font-bold text-slate-700">Reset Password</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Enter your new password below.
                    </p>
                </div>

                {(error || localError) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
                        {error || localError}
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="New Password"
                                required
                                value={forms.password}
                                onChange={(e) => setForms({ ...forms, password: e.target.value })}
                                className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showConfirmPw ? "text" : "password"}
                                placeholder="Confirm New Password"
                                required
                                value={forms.confirmPassword}
                                onChange={(e) => setForms({ ...forms, confirmPassword: e.target.value })}
                                className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </motion.button>
                    </form>
                )}

                {success && (
                    <div className="mt-6 text-center">
                        <Link to="/user/signin" className="inline-block py-2 px-6 bg-emerald-100 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-200 transition">
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
