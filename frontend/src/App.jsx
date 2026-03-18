import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// ─── Layouts ───────────────────────────────────────
import AdminLayout from "./layouts/AdminLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import UserLayout from "./layouts/UserLayout";

// ─── Admin ─────────────────────────────────────────
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ViewUserDetails from "./pages/admin/ViewUserDetails";
import ManageRecruiters from "./pages/admin/ManageRecruiters";
import ViewRecruiterDetails from "./pages/admin/ViewRecruiterDetails";
import ManageJobs from "./pages/admin/ManageJobs";
import ViewJobDetails from "./pages/admin/ViewJobDetails";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminSignIn from "./pages/admin/AdminSignIn";
import AdminProfile from "./pages/admin/AdminProfile";

// ─── Recruiter ─────────────────────────────────────
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import PostJob from "./pages/recruiter/PostJob";
import ViewApplications from "./pages/recruiter/ViewApplications";
import ViewCandidate from "./pages/recruiter/ViewCandidate";
import MyJobs from "./pages/recruiter/MyJobs";
import JobDetails from "./pages/recruiter/JobDetails";
import AIRanking from "./pages/recruiter/AIRanking";
import ShortlistCandidates from "./pages/recruiter/ShortlistCandidates";
import ScheduleInterviews from "./pages/recruiter/ScheduleInterviews";
import RecruiterSignIn from "./pages/recruiter/RecruiterSignIn";
import RecruiterSignUp from "./pages/recruiter/RecruiterSignUp";
import RecruiterForgotPassword from "./pages/recruiter/RecruiterForgotPassword";
import RecruiterResetPassword from "./pages/recruiter/RecruiterResetPassword";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import EditJob from "./pages/recruiter/EditJob";
import RecruiterPendingPage from "./pages/recruiter/RecruiterPendingPage";
import RecruiterProtectedRoute from "./components/recruiter/RecruiterProtectedRoute";

// ─── User ───────────────────────────────────────────
import UserDashboard from "./pages/user/Dashboard";
import UserJobs from "./pages/user/UserJobs";
import UserJobDetails from "./pages/user/JobDetails";
import UserJobApply from "./pages/user/UserJobApply";
import UserApplications from "./pages/user/UserApplications";
import UserInterviews from "./pages/user/UserInterviews";
import UserAI from "./pages/user/UserAI";
import UserAIChat from "./pages/user/UserAIChat";
import UserAIMockInterview from "./pages/user/UserAIMockInterview";
import SignIn from "./pages/user/SignIn";
import SignUp from "./pages/user/SignUp";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";
import MyProfile from "./pages/user/MyProfile";
import BlockedPage from "./pages/user/BlockedPage";
import ProtectedRoute from "./components/user/ProtectedRoute";

// ─── Misc ───────────────────────────────────────────
import LandingPage from "./pages/LandingPage";
import ToastNotifications from "./components/recruiter/ToastNotifications";
import NotificationBell from "./components/recruiter/NotificationBell";
import SharedMessages from "./pages/common/Messages";
import FeedbackPage from "./pages/common/FeedbackPage";

// Component Imports
import UserNavbar from "./components/user/UserNavbar";
import RecruiterNavbar from "./components/recruiter/recruiternavbar";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const location = useLocation(); // Hook to get current location
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isMessagesRoute, setIsMessagesRoute] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);

  useEffect(() => {
    setIsAdminRoute(location.pathname.startsWith("/admin"));
    setIsRecruiter(location.pathname.startsWith("/recruiter"));
    setIsMessagesRoute(location.pathname.endsWith("/messages"));
    setIsLandingPage(location.pathname === "/");
  }, [location]);

  return (
    <SocketProvider>
      <div className="flex flex-col min-h-screen">
        {/* Only show Navbar if not on /admin or landing page */}
        {!isAdminRoute && !isLandingPage && (isRecruiter ? <RecruiterNavbar /> : <UserNavbar />)}

        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* ===== USER AUTH (public) ===== */}
          <Route path="/user/signin" element={<SignIn />} />
          <Route path="/user/signup" element={<SignUp />} />
          <Route path="/user/forgot-password" element={<ForgotPassword />} />
          <Route path="/user/reset-password/:token" element={<ResetPassword />} />
          <Route path="/user/blocked" element={<BlockedPage />} />

          {/* ===== USER (protected) ===== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="jobs" element={<UserJobs />} />
              <Route path="jobs/:id" element={<UserJobDetails />} />
              <Route path="jobs/:id/apply" element={<UserJobApply />} />
              <Route path="applications" element={<UserApplications />} />
              <Route path="interviews" element={<UserInterviews />} />
              <Route path="messages" element={<SharedMessages />} />
              <Route path="ai" element={<UserAI />} />
              <Route path="ai/chat" element={<UserAIChat />} />
              <Route path="ai/mock" element={<UserAIMockInterview />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Route>
          </Route>

          {/* ===== ADMIN ===== */}
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="users/:id" element={<ViewUserDetails />} />
            <Route path="recruiters" element={<ManageRecruiters />} />
            <Route path="recruiters/:id" element={<ViewRecruiterDetails />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/:id" element={<ViewJobDetails />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          {/* ===== RECRUITER AUTH (public) ===== */}
          <Route path="/recruiter/signin" element={<RecruiterSignIn />} />
          <Route path="/recruiter/signup" element={<RecruiterSignUp />} />
          <Route path="/recruiter/forgot-password" element={<RecruiterForgotPassword />} />
          <Route path="/recruiter/reset-password/:token" element={<RecruiterResetPassword />} />
          {/* Pending / Rejected / Blocked page — accessible without full approval */}
          <Route path="/recruiter/pending" element={<RecruiterPendingPage />} />

          {/* ===== RECRUITER (protected — Approved only) ===== */}
          <Route element={<RecruiterProtectedRoute />}>
            <Route path="/recruiter" element={<RecruiterLayout />}>
              <Route index element={<RecruiterDashboard />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="profile" element={<RecruiterProfile />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="edit-job/:id" element={<EditJob />} />
              <Route path="notifications" element={<NotificationBell />} />
              <Route path="applications" element={<ViewApplications />} />
              <Route path="candidates/:id" element={<ViewCandidate />} />
              <Route path="ranking" element={<AIRanking />} />
              <Route path="shortlist" element={<ShortlistCandidates />} />
              <Route path="interview" element={<ScheduleInterviews />} />
              <Route path="messages" element={<SharedMessages />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Route>
          </Route>
        </Routes>

        {!isMessagesRoute && !isAdminRoute && !isLandingPage && (
          <footer className="bg-white border-t border-slate-200 mt-auto">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <img src="/logo.png" alt="HireSmart Logo" className="h-8 w-auto" />
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent m-0">
                    HireSmart
                  </h2>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Smart Internship & Placement Management — connecting students with top recruiters through intelligent matching.
                </p>
                <div className="flex gap-3">
                  {[
                    { icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z", name: "Twitter" },
                    { icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z", name: "GitHub" },
                    { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554v-11.452h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zm-15.11-13.019c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019h-3.564v-11.452h3.564v11.452zm15.106-20.452h-20.454c-.979 0-1.771.774-1.771 1.729v20.542c0 .956.792 1.729 1.771 1.729h20.451c.978 0 1.772-.773 1.772-1.729v-20.542c0-.955-.794-1.729-1.772-1.729z", name: "LinkedIn" },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-50 flex items-center justify-center transition-all hover:scale-110 group border border-slate-200 hover:border-emerald-200"
                      title={social.name}
                    >
                      <svg className="w-4 h-4 fill-slate-500 group-hover:fill-emerald-500 transition" viewBox="0 0 24 24">
                        <path d={social.icon} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* For Students — only on user pages */}
              {!isRecruiter && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">For Students</h3>
                  <ul className="space-y-2.5 text-sm">
                    <li><a href="/user/jobs" className="text-slate-500 hover:text-emerald-600 transition">Browse Jobs</a></li>
                    <li><a href="/user/applications" className="text-slate-500 hover:text-emerald-600 transition">My Applications</a></li>
                    <li><a href="/user/interviews" className="text-slate-500 hover:text-emerald-600 transition">Interviews</a></li>
                    <li><a href="/user/ai" className="text-slate-500 hover:text-emerald-600 transition">AI Tools</a></li>
                    <li><a href="/user/profile" className="text-slate-500 hover:text-emerald-600 transition">My Profile</a></li>
                    <li><a href="/user/feedback" className="text-slate-500 hover:text-emerald-600 transition">Feedback & Report</a></li>
                  </ul>
                </div>
              )}

              {/* For Recruiters — only on recruiter pages */}
              {isRecruiter && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">For Recruiters</h3>
                  <ul className="space-y-2.5 text-sm">
                    <li><a href="/recruiter/dashboard" className="text-slate-500 hover:text-emerald-600 transition">Dashboard</a></li>
                    <li><a href="/recruiter/jobs" className="text-slate-500 hover:text-emerald-600 transition">Manage Jobs</a></li>
                    <li><a href="/recruiter/applications" className="text-slate-500 hover:text-emerald-600 transition">Applications</a></li>
                    <li><a href="/recruiter/shortlist" className="text-slate-500 hover:text-emerald-600 transition">Shortlisted</a></li>
                    <li><a href="/recruiter/messages" className="text-slate-500 hover:text-emerald-600 transition">Messages</a></li>
                    <li><a href="/recruiter/feedback" className="text-slate-500 hover:text-emerald-600 transition">Feedback & Report</a></li>
                  </ul>
                </div>
              )}

              {/* Company */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">About Us</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">Privacy Policy</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">Terms of Service</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">Contact</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">Help Center</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-100 bg-slate-50/50">
              <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                <p>© {new Date().getFullYear()} HireSmart. All rights reserved.</p>
                <p className="flex items-center gap-1">
                  Made with <span className="text-red-400">♥</span> for HireSmart
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </SocketProvider>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
