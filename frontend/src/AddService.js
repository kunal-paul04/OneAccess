import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './AddService.css';

const AddService = () => {
    const [serviceData, setServiceData] = useState(null);
    const [userName, setUserName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [serviceDomain, setServiceDomain] = useState('');
    const [serviceUri, setServiceUri] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const fetchTriggeredRef = useRef(false);  // Use ref to track if the fetch has been triggered

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
            setClientEmail(userSession.email);
        }

        // Only trigger the fetch if it hasn't been triggered yet
        if (!fetchTriggeredRef.current && userSession && userSession.email) {
            fetchTriggeredRef.current = true;  // Set ref to true to prevent future triggers

            fetch(`${process.env.REACT_APP_BACKEND_URL}/generate_client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_email: userSession.email, // Send email in the request body
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setServiceData({
                        app_key: data.app_key,
                        app_secret: data.app_secret,
                        created_at: data.created_at
                    });
                } else {
                    console.error('Failed to fetch service data:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching service data:', error);
            });
        }
    }, []);  // Empty dependency array to run only once

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!serviceData || !clientEmail) {
            alert("Required data is missing.");
            return;
        }

        const serviceDataToSend = {
            service_name: serviceName,
            app_key: serviceData.app_key,
            service_domain: serviceDomain,
            service_uri: serviceUri,
            client_email: clientEmail  // Include client_email in the submission
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add_service`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceDataToSend),
            });
            const responseBody = await response.json();

            if (response.ok) {
                alert("Service has been registered!");
                window.location.href = "/services";
            } else {
                alert(`Error: ${responseBody.detail}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. Please try again later.");
        }
    };

    return (
        <DashboardLayout userName={userName}>
            <h5>Home &gt; Add New Service</h5>
            <div className="container">
                <form className="service-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label>Service Name *</label>
                        <input 
                            type="text" 
                            placeholder="Service Name" 
                            name="service_name" 
                            id="service_name" 
                            value={serviceName} 
                            onChange={(e) => setServiceName(e.target.value)} 
                            required 
                        />
                        <input type="hidden" name="app_key" value={serviceData?.app_key || ''} readOnly />
                        <small>The name of your OAuth 2.0 client. This name is only used to identify the client in the console and will not be shown to end users.</small>
                    </div>

                    <div className="form-section">
                        <label>Service Domain *</label>
                        <input 
                            type="url" 
                            name="service_domain" 
                            placeholder="https://your-app-url.com" 
                            value={serviceDomain} 
                            onChange={(e) => setServiceDomain(e.target.value)} 
                            required 
                        />
                        <small>For use with requests from a browser</small>
                    </div>

                    <div className="form-section">
                        <label>Authorized redirect URIs</label>
                        <div className="form-subsection">
                            <label>URIs *</label>
                            <input 
                                type="url" 
                                name="service_uri" 
                                placeholder="https://your-redirect-url.com" 
                                value={serviceUri} 
                                onChange={(e) => setServiceUri(e.target.value)} 
                                required 
                            />
                        </div>
                        <small>For use with requests from a web server</small>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="save-button">SAVE</button>
                        <button type="button" className="cancel-button" onClick={() => window.location.href = "/services"}>CANCEL</button>
                    </div>
                </form>

                {serviceData && (
                    <div className="additional-info">
                        <div className="info-section">
                            <label>App Key</label>
                            <p>{serviceData.app_key}</p>
                        </div>

                        <div className="info-section">
                            <label>App Secrets</label>
                            <p>{serviceData.app_secret}</p>
                        </div>

                        <div className="info-section">
                            <label>Creation date</label>
                            <p>{serviceData.created_at}</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AddService;
