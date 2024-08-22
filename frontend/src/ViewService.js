import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './AddService.css';

const ViewService = () => {
    const [userName, setUserName] = useState('');
    const fetchTriggeredRef = useRef(false);  
    const location = useLocation(); 
    const navigate = useNavigate(); 
    const [loading, setLoading] = useState(true); // Loading state
    const [service_name, setServiceName] = useState([]);
    const [service_domain, setServiceDomain] = useState([]);
    const [service_uri, setServiceUri] = useState([]);
    const [app_key, setAppKey] = useState([]);
    const [app_secret, setAppSecret] = useState([]);
    const [created_at, setCreated] = useState([]);

    const [isServiceNameReadOnly, setIsServiceNameReadOnly] = useState(false);
    const [isServiceDomainReadOnly, setIsServiceDomainReadOnly] = useState(false);
    const [isServiceUriReadOnly, setIsServiceUriReadOnly] = useState(false);

    useEffect(() => {
        const userSession = getUserSession();

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }

        const params = new URLSearchParams(location.search);
        const encodedClientId = params.get('client_id');
        const clientId = decodeURIComponent(encodedClientId);

        if (!fetchTriggeredRef.current && userSession) {
            fetchTriggeredRef.current = true;

            const fetchServiceData = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_client`, {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ client_id: clientId || '' })
                    });

                    const data = await response.json();

                    if (data.status_code === 200) {
                        const serviceData = data.data;

                        setServiceName(serviceData.service_name || '');
                        setServiceDomain(serviceData.service_domain || '');
                        setServiceUri(serviceData.service_uri || '');
                        setAppKey(serviceData.app_key || '');
                        setAppSecret(serviceData.app_secret || '');
                        setCreated(serviceData.created_at || '');

                        // Disable fields if they have data
                        if (serviceData.service_name) setIsServiceNameReadOnly(true);
                        if (serviceData.service_domain) setIsServiceDomainReadOnly(true);
                        if (serviceData.service_uri) setIsServiceUriReadOnly(true);
                    } else {
                        console.error('Failed to fetch service data:', data);
                    }
                } catch (error) {
                    console.error('Failed to fetch service data:', error);
                } finally {
                    setLoading(false); // Set loading to false once data is fetched
                }
            };

            fetchServiceData();
        }
    }, [location.search]);

    const approveService = async () => {
        const userSession = getUserSession();
        if (!userSession || !app_key) {
            alert(`Missing required information.\nUser Email: ${userSession?.email || "N/A"}\nApp Key: ${app_key || "N/A"}`);
        return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve_service`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ client_email: userSession.email, client_id: app_key })
            });

            const data = await response.json();

            if (data.status_code === 200) {
                console.log('Service approved successfully');
                navigate("/Services");
            } else {
                console.error('Failed to approve service:', data);
            }
        } catch (error) {
            console.error('Failed to approve service:', error);
        }
    };

    // Render loading state until profile data is fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <DashboardLayout userName={userName}>
            <h5>Home &gt; View Service</h5>
            <div className="container">
                <form className="service-form">
                            <div className="form-section">
                                <label>Service Name *</label>
                                <input type="text" placeholder="Service Name" ame="service_name" id="service_name" value={service_name || ''} readOnly={isServiceNameReadOnly} />
                                <small>The name of your OAuth 2.0 client. This name is only used to identify the client in the console and will not be shown to end users.</small>
                            </div>

                            <div className="form-section">
                                <label>Service Domain *</label>
                                <input type="url" name="service_domain" placeholder="https://your-app-url.com" value={service_domain || ''} readOnly={isServiceDomainReadOnly} />
                                <small>For use with requests from a browser</small>
                            </div>

                            <div className="form-section">
                                <label>Authorized redirect URIs</label>
                                <input type="url" name="service_uri" placeholder="https://your-redirect-url.com" value={service_uri || ''} readOnly={isServiceUriReadOnly} />
                                <small>For use with requests from a web server</small>
                            </div>
                            <div className="form-buttons">
                            <button onClick={approveService} className="approve-button">Approve</button>
                        </div>
                </form>

                    <div className="additional-info">
                        <div className="info-section">
                            <label>App Key</label>
                            <p>{app_key}</p>
                        </div>

                        <div className="info-section">
                            <label>App Secrets</label>
                            <p>{app_secret}</p>
                        </div>

                        <div className="info-section">
                            <label>Creation date</label>
                            <p>{created_at}</p>
                        </div>
                    </div>
                    
            </div>
        </DashboardLayout>
    );
};

export default ViewService;
