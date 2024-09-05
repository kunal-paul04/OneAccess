import React, { useState } from 'react';
import {  } from 'react-router-dom'; // useNavigate
import './Register.css';
import { saveUserSession } from './utils/authUtils';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await response.json();
            //console.log("register log:", data)
            if (response.ok && data.success) {
                setSuccessMessage('Registration successful! Please check your email to verify your account.');
                setError('');
                localStorage.setItem('userSession', JSON.stringify({
                    txn: data.txn,
                    email: data.email,
                    user_role: data.user_role,
                    googleLogin: 0 // Flag indicating not login via Google account
                }));
                // Save session data
                saveUserSession({
                    txn: data.txn,
                    email: data.email,
                    name: data.name, // Assuming the response contains the user's name
                    user_role: data.user_role, // Assuming the response contains the user's role
                    googleLogin: data.googleLogin || 0 // If applicable
                });
                window.location.href = "/profile";
            } else {
                setError(data.detail || 'Registration failed');
                setSuccessMessage('');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
            setSuccessMessage('');
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
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="input-group password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                        className={`toggle-password ${showPassword ? "fa fa-eye-slash" : "fa fa-eye"}`}
                        onClick={() => setShowPassword(!showPassword)}
                    ></span>
                </div>
                <div className="input-group password-wrapper">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                        className={`toggle-password ${showConfirmPassword ? "fa fa-eye-slash" : "fa fa-eye"}`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    ></span>
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" className="register-btn">Register</button>
                <p className="signup-link">
                   Already have an Account? <a href="/login">Sign In</a>
                </p>
            </form>
        </div>
    );
};

export default Register;
