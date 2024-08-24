import React from 'react';
import { useLocation } from 'react-router-dom';
import "./ClientLogin.css";

const ClientLogin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const clientId = params.get('client_id');
  const transactionId = params.get('channel_transaction');
  const origin = params.get('origin');
  
  return (
    <div className="login-wrapper">
      <div className="form-container">
        <h2 className="title">Sign In</h2>
        <form>
          <input className="input" type="email" placeholder="Email address" />
          <input className="input" type="password" placeholder="Password" />
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <button className="button" type="submit">Sign in</button>
          <div className="spacing"></div> 
          <div className="oneaccess-container">
          <a href="#" className="oneaccess-link">
            <img src="/OneAccess.png" alt="OneAccess Icon" className="oneaccess-icon" />
            <span className="oneaccess-text">Continue with OneAccess</span>
            </a>
            </div>
        </form>
        <a className="link" href="#">Forgot your password?</a>
      </div>
    </div>
  );
};

export default ClientLogin;
