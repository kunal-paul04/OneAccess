import React from 'react';
import './DashboardLayout.css';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, onLogout }) => {
    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} />
            <div className="main-content">
                <Header onLogout={onLogout} />
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
