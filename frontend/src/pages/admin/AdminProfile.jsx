import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser, FaEnvelope, FaPhone, FaSave, FaEdit, FaEye,
    FaShieldAlt, FaSignOutAlt, FaMapMarkerAlt, FaAlignLeft,
    FaCheckCircle, FaSpinner, FaUsers, FaBriefcase, FaBuilding,
} from "react-icons/fa";
import api from "../../api/axios";
import { adminLogout } from "../../redux/admin/adminAuthSlice";

/* ── Field ── */
const Field = ({ icon, label, value, onChange, type = "text", readOnly, placeholder, textarea }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 text-sm">{icon}</span>
            {textarea ? (
                <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} readOnly={readOnly}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none transition ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`} />
            ) : (
                <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`} />
            )}
        </div>
    </div>
);

/* ── Info Row ── */
const InfoRow = ({ icon, label, value }) =>
    value ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-rose-500 mt-0.5 shrink-0 text-sm">{icon}</span>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-slate-800 font-semibold text-sm mt-0.5">{value}</p>
            </div>
        </div>
    ) : null;

export default function AdminProfile() {
    const dispatch = useDispatch();
    const { admin } = useSelector((s) => s.adminAuth);

    const [mode, setMode] = useState("view");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", bio: "" });

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    useEffect(() => {
        Promise.all([api.get("/admin/profile"), api.get("/admin/stats")])
            .then(([p, s]) => {
                setProfile(p.data); setStats(s.data);
                setForm({ name: p.data.name || "", email: p.data.email || "", phone: p.data.phone || "", location: p.data.location || "", bio: p.data.bio || "" });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.put("/admin/profile", { name: form.name, phone: form.phone, location: form.location, bio: form.bio });
            setProfile(data); setForm((f) => ({ ...f, ...data }));
            setSaved(true); setTimeout(() => { setSaved(false); setMode("view"); }, 1500);
        } catch (err) { alert(err.response?.data?.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const initial = (profile?.name || admin?.name || "A").charAt(0).toUpperCase();

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <FaSpinner className="animate-spin text-rose-500 text-4xl" />
                <p className="text-slate-400 text-sm font-medium">Loading profile…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-20 pb-16">
            <div className="max-w-2xl mx-auto">

                {/* ── Hero Card ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl shadow-xl mb-5"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500" />
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-orange-300/20 blur-2xl" />

                    <div className="relative z-10 p-6 sm:p-8">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-5 mb-6">
                            <motion.div whileHover={{ scale: 1.06, rotate: 3 }}
                                className="w-20 h-20 rounded-2xl bg-white/25 border-2 border-white/40 flex items-center justify-center text-4xl font-black text-white shadow-xl shrink-0 select-none"
                            >
                                {initial}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl sm:text-3xl font-black text-white truncate">{profile?.name}</h2>
                                <p className="text-rose-100 text-sm truncate mt-0.5">{profile?.email}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 border border-white/25 px-3 py-1 rounded-full font-bold text-white">
                                        <FaShieldAlt className="text-rose-200 text-[10px]" /> Super Admin
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-400/30 border border-emerald-300/40 px-3 py-1 rounded-full font-bold text-emerald-100">
                                        <FaCheckCircle className="text-[10px]" /> Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats strip */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Users", val: stats?.totalUsers, icon: <FaUsers /> },
                                { label: "Recruiters", val: stats?.totalRecruiters, icon: <FaBuilding /> },
                                { label: "Jobs", val: stats?.totalJobs, icon: <FaBriefcase /> },
                            ].map(({ label, val, icon }) => (
                                <div key={label} className="bg-white/15 border border-white/15 backdrop-blur-sm rounded-2xl p-3 text-center hover:bg-white/20 transition">
                                    <p className="text-white/50 text-xs mb-0.5 flex justify-center">{icon}</p>
                                    <p className="text-2xl font-black text-white">{val ?? "—"}</p>
                                    <p className="text-rose-100 text-xs font-semibold">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Toggle ── */}
                <div className="flex rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm mb-5">
                    {[["view", <FaEye />, "View Profile"], ["edit", <FaEdit />, "Edit Profile"]].map(([val, icon, label]) => (
                        <button key={val} onClick={() => setMode(val)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${mode === val
                                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {/* ── Panels ── */}
                <AnimatePresence mode="wait">

                    {/* VIEW */}
                    {mode === "view" && (
                        <motion.div key="view"
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}
                        >
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                    <h3 className="font-extrabold text-slate-700 text-base">Admin Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow icon={<FaUser />} label="Full Name" value={form.name} />
                                    <InfoRow icon={<FaEnvelope />} label="Email" value={form.email} />
                                    <InfoRow icon={<FaPhone />} label="Phone" value={form.phone || "Not set"} />
                                    <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={form.location || "Not set"} />
                                    {form.bio && (
                                        <div className="sm:col-span-2">
                                            <InfoRow icon={<FaAlignLeft />} label="Bio" value={form.bio} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 16px 32px -8px rgba(244,63,94,0.4)" }}
                                whileTap={{ scale: 0.97 }} onClick={() => setMode("edit")}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold rounded-2xl shadow-lg mb-3 text-base"
                            >
                                <FaEdit /> Edit Profile
                            </motion.button>

                            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                onClick={() => dispatch(adminLogout())}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition text-sm border border-slate-200"
                            >
                                <FaSignOutAlt /> Sign Out
                            </motion.button>
                        </motion.div>
                    )}

                    {/* EDIT */}
                    {mode === "edit" && (
                        <motion.div key="edit"
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
                        >
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                    <h3 className="font-extrabold text-slate-700 text-base">Edit Profile</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field icon={<FaUser />} label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" />
                                    <Field icon={<FaEnvelope />} label="Email" value={form.email} readOnly />
                                    <Field icon={<FaPhone />} label="Phone" value={form.phone} onChange={set("phone")} type="tel" placeholder="+91 98765 43210" />
                                    <Field icon={<FaMapMarkerAlt />} label="Location" value={form.location} onChange={set("location")} placeholder="City, State" />
                                    <div className="sm:col-span-2">
                                        <Field icon={<FaAlignLeft />} label="Bio" value={form.bio} onChange={set("bio")} textarea placeholder="A short description about yourself…" />
                                    </div>
                                </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 16px 32px -8px rgba(244,63,94,0.4)" }}
                                whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold rounded-2xl shadow-lg transition disabled:opacity-70 text-base"
                            >
                                {saving ? <FaSpinner className="animate-spin" /> : saved ? <FaCheckCircle /> : <FaSave />}
                                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
