import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaPaperPlane, FaBug, FaCommentDots, FaStar } from "react-icons/fa";
import UserNavbar from "../../components/user/UserNavbar";
import RecruiterNavbar from "../../components/recruiter/recruiternavbar";

export default function FeedbackPage() {
    const { user } = useSelector((state) => state.auth);
    const { recruiter } = useSelector((state) => state.recruiterAuth);

    const isRecruiter = !!recruiter;
    const token = isRecruiter ? recruiter?.token : user?.token;

    const [type, setType] = useState("Feedback");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [status, setStatus] = useState({ loading: false, success: "", error: "" });

    const Navbar = isRecruiter ? RecruiterNavbar : UserNavbar;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: "", error: "" });

        try {
            const endpoint = isRecruiter ? "/api/feedback/recruiter" : "/api/feedback/user";
            const res = await fetch(`${import.meta.env.VITE_SOCKET_URL || "https://hiresmart-placement-system-dcoe.onrender.com"}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type, message, rating: type === "Feedback" ? rating : undefined }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit");

            setStatus({ loading: false, success: "Submitted successfully! Thank you.", error: "" });
            setMessage("");
            setRating(0);
        } catch (err) {
            setStatus({ loading: false, success: "", error: err.message });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 flex justify-center items-center py-20 px-4 mt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg relative overflow-hidden"
                >
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100 rounded-full blur-3xl -ml-16 -mb-16 opacity-50 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            We Value Your Voice
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Help us improve by sharing your feedback or reporting issues.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">

                        {/* Type Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType("Feedback")}
                                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${type === "Feedback"
                                        ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-md"
                                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                                    }`}
                            >
                                <FaCommentDots /> Feedback
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("Report")}
                                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${type === "Report"
                                        ? "bg-rose-50 text-rose-600 border-2 border-rose-500 shadow-md"
                                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                                    }`}
                            >
                                <FaBug /> Report Issue
                            </button>
                        </div>

                        {/* Rating (Only for Feedback) */}
                        {type === "Feedback" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <label className="text-sm font-semibold text-slate-700">Rate your experience</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <FaStar
                                                className={
                                                    star <= (hoverRating || rating)
                                                        ? "text-yellow-400 drop-shadow-sm"
                                                        : "text-slate-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Message Area */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700">
                                {type === "Feedback" ? "Your Feedback" : "Describe the Issue"}
                            </label>
                            <textarea
                                rows="4"
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none transition-all placeholder:text-slate-400"
                                placeholder={
                                    type === "Feedback"
                                        ? "What do you like or dislike about our platform?"
                                        : "Please describe the problem you experienced in detail."
                                }
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        {/* Status Messages */}
                        {status.error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                {status.error}
                            </div>
                        )}
                        {status.success && (
                            <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                                {status.success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status.loading || (type === "Feedback" && rating === 0) || !message.trim()}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status.loading ? "Submitting..." : (
                                <>
                                    <FaPaperPlane /> Submit {type}
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
