import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchMyJobs } from "../../redux/recruiter/jobsSlice";
import { useEffect } from "react";

export default function MyJobs() {
  const dispatch = useDispatch();
  const { myJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchMyJobs());
  }, [dispatch]);

  if (loading) {
    return <p className="p-6 pt-24">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Posted Jobs</h1>

        {myJobs.length === 0 ? (
          <p className="text-slate-500">No jobs posted yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {myJobs.map((job, i) => (
              <motion.div
                key={job._id}   // ✅ FIXED
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow p-5"
              >
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-slate-500">
                  {job.company} • {job.location}
                </p>

                <div className="flex gap-4 mt-3 text-sm  ">
                  <span>👀 {job.views} Views</span>
                  <span>📄 {job.applications} Applications</span>
                </div>

                <Link
                  to={`/recruiter/jobs/${job._id}`}  
                  className="nounderline inline-block mt-4 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition underline-none"
                >
                  View Details
                </Link>
                
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
