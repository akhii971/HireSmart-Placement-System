import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { incrementViews } from "../../redux/recruiter/jobsSlice";

export default function ViewJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const jobs = useSelector((state) => state.jobs);
  const job = jobs.find((j) => j.id === id);

  useEffect(() => {
    if (job) {
      dispatch(incrementViews(job.id));
    }
  }, [dispatch, job]);

  if (!job) {
    return <p className="p-6">Job not found</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 pt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-slate-600">{job.company}</p>

        <div className="flex gap-6 mt-4">
          <span>👁 {job.views} Views</span>
          <span>📄 {job.applications} Applications</span>
        </div>

        <p className="mt-6"><strong>Description:</strong> {job.description}</p>
        <p className="mt-2"><strong>Skills:</strong> {job.skills}</p>
        <p className="mt-2"><strong>Eligibility:</strong> {job.eligibility}</p>

        <button
          onClick={() => navigate("/recruiter/jobs")}
          className="mt-6 px-6 py-2 rounded-full border"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
