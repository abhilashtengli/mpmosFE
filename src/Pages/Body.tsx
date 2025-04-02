import { Outlet } from "react-router-dom";


const Body = () => {
  return (
    <div className=" border-black w-full">
      <Outlet />
    </div>
  );
};

export default Body;
