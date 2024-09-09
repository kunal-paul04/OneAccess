import React, { useState } from 'react';
import './Register.css';
import { useLocation } from 'react-router-dom';
import { saveUserSession } from './utils/authUtils';

const Register = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);  // Added loading state

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);  // Start spinner

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, gender, dob, mobile }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Registration successful! Please check your email to verify your account.');
                setError('');
                saveUserSession({
                    txn: data.txn,
                    email: data.email,
                    user_role: data.user_role,
                    googleLogin: 0
                });
                window.location.href = '/profile';
            } else {
                setError(data.detail || 'Registration failed');
                setSuccessMessage('');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
            setSuccessMessage('');
        } finally {
            setLoading(false);  // Stop spinner
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleRegister}>
                <h2>OneAccess - Register Here</h2>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        required
                        value={email}
                        readOnly
                    />
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="date"
                        placeholder="Date of Birth"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="input-group">
                    <input
                        type="tel"
                        placeholder="Mobile Number"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" className="register-btn" disabled={loading}>  {/* Disable during loading */}
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <p className="signin-link">
                    Already have an Account? <a href="/login">Sign In</a>
                </p>
            </form>
            {loading && <div className="overlay"><div className="loading-spinner"></div></div>}  {/* Spinner */}
        </div>
    );
};

export default Register;
