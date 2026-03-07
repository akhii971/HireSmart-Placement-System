import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStar,
  FaArrowRight,
  FaRedo,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../api/axios";

export default function JobRecommendations({ onRecommendationsLoaded }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/recommendations");
      setRecommendations(data.recommendations || []);

      if (onRecommendationsLoaded && data.recommendations) {
        onRecommendationsLoaded(data.recommendations);
      }

      if (data.message && data.recommendations?.length === 0) {
        setError(data.message);
      }
    } catch (err) {
      setError("Couldn't load recommendations right now.");
      console.error("Recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Sleek shimmer skeleton
  const Skeleton = () => (
    <div className="bg-white rounded-[20px] p-6 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)] animate-pulse flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1">
          <div className="h-4 bg-[#f0f0f0] rounded-full w-3/4 mb-2.5" />
          <div className="h-3 bg-[#f5f5f5] rounded-full w-1/2" />
        </div>
        <div className="w-12 h-12 rounded-full bg-[#f0f0f0] shrink-0" />
      </div>
      <div className="mt-auto space-y-2.5">
        <div className="h-3 bg-[#f5f5f5] rounded-full w-full" />
        <div className="h-3 bg-[#f5f5f5] rounded-full w-2/3" />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-widest transition hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
        >
          <FaRedo className={loading ? "animate-spin" : ""} size={10} />
          {loading ? "Syncing..." : "Sync AI"}
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : error && recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-4">
              <FaBrain className="text-[#cccccc]" size={28} />
            </div>
            <p className="font-semibold text-black">{error}</p>
            <p className="text-sm text-[#878787] mt-1">Try updating your skills to get better matches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.job._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[20px] border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#d4d4d4] transition-all duration-300 flex flex-col group relative overflow-hidden"
                >

                  {/* Subtle top border accent based on score */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${rec.matchScore >= 80 ? 'bg-black' : rec.matchScore >= 50 ? 'bg-[#878787]' : 'bg-[#e5e5e5]'}`} />

                  <div className="p-6 flex flex-col h-full">
                    {/* Top: Title + Circular Score */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0 pt-1">
                        <Link to={`/user/jobs/${rec.job._id}`}>
                          <h4 className="font-bold text-black text-lg truncate hover:text-[#666666] transition-colors">
                            {rec.job.title}
                          </h4>
                        </Link>
                        <p className="text-sm font-medium text-[#878787] truncate mt-0.5">
                          {rec.job.company}
                        </p>
                      </div>

                      {/* Premium AI Score Ring */}
                      <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center bg-[#fafafa] rounded-full shadow-inner border border-[#f0f0f0]">
                        <svg className="w-12 h-12 -rotate-90 absolute" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                          <motion.circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke={rec.matchScore >= 80 ? "#000000" : rec.matchScore >= 50 ? "#878787" : "#cccccc"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 100" }}
                            animate={{ strokeDasharray: `${rec.matchScore} 100` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <span className="text-[11px] font-bold text-black relative z-10 block pt-0.5">
                          {rec.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-2.5 mb-5 mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#666666]">
                        <FaMapMarkerAlt className="text-[#a1a1a1]" /> {rec.job.location}
                      </span>
                      {rec.job.salary && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#666666]">
                          <FaMoneyBillWave className="text-[#a1a1a1]" /> {rec.job.salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] bg-[#f5f5f5] px-2 py-0.5 rounded">
                        {rec.job.type}
                      </span>
                    </div>

                    {/* AI Reasoning Box */}
                    <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-3.5 mb-5 mt-auto">
                      <p className="text-xs leading-relaxed text-[#666666] font-medium flex items-start gap-2">
                        <span className="mt-0.5 text-black shrink-0"><FaStar size={10} /></span>
                        <span>{rec.reason}</span>
                      </p>
                    </div>

                    {/* Apply Button */}
                    <Link
                      to={`/user/jobs/${rec.job._id}`}
                      className="mt-2 w-full flex items-center justify-between px-5 py-3 rounded-xl bg-black text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <span>Explore Role</span>
                      <FaChevronRight size={10} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
