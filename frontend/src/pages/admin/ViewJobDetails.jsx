import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

function ViewJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const { data } = await api.get(`/admin/jobs/${id}`);
        setJob(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadJob();
  }, [id]);

  if (!job) return <h5 className="text-center mt-5">Loading...</h5>;

  return (
    <div className="container" style={{ marginTop: "80px" }}>
      <div className="card p-4">
        <h4>{job.title}</h4>
        <p className="text-muted">
          {job.company} • {job.location}
        </p>

        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Experience:</strong> {job.experience}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Eligibility:</strong> {job.eligibility}</p>
        <p><strong>Description:</strong> {job.description}</p>

        <hr />

        <div className="row text-center mb-4">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm">
              <h6>Views</h6>
              <h3>{job.views}</h3>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 shadow-sm">
              <h6>Applications</h6>
              <h3>{job.applications}</h3>
            </div>
          </div>
        </div>

        <button className="btn btn-outline-secondary mt-4" onClick={() => navigate("/admin/jobs")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default ViewJobDetails;
