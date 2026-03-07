import { Outlet } from "react-router-dom";
import RecruiterNavbar from "../components/recruiter/recruiternavbar";
import ToastNotifications from "../components/recruiter/ToastNotifications";


export default function RecruiterLayout() {
  return (
    <>
      <RecruiterNavbar />
      <div className="min-h-screen pt-20">
          <ToastNotifications />
          
        <Outlet />
      </div>
    </>
  );
}
