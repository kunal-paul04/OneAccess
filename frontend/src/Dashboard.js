import React from "react";
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>Welcome to Your Dashboard</h1>
            {/* Use a more sophisticated design here, like a grid, cards, etc. */}
            <div className="content">
                <p>This is where you can manage your data, settings, etc.</p>
            </div>
        </div>
    );
};

export default Dashboard;
