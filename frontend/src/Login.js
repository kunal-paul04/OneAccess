import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Login.css';
import { saveUserSession } from './utils/authUtils';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // State to manage loading spinner

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous error
        setLoading(true); // Show loading spinner

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password}),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // After successful login or Google sign-in
                saveUserSession({
                    txn: data.txn,
                    email: data.email,
                    name: data.name,
                    user_role: data.user_role,
                    googleLogin: 0
                });

                window.location.href = "/dashboard";
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const handleGoogleSuccess = (response) => {
        setLoading(true); // Show loading spinner
        const idToken = response.credential;

        fetch(`${process.env.REACT_APP_BACKEND_URL}/google-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_token: idToken }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                // After successful login or Google sign-in
                saveUserSession({
                    txn: data.txn,
                    email: data.email,
                    user_role: data.user_role,
                    name: data.name,
                    googleLogin: 1
                });

                window.location.href = "/dashboard";
            } else {
                setError("Google Sign-In failed. Please try again.");
            }
        })
        .catch((err) => {
            setError("An error occurred. Please try again later.");
        })
        .finally(() => {
            setLoading(false); // Hide loading spinner
        });
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>OneAccess- Login</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading} // Disable input when loading
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Enter your Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading} // Disable input when loading
                    />
                </div>
                {/* <a href="#" className="forgot-password">Forget password?</a> */}
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                </button>
                <p className="signup-link">
                    Don't have an Account? <a href="/register">Sign up</a>
                </p>
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Sign-In failed. Please try again.")}
                        render={(renderProps) => (
                            <div
                                className="google-signin-button"
                                onClick={renderProps.onClick}
                                disabled={loading} // Disable button when loading
                            >
                                {loading ? (
                                    <div className="loading-spinner"></div> // Loader during Google Sign-In
                                ) : (
                                    <>
                                        <img src="path-to-google-logo.png" alt="Google Logo" />
                                        <span>Sign in with Google</span>
                                    </>
                                )}
                            </div>
                        )}
                    />
                </GoogleOAuthProvider>
            </form>
            {loading && <div className="overlay"><div className="loading-spinner"></div></div>}
        </div>
    );
};

export default Login;
