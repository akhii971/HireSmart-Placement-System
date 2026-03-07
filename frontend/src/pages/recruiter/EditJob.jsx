import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateJob } from "../../redux/recruiter/jobsSlice";
import { motion } from "framer-motion";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const job = useSelector((state) =>
    state.jobs.myJobs.find((j) => j._id === id)
  );

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Job",
    experience: "",
    salary: "",
    skills: "",
    eligibility: "",
    description: "",
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "Job",
        experience: job.experience || "",
        salary: job.salary || "",
        skills: (job.skills || []).join(", "),
        eligibility: job.eligibility || "",
        description: job.description || "",
      });
    }
  }, [job]);

  if (!job) return <p className="p-6 pt-24">Job not found</p>;

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    await dispatch(updateJob({ id: job._id, jobData: payload }));
    navigate(`/recruiter/jobs/${job._id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-20 pb-28 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-5">
        <h1 className="text-2xl font-bold mb-4">✏️ Edit Job</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input label="Job Title" value={form.title} onChange={set("title")} />
          <Input label="Company" value={form.company} onChange={set("company")} />
          <Input label="Location" value={form.location} onChange={set("location")} />

          <div>
            <label className="text-sm font-semibold text-slate-600">Type</label>
            <select
              value={form.type}
              onChange={set("type")}
              className="w-full mt-1 border rounded-xl p-3 bg-slate-50"
            >
              <option value="Job">Job</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <Input label="Experience" value={form.experience} onChange={set("experience")} />
          <Input label="Salary" value={form.salary} onChange={set("salary")} />
          <Input label="Skills (comma separated)" value={form.skills} onChange={set("skills")} />
          <Input label="Eligibility" value={form.eligibility} onChange={set("eligibility")} />

          <div>
            <label className="text-sm font-semibold text-slate-600">Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={set("description")}
              className="w-full mt-1 border rounded-xl p-3 bg-slate-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-semibold"
            >
              💾 Save Changes
            </motion.button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 border rounded-xl p-3 bg-slate-50"
      />
    </div>
  );
}