import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './AddService.css';

const ViewService = () => {
    const [serviceData, setServiceData] = useState(null);
    const [userName, setUserName] = useState('');
    const fetchTriggeredRef = useRef(false);  
    const location = useLocation(); 

    useEffect(() => {
        const userSession = getUserSession();

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }

        const params = new URLSearchParams(location.search);
        const encodedClientId = params.get('client_id');
        const clientId = decodeURIComponent(encodedClientId);
        alert(`Decoded Client ID: ${clientId}`);

        if (!fetchTriggeredRef.current && userSession) {
            fetchTriggeredRef.current = true;

            fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: clientId 
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status_code === 200) {
                    setServiceData({
                        service_name: data.service_name,
                        service_domain: data.service_domain,
                        service_uri: data.service_uri,
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
    }, [location.search]);

    return (
        <DashboardLayout userName={userName}>
            <h5>Home &gt; Add New Service</h5>
            <div className="container">
                <form className="service-form">
                    {serviceData ? (
                        <>
                            <div className="form-section">
                                <label>Service Name *</label>
                                <input 
                                    type="text" 
                                    placeholder="Service Name" 
                                    name="service_name" 
                                    id="service_name" 
                                    value={serviceData.service_name} 
                                    readOnly 
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
                                    value={serviceData.service_domain} 
                                    readOnly 
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
                                        value={serviceData.service_uri} 
                                        readOnly 
                                    />
                                </div>
                                <small>For use with requests from a web server</small>
                            </div>
                        </>
                    ) : (
                        <p>Loading service data...</p>
                    )}
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

export default ViewService;
