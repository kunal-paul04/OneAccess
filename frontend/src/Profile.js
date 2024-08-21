import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from './DashboardLayout';
import './Profile.css';
import { getUserSession } from './utils/authUtils';

const Profile = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [zip, setZip] = useState('');
    const [address, setAddress] = useState('');
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    const [isPhoneReadOnly, setIsPhoneReadOnly] = useState(false);
    const [isDobReadOnly, setIsDobReadOnly] = useState(false);
    const [isGenderReadOnly, setIsGenderReadOnly] = useState(false);
    const [isCountryReadOnly, setIsCountryReadOnly] = useState(false);
    const [isStateReadOnly, setIsStateReadOnly] = useState(false);
    const [isDistrictReadOnly, setIsDistrictReadOnly] = useState(false);
    const [isZipReadOnly, setIsZipReadOnly] = useState(false);
    const [isAddressReadOnly, setIsAddressReadOnly] = useState(false);


    const hasFetchedProfile = useRef(false);

    useEffect(() => {
        const userSession = getUserSession();

        if (userSession) {
            setUserName(userSession.name || '');
            setEmail(userSession.email || '');
        }

        // Fetch profile data only if it hasn't been fetched yet
        if (!hasFetchedProfile.current) {
            hasFetchedProfile.current = true; // Set the ref to true
            const fetchProfileData = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_profile`, {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: userSession?.email || '' })
                    });

                    const data = await response.json();

                    if (data.status_code === 200) {
                        const userData = data.data;

                        setPhone(userData.user_phone || '');
                        setDob(userData.dob || '');
                        setGender(userData.gender || '');
                        setCountry(userData.country_id || '');
                        setState(userData.state_id || '');
                        setDistrict(userData.city_id || '');
                        setZip(userData.zip || '');
                        setAddress(userData.address || '');

                        // Disable fields if they have data
                        if (userData.user_phone) setIsPhoneReadOnly(true);
                        if (userData.dob) setIsDobReadOnly(true);
                        if (userData.gender) setIsGenderReadOnly(true);
                        if (userData.country_id) setIsCountryReadOnly(true);
                        if (userData.state_id) setIsStateReadOnly(true);
                        if (userData.city_id) setIsDistrictReadOnly(true);
                        if (userData.zip) setIsZipReadOnly(true);
                        if (userData.address) setIsAddressReadOnly(true);
                    } else {
                        console.error('Failed to fetch profile data:', data);
                    }
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                } finally {
                    setLoading(false); // Set loading to false once data is fetched
                }
            };

            fetchProfileData();
        } else {
            setLoading(false); // Ensure loading is set to false if already fetched
        }
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const profileData = {
            dob,
            gender,
            country_id: country,
            state_id: state,
            city_id: district,
            user_phone: phone,
            zip,
            address
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-profile/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            const responseBody = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                window.location.href = "/profile";
            } else {
                alert(`Error: ${responseBody.detail}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. Please try again later.");
        }
    };

    // Render loading state until profile data is fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Profile</h5>
            <div className="profile-form">
                <h2 className="section-heading">Personal Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={userName || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={email || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile No.:</label>
                            <input
                                type="text"
                                value={phone || ''}
                                onChange={(e) => setPhone(e.target.value)}
                                readOnly={isPhoneReadOnly}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth:</label>
                            <input
                                type="date"
                                value={dob || ''}
                                onChange={(e) => setDob(e.target.value)}
                                readOnly={isDobReadOnly}
                            />
                        </div>
                        <div className="form-group">
                            <label>Gender:</label>
                            <select
                                className="form-control"
                                value={gender || ''}
                                onChange={(e) => setGender(e.target.value)}
                                disabled={isGenderReadOnly}
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
                                disabled={isCountryReadOnly}
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
                                disabled={isStateReadOnly}
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
                                disabled={isDistrictReadOnly}
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
                                readOnly={isZipReadOnly}
                            />
                        </div>
                        <div className="form-group">
                            <label>Address:</label>
                            <textarea
                                value={address || ''}
                                onChange={(e) => setAddress(e.target.value)}
                                rows="4"
                                className="textarea"
                                readOnly={isAddressReadOnly}
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-button">Update Profile</button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
