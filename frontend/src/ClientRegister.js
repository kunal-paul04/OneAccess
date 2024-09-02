import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // useNavigate
import "./ClientRegister.css";
//import OneAccessIcon from '.public/OneAccess.ico';

const ClientRegister = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState({});

  const clientId = params.get('client_id');
  const transactionId = params.get('channel_transaction');
  const origin = params.get('origin');
  const email = params.get('user');

  useEffect(() => {
    if (country) {
        // Fetch states when country is selected
        fetch(`${process.env.REACT_APP_BACKEND_URL}/states`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ country_id: country })
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.states) {
                    setStates(data.states.map((state, index) => ({ id: index + 1, name: state })));
                } else {
                    setStates([]);
                    console.error('States data is not in the expected format:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching states:', error);
                setStates([]);
            });
    } else {
        setStates([]);
    }
  }, [country]);

  useEffect(() => {
    if (state) {
        // Fetch districts when state is selected
        fetch(`${process.env.REACT_APP_BACKEND_URL}/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ state_id: state })
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.districts) {
                    setDistricts(data.districts.map((district, index) => ({ id: index + 1, name: district })));
                } else {
                    setDistricts([]);
                    console.error('Districts data is not in the expected format:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching districts:', error);
                setDistricts([]);
            });
    } else {
        setDistricts([]);
    }
  }, [state]);

  const validateForm = () => {
    const errors = {};

    // Name validation: only letters and spaces, max 100 characters
    if (!/^[a-zA-Z\s]{1,100}$/.test(userName)) {
        errors.userName = 'Name should only contain letters and spaces, up to 100 characters.';
    }

    // Mobile number validation: starts with 6-9, exactly 10 digits
    if (!/^[6-9]\d{9}$/.test(phone)) {
        errors.phone = 'Mobile number should start with 6-9 and contain exactly 10 digits.';
    }

    // Date of Birth validation: between 01-01-1990 and 01-01-2015
    const dobDate = new Date(dob);
    const minDate = new Date('1990-01-01');
    const maxDate = new Date('2015-01-01');
    
    if (dob && (dobDate < minDate || dobDate > maxDate)) {
        errors.dob = 'Date of Birth must be between 01-01-1990 and 01-01-2015.';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return; // Stop submission if validation fails
    }

    const userData = {
        user_email: email,
        city_id: district,
        country_id: country,
        dob,
        name: userName,
        state_id: state,
        user_phone: phone,
        clientId,
        transactionId,
        origin
    };

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/client_registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const responseBody = await response.json();

        if (response.ok && responseBody.success) {
          // After successful login or Google sign-in
          const redirectURL = `${responseBody.redirect_uri}?token=${responseBody.id_token}&error=0`;
      
          // Navigate to the generated URL
          window.location.href = redirectURL;
        } else {
          if (responseBody.redirectURL) {
            // After successful registration or Google sign-in
            const redirectURL = `${responseBody.redirect_uri}?token=0&error=${responseBody.redirectURL}`;
        
            // Navigate to the generated URL
            window.location.href = redirectURL;
          } else {
            errors.registration = "Registration failed. Please check your credentials.";
          }
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile. Please try again later.");
    }
  };

  // Render loading state until profile data is fetched
  // if (loading) {
  //     return <div>Loading...</div>;
  // }

  return (
    <div className="register-wrapper">
      <div className="form-container">
        <h2 className="title">Sign Up</h2>
        {errors.registration && <div className="error-message">{errors.registration}</div>}
        <form onSubmit={handleSubmit}>
          <input className="input" type="text" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          {errors.userName && <div className="error">{errors.userName}</div>}
          <input className="input" type="email" placeholder="Email address" value={email} readOnly required />
          {errors.email && <div className="error">{errors.email}</div>}
          <input className="input" type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} required />
          {errors.userName && <div className="error">{errors.dob}</div>}
          <input className="input" type="text" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          {errors.phone && <div className="error">{errors.phone}</div>}
          <select className="dropdown" value={country || ''} onChange={(e) => setCountry(e.target.value)} >
            <option value="">Select Country</option>
            <option value="99">India</option>
          </select>
          {errors.country && <div className="error">{errors.country}</div>}
          <select className="dropdown" value={state || ''} onChange={(e) => setState(e.target.value)} >
            <option value="">Select State</option>
            {states.map((state) => (
            <option key={state.id} value={state.id}>
                {state.name}
            </option>
            ))}
          </select>
          {errors.state && <div className="error">{errors.state}</div>}
          <select className="dropdown" value={district || ''} onChange={(e) => setDistrict(e.target.value)} >
            <option value="">Select District</option>
            {districts.map((district) => (
            <option key={district.id} value={district.id}>
                {district.name}
            </option>
            ))}
          </select>
          {errors.district && <div className="error">{errors.district}</div>}
          <button className="button" type="submit">Sign up</button>
          <div className="spacing"></div> 
          {/* <div className="oneaccess-container">
            <a href="#" className="oneaccess-link">
              <img src="/OneAccess.png" alt="OneAccess Icon" className="oneaccess-icon" />
              <span className="oneaccess-text">Continue with OneAccess</span>
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default ClientRegister;
