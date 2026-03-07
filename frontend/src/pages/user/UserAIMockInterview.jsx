import { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GeminiKeyInput from "../../components/common/GeminiKeyInput";
import {
  hasApiKey,
  generateInterviewQuestions,
  evaluateAnswer,
} from "../../services/aiService";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function UserAIMockInterview() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [keyReady, setKeyReady] = useState(hasApiKey());

  // Setup state
  const [role, setRole] = useState("Full Stack Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [started, setStarted] = useState(false);

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]);
  const [finished, setFinished] = useState(false);

  // Loading
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  // ── Start Interview ──
  const startInterview = async () => {
    setGenerating(true);
    setError("");
    try {
      const skills = user?.skills || ["JavaScript", "React", "Node.js"];
      const result = await generateInterviewQuestions(role, skills, difficulty, questionCount);
      setQuestions(result.questions || []);
      setStarted(true);
      setCurrentIdx(0);
      setScores([]);
      setFinished(false);
    } catch (err) {
      setError(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  // ── Submit Answer ──
  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setError("");
    try {
      const q = questions[currentIdx];
      const result = await evaluateAnswer(q.question, q.expectedPoints, answer);
      setFeedback(result);
      setScores((prev) => [...prev, result.score || 0]);
    } catch (err) {
      setError(err.message || "Failed to evaluate answer");
    } finally {
      setEvaluating(false);
    }
  };

  // ── Next Question ──
  const nextQuestion = () => {
    setAnswer("");
    setFeedback(null);
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  // ── Restart ──
  const restart = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswer("");
    setFeedback(null);
    setScores([]);
    setFinished(false);
  };

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const progress = questions.length
    ? ((currentIdx + 1) / questions.length) * 100
    : 0;

  // ════════════════════════════════════════════
  //  FINISHED SCREEN
  // ════════════════════════════════════════════
  if (finished) {
    const percentage = avgScore * 10;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 ">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl">
            <FaTrophy />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Interview Complete! 🎉
          </h2>

          {/* Score Ring */}
          <div className="relative w-36 h-36 mx-auto my-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={percentage >= 70 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-slate-900">{percentage}%</span>
              <span className="text-xs text-slate-500">{avgScore}/10 avg</span>
            </div>
          </div>

          <p className="text-slate-600 mb-2">
            {percentage >= 80
              ? "🌟 Excellent! You're interview-ready!"
              : percentage >= 60
                ? "👍 Good performance! Keep practicing."
                : percentage >= 40
                  ? "💪 Decent start. Focus on weak areas."
                  : "📚 Keep studying. Practice makes perfect!"}
          </p>

          {/* Score per question */}
          <div className="flex justify-center gap-2 my-4">
            {scores.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${s >= 8 ? "bg-emerald-500" : s >= 5 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                >
                  {s}
                </div>
                <span className="text-[10px] text-slate-400">Q{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={restart}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg"
            >
              Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/user/ai")}
              className="flex-1 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold"
            >
              Back to AI
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  //  SETUP SCREEN
  // ════════════════════════════════════════════
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 mt-19"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
              🎤
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI Mock Interview</h2>
            <p className="text-sm text-slate-500 mt-1">
              Practice with AI-generated questions and get real feedback
            </p>
          </div>

          <div className="space-y-4">
            <GeminiKeyInput onKeySet={() => setKeyReady(true)} />

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Target Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. React Developer, Data Analyst"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Difficulty
              </label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${difficulty === d
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Number of Questions
              </label>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${questionCount === n
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startInterview}
              disabled={generating || !keyReady}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating Questions...
                </>
              ) : (
                "Start Interview 🚀"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  //  INTERVIEW SCREEN
  // ════════════════════════════════════════════
  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-3 flex items-center justify-center">
      <div className="max-w-md sm:max-w-3xl w-full bg-white rounded-3xl shadow-xl p-4 sm:p-6 space-y-4 mt-16">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={restart}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <FaArrowLeft className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-900">🎤 Mock Interview</h2>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-500">
                Question {currentIdx + 1} of {questions.length}
              </p>
              <p className="text-xs text-slate-500">
                {currentQ?.topic} • {currentQ?.difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-5 rounded-2xl"
          >
            <p className="font-medium text-slate-800 text-lg">{currentQ?.question}</p>
          </motion.div>
        </AnimatePresence>

        {/* Answer Input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border-2 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition resize-none"
          rows={5}
          placeholder="Type your answer here... Be detailed and use examples."
          disabled={!!feedback}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!feedback ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={submitAnswer}
            disabled={evaluating || !answer.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {evaluating ? (
              <>
                <FaSpinner className="animate-spin" /> AI is evaluating...
              </>
            ) : (
              "Submit Answer"
            )}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 bg-slate-50 border rounded-2xl p-5"
          >
            {/* Score */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${feedback.score >= 8
                  ? "bg-emerald-500"
                  : feedback.score >= 5
                    ? "bg-yellow-500"
                    : "bg-red-500"
                  }`}
              >
                {feedback.score}
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {feedback.score >= 8
                    ? "Excellent! 🌟"
                    : feedback.score >= 6
                      ? "Good Answer! 👍"
                      : feedback.score >= 4
                        ? "Needs Improvement 💪"
                        : "Keep Practicing 📚"}
                </p>
                <p className="text-xs text-slate-500">Score: {feedback.score}/10</p>
              </div>
            </div>

            {/* Strengths */}
            {feedback.strengths?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-emerald-700 mb-1">
                  ✅ Strengths
                </p>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-600 flex gap-2">
                      <FaCheckCircle className="mt-0.5 flex-shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {feedback.weaknesses?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">
                  ❌ Areas to Improve
                </p>
                <ul className="space-y-1">
                  {feedback.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-600 flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ideal Answer */}
            {feedback.idealAnswer && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-blue-700 mb-1">💡 Ideal Answer</p>
                <p className="text-sm text-blue-600">{feedback.idealAnswer}</p>
              </div>
            )}

            {/* Tip */}
            {feedback.tip && (
              <p className="text-sm text-purple-600 bg-purple-50 rounded-xl p-3">
                🎯 <strong>Tip:</strong> {feedback.tip}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg"
            >
              {currentIdx + 1 >= questions.length
                ? "See Final Results 🏆"
                : "Next Question →"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}