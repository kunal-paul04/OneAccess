import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './Services.css';

const Services = () => {
    const [userName, setUserName] = useState('');
    const [services, setServices] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }

        // Fetch services data from FastAPI backend
        if (userSession && userSession.email) {
            fetch(`${process.env.REACT_APP_BACKEND_URL}/get_services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_email: userSession.email, // Send email in the request body
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setServices(data.service_details);
                } else {
                    setError("Unexpected response format");
                }
            })
            .catch(error => {
                setError("Error fetching services data");
                console.error("There was an error fetching the services data!", error);
            });
        }
    }, []);

    if (error) {
        return (
            <DashboardLayout userName={userName}>
                <div className="page-header">
                    <h5 className="page-tag">Home &gt; Services</h5>
                    <a href="/AddService"><button className="add-service-btn">+ Add New Service</button></a>
                </div>
                <table className="services-table">
                    <thead>
                        <tr>
                            <th>Website URL/App Domain</th>
                            <th>App Name | Tag</th>
                            <th>Client ID</th>
                            <th>Call Back URL (URI)</th>
                            <th>Modified Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>{error}</td>
                        </tr>
                    </tbody>
                </table>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userName={userName}>
            <div className="page-header">
                <h5 className="page-tag">Home &gt; Services</h5>
                <button className="add-service-btn">+ Add New Service</button>
            </div>
            <table className="services-table">
                <thead>
                    <tr>
                        <th>Website URL/App Domain</th>
                        <th>App Name | Tag</th>
                        <th>Client ID</th>
                        <th>Call Back URL (URI)</th>
                        <th>Modified Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service, index) => (
                        <tr key={index}>
                            <td>{service.website_url}</td>
                            <td>{service.app_name}</td>
                            <td>{service.client_id}</td>
                            <td>{service.callback_url}</td>
                            <td>{service.modified_date}</td>
                            <td>
                                <button>Edit</button>
                                <button>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardLayout>
    );
};

export default Services;
