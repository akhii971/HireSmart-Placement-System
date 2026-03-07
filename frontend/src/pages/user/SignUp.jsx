import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup, clearError } from "../../redux/user/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaGraduationCap,
} from "react-icons/fa";

export default function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
    });
    const [showPw, setShowPw] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (isAuthenticated) navigate("/user/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    useEffect(() => () => dispatch(clearError()), [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError("");

        if (form.password !== form.confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }
        if (form.password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }

        dispatch(signup(form));
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 px-4 py-10">
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
                    <p className="text-slate-500 text-sm mt-1">Create your account</p>
                </div>

                {/* Error */}
                {displayError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Full name"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                        />
                    </div>

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

                    {/* Role */}
                    <div className="relative">
                        <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50 appearance-none"
                        >
                            <option value="student">Student</option>
                            <option value="fresher">Fresher</option>
                            <option value="professional">Working Professional</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Password (min 6 chars)"
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

                    {/* Confirm Password */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Confirm password"
                            required
                            value={form.confirmPassword}
                            onChange={(e) =>
                                setForm({ ...form, confirmPassword: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Create Account
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/user/signin"
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
