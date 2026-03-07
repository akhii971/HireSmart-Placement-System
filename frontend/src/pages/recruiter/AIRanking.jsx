import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaSpinner, FaBrain, FaTrophy } from "react-icons/fa";
import api from "../../api/axios";
import GeminiKeyInput from "../../components/common/GeminiKeyInput";
import { hasApiKey, rankCandidates } from "../../services/aiService";

export default function AIRanking() {
  const [keyReady, setKeyReady] = useState(hasApiKey());

  // Data
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // AI
  const [rankings, setRankings] = useState(null);
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState("");
  const [openExplain, setOpenExplain] = useState(null);

  // Sort
  const [sort, setSort] = useState("desc");

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get("/jobs/my/jobs");
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applications when job selected
  useEffect(() => {
    if (!selectedJob) return;
    const fetchApps = async () => {
      setLoadingApps(true);
      setRankings(null);
      try {
        const { data } = await api.get(`/applications/job/${selectedJob._id}`);
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
        setApplications([]);
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, [selectedJob]);

  // Run AI Ranking
  const runRanking = async () => {
    if (!selectedJob || applications.length === 0) return;
    setRanking(true);
    setError("");
    try {
      const result = await rankCandidates(selectedJob, applications);
      setRankings(result);
    } catch (err) {
      setError(err.message || "AI ranking failed");
    } finally {
      setRanking(false);
    }
  };

  // Merge rankings into applications
  const rankedList = useMemo(() => {
    if (!rankings?.rankings) return [];
    return rankings.rankings
      .map((r) => {
        const app = applications[r.candidateIndex - 1];
        return app ? { ...r, app } : null;
      })
      .filter(Boolean)
      .sort((a, b) =>
        sort === "desc" ? b.aiScore - a.aiScore : a.aiScore - b.aiScore
      );
  }, [rankings, applications, sort]);

  const scoreColor = (score) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    if (score >= 40) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const recColor = (rec) => {
    const map = {
      "Strong Hire": "text-emerald-600 bg-emerald-50",
      Hire: "text-blue-600 bg-blue-50",
      Maybe: "text-yellow-600 bg-yellow-50",
      "No Hire": "text-red-600 bg-red-50",
    };
    return map[rec] || "text-slate-600 bg-slate-50";
  };

  const top3 = rankedList.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white/70 backdrop-blur rounded-3xl shadow-2xl border p-6 mt-16"
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <FaBrain className="text-indigo-500" /> AI Candidate Ranking
            </h1>
            <p className="text-slate-500 text-sm">
              Select a job to rank all applicants with AI
            </p>
          </div>
          <GeminiKeyInput onKeySet={() => setKeyReady(true)} />
        </div>

        {/* ═══ JOB SELECTION ═══ */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Select a Job Posting
          </p>
          <div className="flex flex-wrap gap-2">
            {jobs.length === 0 ? (
              <p className="text-slate-400 text-sm">No jobs posted yet</p>
            ) : (
              jobs.map((j) => (
                <button
                  key={j._id}
                  onClick={() => setSelectedJob(j)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selectedJob?._id === j._id
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-white border text-slate-700 hover:bg-indigo-50"
                    }`}
                >
                  {j.title}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ═══ APPLICANTS PANEL ═══ */}
        {selectedJob && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <p className="text-sm text-slate-600">
                <strong>{applications.length}</strong> applicants for{" "}
                <strong>{selectedJob.title}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSort("desc")}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${sort === "desc"
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-slate-700"
                    }`}
                >
                  High → Low
                </button>
                <button
                  onClick={() => setSort("asc")}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${sort === "asc"
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-slate-700"
                    }`}
                >
                  Low → High
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runRanking}
                  disabled={ranking || !keyReady || applications.length === 0}
                  className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {ranking ? (
                    <>
                      <FaSpinner className="animate-spin" /> Ranking...
                    </>
                  ) : (
                    "Rank with AI ✨"
                  )}
                </motion.button>
              </div>
            </div>

            {loadingApps && (
              <div className="text-center py-10">
                <FaSpinner className="animate-spin text-indigo-500 text-2xl mx-auto mb-2" />
                <p className="text-slate-500">Loading applicants...</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}

            {/* ═══ AI SUMMARY ═══ */}
            {rankings?.summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50 rounded-xl p-4 mb-4"
              >
                <p className="text-sm font-bold text-indigo-700 mb-1">
                  🧠 AI Summary
                </p>
                <p className="text-sm text-indigo-600">{rankings.summary}</p>
              </motion.div>
            )}

            {/* ═══ TOP 3 ═══ */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {top3.map((r, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-2xl p-5 shadow border relative"
                  >
                    {i === 0 && (
                      <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow flex items-center gap-1">
                        <FaTrophy /> Best Hire
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900">
                      {r.app?.user?.name || `Candidate ${r.candidateIndex}`}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor(
                          r.aiScore
                        )}`}
                      >
                        AI: {r.aiScore}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${recColor(
                          r.recommendation
                        )}`}
                      >
                        {r.recommendation}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {r.strengths}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ═══ RANKING TABLE ═══ */}
            {rankedList.length > 0 && (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left text-sm">Rank</th>
                      <th className="p-4 text-left text-sm">Candidate</th>
                      <th className="p-4 text-left text-sm">AI Score</th>
                      <th className="p-4 text-left text-sm">Recommendation</th>
                      <th className="p-4 text-left text-sm">Matched</th>
                      <th className="p-4 text-center text-sm">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rankedList.map((r, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-t hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          #{i + 1}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">
                            {r.app?.user?.name ||
                              `Candidate ${r.candidateIndex}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {r.app?.user?.email}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor(
                              r.aiScore
                            )}`}
                          >
                            {r.aiScore}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${recColor(
                              r.recommendation
                            )}`}
                          >
                            {r.recommendation}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {r.matchedSkills?.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                            {r.matchedSkills?.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{r.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                setOpenExplain(
                                  openExplain === i ? null : i
                                )
                              }
                              className="px-3 py-1 rounded-full border text-slate-700 hover:bg-slate-100 text-sm"
                            >
                              Explain
                            </button>
                            <Link
                              to={`/recruiter/candidates/${r.app?._id}`}
                              className="px-3 py-1 rounded-full border border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white transition text-sm"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Explanation panels */}
                <AnimatePresence>
                  {rankedList.map(
                    (r, i) =>
                      openExplain === i && (
                        <motion.div
                          key={`explain-${i}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50 border-t px-6 py-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-emerald-700 mb-1">
                                💪 Strengths
                              </p>
                              <p className="text-slate-600">{r.strengths}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-red-700 mb-1">
                                ⚠️ Concerns
                              </p>
                              <p className="text-slate-600">{r.concerns}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-emerald-700 mb-1">
                                Matched Skills
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {r.matchedSkills?.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-xs"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-red-700 mb-1">
                                Missing Skills
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {r.missingSkills?.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-xs"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Empty state */}
            {!loadingApps &&
              applications.length === 0 &&
              !ranking && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-500 font-semibold">
                    No applications received for this job yet
                  </p>
                </div>
              )}
          </>
        )}

        {/* No job selected */}
        {!selectedJob && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-slate-500 font-semibold text-lg">
              Select a job above to rank candidates
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
