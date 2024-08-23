// Dashboard.js
import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import DashboardAnalytics from './DashboardAnalytics';
import { getUserSession } from './utils/authUtils'; // Import session handling function

const Dashboard = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const userSession = getUserSession(); // Get user session
        //console.log("Retrieved User Session:", userSession);

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }
    }, []);

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Dashboard</h5>
            <DashboardAnalytics />
        </DashboardLayout>
    );
};

export default Dashboard;
