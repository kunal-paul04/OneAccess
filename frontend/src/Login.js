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

    fetch("http://localhost:8088/google-login", {
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
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div id="googleSignInButton" style={{ marginTop: '20px' }}></div>
      <GoogleOAuthProvider clientId="703966748664-06lfs5d36m4638v5k83n9t6j8mgtrf7k.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Sign-In failed. Please try again.")}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
