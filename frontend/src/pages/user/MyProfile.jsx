import { useSelector, useDispatch } from "react-redux";
import { useState, useRef } from "react";
import { changePassword, fetchProfile, saveProfile, uploadResumeFile } from "../../redux/user/authSlice";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEnvelope, FaPhone, FaGraduationCap,
  FaBriefcase, FaCode, FaAlignLeft, FaSave,
  FaLinkedin, FaGithub, FaGlobe, FaMapMarkerAlt,
  FaFileAlt, FaLanguage, FaMedal, FaStar,
  FaCalendarAlt, FaRupeeSign, FaChevronDown, FaChevronUp,
  FaEdit, FaEye, FaCheckCircle, FaExternalLinkAlt,
  FaUpload, FaFilePdf, FaTrash, FaRobot, FaChartBar,
  FaSearch, FaFileCode, FaBolt, FaUserTie,
  FaLock,
} from "react-icons/fa";
import { Await } from "react-router-dom";

/* ═══════════════════════════════════
   Local ATS Scoring Engine (NLP + Weighted)
   ═══════════════════════════════════ */

// Common ATS-friendly tech keywords for keyword-match scoring
const ATS_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "golang", "rust", "kotlin", "swift",
  "react", "vue", "angular", "nextjs", "nodejs", "express", "django", "flask", "spring", "fastapi",
  "mongodb", "mysql", "postgresql", "redis", "firebase", "supabase", "sqlite",
  "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "ci/cd", "devops",
  "html", "css", "tailwind", "bootstrap", "sass",
  "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy",
  "rest", "graphql", "api", "microservices", "agile", "scrum", "jira",
  "figma", "photoshop", "ui/ux", "responsive", "accessibility",
  "sql", "nosql", "data structures", "algorithms", "oop", "functional programming",
];

/**
 * computeATSScore — local NLP weighted scoring + improvement tips
 */
function computeATSScore(form) {
  const toArr = (str) => (str ? str.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : []);
  const skills = toArr(form.skills);
  const certs = toArr(form.certifications);

  const bodyText = [form.skills, form.role, form.bio, form.certifications, form.branch, form.degree].join(" ").toLowerCase();
  const matchedKW = ATS_KEYWORDS.filter((kw) => bodyText.includes(kw));
  const unmatchedKW = ATS_KEYWORDS.filter((kw) => !bodyText.includes(kw)).slice(0, 6);
  const kwScore = Math.round((Math.min(matchedKW.length, 15) / 15) * 30);
  const kwDetail = matchedKW.length > 0 ? `${matchedKW.length} keyword${matchedKW.length > 1 ? "s" : ""} detected` : "No ATS keywords found";
  const kwTips = matchedKW.length < 8
    ? [`Try adding: ${unmatchedKW.slice(0, 3).join(", ")}`, "Include your tech stack in Skills & Bio", "Mention tools/frameworks explicitly"]
    : ["Great keyword coverage!", "Keep skills updated with latest tools"];

  const formatChecks = [
    { ok: !!(form.name?.trim()), pts: 3, label: "Full name" },
    { ok: !!(form.email?.trim()), pts: 3, label: "Email address" },
    { ok: !!(form.phone?.trim()), pts: 3, label: "Phone number" },
    { ok: !!(form.location?.trim()), pts: 2, label: "Location" },
    { ok: !!(form.bio?.length > 40), pts: 4, label: "Professional summary (40+ chars)" },
    { ok: !!(form.college?.trim()), pts: 3, label: "Education/College" },
    { ok: !!(form.resumeFile || form.resumeUrl?.trim()), pts: 5, label: "Resume file or link" },
    { ok: !!(form.linkedin?.trim()), pts: 2, label: "LinkedIn profile URL" },
  ];
  const fmtScore = formatChecks.reduce((s, c) => s + (c.ok ? c.pts : 0), 0);
  const fmtMissed = formatChecks.filter((c) => !c.ok).map((c) => c.label);
  const fmtDetail = fmtMissed.length === 0 ? "All key sections complete ✓" : `Missing: ${fmtMissed.join(", ")}`;
  const fmtTips = fmtMissed.length > 0 ? fmtMissed.map((m) => `Add your ${m}`) : ["Profile format is excellent!"];

  const uniqueSkills = [...new Set(skills)];
  const hasLinks = !!(form.github?.trim() || form.portfolio?.trim());
  const basePts = uniqueSkills.length >= 10 ? 25 : uniqueSkills.length >= 6 ? 20 : uniqueSkills.length >= 3 ? 14 : uniqueSkills.length >= 1 ? 8 : 0;
  const skillBonus = Math.min(basePts + (hasLinks ? 3 : 0), 25);
  const skDetail = uniqueSkills.length > 0 ? `${uniqueSkills.length} skill${uniqueSkills.length > 1 ? "s" : ""}${hasLinks ? " + portfolio" : ""}` : "No skills listed";
  const skTips = uniqueSkills.length < 6
    ? ["List at least 6–10 technical skills", "Include both hard & soft skills", ...(hasLinks ? [] : ["Add GitHub/Portfolio link (+3 pts)"])]
    : hasLinks ? ["Excellent skill + portfolio combo!"] : ["Add GitHub/Portfolio link for +3 points", "Skills section looks solid!"];

  const expMap = { fresher: 6, "0-1": 10, "1-2": 14, "2-5": 18, "5+": 20 };
  const expScore = Math.min((expMap[form.experience] ?? 6) + (form.role?.trim() ? 2 : 0) + (certs.length > 0 ? 2 : 0) + (form.cgpa?.trim() ? 1 : 0), 20);
  const expDetail = `${form.experience === "fresher" ? "Fresher" : form.experience + " yrs"}${form.role?.trim() ? " · " + form.role : ""}${certs.length ? " · " + certs.length + " cert(s)" : ""}`;
  const expTips = [
    !form.role?.trim() && "Add your current role / job title",
    certs.length === 0 && "Add certifications (AWS, Google, etc.)",
    !form.cgpa?.trim() && "Include your CGPA or percentage",
  ].filter(Boolean);
  if (expTips.length === 0) expTips.push("Experience profile is strong ✓");

  return {
    total: kwScore + fmtScore + skillBonus + expScore,
    matched: matchedKW.slice(0, 10),
    unmatched: unmatchedKW,
    factors: [
      { name: "Keyword Match", score: kwScore, max: 30, detail: kwDetail, icon: "search", tips: kwTips },
      { name: "Resume Format", score: fmtScore, max: 25, detail: fmtDetail, icon: "format", tips: fmtTips },
      { name: "Skill Relevance", score: skillBonus, max: 25, detail: skDetail, icon: "skill", tips: skTips },
      { name: "Experience Match", score: expScore, max: 20, detail: expDetail, icon: "exp", tips: expTips },
    ],
  };
}

const atsGrade = (s) => {
  if (s >= 80) return { label: "Excellent", ring: "#10b981", bar: "from-emerald-400 to-teal-500", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (s >= 60) return { label: "Good", ring: "#f59e0b", bar: "from-yellow-400 to-orange-400", text: "text-orange-500", bg: "bg-amber-50 border-amber-200" };
  if (s >= 40) return { label: "Fair", ring: "#f97316", bar: "from-orange-400 to-red-400", text: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
  return { label: "Needs Work", ring: "#ef4444", bar: "from-red-400 to-rose-500", text: "text-red-500", bg: "bg-red-50 border-red-200" };
};

const factorIcon = (icon) => {
  switch (icon) {
    case "search": return <FaSearch />;
    case "format": return <FaFileCode />;
    case "skill": return <FaBolt />;
    case "exp": return <FaUserTie />;
    default: return <FaChartBar />;
  }
};

/* ═══════════════════════════════════
   Reusable UI helpers
   ═══════════════════════════════════ */
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <span className="text-emerald-500">{icon}</span> {title}
        </div>
        <span className="text-slate-400">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-6 pb-6 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TextInput = ({ icon, label, value, onChange, type = "text", readOnly, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder || label}
        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 text-slate-800 text-sm ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`} />
    </div>
  </div>
);

const SelectInput = ({ icon, label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
      <select value={value} onChange={onChange}
        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 text-slate-800 text-sm appearance-none">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

const TagInput = ({ icon, label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
      {label} <span className="normal-case font-normal text-slate-400">(comma separated)</span>
    </label>
    <div className="relative">
      <span className="absolute left-3 top-3.5 text-slate-400 text-sm">{icon}</span>
      <textarea rows={2} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 text-slate-800 text-sm resize-none" />
    </div>
    {value && (
      <div className="flex flex-wrap gap-1 mt-2">
        {value.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{tag}</span>
        ))}
      </div>
    )}
  </div>
);

/* ── View-mode helpers ── */
const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-emerald-500 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">{label}</p>
        <p className="text-slate-800 font-medium text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const TagBadges = ({ label, tags }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {tags.map(t => (
          <span key={t} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
};

const LinkRow = ({ icon, label, href }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-2 text-sm text-emerald-600 hover:underline no-underline font-medium">
      <span className="text-emerald-500">{icon}</span>
      {label} <FaExternalLinkAlt className="text-xs" />
    </a>
  );
};

const ViewSection = ({ title, icon, children, defaultOpen = true, accent = "emerald" }) => {
  const [open, setOpen] = useState(defaultOpen);
  const accentMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  };
  const accentCls = accentMap[accent] || accentMap.emerald;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition">
        <div className="flex items-center gap-3 font-bold text-slate-700">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${accentCls}`}>{icon}</span>
          {title}
        </div>
        <span className="text-slate-400 text-sm">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-6 pb-6 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
export default function MyProfile() {
  const { user, resumeUploading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [mode, setMode] = useState("view");
  const [saved, setSaved] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  const fileInputRef = useRef(null);
  // 🔐 Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // 🔹 Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    role: "",
    experience: "fresher",
    skills: "",
    languages: "",
    jobType: "internship",
    preferredLocation: "",
    expectedSalary: "",
    availability: "immediate",
    openToRemote: true,
    linkedin: "",
    github: "",
    portfolio: "",
    resumeUrl: "",
    certifications: "",
    achievements: "",
  });

  // 🔹 When user data loads from Redux → fill form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        college: user.college || "",
        degree: user.degree || "",
        branch: user.branch || "",
        graduationYear: user.graduationYear || "",
        cgpa: user.cgpa || "",
        role: user.role || "",
        experience: user.experience || "fresher",
        skills: (user.skills || []).join(", "),
        languages: (user.languages || []).join(", "),
        jobType: user.jobType || "internship",
        preferredLocation: user.preferredLocation || "",
        expectedSalary: user.expectedSalary || "",
        availability: user.availability || "immediate",
        openToRemote: user.openToRemote ?? true,
        linkedin: user.linkedin || "",
        github: user.github || "",
        portfolio: user.portfolio || "",
        resumeUrl: user.resumeUrl || "",
        certifications: (user.certifications || []).join(", "),
        achievements: (user.achievements || []).join(", "),
      });
    }
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (key) => () => setForm((f) => ({ ...f, [key]: !f[key] }));

  /* ── Resume upload handler (Cloudinary) ── */
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5 MB."); return; }
    setResumeSuccess(false);
    const res = await dispatch(uploadResumeFile(file));
    if (!res.error) {
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Save ── */
  const handleSave = async () => {
    const toArr = (str) => str.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      ...form,
      skills: toArr(form.skills),
      languages: toArr(form.languages),
      certifications: toArr(form.certifications),
      achievements: toArr(form.achievements),
    };
    await dispatch(saveProfile(payload));
    setSaved(true);

    setTimeout(() => { setSaved(false); setMode("view"); }, 1200);
  };
  /* ── Change Password ── */
  const handleChangePassword = async () => {
    setPwError("");
    setPwMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPwError("All fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }

    const res = await dispatch(
      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
    );

    if (res.error) {
      setPwError(res.payload || "Failed to change password");
    } else {
      setPwMessage("✅ Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  /* ── Completion bar ── */
  const completedFields = Object.values(form).filter(
    (v) => v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
  ).length;
  const completion = Math.round((completedFields / Object.keys(form).length) * 100);

  const toArr = (str) => (str ? str.split(",").map((s) => s.trim()).filter(Boolean) : []);
  const expLabels = { fresher: "Fresher", "0-1": "0–1 Year", "1-2": "1–2 Years", "2-5": "2–5 Years", "5+": "5+ Years" };
  const jobTypeLabels = { internship: "Internship", "full-time": "Full Time", "part-time": "Part Time", contract: "Contract", freelance: "Freelance" };
  const availabilityLabels = { immediate: "Immediate", "15days": "Within 15 Days", "1month": "Within 1 Month", "2months": "Within 2 Months" };

  /* ── ATS Score state ── */
  const [atsResult, setAtsResult] = useState(null);
  const [showATS, setShowATS] = useState(false);

  const handleComputeATS = () => {
    const result = computeATSScore(form);
    setAtsResult(result);
    setShowATS(true);
  };

  const atsMeta = atsResult ? atsGrade(atsResult.total) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 p-4 pt-24 pb-28">
      <div className="max-w-2xl mx-auto mt-24 mb-10">

        {/* ── Hero Banner ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl shadow-xl p-6 mb-5 text-white">
          {/* background decoration */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            {/* Avatar ring */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full bg-white/20 p-0.5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-2xl font-extrabold border-2 border-white/40">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              {completion >= 80 && (
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">⭐</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold truncate">{user?.name || "Your Name"}</h2>
              <p className="text-emerald-100 text-sm capitalize">{form.role || user?.role || "Student"} · {user?.email}</p>
              {form.location && <p className="text-emerald-200 text-xs mt-0.5">📍 {form.location}</p>}
            </div>
          </div>
          {/* Completion bar */}
          <div className="relative mt-4">
            <div className="flex justify-between text-xs text-emerald-100 mb-1">
              <span>Profile Strength</span>
              <span className="font-bold">{completion}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }}
                transition={{ duration: 0.9 }}
                className={`h-2 rounded-full ${completion >= 80 ? "bg-yellow-400" : completion >= 50 ? "bg-white" : "bg-emerald-200"}`} />
            </div>
            <p className="text-emerald-200 text-xs mt-1">
              {completion >= 80 ? "🎉 Strong profile! Ready for recruiters." : completion >= 50 ? "Keep filling in details to boost your ATS score." : "Complete your profile to maximize visibility."}
            </p>
          </div>
          {/* Quick stats */}
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Skills", value: toArr(form.skills).length || 0 },
              { label: "Certs", value: toArr(form.certifications).length || 0 },
              { label: "Links", value: [form.linkedin, form.github, form.portfolio].filter(Boolean).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-emerald-100 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── View / Edit Toggle ── */}
        <div className="flex rounded-2xl overflow-hidden shadow mb-5 bg-white border border-slate-200">
          {[["view", <FaEye />, "View Profile"], ["edit", <FaEdit />, "Edit Profile"]].map(([val, icon, label]) => (
            <button key={val} onClick={() => setMode(val)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition ${mode === val
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                : "text-slate-500 hover:bg-slate-50"}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ════════ VIEW MODE ════════ */}
        <AnimatePresence mode="wait">
          {mode === "view" && (
            <motion.div key="view"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}>

              {/* ── ATS Score Card ── */}
              <ViewSection title="ATS Compatibility Score" icon={<FaRobot />} accent="emerald" defaultOpen>
                {/* Resume row */}
                {(user?.resumeUrl || form.resumeUrl) ? (
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0"><FaFilePdf /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate">Resume Uploaded</p>
                      <p className="text-slate-400 text-xs">Stored securely on Cloudinary</p>
                    </div>
                    <a href={user?.resumeUrl || form.resumeUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-emerald-600 font-semibold border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 no-underline shrink-0">View Resume</a>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">No resume attached. Upload one in Edit Profile for a better score.</p>
                )}

                {/* ATS note */}
                <p className="text-xs text-slate-500 italic border-l-4 border-emerald-300 pl-3 py-1 bg-emerald-50 rounded-r-lg">
                  "ATS score indicates how compatible a resume is with automated recruitment systems."
                </p>

                {/* Compute button */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleComputeATS}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow hover:shadow-lg transition text-sm">
                  <FaChartBar /> Generate ATS Compatibility Score
                </motion.button>

                {/* Result */}
                <AnimatePresence>
                  {showATS && atsResult && atsMeta && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.35 }}
                      className="space-y-4">

                      {/* Score ring + grade */}
                      <div className={`rounded-2xl border p-5 ${atsMeta.bg} flex flex-col sm:flex-row items-center gap-5`}>
                        {/* SVG ring */}
                        <div className="relative shrink-0">
                          <svg width="110" height="110" viewBox="0 0 110 110">
                            <circle cx="55" cy="55" r="46" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                            <motion.circle
                              cx="55" cy="55" r="46"
                              fill="none"
                              stroke={atsMeta.ring}
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 46}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - atsResult.total / 100) }}
                              transition={{ duration: 1.4, ease: "easeOut" }}
                              style={{ transformOrigin: "55px 55px", transform: "rotate(-90deg)" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-extrabold ${atsMeta.text}`}>{atsResult.total}</span>
                            <span className="text-xs text-slate-400 font-semibold">/100</span>
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <p className={`text-xl font-extrabold ${atsMeta.text}`}>{atsMeta.label}</p>
                          <p className="text-slate-600 text-sm mt-1">Your profile scored <strong>{atsResult.total}%</strong> on ATS compatibility based on NLP keyword analysis, resume format, skill relevance, and experience depth.</p>
                          {atsResult.matched.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {atsResult.matched.map((kw) => (
                                <span key={kw} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-xs rounded-full font-medium capitalize">{kw}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Factor breakdown */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Score Breakdown</p>
                        {atsResult.factors.map((f, i) => {
                          const pct = Math.round((f.score / f.max) * 100);
                          const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 45 ? "bg-amber-400" : "bg-red-400";
                          const borderColor = pct >= 70 ? "border-emerald-100" : pct >= 45 ? "border-amber-100" : "border-red-100";
                          return (
                            <div key={i} className={`bg-white rounded-xl border ${borderColor} p-4 shadow-sm`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                  <span className="text-emerald-500">{factorIcon(f.icon)}</span> {f.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 70 ? "bg-emerald-100 text-emerald-700" : pct >= 45 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                                    }`}>{pct}%</span>
                                  <span className="text-sm font-extrabold text-slate-800">{f.score}<span className="text-xs text-slate-400 font-normal">/{f.max}</span></span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.9, delay: i * 0.15, ease: "easeOut" }}
                                  className={`h-2.5 rounded-full ${barColor}`}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mb-2">{f.detail}</p>
                              {f.tips && f.tips.length > 0 && (
                                <div className="space-y-1">
                                  {f.tips.map((tip, ti) => (
                                    <div key={ti} className={`flex items-start gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${tip.includes("✓") || tip.includes("!") ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
                                      }`}>
                                      <span className="mt-0.5 shrink-0">{tip.includes("✓") || tip.includes("!") ? "✅" : "💡"}</span>
                                      {tip}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Keyword suggestions */}
                      {atsResult.unmatched && atsResult.unmatched.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">💬 Suggested Keywords to Add</p>
                          <p className="text-xs text-blue-600 mb-2">These ATS keywords are missing from your profile. Adding them could boost your score:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.unmatched.map((kw) => (
                              <span key={kw} className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 text-xs rounded-full font-medium capitalize">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer note */}
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <FaRobot className="text-emerald-400" />
                        <span>NLP text-matching · weighted scoring · no data leaves your device</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ViewSection>

              {/* Basic Info */}
              <ViewSection title="Basic Information" icon={<FaUser />} accent="blue" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<FaUser />} label="Full Name" value={form.name} />
                  <InfoRow icon={<FaEnvelope />} label="Email" value={form.email} />
                  <InfoRow icon={<FaPhone />} label="Phone" value={form.phone} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={form.location} />
                </div>
                {form.bio && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Bio</p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">{form.bio}</p>
                  </div>
                )}
              </ViewSection>

              {/* Education */}
              <ViewSection title="Education" icon={<FaGraduationCap />} accent="violet" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<FaGraduationCap />} label="College" value={form.college} />
                  <InfoRow icon={<FaGraduationCap />} label="Degree" value={form.degree} />
                  <InfoRow icon={<FaCode />} label="Branch" value={form.branch} />
                  <InfoRow icon={<FaCalendarAlt />} label="Graduation Year" value={form.graduationYear} />
                  <InfoRow icon={<FaStar />} label="CGPA / %" value={form.cgpa} />
                  <InfoRow icon={<FaLanguage />} label="Languages Known" value={form.languages} />
                </div>
              </ViewSection>

              {/* Skills */}
              <ViewSection title="Skills & Experience" icon={<FaCode />} accent="amber" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <InfoRow icon={<FaBriefcase />} label="Role / Title" value={form.role} />
                  <InfoRow icon={<FaBriefcase />} label="Experience Level" value={expLabels[form.experience] || form.experience} />
                </div>
                <TagBadges label="Technical Skills" tags={toArr(form.skills)} />
              </ViewSection>

              {/* Preferences */}
              <ViewSection title="Job Preferences" icon={<FaBriefcase />} accent="rose" defaultOpen={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<FaBriefcase />} label="Job Type" value={jobTypeLabels[form.jobType] || form.jobType} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Preferred Location" value={form.preferredLocation} />
                  <InfoRow icon={<FaRupeeSign />} label="Expected Salary" value={form.expectedSalary ? `₹${Number(form.expectedSalary).toLocaleString("en-IN")} / month` : ""} />
                  <InfoRow icon={<FaCalendarAlt />} label="Availability" value={availabilityLabels[form.availability] || form.availability} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <FaCheckCircle className={form.openToRemote ? "text-emerald-500" : "text-slate-300"} />
                  <span className="text-sm text-slate-700 font-medium">
                    {form.openToRemote ? "Open to Remote Work" : "Not open to Remote Work"}
                  </span>
                </div>
              </ViewSection>

              {/* Links */}
              <ViewSection title="Links & Portfolio" icon={<FaGlobe />} accent="blue" defaultOpen={false}>
                <div className="space-y-3">
                  <LinkRow icon={<FaLinkedin />} label="LinkedIn" href={form.linkedin} />
                  <LinkRow icon={<FaGithub />} label="GitHub" href={form.github} />
                  <LinkRow icon={<FaGlobe />} label="Portfolio" href={form.portfolio} />
                  <LinkRow icon={<FaFileAlt />} label="Resume (Drive/URL)" href={form.resumeUrl} />
                </div>
                {!form.linkedin && !form.github && !form.portfolio && !form.resumeUrl && (
                  <p className="text-slate-400 text-sm italic">No links added yet.</p>
                )}
              </ViewSection>

              {/* Certs */}
              <ViewSection title="Certifications & Achievements" icon={<FaMedal />} accent="amber" defaultOpen={false}>
                <TagBadges label="Certifications" tags={toArr(form.certifications)} />
                <TagBadges label="Achievements & Awards" tags={toArr(form.achievements)} />
                {!form.certifications && !form.achievements && (
                  <p className="text-slate-400 text-sm italic">Nothing added yet.</p>
                )}
              </ViewSection>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setMode("edit")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition text-base">
                <FaEdit /> Edit Profile
              </motion.button>
            </motion.div>
          )}

          {/* ════════ EDIT MODE ════════ */}
          {mode === "edit" && (
            <motion.div key="edit"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>

              {/* ── Resume Upload Section ── */}
              <Section title="Resume Upload" icon={<FaFilePdf />} defaultOpen>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />

                {/* Currently uploaded resume link */}
                {user?.resumeUrl && (
                  <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                      <FaFilePdf />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate">Resume Uploaded ✓</p>
                      <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-emerald-600 text-xs hover:underline truncate block">{user.resumeUrl}</a>
                    </div>
                    <a href={user.resumeUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-emerald-600 font-semibold border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 no-underline shrink-0">View</a>
                  </div>
                )}

                {/* Upload button with loading spinner */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={resumeUploading}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition group bg-emerald-50/50 ${resumeUploading ? "border-slate-300 opacity-70 cursor-wait" : "border-emerald-300 hover:border-emerald-500"
                    }`}>
                  {resumeUploading ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <p className="font-bold text-slate-500 text-sm">Uploading to Cloudinary...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-500 transition">
                        <FaUpload className="text-xl" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700 text-sm">{user?.resumeUrl ? "Upload a new Resume" : "Click to upload your Resume"}</p>
                        <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX · Max 5 MB</p>
                      </div>
                    </>
                  )}
                </button>

                {/* Success message */}
                {resumeSuccess && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold">
                    <FaCheckCircle /> Resume uploaded successfully!
                  </motion.div>
                )}

                {/* OR paste a URL */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">OR paste link</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <TextInput icon={<FaFileAlt />} label="Resume Drive / URL" value={form.resumeUrl} onChange={set("resumeUrl")} placeholder="https://drive.google.com/..." type="url" />
              </Section>

              {/* Basic Info */}
              <Section title="Basic Information" icon={<FaUser />} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput icon={<FaUser />} label="Full Name" value={form.name} onChange={set("name")} />
                  <TextInput icon={<FaEnvelope />} label="Email" value={form.email} readOnly type="email" />
                  <TextInput icon={<FaPhone />} label="Phone" value={form.phone} onChange={set("phone")} type="tel" placeholder="+91 98765 43210" />
                  <TextInput icon={<FaMapMarkerAlt />} label="Current Location" value={form.location} onChange={set("location")} placeholder="City, State" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Bio / Summary</label>
                  <div className="relative">
                    <FaAlignLeft className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                    <textarea rows={3} value={form.bio} onChange={set("bio")} placeholder="Write a short professional summary..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 text-slate-800 text-sm resize-none" />
                  </div>
                </div>
              </Section>

              {/* Education */}
              <Section title="Education" icon={<FaGraduationCap />} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput icon={<FaGraduationCap />} label="College / University" value={form.college} onChange={set("college")} placeholder="e.g. Anna University" />
                  <TextInput icon={<FaGraduationCap />} label="Degree" value={form.degree} onChange={set("degree")} placeholder="e.g. B.Tech" />
                  <TextInput icon={<FaCode />} label="Branch" value={form.branch} onChange={set("branch")} placeholder="e.g. Computer Science" />
                  <TextInput icon={<FaCalendarAlt />} label="Graduation Year" value={form.graduationYear} onChange={set("graduationYear")} placeholder="e.g. 2025" type="number" />
                  <TextInput icon={<FaStar />} label="CGPA / Percentage" value={form.cgpa} onChange={set("cgpa")} placeholder="e.g. 8.5" />
                  <TextInput icon={<FaLanguage />} label="Languages Known" value={form.languages} onChange={set("languages")} placeholder="Tamil, English, Hindi" />
                </div>
              </Section>

              {/* Skills */}
              <Section title="Skills & Experience" icon={<FaCode />} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput icon={<FaBriefcase />} label="Current Role / Title" value={form.role} onChange={set("role")} placeholder="e.g. Frontend Developer" />
                  <SelectInput icon={<FaBriefcase />} label="Experience Level" value={form.experience} onChange={set("experience")}
                    options={[{ value: "fresher", label: "Fresher" }, { value: "0-1", label: "0–1 Year" }, { value: "1-2", label: "1–2 Years" }, { value: "2-5", label: "2–5 Years" }, { value: "5+", label: "5+ Years" }]} />
                </div>
                <TagInput icon={<FaCode />} label="Technical Skills" value={form.skills} onChange={set("skills")} placeholder="React, Node.js, Python, MongoDB..." />
              </Section>

              {/* Preferences */}
              <Section title="Job Preferences" icon={<FaBriefcase />} defaultOpen={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectInput icon={<FaBriefcase />} label="Job Type" value={form.jobType} onChange={set("jobType")}
                    options={[{ value: "internship", label: "Internship" }, { value: "full-time", label: "Full Time" }, { value: "part-time", label: "Part Time" }, { value: "contract", label: "Contract" }, { value: "freelance", label: "Freelance" }]} />
                  <TextInput icon={<FaMapMarkerAlt />} label="Preferred Location" value={form.preferredLocation} onChange={set("preferredLocation")} placeholder="e.g. Bangalore, Remote" />
                  <TextInput icon={<FaRupeeSign />} label="Expected Salary (₹/month)" value={form.expectedSalary} onChange={set("expectedSalary")} type="number" placeholder="e.g. 25000" />
                  <SelectInput icon={<FaCalendarAlt />} label="Availability" value={form.availability} onChange={set("availability")}
                    options={[{ value: "immediate", label: "Immediate" }, { value: "15days", label: "Within 15 Days" }, { value: "1month", label: "Within 1 Month" }, { value: "2months", label: "Within 2 Months" }]} />
                </div>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">Open to Remote Work</span>
                  <button onClick={toggle("openToRemote")}
                    className={`w-12 h-6 rounded-full transition-colors ${form.openToRemote ? "bg-emerald-500" : "bg-slate-300"}`}>
                    <motion.div animate={{ x: form.openToRemote ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              </Section>

              {/* Links */}
              <Section title="Links & Portfolio" icon={<FaGlobe />} defaultOpen={false}>
                <TextInput icon={<FaLinkedin />} label="LinkedIn URL" value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/username" type="url" />
                <TextInput icon={<FaGithub />} label="GitHub URL" value={form.github} onChange={set("github")} placeholder="https://github.com/username" type="url" />
                <TextInput icon={<FaGlobe />} label="Portfolio / Website" value={form.portfolio} onChange={set("portfolio")} placeholder="https://yourname.dev" type="url" />
              </Section>

              {/* Certs */}
              <Section title="Certifications & Achievements" icon={<FaMedal />} defaultOpen={false}>
                <TagInput icon={<FaMedal />} label="Certifications" value={form.certifications} onChange={set("certifications")}
                  placeholder="AWS Cloud Practitioner, Google UX Design..." />
                <TagInput icon={<FaStar />} label="Achievements & Awards" value={form.achievements} onChange={set("achievements")}
                  placeholder="Hackathon Winner, Smart India Finalist..." />
              </Section>
              {/* 🔐 Change Password */}
              <div className="bg-white rounded-2xl shadow overflow-hidden mb-4 p-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                  <FaLock className="text-emerald-500" /> Change Password
                </h3>

                {pwError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-3">
                    {pwError}
                  </div>
                )}
                {pwMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm mb-3">
                    {pwMessage}
                  </div>
                )}

                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full mb-3 px-4 py-3 border rounded-xl"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full mb-3 px-4 py-3 border rounded-xl"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full mb-3 px-4 py-3 border rounded-xl"
                />

                <button
                  onClick={handleChangePassword}
                  className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold rounded-xl"
                >
                  Change Password
                </button>
              </div>

              {/* Save */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition text-base">
                <FaSave />
                {saved ? "✓ Saved! Switching to View..." : "Save Profile"}
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}