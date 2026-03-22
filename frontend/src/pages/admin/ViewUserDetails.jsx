import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

function ViewUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get(`/admin/users/${id}`);
        setUser(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-status`);
      setUser(data);
    } catch (err) {
      console.error(err);
      alert("Failed to update user status");
    }
  };

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  if (!user) return <div className="container mt-5 text-center">User not found</div>;

  return (
    <div className="container" style={{ marginTop: "80px" }}>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card p-4 shadow">

            {/* HEADER */}
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: 60, height: 60, fontSize: 24 }}
              >
                {user.name?.charAt(0)}
              </div>
              <div>
                <h4 className="mb-0">{user.name}</h4>
                <p className="text-muted mb-0">{user.email}</p>
              </div>
            </div>

            {/* BASIC INFO */}
            <h5 className="mb-3">Basic Information</h5>
            <div className="row g-3">
              <Info label="User ID" value={user._id} />
              <Info label="Role" value={user.role} />
              <Info label="Status" value={user.status} />
              <Info label="Phone" value={user.phone || "N/A"} />
              <Info label="Location" value={user.location || "N/A"} />
              <Info label="Registered On" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>

            <hr />

            {/* EDUCATION & PROFILE */}
            <h5 className="mb-3">Profile Details</h5>
            <div className="row g-3">
              <Info label="College" value={user.college || "N/A"} />
              <Info label="Degree" value={user.degree || "N/A"} />
              <Info label="Branch" value={user.branch || "N/A"} />
              <Info label="Graduation Year" value={user.graduationYear || "N/A"} />
              <Info label="CGPA" value={user.cgpa || "N/A"} />
              <Info label="Experience" value={user.experience || "N/A"} />
            </div>

            <hr />

            {/* JOB PREFERENCES */}
            <h5 className="mb-3">Job Preferences</h5>
            <div className="row g-3">
              <Info label="Job Type" value={user.jobType || "N/A"} />
              <Info label="Preferred Location" value={user.preferredLocation || "N/A"} />
              <Info label="Expected Salary" value={user.expectedSalary || "N/A"} />
              <Info label="Availability" value={user.availability || "N/A"} />
              <Info label="Open To Remote" value={user.openToRemote ? "Yes" : "No"} />
            </div>

            <hr />

            {/* SKILLS & LINKS */}
            <h5 className="mb-3">Skills & Links</h5>
            <div className="mb-2">
              <strong>Skills:</strong>{" "}
              {user.skills && user.skills.length > 0 ? user.skills.join(", ") : "N/A"}
            </div>
            <div className="mb-2">
              <strong>Languages:</strong>{" "}
              {user.languages && user.languages.length > 0 ? user.languages.join(", ") : "N/A"}
            </div>
            <div className="mb-2">
              <strong>LinkedIn:</strong> {user.linkedin || "N/A"}
            </div>
            <div className="mb-2">
              <strong>GitHub:</strong> {user.github || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Portfolio:</strong> {user.portfolio || "N/A"}
            </div>

            <hr />

            {/* ACTIONS */}
            <div className="d-flex gap-3">
              <button
                className={`btn ${user.status === "Active" ? "btn-danger" : "btn-success"}`}
                onClick={handleToggleStatus}
              >
                {user.status === "Active" ? "Block User" : "Unblock User"}
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/admin/users")}
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

function Info({ label, value }) {
  return (
    <div className="col-md-4">
      <label className="text-muted small">{label}</label>
      <div className="fw-semibold">{value}</div>
    </div>
  );
}

export default ViewUserDetails;
