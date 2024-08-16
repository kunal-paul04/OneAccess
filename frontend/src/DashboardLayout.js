import React from 'react';
import './DashboardLayout.css';
import Header from './Header';
import Sidebar from './Sidebar';
import { handleLogout } from './utils/authUtils'; // Import the logout function

const DashboardLayout = ({ children, userName }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <Header onLogout={handleLogout} userName={userName} />
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
