import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import PageTabs from '../components/PageTabs';
import './DashboardLayout.css';


const DashboardLayout = () => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    // Check if we are on a "creation" page
    const isCreationPage = location.pathname === '/organizations/new' || location.pathname === '/projects/new';

    useEffect(() => {
        const handleScroll = () => {
            // Threshold for hiding the header
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isCreationPage) {
        return (
            <div className="dashboard-layout creation-mode">
                <main className="dashboard-main">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <div className={`dashboard-header-wrapper ${isScrolled ? 'header-hidden' : ''}`}>
                <Header />
                <PageTabs />
            </div>
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
