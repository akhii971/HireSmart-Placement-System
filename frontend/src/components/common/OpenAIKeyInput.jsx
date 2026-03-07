import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaKey, FaCheckCircle, FaTrash, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { hasApiKey, setApiKey, removeApiKey, getApiKey } from "../../services/aiService";

export default function OpenAIKeyInput({ onKeySet }) {
    const [key, setKey] = useState("");
    const [saved, setSaved] = useState(hasApiKey());
    const [showModal, setShowModal] = useState(!hasApiKey());
    const [error, setError] = useState("");

    const handleSave = () => {
        const trimmed = key.trim();
        if (!trimmed || trimmed.length < 20) {
            setError("Please enter a valid OpenAI API key");
            return;
        }
        setApiKey(trimmed);
        setSaved(true);
        setShowModal(false);
        setError("");
        onKeySet?.();
    };

    const handleRemove = () => {
        removeApiKey();
        setSaved(false);
        setKey("");
        setShowModal(true);
    };

    // If key is already saved, show small badge
    if (saved && !showModal) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-semibold">
                <FaCheckCircle />
                <span>OpenAI API Key Connected</span>
                <button
                    onClick={handleRemove}
                    className="ml-2 text-red-500 hover:text-red-700 transition"
                    title="Remove API Key"
                >
                    <FaTrash className="text-xs" />
                </button>
            </div>
        );
    }

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
                    >
                        {/* Close button — only if key exists */}
                        {hasApiKey() && (
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSaved(true);
                                }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                            >
                                <FaTimes />
                            </button>
                        )}

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg">
                                <FaKey />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Connect OpenAI
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Enter your OpenAI API key to unlock AI-powered features
                            </p>
                        </div>

                        {/* Key Input */}
                        <div className="space-y-3">
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => {
                                    setKey(e.target.value);
                                    setError("");
                                }}
                                placeholder="Paste your OpenAI API key (sk-...)..."
                                className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
                            />

                            {error && (
                                <p className="text-red-500 text-xs font-semibold">{error}</p>
                            )}

                            <button
                                onClick={handleSave}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition"
                            >
                                Connect & Enable AI ✨
                            </button>
                        </div>

                        {/* Help */}
                        <div className="mt-5 bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-slate-800">
                                How to get an API key:
                            </p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>
                                    Go to{" "}
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
                                    >
                                        OpenAI Platform <FaExternalLinkAlt className="text-[8px]" />
                                    </a>
                                </li>
                                <li>Sign in with your OpenAI account</li>
                                <li>Click "Create new secret key"</li>
                                <li>Copy and paste the key above</li>
                            </ol>
                            <p className="text-slate-400">
                                🔒 Your key is stored only in your browser and never sent to our
                                servers.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
