import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatModal({ application, onClose, onSend, onSeen }) {
  const [text, setText] = useState("");
  const [recruiterTyping, setRecruiterTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [application.messages, recruiterTyping]);

  // Mark recruiter messages as seen when opened
  useEffect(() => {
    onSeen(application.id);
  }, [application.id, onSeen]);

  const simulateRecruiterReply = () => {
    setRecruiterTyping(true);

    setTimeout(() => {
      setRecruiterTyping(false);
      onSend(application.id, {
        from: "recruiter",
        text: "Thanks for your message! Our team will review your profile.",
      });
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(application.id, {
      from: "user",
      text,
    });

    setText("");
    simulateRecruiterReply();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <p className="font-semibold">{application.jobTitle}</p>
            <p className="text-xs text-slate-500">{application.company}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 text-lg">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50">
          {application.messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                m.from === "user"
                  ? "ml-auto bg-emerald-500 text-white"
                  : "bg-white text-slate-800 border"
              }`}
            >
              <p>{m.text}</p>
              <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-70">
                <span>{m.time}</span>
                {m.from === "user" && (
                  <span>{m.seen ? "✓✓" : "✓"}</span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {recruiterTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border rounded-xl px-3 py-2 text-sm w-fit"
              >
                Recruiter is typing<span className="animate-pulse">...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
