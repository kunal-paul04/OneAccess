import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>OneAccess</h2>
            <a href="/Dashboard">Dashboard</a>
            <a href="/Services">Service Request</a>
            <a href="/Profile">Profile</a>
            {/* <a href="#">Reports</a> */}
        </div>
    );
};

export default Sidebar;
