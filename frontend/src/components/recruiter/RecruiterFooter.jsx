import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from "react-icons/fa";

export default function RecruiterFooter() {
  const year = new Date().getFullYear();

  const links = [
    { name: "Dashboard", path: "/recruiter/dashboard" },
    { name: "My Jobs", path: "/recruiter/jobs" },
    { name: "Applications", path: "/recruiter/applications" },
    { name: "Messages", path: "/recruiter/messages" },
    { name: "Profile", path: "/recruiter/profile" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mt-20 backdrop-blur-xl bg-white/60 border-t border-white/30 shadow-2xl shadow-emerald-500/10"
    >
      {/* Glow background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* BRAND */}
        <div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="HireSmart Logo" className="h-8 w-auto" />
            <h2 className="text-2xl font-extrabold tracking-wide m-0">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Hire
              </span>
              <span className="text-slate-900 ml-1">Smart</span>
            </h2>
          </motion.div>
          <p className="text-sm text-slate-600 mt-2 max-w-sm">
            Smart recruitment platform to manage jobs, candidates, interviews
            and AI ranking — all in one place.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <p className=" font-semibold text-slate-800 mb-3">Quick Links</p>
          <div className=" nounderline flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.name}
                to={l.path}
                className="text-slate-600 hover:text-emerald-600 transition no-underline"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        {/* SOCIAL + INFO */}
        <div className="flex flex-col md:items-end gap-4">
          <p className="font-semibold text-slate-800">Connect with us</p>

          <div className="flex gap-4">
            {[
              { icon: <FaGithub />, href: "#" },
              { icon: <FaLinkedin />, href: "#" },
              { icon: <FaTwitter />, href: "#" },
            ].map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-700 hover:text-emerald-600 transition"
              >
                {s.icon}
              </motion.a>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            © {year} HireSmart. All rights reserved.
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/40 py-4 text-center text-sm text-slate-600">
        Built with  by Akhinesh
      </div>
    </motion.footer>
  );
}
