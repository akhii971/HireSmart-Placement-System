import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: 1,
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    job: "Frontend Developer Intern",
    education: "B.Sc Computer Science",
    experience: "Fresher",
    skills: ["React", "JavaScript", "Tailwind", "Node.js"],
    resumeUrl: "/sample-resume.pdf",
    aiScore: 82,
    atsScore: 76,
    status: "Applied",
    interviewDate: null,
  },
  {
    id: 2,
    name: "Anjali",
    email: "anjali@gmail.com",
    phone: "+91 99887 66554",
    job: "MERN Stack Developer",
    education: "B.Tech IT",
    experience: "1 Year",
    skills: ["MongoDB", "Express", "React", "Node.js"],
    resumeUrl: "/sample-resume.pdf",
    aiScore: 90,
    atsScore: 84,
    status: "Shortlisted",
    interviewDate: null,
  },
];

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    updateStatus: (state, action) => {
      const { id, status } = action.payload;
      const candidate = state.find((c) => c.id === id);
      if (candidate) {
        candidate.status = status;
      }
    },
    scheduleInterview: (state, action) => {
      const { id, date } = action.payload;
      const candidate = state.find((c) => c.id === id);
      if (candidate) {
        candidate.interviewDate = date;
      }
    },
  },
});

export const { updateStatus, scheduleInterview } = candidatesSlice.actions;
export default candidatesSlice.reducer;
