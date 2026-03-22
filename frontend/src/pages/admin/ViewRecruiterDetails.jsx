import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

function ViewRecruiterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(null);

  useEffect(() => {
    const loadRecruiter = async () => {
      try {
        const { data } = await api.get(`/admin/recruiters/${id}`);
        setRecruiter(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadRecruiter();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      const { data } = await api.put(`/admin/recruiters/${id}/status`, {
        status: newStatus,
      });
      setRecruiter(data);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (!recruiter)
    return <div className="container mt-5 text-center">Loading...</div>;

  return (
    <div className="container" style={{ marginTop: "90px" }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="recruiter-card">
            <div className="recruiter-header">
              <div className="company-avatar">
                {recruiter.company?.charAt(0) || "R"}
              </div>
              <div>
                <h4 className="mb-0">{recruiter.company || "Recruiter"}</h4>
                <p className="text-muted mb-0">{recruiter.email}</p>
              </div>
            </div>

            <div className="recruiter-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label>Recruiter ID</label>
                  <p>{recruiter._id}</p>
                </div>

                <div className="col-md-6">
                  <label>Industry</label>
                  <p>{recruiter.industry || "Not specified"}</p>
                </div>

                <div className="col-md-6">
                  <label>Status</label>
                  <br />
                  <span
                    className={`status-badge ${
                      recruiter.status === "Approved"
                        ? "approved"
                        : recruiter.status === "Pending"
                        ? "pending"
                        : "rejected"
                    }`}
                  >
                    {recruiter.status}
                  </span>
                </div>

                <div className="col-md-6">
                  <label>Registered On</label>
                  <p>{new Date(recruiter.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="recruiter-actions">
              {recruiter.status === "Pending" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => updateStatus("Approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger ms-2"
                    onClick={() => updateStatus("Rejected")}
                  >
                    Reject
                  </button>
                </>
              )}

              <button
                className="btn btn-outline-secondary ms-auto"
                onClick={() => navigate("/admin/recruiters")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRecruiterDetails;
