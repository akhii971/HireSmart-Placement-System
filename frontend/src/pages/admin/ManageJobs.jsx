import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await api.get("/admin/jobs");
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;
    if (filter === "Job") matchFilter = job.type === "Job";
    if (filter === "Internship") matchFilter = job.type === "Internship";
    if (filter === "Popular") matchFilter = job.applications >= 50;

    return matchSearch && matchFilter;
  });

  if (loading) return <p className="mt-24 text-center">Loading...</p>;

  return (
    <div className="container" style={{ marginTop: "90px" }}>
      <div className="jobs-top mb-4">
        <div>
          <h4>Manage Jobs & Internships</h4>
          <p className="text-muted mb-0">Monitor job performance and engagement</p>
        </div>

        <input
          type="text"
          className="form-control jobs-search"
          placeholder="Search jobs, company, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="job-filters mb-4">
        {["All", "Job", "Internship", "Popular"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12" key={job._id}>
              <div className="job-card">
                <div className="job-card-header">
                  <div className="job-icon">{job.company.charAt(0)}</div>
                  <div>
                    <h6 className="mb-0">{job.title}</h6>
                    <small className="text-muted">
                      {job.company} • {job.location}
                    </small>
                  </div>
                </div>

                <span className={`job-badge ${job.type === "Internship" ? "internship" : "job"}`}>
                  {job.type}
                </span>

                <div className="job-metrics">
                  <div>
                    <p>Views</p>
                    <h5>{job.views}</h5>
                  </div>
                  <div>
                    <p>Applications</p>
                    <h5>{job.applications}</h5>
                  </div>
                </div>

                <Link to={`/admin/jobs/${job._id}`} className="btn btn-outline-primary w-100 mt-3">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No matching jobs found</p>
        )}
      </div>
    </div>
  );
}

export default ManageJobs;
