import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaRobot,
  FaMicrophone,
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import GeminiKeyInput from "../../components/common/GeminiKeyInput";
import {
  hasApiKey,
  analyzeATS,
  generateCareerRoadmap,
} from "../../services/aiService";

export default function UserAI() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [keyReady, setKeyReady] = useState(hasApiKey());

  // ── ATS Score state ──
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState("");

  // ── Roadmap state ──
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapError, setRoadmapError] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [done, setDone] = useState({});

  // ── ATS Analysis ──
  const runATS = async () => {
    if (!user) return;
    setAtsLoading(true);
    setAtsError("");
    try {
      const result = await analyzeATS(user);
      setAtsResult(result);
    } catch (err) {
      setAtsError(err.message || "Failed to analyze profile");
    } finally {
      setAtsLoading(false);
    }
  };

  // ── Roadmap Generation ──
  const runRoadmap = async () => {
    if (!user) return;
    setRoadmapLoading(true);
    setRoadmapError("");
    try {
      const result = await generateCareerRoadmap(user, targetRole);
      setRoadmap(result);
    } catch (err) {
      setRoadmapError(err.message || "Failed to generate roadmap");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-yellow-500 to-amber-500";
    if (score >= 40) return "from-orange-500 to-red-400";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-6 pb-24 mt-20">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <FaBrain className="text-indigo-500" /> AI Career Assistant
            </h1>
            <p className="text-slate-500">
              Unlock AI-powered tools to boost your career
            </p>
          </div>
          <GeminiKeyInput onKeySet={() => setKeyReady(true)} />
        </div>

        {/* ═══ QUICK ACTION CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => navigate("/user/ai/chat")}
            className="bg-white rounded-2xl p-6 shadow-lg border text-left group hover:shadow-xl transition"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl mb-3">
              <FaRobot />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              AI Chat Assistant
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Ask anything about jobs, skills, resume tips & career guidance
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => navigate("/user/ai/mock")}
            className="bg-white rounded-2xl p-6 shadow-lg border text-left group hover:shadow-xl transition"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl mb-3">
              <FaMicrophone />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition">
              AI Mock Interview
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Practice with AI-generated questions and get real-time feedback
            </p>
          </motion.button>
        </div>

        {/* ═══ ATS RESUME SCORE ═══ */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaChartLine className="text-indigo-500" /> ATS Resume Score
              </h3>
              <p className="text-sm text-slate-500">
                Get your profile analyzed by AI for ATS compatibility
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runATS}
              disabled={atsLoading || !keyReady}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {atsLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Analyzing...
                </>
              ) : (
                "Analyze My Profile ✨"
              )}
            </motion.button>
          </div>

          {atsError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {atsError}
            </div>
          )}

          {atsResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Overall Score */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={atsResult.overallScore >= 70 ? "#10b981" : atsResult.overallScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(atsResult.overallScore / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${scoreColor(atsResult.overallScore)}`}>
                      {atsResult.overallScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Industry Readiness:{" "}
                    <span className="text-indigo-600">{atsResult.industryReadiness}</span>
                  </p>
                  <p className="text-sm text-slate-600">Best fit roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.topRoles?.map((r) => (
                      <span key={r} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Scores */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {Object.entries(atsResult.sections || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className={`text-2xl font-bold ${scoreColor(val.score)}`}>{val.score}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{val.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-emerald-700 mb-2">💪 Strengths</p>
                  <ul className="space-y-1">
                    {atsResult.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-600 flex items-start gap-2">
                        <FaCheckCircle className="mt-0.5 flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-700 mb-2">⚠️ Weaknesses</p>
                  <ul className="space-y-1">
                    {atsResult.weaknesses?.map((w, i) => (
                      <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm font-bold text-indigo-700 mb-2">🚀 Suggestions to Improve</p>
                <ul className="space-y-2">
                  {atsResult.suggestions?.map((s, i) => (
                    <li key={i} className="text-sm text-indigo-600 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ CAREER ROADMAP ═══ */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                🧠 AI Career Roadmap
              </h3>
              <p className="text-sm text-slate-500">
                Get a personalized week-by-week learning plan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target Role..."
                className="border rounded-xl px-3 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runRoadmap}
                disabled={roadmapLoading || !keyReady}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {roadmapLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Generating...
                  </>
                ) : (
                  "Generate ✨"
                )}
              </motion.button>
            </div>
          </div>

          {roadmapError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {roadmapError}
            </div>
          )}

          {!roadmap && !roadmapLoading && (
            <p className="text-slate-400 text-sm">
              Enter your target role and generate a personalized learning plan
            </p>
          )}

          {roadmap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Focus areas */}
              {roadmap.focusAreas && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs text-slate-500 font-semibold">Focus:</span>
                  {roadmap.focusAreas.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Weeks */}
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.roadmap?.map((week) => (
                  <div key={week.week} className="bg-slate-50 rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800">
                        Week {week.week}: {week.title}
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {week.tasks?.map((task, j) => {
                        const taskKey = `${week.week}-${j}`;
                        return (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!done[taskKey]}
                              onChange={() =>
                                setDone((prev) => ({
                                  ...prev,
                                  [taskKey]: !prev[taskKey],
                                }))
                              }
                              className="mt-0.5 accent-indigo-500"
                            />
                            <span className={done[taskKey] ? "line-through text-slate-400" : "text-slate-700"}>
                              {task}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {week.resources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {week.resources.map((r, k) => (
                          <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                            📚 {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {roadmap.estimatedReadiness && (
                <p className="text-sm text-indigo-600 font-semibold text-center mt-2">
                  🎯 {roadmap.estimatedReadiness}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}