import React, { useEffect } from "react";
import './Dashboard.css';

const Dashboard = () => {
    useEffect(() => {
        const initGoogleIdentityServices = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        console.log("Google Identity Services callback response:", response);
                    }
                });
                console.log("Google Identity Services initialized.");
            } else {
                console.error("Google Identity Services script not loaded.");
            }
        };

        // Load the Google Identity Services script if not already loaded
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogleIdentityServices;
        document.body.appendChild(script);
    }, []);

    const handleLogout = () => {
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        const isGoogleLogin = userSession?.googleLogin;
        const txn = userSession?.txn;
        const email = userSession?.email;

        fetch("http://localhost:8000/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isGoogleLogin, txn, email })
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                localStorage.removeItem('userSession');

                if (isGoogleLogin) {
                    if (window.google) {
                        window.google.accounts.id.disableAutoSelect(); // Disable auto-select if needed
                        window.google.accounts.id.revoke(process.env.REACT_APP_GOOGLE_CLIENT_ID, () => {
                            console.log('User signed out from Google.');
                            window.location.href = "/";
                        });
                    } else {
                        console.error('Google Identity Services not initialized.');
                        window.location.href = "/";
                    }
                } else {
                    window.location.href = "/";
                }
            } else {
                console.error("Logout failed.");
            }
        })
        .catch((err) => {
            console.error("An error occurred during logout.", err);
        });
    };

    return (
        <div className="dashboard">
            <nav className="sidebar">
                <h2>Dashboard Menu</h2>
                <ul>
                    <li><a href="#profile">Profile</a></li>
                    <li><a href="#settings">Settings</a></li>
                    <li><a href="#reports">Reports</a></li>
                    <li><a href="#logout" onClick={handleLogout}>Logout</a></li>
                </ul>
            </nav>
            <div className="content">
                <header className="header">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
                <div className="profile-section">
                    <img src="profile-picture-url" alt="Profile" className="profile-pic" />
                    <h1>Welcome to the Dashboard</h1>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
