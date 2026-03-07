import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const statusBadge = (status) => {
  const map = {
    Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    Rejected: "bg-red-100 text-red-700 border border-red-200",
    Blocked: "bg-gray-200 text-gray-600 border border-gray-300",
  };
  return map[status] || map.Pending;
};

function ManageRecruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // recruiter id being updated

  useEffect(() => {
    const loadRecruiters = async () => {
      try {
        const { data } = await api.get("/admin/recruiters");
        setRecruiters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRecruiters();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const { data } = await api.put(`/admin/recruiters/${id}/status`, { status: newStatus });
      setRecruiters((prev) => prev.map((r) => (r._id === id ? data : r)));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredRecruiters = recruiters.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.company?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.industry?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: recruiters.length,
    Pending: recruiters.filter((r) => r.status === "Pending").length,
    Approved: recruiters.filter((r) => r.status === "Approved").length,
    Rejected: recruiters.filter((r) => r.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800">Recruiter Management</h1>
          <p className="text-slate-500 text-sm mt-1">Verify, approve or reject recruiter applications</p>
        </div>

        {/* Stats tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["All", "Pending", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${statusFilter === tab
                  ? "bg-rose-500 text-white border-rose-500 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {tab}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusFilter === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                {counts[tab] || 0}
              </span>
            </button>
          ))}

          {/* Search */}
          <input
            type="text"
            placeholder="Search by company, name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white min-w-[220px]"
          />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">#</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Company / Recruiter</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Industry</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRecruiters.map((r, index) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50 transition"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {r.company?.charAt(0) || "R"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{r.company || "—"}</p>
                            <p className="text-xs text-slate-400">{r.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{r.email}</td>
                      <td className="px-5 py-4 text-slate-500">{r.industry || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Approve */}
                          {r.status !== "Approved" && (
                            <button
                              disabled={updating === r._id}
                              onClick={() => updateStatus(r._id, "Approved")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition disabled:opacity-50"
                            >
                              {updating === r._id ? "…" : "Approve"}
                            </button>
                          )}
                          {/* Reject */}
                          {r.status !== "Rejected" && (
                            <button
                              disabled={updating === r._id}
                              onClick={() => updateStatus(r._id, "Rejected")}
                              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition disabled:opacity-50"
                            >
                              {updating === r._id ? "…" : "Reject"}
                            </button>
                          )}
                          {/* View */}
                          <Link
                            to={`/admin/recruiters/${r._id}`}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition no-underline"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filteredRecruiters.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400">
                      No recruiters found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageRecruiters;