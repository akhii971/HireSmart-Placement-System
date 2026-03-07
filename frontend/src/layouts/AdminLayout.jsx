import { Outlet } from "react-router-dom";
import Adminnavbar from "../components/admin/Adminnavbar";
import AdminFooter from "../components/admin/AdminFooter";

export default function AdminLayout() {
  return (
    <>
      <Adminnavbar />
      <div className="min-h-screen">
        <Outlet />
      </div>
      <AdminFooter />
    </>
  );
}
