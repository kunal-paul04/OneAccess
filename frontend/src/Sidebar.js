import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
    return (
        <div className="sidebar">
            <h2>OneAccess Menu</h2>
            <a href="#">Profile</a>
            <a href="#">Settings</a>
            <a href="#">Reports</a>
            <a href="#" onClick={onLogout}>Logout</a>
        </div>
    );
};

export default Sidebar;
