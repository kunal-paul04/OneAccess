import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import "./ClientLogin.css";

const ClientLogin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading spinner

  const clientId = params.get('client_id');
  const transactionId = params.get('channel_transaction');
  const origin = params.get('origin');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error
    setLoading(true); // Show loading spinner

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/client_login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, clientId, transactionId, origin}),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // After successful login or Google sign-in
        const redirectURL = `${data.redirect_uri}?token=${data.id_token}&error=0`;
    
        // Navigate to the generated URL
        window.location.href = redirectURL;
      } else {
        if (data.redirectURL) {
          // After successful login or Google sign-in
          const redirectURL = `${data.redirect_uri}?token=0&error=${data.redirectURL}`;
      
          // Navigate to the generated URL
          window.location.href = redirectURL;
        } else {
          setError("Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  
  return (
    <div className="login-wrapper">
      <div className="form-container">
        <h2 className="title">Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input className="input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
          {/* <label>
            <input type="checkbox" /> Remember me
          </label> */}
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Loading..." : "Sign in"}
          </button>
          <div className="spacing"></div> 
          <div className="oneaccess-container">
            {/* <a href="#" className="oneaccess-link">
              <img src="/OneAccess.png" alt="OneAccess Icon" className="oneaccess-icon" />
              <span className="oneaccess-text">Continue with OneAccess</span>
            </a> */}
          </div>
        </form>
        {/* <a className="link" href="#">Forgot your password?</a> */}
      </div>
    </div>
  );
};

export default ClientLogin;
