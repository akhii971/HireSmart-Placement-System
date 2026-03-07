import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user/UserNavbar";
import ToastNotifications from "../components/user/ToastNotifications";


export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <UserNavbar />
      <ToastNotifications />
      <Outlet />
    </div>
  );
}
