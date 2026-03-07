import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recruiterLogin, recruiterClearError } from "../../redux/recruiter/recruiterAuthSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBriefcase } from "react-icons/fa";

export default function RecruiterSignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((s) => s.recruiterAuth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate("/recruiter/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    useEffect(() => () => dispatch(recruiterClearError()), [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(recruiterLogin(form));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <FaBriefcase className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-wide">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Hire
                        </span>
                        <span className="text-slate-800">Smart</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Recruiter Portal — Sign In</p>
                </div>

                {/* Demo hint */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
                    <strong>Demo credentials:</strong> hr@demo.com / demo1234
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
                            placeholder="Work email address"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
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
                            className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Sign In as Recruiter
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    New recruiter?{" "}
                    <Link to="/recruiter/signup" className="text-blue-600 font-semibold hover:underline">
                        Create Account
                    </Link>
                </p>
                <p className="text-center text-slate-400 text-xs mt-3">
                    Are you a student?{" "}
                    <Link to="/user/signin" className="text-emerald-600 hover:underline">
                        Student Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
