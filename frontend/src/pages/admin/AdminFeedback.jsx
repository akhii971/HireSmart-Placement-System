import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaTrash, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function AdminFeedback() {
  const { admin } = useSelector((state) => state.adminAuth);
  const adminToken = admin?.token;
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("All"); // All, Feedback, Report
  const [roleFilter, setRoleFilter] = useState("All"); // All, User, Recruiter
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/feedback/admin", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [adminToken]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/admin/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (filter !== "All" && f.type !== filter) return false;
    if (roleFilter !== "All" && f.authorModel !== roleFilter) return false;
    return true;
  });

  return (
    <div className="container" style={{ marginTop: "90px" }}>
      {/* HEADER */}
      <div className="feedback-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1">Feedback & Reports</h4>
          <p className="text-muted mb-0">Review feedback from users and recruiters</p>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ width: "150px" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="User">Users</option>
            <option value="Recruiter">Recruiters</option>
          </select>
          <select
            className="form-select"
            style={{ width: "150px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Feedback">Feedback</option>
            <option value="Report">Reports</option>
          </select>
        </div>
      </div>

      {/* OVERVIEW STATS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted mb-1">Total Submissions</h6>
            <h3 className="mb-0">{feedbacks.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted mb-1">Reports</h6>
            <h3 className="mb-0 text-danger">{feedbacks.filter(f => f.type === "Report").length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted mb-1">Unresolved</h6>
            <h3 className="mb-0 text-warning">{feedbacks.filter(f => f.status === "Pending").length}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="fa-spin text-emerald-500 text-3xl" />
        </div>
      ) : (
        <div className="row g-4">
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((f) => (
                <motion.div
                  key={f._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="col-xl-4 col-lg-6 col-md-6 col-sm-12"
                >
                  <div className={`card border-0 shadow-sm h-100 p-3 position-relative ${f.type === "Report" ? "border-top border-danger border-3" : "border-top border-emerald-500 border-3"}`}>

                    {/* Status Badge */}
                    <div className="position-absolute" style={{ top: "10px", right: "10px" }}>
                      <span className={`badge ${f.status === "Pending" ? "bg-warning text-dark" :
                        f.status === "Reviewed" ? "bg-info" : "bg-success"
                        }`}>
                        {f.status}
                      </span>
                    </div>

                    {/* TOP */}
                    <div className="d-flex align-items-center gap-3 mb-3 mt-2">
                      <div className="avatar bg-light text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                        {f.authorId?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h6 className="mb-0">{f.authorId?.name || "Unknown"}</h6>
                        <small className="text-muted d-block">{f.authorId?.email}</small>
                        <span className={`badge mt-1 ${f.authorModel === "Recruiter" ? "bg-primary" : "bg-secondary"}`}>
                          {f.authorModel}
                        </span>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="mb-3 flex-grow-1">
                      <span className={`badge mb-2 ${f.type === "Report" ? "bg-danger" : "bg-emerald-500"}`}>
                        {f.type}
                      </span>
                      <p className="mb-0" style={{ fontSize: "0.95rem" }}>
                        “{f.message}”
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                      <div>
                        {f.type === "Feedback" && f.rating > 0 ? (
                          <div className="text-warning">
                            {"★".repeat(f.rating)}
                            <span className="text-muted">{"★".repeat(5 - f.rating)}</span>
                          </div>
                        ) : (
                          <small className="text-muted">
                            {new Date(f.createdAt).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        {f.status !== "Resolved" && (
                          <button
                            className="btn btn-sm btn-outline-success border-0"
                            onClick={() => handleStatusChange(f._id, "Resolved")}
                            title="Mark as Resolved"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => handleDelete(f._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-muted text-center py-5">No feedback found matching the criteria</p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;
