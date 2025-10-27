import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import { useState } from "react";

const DashboardLayout = () => {
  //   const loc = useLocation();
  // console.log('pathname:', loc.pathname);
  const [isActive, setActive] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="">
        <Sidebar isActive={isActive} setActive={setActive} />
      </div>
      <div className={`flex-1 ${isActive && "md:ml-64"} mt-20`}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
