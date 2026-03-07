import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function ShortlistCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const { data } = await api.get("/applications/recruiter/all");
        // Filter only Shortlisted candidates
        const shortlistedApps = data.filter((app) => app.status === "Shortlisted");
        setCandidates(shortlistedApps);
      } catch (err) {
        console.error("Failed to fetch shortlisted candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, []);

  // 🔹 Only shortlisted candidates
  const shortlisted = candidates.filter((c) => c.status === "Shortlisted");

  // 🔹 Unique jobs for filter
  const jobs = ["All", ...new Set(candidates.map((c) => c.job?.title).filter(Boolean))];

  // 🔹 Filter logic
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch =
        c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.job?.title?.toLowerCase().includes(search.toLowerCase());

      const matchJob = jobFilter === "All" ? true : c.job?.title === jobFilter;

      return matchSearch && matchJob;
    });
  }, [candidates, search, jobFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      // Remove from list if no longer shortlisted (hired, rejected, etc)
      setCandidates((prev) => prev.filter((c) => c._id !== appId));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const scoreColor = (score) => {
    if (!score) return "bg-slate-100 text-slate-700";
    if (score >= 85) return "bg-green-100 text-green-700";
    if (score >= 70) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white/70 backdrop-blur rounded-3xl shadow-2xl border p-6"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Shortlisted Candidates
            </h1>
            <p className="text-slate-500 text-sm">
              Review, select or reject shortlisted candidates
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder=" Search by name or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            {jobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className=" nounderline overflow-x-auto rounded-2xl shadow bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">Job</th>
                <th className="p-4 text-left">AI Score</th>
                <th className="p-4 text-left">Interview Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3 justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-500 font-medium">Loading candidates...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    className="border-t"
                  >
                    <td className="p-4 font-medium text-slate-800">
                      {c.user?.name || "Unknown"}
                      <div className="text-xs text-slate-500">{c.user?.email}</div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {c.job?.title || "Unknown Job"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor(
                          c.atsScore
                        )}`}
                      >
                        {c.atsScore || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 text-sm font-medium">
                      {/* Can connect to interview model later if needed */}
                      <Link
                        to="/recruiter/interview"
                        className="text-emerald-500 hover:underline"
                      >
                        Schedule
                      </Link>
                    </td>

                    <td className="p-4 text-center flex flex-wrap gap-2 justify-center">
                      <Link
                        to={`/recruiter/candidates/${c._id}`}
                        className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition text-sm font-semibold"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => handleStatusChange(c._id, "Hired")}
                        className="px-3 py-1 rounded-full bg-slate-100 text-green-600 font-semibold text-sm hover:bg-green-500 hover:text-white border border-green-200 hover:border-transparent transition"
                      >
                        Hire
                      </button>

                      <button
                        onClick={() => handleStatusChange(c._id, "Rejected")}
                        className="px-3 py-1 rounded-full bg-slate-100 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white border border-red-200 hover:border-transparent transition"
                      >
                        Reject
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    <p className="font-semibold text-lg text-slate-700 mb-1">No Shortlisted Candidates</p>
                    <p className="text-sm">You haven't shortlisted any candidates yet. Go to <Link to="/recruiter/applications" className="text-emerald-500 hover:underline">Applications</Link> to review candidates.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
