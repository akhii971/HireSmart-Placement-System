import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recruiterResetPassword, recruiterClearError } from "../../redux/recruiter/recruiterAuthSlice";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function RecruiterResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.recruiterAuth);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(recruiterClearError());
        setValidationError("");

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match");
            return;
        }

        const res = await dispatch(recruiterResetPassword({ token, password }));
        if (res.meta.requestStatus === "fulfilled") {
            navigate("/recruiter/signin", { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-wide text-slate-800">
                        Reset Password
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Please enter your new password below.
                    </p>
                </div>

                {(error || validationError) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
                        {validationError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="New Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showConfirmPw ? "text" : "password"}
                            placeholder="Confirm New Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
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
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-70"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
