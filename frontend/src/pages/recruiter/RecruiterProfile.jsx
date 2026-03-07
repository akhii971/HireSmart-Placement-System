import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { recruiterUpdateProfile, recruiterLogout } from "../../redux/recruiter/recruiterAuthSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser, FaEnvelope, FaPhone, FaBuilding, FaGlobe,
    FaMapMarkerAlt, FaAlignLeft, FaSave, FaEdit, FaEye,
    FaChevronDown, FaChevronUp, FaLinkedin, FaSignOutAlt,
    FaIndustry, FaUsers, FaCheckCircle, FaHourglassHalf,
    FaTimesCircle,
} from "react-icons/fa";

/* ── Mini helpers ── */
const Field = ({ icon, label, value, onChange, type = "text", readOnly, placeholder, rows }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
            {rows ? (
                <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder || label}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-800 text-sm resize-none" />
            ) : (
                <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder || label}
                    className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-800 text-sm ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`} />
            )}
        </div>
    </div>
);

const Card = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 font-bold text-slate-700">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">{icon}</span>
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

const statusConfig = {
    Approved: { label: "Approved", icon: <FaCheckCircle />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    Pending: { label: "Pending Approval", icon: <FaHourglassHalf />, cls: "bg-amber-100 text-amber-700 border-amber-200" },
    Rejected: { label: "Rejected", icon: <FaTimesCircle />, cls: "bg-red-100 text-red-700 border-red-200" },
    Blocked: { label: "Blocked", icon: <FaTimesCircle />, cls: "bg-red-100 text-red-700 border-red-200" },
};

const COMPANY_SIZES = ["1-10", "11-50", "50-200", "201-500", "500-1000", "1000+"];
const INDUSTRIES = ["IT Services", "Product / SaaS", "E-Commerce", "FinTech", "EdTech", "HealthTech", "Manufacturing", "Consulting", "BFSI", "Other"];

export default function RecruiterProfile() {
    const { recruiter } = useSelector((s) => s.recruiterAuth);
    const dispatch = useDispatch();
    const [mode, setMode] = useState("view");
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        name: recruiter?.name || "",
        email: recruiter?.email || "",
        phone: recruiter?.phone || "",
        company: recruiter?.company || "",
        companySize: recruiter?.companySize || "",
        industry: recruiter?.industry || "",
        location: recruiter?.location || "",
        website: recruiter?.website || "",
        linkedin: recruiter?.linkedin || "",
        description: recruiter?.description || "",
    });

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSave = () => {
        dispatch(recruiterUpdateProfile(form));
        setSaved(true);
        setTimeout(() => { setSaved(false); setMode("view"); }, 1200);
    };

    const status = recruiter?.status || "Pending";
    const sc = statusConfig[status] || statusConfig.Pending;

    const InfoRow = ({ icon, label, value }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5 shrink-0">{icon}</span>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">{label}</p>
                    <p className="text-slate-800 font-medium text-sm mt-0.5">{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 pt-24 pb-28">
            <div className="max-w-2xl mx-auto">

                {/* Hero Banner */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-2xl shadow-xl p-6 mb-5 text-white">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-extrabold shrink-0">
                            {recruiter?.name?.[0]?.toUpperCase() || "R"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-extrabold truncate">{recruiter?.name || "Recruiter"}</h2>
                            <p className="text-blue-100 text-sm">{recruiter?.company || "Company"} · {recruiter?.email}</p>
                            {recruiter?.industry && <p className="text-blue-200 text-xs mt-0.5">🏭 {recruiter.industry}</p>}
                        </div>
                    </div>
                    {/* Account status badge */}
                    <div className="relative mt-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.cls}`}>
                            {sc.icon} {sc.label}
                        </span>
                    </div>
                    {/* Stats */}
                    <div className="relative mt-4 grid grid-cols-3 gap-2">
                        {[
                            { label: "Industry", value: recruiter?.industry ? "✓" : "—" },
                            { label: "Phone", value: recruiter?.phone ? "✓" : "—" },
                            { label: "Website", value: recruiter?.website ? "✓" : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white/15 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-extrabold">{value}</p>
                                <p className="text-blue-100 text-xs">{label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Toggle */}
                <div className="flex rounded-2xl overflow-hidden shadow mb-5 bg-white border border-slate-200">
                    {[["view", <FaEye />, "View Profile"], ["edit", <FaEdit />, "Edit Profile"]].map(([val, icon, label]) => (
                        <button key={val} onClick={() => setMode(val)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition ${mode === val
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                : "text-slate-500 hover:bg-slate-50"}`}>
                            {icon} {label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── VIEW MODE ── */}
                    {mode === "view" && (
                        <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>

                            <Card title="Company Information" icon={<FaBuilding />}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow icon={<FaBuilding />} label="Company" value={form.company} />
                                    <InfoRow icon={<FaIndustry />} label="Industry" value={form.industry} />
                                    <InfoRow icon={<FaUsers />} label="Company Size" value={form.companySize} />
                                    <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={form.location} />
                                    <InfoRow icon={<FaGlobe />} label="Website" value={form.website} />
                                    <InfoRow icon={<FaLinkedin />} label="LinkedIn" value={form.linkedin} />
                                </div>
                                {form.description && (
                                    <div className="mt-2">
                                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">About Company</p>
                                        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">{form.description}</p>
                                    </div>
                                )}
                            </Card>

                            <Card title="Contact Information" icon={<FaUser />}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow icon={<FaUser />} label="Name" value={form.name} />
                                    <InfoRow icon={<FaEnvelope />} label="Email" value={form.email} />
                                    <InfoRow icon={<FaPhone />} label="Phone" value={form.phone} />
                                </div>
                            </Card>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setMode("edit")}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition text-base mb-3">
                                <FaEdit /> Edit Profile
                            </motion.button>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => dispatch(recruiterLogout())}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-sm">
                                <FaSignOutAlt /> Sign Out
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── EDIT MODE ── */}
                    {mode === "edit" && (
                        <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                            <Card title="Company Information" icon={<FaBuilding />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field icon={<FaBuilding />} label="Company Name" value={form.company} onChange={set("company")} placeholder="e.g. Infosys" />
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Industry</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><FaIndustry /></span>
                                            <select value={form.industry} onChange={set("industry")}
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-800 text-sm appearance-none">
                                                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Company Size</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><FaUsers /></span>
                                            <select value={form.companySize} onChange={set("companySize")}
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-800 text-sm appearance-none">
                                                <option value="">Select size</option>
                                                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <Field icon={<FaMapMarkerAlt />} label="Location" value={form.location} onChange={set("location")} placeholder="City, State" />
                                    <Field icon={<FaGlobe />} label="Website" value={form.website} onChange={set("website")} type="url" placeholder="https://company.com" />
                                    <Field icon={<FaLinkedin />} label="LinkedIn" value={form.linkedin} onChange={set("linkedin")} type="url" placeholder="https://linkedin.com/company/..." />
                                </div>
                                <Field icon={<FaAlignLeft />} label="About / Description" value={form.description} onChange={set("description")} rows={3} placeholder="Tell candidates about your company culture and mission..." />
                            </Card>

                            <Card title="Contact Information" icon={<FaUser />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field icon={<FaUser />} label="Your Name" value={form.name} onChange={set("name")} />
                                    <Field icon={<FaEnvelope />} label="Email" value={form.email} readOnly />
                                    <Field icon={<FaPhone />} label="Phone" value={form.phone} onChange={set("phone")} type="tel" placeholder="+91 98765 43210" />
                                </div>
                            </Card>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition text-base">
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
