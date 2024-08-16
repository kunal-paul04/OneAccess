import React from 'react';
import './Header.css';
import { handleLogout } from './utils/authUtils'; // Import the logout function

const Header = ({ userName }) => {
    return (
        <div className="header">
            <div className="page-title">Welcome {userName}</div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Header;
