import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import { getUserSession } from './utils/authUtils';
import './AddService.css';

const AddService = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }
    }, []);

    return (
        <DashboardLayout userName={userName}>
            <h5>Home &gt; Add New Service</h5>
            <div className="container">
                <form className="service-form">
                    <div className="form-section">
                        <label>Service Name *</label>
                        <input type="text" placeholder="Service Name" required />
                        <small>The name of your OAuth 2.0 client. This name is only used to identify the client in the console and will not be shown to end users.</small>
                    </div>

                    <div className="form-section">
                        <label>Service Domain *</label>
                        <input type="url" placeholder="https://your-app-url.com" required />
                        <small>For use with requests from a browser</small>
                    </div>

                    <div className="form-section">
                        <label>Authorized redirect URIs</label>
                        <div className="form-subsection">
                            <label>URIs 1 *</label>
                            <input type="url" placeholder="https://your-redirect-url.com" required />
                            <button type="button" className="add-uri">+ ADD URI</button>
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
                        <p>703966748664-06lf5s63m4638v5k83n9t6j8mgtrf7k.apps.googleusercontent.com</p>
                    </div>

                    <div className="info-section">
                        <label>App Secrets</label>
                        <p>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</p>
                    </div>

                    <div className="info-section">
                        <label>Creation date</label>
                        <p>August 11, 2024 at 12:54:07 PM GMT+5</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddService;
