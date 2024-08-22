import React from "react";
import "./ClientRegister.css";
//import OneAccessIcon from '.public/OneAccess.ico';

const ClientRegister = () => {
  return (
    <div className="register-wrapper">
      <div className="form-container">
        <h2 className="title">Sign Up</h2>
        <form>
          <input className="input" type="text" placeholder="Name" />
          <input className="input" type="email" placeholder="Email address" />
          <input className="input" type="date" placeholder="Date of Birth" />
          <input className="input" type="text" placeholder="Mobile Number" />
          <select className="dropdown">
            <option>Select a country</option>
          </select>
          <select className="dropdown">
            <option>Select a state</option>
          </select>
          <select className="dropdown">
            <option>Select a district</option>
          </select>
          <button className="button" type="submit">Sign up</button>
          <div className="spacing"></div> 
          <div className="oneaccess-container">
          <a href="#" className="oneaccess-link">
            <img src="/OneAccess.png" alt="OneAccess Icon" className="oneaccess-icon" />
            <span className="oneaccess-text">Continue with OneAccess</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegister;
