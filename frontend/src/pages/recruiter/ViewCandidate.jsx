import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaFileAlt,
  FaExternalLinkAlt,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaArrowLeft,
  FaStickyNote,
  FaCertificate,
  FaTrophy,
  FaCode,
  FaLanguage,
  FaComments,
} from "react-icons/fa";
import api from "../../api/axios";

export default function ViewCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // ─── Fetch Application Detail ───
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data } = await api.get(`/applications/detail/${id}`);
        setApplication(data);
        setNotes(data.recruiterNotes || "");
      } catch (err) {
        console.error("Failed to fetch application", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  // ─── Change Status ───
  const changeStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.put(`/applications/${id}/status`, {
        status: newStatus,
      });
      setApplication((prev) => ({
        ...prev,
        status: data.application.status,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─── Save Recruiter Notes ───
  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/applications/${id}/status`, {
        recruiterNotes: notes,
      });
      alert("Notes saved!");
    } catch (err) {
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const statusColor = (s) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Reviewed: "bg-blue-100 text-blue-700 border-blue-300",
      Shortlisted: "bg-emerald-100 text-emerald-700 border-emerald-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
      Hired: "bg-green-100 text-green-700 border-green-300",
    };
    return map[s] || "bg-slate-100 text-slate-700 border-slate-300";
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">
            Application not found
          </p>
          <button
            className="mt-4 px-5 py-2 rounded-full border hover:bg-slate-100 transition"
            onClick={() => navigate("/recruiter/applications")}
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const user = application.user || {};
  const job = application.job || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-5 pb-24"
      >
        {/* ═══ HEADER ═══ */}
        <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user.name || "Unknown Candidate"}
                  </h2>
                  <p className="text-slate-600 flex items-center gap-1">
                    <FaEnvelope className="text-slate-400" />
                    {user.email || "N/A"}
                  </p>
                  {user.phone && (
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <FaPhone className="text-slate-400" /> {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-5 py-2 rounded-full text-sm font-bold border ${statusColor(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
                
                <button
                  onClick={() => navigate("/recruiter/messages", {
                    state: {
                        autoOpenChat: {
                            _id: user._id,
                            name: user.name,
                            model: "User"
                        }
                    }
                  })}
                  className="flex items-center gap-2 px-4 py-2 mt-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow hover:scale-105 active:scale-95 transition text-sm font-semibold"
                >
                  <FaComments /> Message Candidate
                </button>

                <p className="text-xs text-slate-400 mt-1">
                  Applied: {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ JOB APPLIED FOR ═══ */}
        <div className="bg-white rounded-2xl p-5 shadow border">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Applied For
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaBriefcase className="text-emerald-500" />
                {job.title || "Job Deleted"}
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                {job.company} • {job.location} • {job.type}
              </p>
            </div>
            {job.salary && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                💰 {job.salary}
              </span>
            )}
          </div>
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ═══ CANDIDATE PROFILE ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Education & Experience */}
          <div className="bg-white rounded-2xl p-5 shadow border space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Education & Experience
            </h3>
            <InfoRow icon={<FaGraduationCap />} label="College" value={user.college} />
            <InfoRow icon={<FaGraduationCap />} label="Degree" value={user.degree} />
            <InfoRow icon={<FaCode />} label="Branch" value={user.branch} />
            <InfoRow
              icon={<FaGraduationCap />}
              label="Graduation Year"
              value={user.graduationYear}
            />
            <InfoRow icon={<FaGraduationCap />} label="CGPA" value={user.cgpa} />
            <InfoRow icon={<FaBriefcase />} label="Experience" value={user.experience} />
          </div>

          {/* Contact & Links */}
          <div className="bg-white rounded-2xl p-5 shadow border space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Contact & Links
            </h3>
            <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={user.location} />

            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <FaLinkedin /> LinkedIn <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
            {user.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
              >
                <FaGithub /> GitHub <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
            {user.portfolio && (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800"
              >
                <FaGlobe /> Portfolio <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
            {user.resumeUrl && (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
              >
                <FaFileAlt /> View Resume <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
          </div>
        </div>

        {/* ═══ SKILLS ═══ */}
        {user.skills?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow border">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaCode /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ LANGUAGES ═══ */}
        {user.languages?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow border">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaLanguage /> Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.languages.map((l) => (
                <span
                  key={l}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ BIO ═══ */}
        {user.bio && (
          <div className="bg-white rounded-2xl p-5 shadow border">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* ═══ CERTIFICATIONS & ACHIEVEMENTS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {user.certifications?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow border">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaCertificate /> Certifications
              </h3>
              <ul className="space-y-2">
                {user.certifications.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user.achievements?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow border">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaTrophy /> Achievements
              </h3>
              <ul className="space-y-2">
                {user.achievements.map((a, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ═══ COVER LETTER ═══ */}
        {application.coverLetter && (
          <div className="bg-white rounded-2xl p-5 shadow border">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Cover Letter
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {application.coverLetter}
            </p>
          </div>
        )}

        {/* ═══ RECRUITER NOTES ═══ */}
        <div className="bg-white rounded-2xl p-5 shadow border">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FaStickyNote /> Recruiter Notes (Private)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add private notes about this candidate..."
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
          />
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-3 px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition disabled:opacity-60"
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* ═══ STATUS ACTIONS ═══ */}
        <div className="bg-white rounded-2xl p-5 shadow border">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Update Status
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Reviewed", color: "bg-blue-500 hover:bg-blue-600" },
              {
                label: "Shortlisted",
                color: "bg-emerald-500 hover:bg-emerald-600",
              },
              { label: "Hired", color: "bg-green-500 hover:bg-green-600" },
              { label: "Rejected", color: "bg-red-500 hover:bg-red-600" },
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={
                  updatingStatus || application.status === btn.label
                }
                onClick={() => changeStatus(btn.label)}
                className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow transition ${btn.color
                  } ${application.status === btn.label
                    ? "opacity-50 cursor-not-allowed ring-2 ring-offset-2 ring-slate-300"
                    : ""
                  } disabled:opacity-50`}
              >
                {updatingStatus ? "..." : btn.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ═══ BACK BUTTON ═══ */}
        <button
          onClick={() => navigate("/recruiter/applications")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition font-semibold text-sm"
        >
          <FaArrowLeft /> Back to Applications
        </button>
      </motion.div>
    </div>
  );
}

// ─── Helper Component ───
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-500 w-28 flex-shrink-0">{label}:</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}
