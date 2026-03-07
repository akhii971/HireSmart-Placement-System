import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recruiterSignup, recruiterClearError } from "../../redux/recruiter/recruiterAuthSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaBuilding, FaIndustry,
} from "react-icons/fa";

const INDUSTRIES = [
    "IT Services", "Product / SaaS", "E-Commerce", "FinTech", "EdTech",
    "HealthTech", "Manufacturing", "Consulting", "BFSI", "Other",
];

export default function RecruiterSignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((s) => s.recruiterAuth);

    const [form, setForm] = useState({
        name: "", email: "", company: "", industry: "IT Services",
        password: "", confirmPassword: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (isAuthenticated) navigate("/recruiter/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    useEffect(() => () => dispatch(recruiterClearError()), [dispatch]);

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
        dispatch(recruiterSignup(form));
    };

    const displayError = localError || error;
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-wide">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Hire
                        </span>
                        <span className="text-slate-800">Smart</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Create your Recruiter account</p>
                </div>

                {/* Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
                    ⏳ Your account will be <strong>pending admin approval</strong> after registration.
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
                            type="text" placeholder="Your full name" required
                            value={form.name} onChange={set("name")}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email" placeholder="Work email address" required
                            value={form.email} onChange={set("email")}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    {/* Company */}
                    <div className="relative">
                        <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" placeholder="Company / Organisation name" required
                            value={form.company} onChange={set("company")}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    {/* Industry */}
                    <div className="relative">
                        <FaIndustry className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={form.industry} onChange={set("industry")}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50 appearance-none"
                        >
                            {INDUSTRIES.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"} placeholder="Password (min 6 chars)" required
                            value={form.password} onChange={set("password")}
                            className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPw ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"} placeholder="Confirm password" required
                            value={form.confirmPassword} onChange={set("confirmPassword")}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Create Recruiter Account
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link to="/recruiter/signin" className="text-blue-600 font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
