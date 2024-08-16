import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';
import { getUserSession } from './utils/authUtils';

const Profile = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [zip, setZip] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        const userSession = getUserSession();
        // if (userSession && userSession.name) {
        //     setUserName(userSession.name);
        // }

        if (userSession) {
            setUserName(userSession.name || '');
            setEmail(userSession.email || '');
            setDob(userSession.dob || '');
            setZip(userSession.zip || '');
            setState(userSession.state || '');
            setDistrict(userSession.district || '');
            setCountry(userSession.country || '');
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updated Profile Data:', { userName, email, dob, zip, state, district, country });
    };

    return (
        <DashboardLayout userName={userName}>
            <h5 className="page-tag">Home &gt; Profile</h5>
            <ProfileForm
                userName={userName}
                email={email}
                dob={dob}
                zip={zip}
                state={state}
                district={district}
                country={country}
                setUserName={setUserName}
                setEmail={setEmail}
                setDob={setDob}
                setZip={setZip}
                setState={setState}
                setDistrict={setDistrict}
                setCountry={setCountry}
                handleSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default Profile;
