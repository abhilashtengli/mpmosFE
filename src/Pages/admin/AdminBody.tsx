import { Sidebar } from "@/components/sidebar";
import { Outlet } from "react-router-dom";

const AdminBody = () => {
  return <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>;
};

export default AdminBody;
