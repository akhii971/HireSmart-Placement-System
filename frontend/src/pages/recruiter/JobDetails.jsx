import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteJob } from "../../redux/recruiter/jobsSlice";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaTrash,
  FaUsers,
  FaEdit,
  FaArrowLeft,
  FaEye,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const job = useSelector((state) =>
    state.jobs.myJobs.find((j) => j._id === id)
  );

  if (!job)
    return (
      <p className="p-6 pt-24 text-center text-slate-500">Job not found</p>
    );

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    await dispatch(deleteJob(job._id));
    navigate("/recruiter/jobs");
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-20 pb-28 px-4">
      <div className="max-w-3xl mx-auto space-y-3">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>

          <div className="flex flex-wrap gap-3 mt-1 text-slate-600 text-xs">
            <span className="flex items-center gap-1">
              <FaBuilding /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <FaBriefcase /> {job.type}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
              <FaEye /> {job.views}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
              <FaFileAlt /> {job.applications}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
              <FaClock /> {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <MiniCard label="Experience" value={job.experience || "Not specified"} />
          <MiniCard label="Salary" value={job.salary || "Not specified"} />
          <MiniCard label="Eligibility" value={job.eligibility || "Not specified"} />
          <MiniCard
            label="Skills"
            value={
              job.skills && job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                "Not specified"
              )
            }
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">
            Job Description
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed break-words">
            {job.description}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 rounded-2xl shadow p-4">
          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold active:scale-95 transition"
          >
            <FaArrowLeft className="text-base" />
            Back
          </button>

          {/* View Applications */}
          <button
            onClick={() => navigate("/recruiter/applications")}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <FaUsers className="text-base" />
            Applications
          </button>

          {/* Edit */}
          <button
            onClick={() => navigate(`/recruiter/edit-job/${job._id}`)}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <FaEdit className="text-base" />
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-red-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <FaTrash className="text-base" />
            Delete
          </button>
        </div>
      </div>


    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-3">
      <p className="text-[10px] text-slate-400 uppercase font-semibold">
        {label}
      </p>
      <div className="text-slate-800 text-sm font-medium mt-1">
        {value}
      </div>
    </div>
  );
}
