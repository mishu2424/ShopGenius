import React, { useRef } from 'react';
import Navbar from '../components/Navbar/Navbar';
import DashboardNavbar from '../components/Navbar/DashboardNavbar';
import Footer from '../components/Footer/Footer';
import { Outlet } from 'react-router-dom';

const Main = () => {
    const navbarRef=useRef();
    return (
        <div className='font-roboto'>
            <Navbar navbarRef={navbarRef}/>
            <div className='min-h-[calc(100vh-472px)]'>
                <Outlet/>
            </div>
            <Footer navbarRef={navbarRef}/>
        </div>
    );
};

export default Main;