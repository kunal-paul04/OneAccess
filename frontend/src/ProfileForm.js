import React, { useState, useEffect } from 'react';
import './ProfileForm.css';

const ProfileForm = ({
  userName, email, phone, dob, gender, country, state, district, zip, address,
  setDob, setPhone, setGender, setCountry, setState, setDistrict, setZip, setAddress, handleSubmit
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (country) {
      // Fetch states when country is selected
      fetch('http://localhost:8000/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ country_id: country })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Fetched states data:', data); // Debugging line
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
      fetch('http://localhost:8000/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ state_id: state })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Fetched districts data:', data); // Debugging line
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

  return (
    <div className="profile-form">
      <h2 className="section-heading">Personal Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={userName || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Mobile No.:</label>
            <input
              type="text"
              value={phone || ''}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              value={dob || ''}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Gender:</label>
            <select
              className="form-control"
              value={gender || ''}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="form-group">
            <label>Country:</label>
            <select
              className="form-control"
              value={country || ''}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              <option value="99">India</option>
            </select>
          </div>
          <div className="form-group">
            <label>State:</label>
            <select
              className="form-control"
              value={state || ''}
              onChange={(e) => setState(e.target.value)}
              disabled={!states.length}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>District:</label>
            <select
              className="form-control"
              value={district || ''}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!districts.length} // Disable if no districts are available
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>ZIP Code:</label>
            <input
              type="text"
              value={zip || ''}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <textarea
              value={address || ''}
              onChange={(e) => setAddress(e.target.value)}
              rows="4"
              className="textarea"
            />
          </div>
        </div>
        <button type="submit" className="submit-button">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfileForm;
