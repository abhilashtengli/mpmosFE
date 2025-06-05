import { Outlet } from "react-router-dom";

const AdminBody = () => {
  return (
    <div className="">
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminBody;
