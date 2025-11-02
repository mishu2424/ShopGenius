import React, { useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import DashboardNavbar from "../components/Navbar/DashboardNavbar";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import SplashScreen from "../components/Shared/SplashScreen";
import useMyLocation from "../hooks/useMyLocation";
import LoginPromptModal from "../components/Modal/LoginPromptModal";

const Main = () => {
  const navbarRef = useRef();
  const { location, error, getLocation } = useMyLocation();

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
  

  if(!location) return getLocation();
  console.log(location);
  return (
    <div className="font-roboto">
      <Navbar navbarRef={navbarRef} />
      <div className="min-h-[calc(100vh-472px)]">
        <Outlet />
      </div>
      <LoginPromptModal/>
      <Footer navbarRef={navbarRef} />
    </div>
  );
};

export default Main;
