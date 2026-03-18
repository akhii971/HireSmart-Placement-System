import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearError } from "../../redux/user/authSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";

export default function ForgotPassword() {
    const dispatch = useDispatch();
    const { loading, error, message } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");

    // Clear redux error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(forgotPassword({ email }));
        if (!res.error) {
            dispatch({ type: "userNotifications/addNotification", payload: { message: "Password reset link sent to your email!" } });
            setEmail(""); // clear input on success
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
                    <h2 className="text-xl font-bold text-slate-700">Forgot Password?</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 bg-slate-50"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </motion.button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Remember your password?{" "}
                    <Link
                        to="/user/signin"
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Log In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
