import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaBrain,
} from "react-icons/fa";
import api from "../../api/axios";
import { hasApiKey, analyzeSkillMatch } from "../../services/aiService";
import GeminiKeyInput from "../../components/common/GeminiKeyInput";

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  // AI Skill Match
  const user = useSelector((state) => state.auth.user);
  const [skillMatch, setSkillMatch] = useState(null);
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillError, setSkillError] = useState("");
  const [keyReady, setKeyReady] = useState(hasApiKey());

  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem("savedJobs");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch job + check application status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, checkRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/applications/check/${id}`),
        ]);
        setJob(jobRes.data);
        if (checkRes.data.applied) {
          setAlreadyApplied(true);
          setApplicationStatus(checkRes.data.application?.status);
        }
      } catch (err) {
        console.error("Failed to load job", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-600">
        ❌ Job not found
      </div>
    );
  }

  const isSaved = savedJobs.includes(job._id);

  const toggleSave = () => {
    let updated;
    if (isSaved) {
      updated = savedJobs.filter((j) => j !== job._id);
    } else {
      updated = [...savedJobs, job._id];
    }
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  // Status badge color
  const statusBadge = (s) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-700",
      Reviewed: "bg-blue-100 text-blue-700",
      Shortlisted: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-700",
      Hired: "bg-green-100 text-green-700",
    };
    return map[s] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <div className="max-w-4xl mx-auto space-y-6 pb-24 mt-24">
        {/* ===== JOB HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow border relative overflow-hidden"
        >
          <button
            onClick={toggleSave}
            className="absolute top-4 right-4 text-2xl text-red-500"
          >
            {isSaved ? <FaHeart /> : <FaRegHeart />}
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {job.title}
          </h1>

          <p className="text-slate-600 mt-1 flex flex-wrap gap-3 items-center">
            <span className="flex items-center gap-1">
              <FaBriefcase /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt /> {job.location}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
              {job.type}
            </span>
          </p>

          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              👀 {job.views || 0} Views
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
              📄 {job.applications || 0} Applications
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              🕒 {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* ===== DETAILS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills?.length > 0 ? (
                job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">Not specified</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== EXTRA INFO ===== */}
        <div className="bg-white rounded-2xl p-6 shadow space-y-2 text-sm">
          <p>
            <strong>Experience:</strong> {job.experience || "Not specified"}
          </p>
          <p>
            <strong>Salary / Stipend:</strong> {job.salary || "Not specified"}
          </p>
          <p>
            <strong>Eligibility:</strong> {job.eligibility || "Not specified"}
          </p>
        </div>

        {/* ===== COMPANY SECTION ===== */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700">
            <FaBuilding />
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-lg flex items-center gap-2 justify-center sm:justify-start">
              <FaBuilding /> {job.company}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Recruiter: {job.recruiter?.name || "Company HR"}
            </p>
          </div>
        </div>

        {/* ===== AI SKILL MATCH ===== */}
        <div className="bg-white rounded-2xl p-6 shadow border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FaBrain className="text-indigo-500 text-xl" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900">AI Skill Match</h3>
                <p className="text-xs text-slate-500">See how your skills match this job</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GeminiKeyInput onKeySet={() => setKeyReady(true)} />
              {keyReady && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    setSkillLoading(true);
                    setSkillError("");
                    try {
                      const result = await analyzeSkillMatch(user, job);
                      setSkillMatch(result);
                    } catch (err) {
                      setSkillError(err.message || "Failed to analyze");
                    } finally {
                      setSkillLoading(false);
                    }
                  }}
                  disabled={skillLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {skillLoading ? (
                    <><FaSpinner className="animate-spin" /> Analyzing...</>
                  ) : (
                    "Check Match ✨"
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {skillError && (
            <p className="text-red-500 text-sm mb-3">{skillError}</p>
          )}

          {skillMatch && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score + Fit */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={skillMatch.matchScore >= 70 ? "#10b981" : skillMatch.matchScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(skillMatch.matchScore / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{skillMatch.matchScore}%</span>
                  </div>
                </div>
                <div>
                  <p className={`text-lg font-bold ${skillMatch.overallFit === "Strong Match" ? "text-emerald-600" :
                    skillMatch.overallFit === "Moderate Match" ? "text-yellow-600" : "text-red-600"
                    }`}>{skillMatch.overallFit}</p>
                  <p className="text-sm text-slate-600 mt-1">{skillMatch.recommendation}</p>
                </div>
              </div>

              {/* Matched / Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-sm font-bold text-emerald-700 mb-2">✅ Matched Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillMatch.matchedSkills?.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-semibold">{s}</span>
                    ))}
                    {(!skillMatch.matchedSkills || skillMatch.matchedSkills.length === 0) && <span className="text-xs text-slate-400">None</span>}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-sm font-bold text-red-700 mb-2">❌ Missing Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillMatch.missingSkills?.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-semibold">{s}</span>
                    ))}
                    {(!skillMatch.missingSkills || skillMatch.missingSkills.length === 0) && <span className="text-xs text-slate-400">None</span>}
                  </div>
                </div>
              </div>

              {/* Learning Plan */}
              {skillMatch.learningPlan?.length > 0 && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-indigo-700 mb-2">📚 Learning Plan</p>
                  <div className="space-y-2">
                    {skillMatch.learningPlan.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <div>
                          <span className="font-semibold text-indigo-800">{item.skill}</span>
                          <span className="text-indigo-600"> — {item.timeToLearn}</span>
                          <span className="text-indigo-400"> ({item.resource})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ===== APPLICATION STATUS / ACTION ===== */}
        {alreadyApplied ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-500 text-2xl" />
                <div>
                  <p className="font-bold text-emerald-700">
                    You've applied to this job
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <FaClock className="text-slate-400 text-xs" />
                    <span className="text-sm text-slate-600">Status:</span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-semibold ${statusBadge(
                        applicationStatus
                      )}`}
                    >
                      {applicationStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/user/applications")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition text-sm"
              >
                View My Applications
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={() => navigate(`/user/jobs/${job._id}/apply`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition shadow"
            >
              Apply Now
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}