import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createJob } from "../../redux/recruiter/jobsSlice";

export default function PostJob() {
  const navigate = useNavigate();

  const initialValues = {
    title: "",
    company: "",
    type: "Job",
    location: "",
    experience: "",
    salary: "",
    skills: "",
    description: "",
    eligibility: "",
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Job title is required"),
    company: Yup.string().required("Company name is required"),
    type: Yup.string().required("Select job type"),
    location: Yup.string().required("Location is required"),
    experience: Yup.string().required("Experience is required"),
    salary: Yup.string().required("Salary is required"),
    skills: Yup.string().required("Skills are required"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Description is required"),
    eligibility: Yup.string().required("Eligibility is required"),
  });



  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(
        createJob({
          title: values.title,
          company: values.company,
          type: values.type,
          location: values.location,
          experience: values.experience,
          salary: values.salary,
          skills: values.skills.split(",").map((s) => s.trim()),
          description: values.description,
          eligibility: values.eligibility,
        })
      ).unwrap();

      alert("Job posted successfully!");
      navigate("/recruiter/jobs");
    } catch (err) {
      alert("Failed to post job: " + (err || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-4 sm:p-6 pt-24 flex justify-center items-start">

      {/* Floating background blobs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-6 sm:p-10"
      >
        {/* Header */}
        <div className="mb-8">


          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent animate-gradient">
              Post a New Job
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Create a new job or internship and reach the best candidates instantly.
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Job Title */}
              <div>
                <label className="form-label">Job Title</label>
                <Field name="title" className="input" placeholder="e.g. MERN Stack Developer" />
                <ErrorMessage name="title" component="div" className="error" />
              </div>

              {/* Company */}
              <div>
                <label className="form-label">Company</label>
                <Field name="company" className="input" placeholder="e.g. Infosys" />
                <ErrorMessage name="company" component="div" className="error" />
              </div>

              {/* Type */}
              <div>
                <label className="form-label">Type</label>
                <Field as="select" name="type" className="input">
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                </Field>
              </div>

              {/* Location */}
              <div>
                <label className="form-label">Location</label>
                <Field name="location" className="input" placeholder="e.g. Bangalore / Remote" />
                <ErrorMessage name="location" component="div" className="error" />
              </div>

              {/* Experience */}
              <div>
                <label className="form-label">Experience</label>
                <Field name="experience" className="input" placeholder="e.g. 0-2 Years" />
                <ErrorMessage name="experience" component="div" className="error" />
              </div>

              {/* Salary */}
              <div>
                <label className="form-label">Salary / Stipend</label>
                <Field name="salary" className="input" placeholder="e.g. ₹5 LPA / ₹10k per month" />
                <ErrorMessage name="salary" component="div" className="error" />
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label className="form-label">Required Skills</label>
                <Field
                  name="skills"
                  className="input"
                  placeholder="e.g. React, Node, MongoDB"
                />
                <ErrorMessage name="skills" component="div" className="error" />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="form-label">Job Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows="4"
                  className="input"
                  placeholder="Describe the role, responsibilities, etc."
                />
                <ErrorMessage name="description" component="div" className="error" />
              </div>

              {/* Eligibility */}
              <div className="md:col-span-2">
                <label className="form-label">Eligibility Criteria</label>
                <Field
                  as="textarea"
                  name="eligibility"
                  rows="3"
                  className="input"
                  placeholder="e.g. B.Tech CS, Final year students, etc."
                />
                <ErrorMessage name="eligibility" component="div" className="error" />
              </div>


              {/* Buttons */}
              <div className="md:col-span-2 flex flex-wrap gap-4 mt-8">

                {/* Publish Button */}
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden px-6 py-3 rounded-full font-semibold text-white 
               bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 
               shadow-lg hover:shadow-emerald-300/50 transition-all duration-300
               disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />

                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? "Publishing..." : "Publish Job"}
                  </span>
                </motion.button>

                {/* Cancel Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate("/recruiter/dashboard")}
                  className="px-10 py-3 rounded-full font-semibold text-slate-700 
               border  border-slate-300 bg-white 
               hover:bg-slate-100 hover:shadow-md transition-all duration-300"
                >
                  ← Cancel
                </motion.button>

              </div>


            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
}
