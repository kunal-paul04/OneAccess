import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './Services.css';

const Services = () => {
    const [userName, setUserName] = useState('');
    const [services, setServices] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [error, setError] = useState(null);
    const fetchTriggeredRef = useRef(false);  // Use ref to track if the fetch has been triggered

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.user_role) {
            setUserName(userSession.name);
            setUserRole(userSession.user_role);
            
        }else {
            setError('User session is not valid or does not have a name.');
        }

        // Fetch services data from FastAPI backend
        if (!fetchTriggeredRef.current && userSession && userSession.email) {
            fetchTriggeredRef.current = true;  // Set ref to true to prevent future triggers

            fetch(`${process.env.REACT_APP_BACKEND_URL}/get_service_list`, {
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
                            <th>App Name</th>
                            <th>Service Domain</th>
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
                {userRole !== "ADMIN-USER" && (
                <a href="/AddService"><button className="add-service-btn">+ Add New Service</button></a>
            )}
            </div>
            <table className="services-table">
                <thead>
                    <tr>
                        <th>App Name</th>
                        <th>Service Domain</th>
                        <th>Client ID</th>
                        <th>Call Back URL (URI)</th>
                        <th>Modified Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service, index) => (
                        <tr key={index}>
                            <td>{service.service_name}</td>
                            <td>{service.service_domain}</td>
                            <td>{service.app_key}</td>
                            <td>{service.service_uri}</td>
                            <td>{service.created_at}</td>
                            <td>
                            <div className="form-buttons">
                            {userRole !== 'ADMIN-USER' && (
                                <button className="services-table button" onClick={() => window.location.href = `/ViewService?client_id=${encodeURIComponent(service.enc_app_key)}`}>View</button>
                            )}
                            {userRole === 'ADMIN-USER' && Number(service.is_approved) !== 1 && (
                                <button className="services-table button" onClick={() => window.location.href = `/ViewService?client_id=${encodeURIComponent(service.enc_app_key)}`}>View</button>
                            )}
                            {Number(service.is_approved) === 1 && userRole === 'ADMIN-USER' && (
                                <button className="add-service-btn" disabled>Approved</button>
                            )}
                            </div> 
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardLayout>
    );
};

export default Services;
