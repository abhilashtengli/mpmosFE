import Navbar from "@/components/navbar";
import { Footer } from "@/components/public-components/footer";
import { Outlet } from "react-router-dom";

const Body = () => {
  return <div className="">
      <Navbar />
      <div className="">
        <Outlet />
    </div>
    <Footer/>
    </div>;
};

export default Body;
