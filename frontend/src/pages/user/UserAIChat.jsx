import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GeminiKeyInput from "../../components/common/GeminiKeyInput";
import { hasApiKey, createChat, sendChatMessage } from "../../services/aiService";
import ReactMarkdown from "react-markdown";

const quickPrompts = [
  "Review my resume",
  "Common interview questions",
  "Improve my LinkedIn profile",
  "Write a cover letter",
  "Skills to learn in 2025",
  "Project ideas for MERN",
];

export default function UserAIChat() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm **HireSmart AI**, your personal career assistant. 🚀\n\nI can help you with:\n- 📝 Resume reviews & improvements\n- 🎤 Interview preparation\n- 💼 Career guidance\n- 🧠 Technical explanations\n- ✉️ Cover letter writing\n\nWhat would you like help with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState(null);
  const [keyReady, setKeyReady] = useState(hasApiKey());
  const bottomRef = useRef(null);

  // Initialize chat when key is ready
  useEffect(() => {
    if (keyReady && !chatInstance) {
      try {
        const systemPrompt = `You are HireSmart AI, a friendly and expert career assistant for students and freshers in India.
You help with: resume reviews, interview prep, career guidance, technical explanations, cover letter writing, project suggestions, and job search strategies.

${user ? `The user's profile:
- Name: ${user.name || "N/A"}
- Skills: ${user.skills?.join(", ") || "Not specified"}
- Experience: ${user.experience || "Fresher"}
- Education: ${user.college || "N/A"}, ${user.degree || "N/A"} in ${user.branch || "N/A"}
- Looking for: ${user.jobType || "Any"} roles
- Location preference: ${user.preferredLocation || "Any"}` : "The user hasn't provided their profile yet."}

Rules:
- Be concise and actionable
- Use bullet points and markdown formatting
- Be encouraging but honest
- Give specific, practical advice
- If asked about something non-career related, gently redirect
- Use emojis sparingly for emphasis`;

        const chat = createChat(systemPrompt);
        setChatInstance(chat);
      } catch (err) {
        console.error("Failed to init chat:", err);
      }
    }
  }, [keyReady]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !chatInstance) return;

    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const reply = await sendChatMessage(chatInstance, userMsg);
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ Sorry, I encountered an error: ${err.message}\n\nPlease try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 mt-10">
      <div className="w-full max-w-md sm:max-w-4xl h-[90vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden mt-16">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <button
            onClick={() => navigate("/user/ai")}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <FaArrowLeft />
          </button>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
            <FaRobot />
          </div>
          <div className="flex-1">
            <p className="font-semibold">HireSmart AI</p>
            <p className="text-xs opacity-80">
              {loading ? "Typing..." : "Powered by Gemini AI"}
            </p>
          </div>
          <GeminiKeyInput onKeySet={() => setKeyReady(true)} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 flex gap-2 overflow-x-auto border-b bg-slate-50">
          {quickPrompts.map((p) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={p}
              onClick={() => setInput(p)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white border text-slate-700 text-xs sm:text-sm hover:bg-indigo-50 hover:border-indigo-300 transition"
            >
              {p}
            </motion.button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.sender === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
                    : "bg-white text-slate-800 border rounded-bl-sm"
                    }`}
                >
                  {m.sender === "ai" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-headings:my-2">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t flex gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={keyReady ? "Ask anything about your career..." : "Please add your Gemini API key first"}
            disabled={!keyReady}
            className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={loading || !keyReady || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition text-white px-5 py-2 rounded-full text-sm font-medium shadow disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
