import React, { useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import DashboardNavbar from "../components/Navbar/DashboardNavbar";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import SplashScreen from "../components/Shared/SplashScreen";

const Main = () => {
  const navbarRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakePromise = new Promise(
      (resolve) => setTimeout(resolve, 2000) // simulate fetching/config loading
    );
    fakePromise.then(() => setLoading(false));
  }, []);

  if (loading) {
    return <SplashScreen />; // ⏳ Show logo until promise resolves
  }
  return (
    <div className="font-roboto">
      <Navbar navbarRef={navbarRef} />
      <div className="min-h-[calc(100vh-472px)]">
        <Outlet />
      </div>
      <Footer navbarRef={navbarRef} />
    </div>
  );
};

export default Main;
