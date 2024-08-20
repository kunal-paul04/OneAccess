import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './AddService.css';

const AddService = () => {
    const [serviceData, setServiceData] = useState(null);
    const [userName, setUserName] = useState('');
    const [service_name, setService_name] = useState('');
    const [app_key, setApp_key] = useState('');
    const [service_domain, setService_domain] = useState('');
    const [service_uri, setService_uri] = useState('');

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }

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
                setServiceData(data.data);
            } else {
                console.error('Failed to fetch service data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching service data:', error);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const serviceData = {
            service_name: service_name,
            app_key: app_key,
            service_domain: service_domain,
            service_uri: service_uri
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add_service`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData),
            });
            console.log('Response Status:', response.status);
            const responseBody = await response.json();
            console.log('Response Body:', responseBody);

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
                        <input type="text" placeholder="Service Name" name="service_name" id="service_name" onChange={(e) => setService_name(e.target.value)} required />
                        <input type="hidden" name="app_key" value={serviceData.app_key} onChange={(e) => setApp_key(e.target.value)} readOnly />
                        <small>The name of your OAuth 2.0 client. This name is only used to identify the client in the console and will not be shown to end users.</small>
                    </div>

                    <div className="form-section">
                        <label>Service Domain *</label>
                        <input type="url" name="service_domain" placeholder="https://your-app-url.com" onChange={(e) => setService_domain(e.target.value)} required />
                        <small>For use with requests from a browser</small>
                    </div>

                    <div className="form-section">
                        <label>Authorized redirect URIs</label>
                        <div className="form-subsection">
                            <label>URIs *</label>
                            <input type="url" name="service_uri" placeholder="https://your-redirect-url.com" onChange={(e) => setService_uri(e.target.value)} required />
                            {/* <button type="button" className="add-uri">+ ADD URI</button> */}
                        </div>
                        <small>For use with requests from a web server</small>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="save-button">SAVE</button>
                        <button type="button" className="cancel-button">CANCEL</button>
                    </div>
                </form>

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
            </div>
        </DashboardLayout>
    );
};

export default AddService;
