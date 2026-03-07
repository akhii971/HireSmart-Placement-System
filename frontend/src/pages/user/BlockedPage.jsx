import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBan, FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function BlockedPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #fafafa 100%)",
                fontFamily: "'Inter', system-ui, sans-serif",
                padding: "24px",
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    maxWidth: "480px",
                    width: "100%",
                    background: "#ffffff",
                    borderRadius: "28px",
                    padding: "48px 36px",
                    textAlign: "center",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                    border: "1px solid #fee2e2",
                }}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    style={{
                        width: "88px",
                        height: "88px",
                        borderRadius: "24px",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 28px",
                        boxShadow: "0 8px 32px rgba(239, 68, 68, 0.25)",
                    }}
                >
                    <FaBan size={38} color="#fff" />
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        color: "#1e293b",
                        marginBottom: "12px",
                    }}
                >
                    Account Blocked
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        fontSize: "15px",
                        color: "#64748b",
                        lineHeight: 1.7,
                        marginBottom: "28px",
                    }}
                >
                    Your account has been <strong style={{ color: "#ef4444" }}>blocked</strong> by the administrator.
                    You are currently unable to access the platform. If you believe this is a mistake, please
                    contact our support team.
                </motion.p>

                {/* Contact support */}
                <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    href="mailto:support@hiresmart.com"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 28px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "14px",
                        textDecoration: "none",
                        boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        marginBottom: "20px",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 24px rgba(239,68,68,0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.3)";
                    }}
                >
                    <FaEnvelope /> Contact Support
                </motion.a>

                {/* Back to home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link
                        to="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#94a3b8",
                            textDecoration: "none",
                            fontWeight: 500,
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    >
                        <FaArrowLeft size={12} /> Back to Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
