import React from 'react';
import './Header.css';

const Header = ({ onLogout }) => {
    return (
        <div className="header">
            <div className="page-title">OneAccess - Single SignOn</div>
            <button className="logout-button" onClick={onLogout}>Logout</button>
        </div>
    );
};

export default Header;
