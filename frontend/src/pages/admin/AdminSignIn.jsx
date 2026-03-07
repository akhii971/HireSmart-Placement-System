import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { adminClearError, adminLogin } from "../../redux/admin/adminAuthSlice";

export default function AdminSignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((s) => s.adminAuth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate("/admin/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    useEffect(() => () => dispatch(adminClearError()), [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(adminLogin(form));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <FaShieldAlt className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-wide text-white">
                        <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                            Admin
                        </span>
                        <span className="text-white"> Portal</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Restricted access — Admins only</p>
                </div>

                {/* Demo hint */}
                <div className="bg-rose-900/30 border border-rose-500/30 rounded-xl p-3 mb-6 text-sm text-rose-300">
                    <strong>Demo credentials:</strong> admin@hiresmart.com / admin1234
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-900/40 border border-red-500/40 text-red-300 rounded-xl p-3 mb-5 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Admin email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-white bg-white/10 placeholder-slate-400"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Password"
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-11 pr-11 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-white bg-white/10 placeholder-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            {showPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Sign In as Admin
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Not an admin?{" "}
                    <Link to="/user/signin" className="text-emerald-400 hover:underline">
                        Student Login
                    </Link>
                    {" · "}
                    <Link to="/recruiter/signin" className="text-blue-400 hover:underline">
                        Recruiter Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
