import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';
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

    useEffect(() => {
        const userSession = getUserSession();
        
        if (userSession) {
            setUserName(userSession.name || '');
            setEmail(userSession.email || '');
        }
        
        // Fetch profile data
        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:8000/get_profile', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: userSession?.email || '' })
                });
                const data = await response.json();
                
                if (response.ok) {
                    setPhone(data.user_phone || '');
                    setDob(data.dob || '');
                    setGender(data.gender || '');
                    setCountry(data.country_id || '');
                    setState(data.state_id || '');
                    setDistrict(data.city_id || '');
                    setZip(data.zip || '');
                    setAddress(data.address || '');
                } else {
                    console.error('Failed to fetch profile data:', data);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        
        fetchProfileData();
    }, []);

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
            const response = await fetch(`http://localhost:8000/update-profile/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            console.log('Response Status:', response.status);
            const responseBody = await response.json();
            console.log('Response Body:', responseBody);

            if (response.ok) {
                alert("Profile updated successfully!");
            } else {
                alert(`Error: ${responseBody.detail}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. Please try again later.");
        }
    };

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Profile</h5>
            <ProfileForm
                userName={userName}
                email={email}
                phone={phone}
                dob={dob}
                gender={gender}
                country={country}
                state={state}
                district={district}
                zip={zip}
                address={address}
                setDob={setDob}
                setPhone={setPhone}
                setGender={setGender}
                setCountry={setCountry}
                setState={setState}
                setDistrict={setDistrict}
                setZip={setZip}
                setAddress={setAddress}
                handleSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default Profile;
