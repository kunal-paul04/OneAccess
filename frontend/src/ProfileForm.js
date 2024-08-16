// ProfileForm.js
import React from 'react';
import './ProfileForm.css'; // Import the CSS file

const ProfileForm = ({ userName, email, dob, zip, state, district, country, setUserName, setEmail, setDob, setZip, setState, setDistrict, setCountry, handleSubmit }) => {
    return (
        <div className="profile-form">
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Name:</label>
                        <input 
                            type="text" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth:</label>
                        <input 
                            type="date" 
                            value={dob} 
                            onChange={(e) => setDob(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>ZIP Code:</label>
                        <input 
                            type="text" 
                            value={zip} 
                            onChange={(e) => setZip(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>State:</label>
                        <input 
                            type="text" 
                            value={state} 
                            onChange={(e) => setState(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>District:</label>
                        <input 
                            type="text" 
                            value={district} 
                            onChange={(e) => setDistrict(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Country:</label>
                        <input 
                            type="text" 
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)} 
                        />
                    </div>
                </div>
                <button type="submit" className="submit-button">Update Profile</button>
            </form>
        </div>
    );
};

export default ProfileForm;
