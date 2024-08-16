// Profile.js
import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils'; // Import session handling function

const Profile = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }
    }, []);

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Profile</h5>
        </DashboardLayout>
    );
};

export default Profile;
