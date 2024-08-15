// Dashboard.js
import React, { useEffect } from "react";
import DashboardLayout from './DashboardLayout';
import DashboardAnalytics from './DashboardAnalytics'; // Import the DashboardAnalytics component

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
                        window.google.accounts.id.disableAutoSelect(); 
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
        <DashboardLayout onLogout={handleLogout}>
            <DashboardAnalytics /> {/* Include the analytics component */}
        </DashboardLayout>
    );
};

export default Dashboard;
