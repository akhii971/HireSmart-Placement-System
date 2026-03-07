import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    FaUser,
    FaUserShield,
    FaBriefcase,
    FaArrowRight,
    FaRocket,
    FaChartLine,
    FaBrain,
} from "react-icons/fa";
import "./LandingPage.css";

/* ─── floating‑particle data ─── */
const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
}));

/* ─── role card data ─── */
const roles = [
    {
        key: "user",
        label: "Student / User",
        desc: "Find internships, track applications, get AI-powered career guidance, and build your future.",
        icon: FaUser,
        gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        glow: "rgba(99, 102, 241, .18)",
        path: "/user/signin",
    },
    {
        key: "admin",
        label: "Administrator",
        desc: "Manage users, recruiters, job posts, feedback, and oversee the entire platform effortlessly.",
        icon: FaUserShield,
        gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
        glow: "rgba(236, 72, 153, .18)",
        path: "/admin/signin",
    },
    {
        key: "recruiter",
        label: "Recruiter",
        desc: "Post jobs, shortlist candidates, schedule interviews, and leverage AI-powered rankings.",
        icon: FaBriefcase,
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
        glow: "rgba(14, 165, 233, .18)",
        path: "/recruiter/signin",
    },
];

/* ─── feature pills ─── */
const features = [
    { icon: FaRocket, text: "AI-Powered Matching" },
    { icon: FaChartLine, text: "Real-time Analytics" },
    { icon: FaBrain, text: "Smart ATS Scoring" },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouse = (e) =>
            setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouse);
        return () => window.removeEventListener("mousemove", handleMouse);
    }, []);

    return (
        <div className="landing-root">
            {/* ── Animated background ── */}
            <div className="landing-bg" />
            <div
                className="landing-spotlight"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 60%)`,
                }}
            />

            {/* Floating particles */}
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="landing-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}

            {/* ── Content ── */}
            <div className="landing-content">
                {/* Hero */}
                <motion.div
                    className="landing-hero"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="landing-badge">✨ Next-Gen Placement Platform</span>
                    <h1 className="landing-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <img src="/logo.png" alt="HireSmart Logo" style={{ height: '1.2em', width: 'auto' }} />
                        <span className="landing-title-gradient m-0">HireSmart</span>
                    </h1>
                    <p className="landing-subtitle">
                        Smart Internship &amp; Placement Management System
                    </p>
                    <p className="landing-desc">
                        Connecting students, recruiters, and administrators on a single
                        intelligent platform powered by AI.
                    </p>

                    {/* Feature pills */}
                    <motion.div
                        className="landing-features"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        {features.map((f, i) => (
                            <span key={i} className="landing-feature-pill">
                                <f.icon />
                                {f.text}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Role selector heading */}
                <motion.p
                    className="landing-choose"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Select your role to continue
                </motion.p>

                {/* ── Role cards ── */}
                <div className="landing-cards">
                    {roles.map((role, idx) => {
                        const Icon = role.icon;
                        return (
                            <motion.div
                                key={role.key}
                                className={`landing-card ${hovered === role.key ? "active" : ""}`}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.15, type: "spring", stiffness: 120 }}
                                whileHover={{ y: -12, scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onMouseEnter={() => setHovered(role.key)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => navigate(role.path)}
                                style={{
                                    "--card-glow": role.glow,
                                    "--card-gradient": role.gradient,
                                }}
                            >
                                {/* Glow ring behind the icon */}
                                <div className="card-icon-wrap" style={{ background: role.gradient }}>
                                    <Icon size={28} color="#fff" />
                                </div>

                                <h3 className="card-label">{role.label}</h3>
                                <p className="card-desc">{role.desc}</p>

                                <span className="card-cta">
                                    Get Started <FaArrowRight className="card-arrow" />
                                </span>

                                {/* Animated border glow */}
                                <div className="card-border-glow" />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer */}
                <motion.p
                    className="landing-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    © 2026 HireSmart — Built with ❤️ for smart placements
                </motion.p>
            </div>
        </div>
    );
}
