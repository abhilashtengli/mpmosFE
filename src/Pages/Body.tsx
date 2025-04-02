import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";

const Body = () => {
  return (
    <div className="">
      <Navbar />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default Body;
