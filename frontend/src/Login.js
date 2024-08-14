import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        fetch("http://localhost:8000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
              window.location.href = "/dashboard";
            } else {
              setError("Login failed. Please check your credentials.");
            }
        })
        .catch((err) => {
            setError("An error occurred. Please try again later.");
        });
    };

    const handleGoogleSuccess = (response) => {
        const idToken = response.credential;

        fetch("http://localhost:8000/google-login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_token: idToken }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                window.location.href = "/dashboard";
            } else {
                setError("Google Sign-In failed. Please try again.");
            }
        })
        .catch((err) => {
            setError("An error occurred. Please try again later.");
        });
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>OneAccess- Login</h2>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Enter your Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="#" className="forgot-password">Forget password?</a>
                </div>
                <button type="submit" className="login-btn">Login</button>
                <p className="signup-link">
                    Don't have an Account? <a href="/register">Sign up</a>
                </p>
                <GoogleOAuthProvider clientId="703966748664-06lfs5d36m4638v5k83n9t6j8mgtrf7k.apps.googleusercontent.com">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Sign-In failed. Please try again.")}
                    />
                </GoogleOAuthProvider>
            </form>
        </div>
    );
};

export default Login;
