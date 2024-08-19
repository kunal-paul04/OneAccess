import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';
import { getUserSession } from './utils/authUtils';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    
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
        const userSession = getUserSession(); // Get user session

        if (userSession && userSession.name) {
            setUserName(userSession.name);
        }

        fetch(`${process.env.REACT_APP_BACKEND_URL}/get_profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userSession.email, // Send email in the request body
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setProfileData(data.data);
            } else {
                console.error('Failed to fetch profile data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
        });
    }, []);
    
    if (!profileData) {
    return <div>Loading...</div>;
    }

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Profile</h5>
            <ProfileForm
                userName={profileData.name}
                email={profileData.user_email}
                phone={profileData.user_phone}
                dob={profileData.dob}
                gender={profileData.gender}
                country={profileData.country_id}
                state={profileData.state_id}
                district={profileData.city_id}
                zip={profileData.zip}
                address={profileData.address}
                setDob={dob => setProfileData({ ...profileData, dob })}
                setPhone={phone => setProfileData({ ...profileData, phone })}
                setGender={gender => setProfileData({ ...profileData, gender })}
                setCountry={country => setProfileData({ ...profileData, country })}
                setState={state => setProfileData({ ...profileData, state })}
                setDistrict={district => setProfileData({ ...profileData, district })}
                setZip={zip => setProfileData({ ...profileData, zip })}
                setAddress={address => setProfileData({ ...profileData, address })}
                handleSubmit={(event) => {
                    event.preventDefault();
                    // Handle form submission
                    console.log('Form submitted:', profileData);
                }}
            />
        </DashboardLayout>
    );

    // return (
    //     <DashboardLayout userName={userName}>
    //         <h5 className="page-tag">Home &gt; Profile</h5>
    //         <ProfileForm
    //             userName={userName}
    //             email={email}
    //             phone={phone}
    //             dob={dob}
    //             gender={gender}
    //             country={country}
    //             state={state}
    //             district={district}
    //             zip={zip}
    //             address={address}
    //             setDob={setDob}
    //             setPhone={setPhone}
    //             setGender={setGender}
    //             setCountry={setCountry}
    //             setState={setState}
    //             setDistrict={setDistrict}
    //             setZip={setZip}
    //             setAddress={setAddress}
    //             handleSubmit={handleSubmit}
    //         />
    //     </DashboardLayout>
    // );
};

export default Profile;
