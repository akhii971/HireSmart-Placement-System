import Job from "../models/Job.js";

// ✅ POST /api/jobs  (Recruiter creates job)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      experience,
      salary,
      skills,
      description,
      eligibility,
    } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      type,
      experience,
      salary,
      skills: Array.isArray(skills)
        ? skills
        : skills?.split(",").map((s) => s.trim()),
      description,
      eligibility,
      recruiter: req.recruiter._id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /api/jobs  (Public: view all jobs)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email company")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /api/jobs/my/jobs  (Recruiter: my posted jobs)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.recruiter._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /api/jobs/:id  (Public: job details + increment views)
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name email company"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.views += 1;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE /api/jobs/:id  (Recruiter deletes own job)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only the owner recruiter can delete
    if (job.recruiter.toString() !== req.recruiter._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ PUT /api/jobs/:id  (Recruiter edits own job)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only the owner recruiter can edit
    if (job.recruiter.toString() !== req.recruiter._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(job, req.body);
    const updated = await job.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};