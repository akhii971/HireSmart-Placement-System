import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../redux/user/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error, isBlocked } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);

    // Redirect when already authenticated
    useEffect(() => {
        if (isAuthenticated) navigate("/user/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    // Redirect when account is blocked
    useEffect(() => {
        if (isBlocked) navigate("/user/blocked", { replace: true });
    }, [isBlocked, navigate]);

    // Clear redux error when component unmounts
    useEffect(() => () => dispatch(clearError()), [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login(form));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-wide">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            Hire
                        </span>
                        <span className="text-slate-800">Smart</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
                </div>

                {/* Demo hint */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6 text-sm text-emerald-700">
                    <strong>Demo credentials:</strong> user@demo.com / demo1234
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email address"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="Password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                        <div className="text-right mt-1">
                            <Link to="/user/forgot-password" className="text-xs text-emerald-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Sign In
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/user/signup"
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
