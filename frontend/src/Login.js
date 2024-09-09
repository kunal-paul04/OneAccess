import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Login.css';
import { saveUserSession } from './utils/authUtils';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpRandomId, setOtpRandomId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [resendAvailable, setResendAvailable] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let countdown;
        if (otpSent && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(countdown);
            setResendAvailable(true);
        }

        return () => clearInterval(countdown);
    }, [otpSent, timer]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
    
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send_otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to_email: email }),
            });

            const data = await response.json();
            if (data.status_code === 200) {
                setOtpSent(true);
                setTimer(60);
                setResendAvailable(false);
                setOtpRandomId(data.otp_random_id);
            } else {
                setError('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            setError('An error occurred while sending OTP. Please try again later.');
            console.error('Error during OTP sending:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verify_otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, otp_random_id: otpRandomId }),
            });

            const data = await response.json();
            if (data.status_code === 200) {
                try {
                    const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: data.email }),
                    });

                    const responseData = await userResponse.json();
                    if (responseData.status_code === 200) {
                        saveUserSession({
                            txn: responseData.txn,
                            email: responseData.email,
                            name: responseData.name || '',
                            user_role: responseData.user_role,
                            googleLogin: responseData.googleLogin
                        });

                        window.location.href = '/profile';
                    } else if (responseData.status_code === 404) {
                        navigate('/register', { state: { email: data.email } });
                    } else {
                        setError(`Login error: ${responseData.detail}`);
                    }
                } catch (loginError) {
                    setError('An error occurred during login. Please try again later.');
                    console.error('Login error:', loginError);
                }
            } else {
                setError('OTP verification failed. Please try again.');
            }
        } catch (verifyError) {
            setError('An error occurred during OTP verification. Please try again later.');
            console.error('OTP verification error:', verifyError);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = (response) => {
        setLoading(true);
        const idToken = response.credential;

        fetch(`${process.env.REACT_APP_BACKEND_URL}/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_token: idToken }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    saveUserSession({
                        txn: data.txn,
                        email: data.email,
                        user_role: data.user_role,
                        name: data.name,
                        googleLogin: 1
                    });
                    window.location.href = '/dashboard';
                } else {
                    setError('Google Sign-In failed. Please try again.');
                }
            })
            .catch((googleError) => {
                setError('An error occurred during Google Sign-In. Please try again later.');
                console.error('Google Sign-In error:', googleError);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleResendOtp = async () => {
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        // Call handleSendOtp without passing an event
        await handleSendOtp();
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">OneAccess - Secure Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form className="login-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || otpSent}
                    />
                    {otpSent && (
                        <>
                            <input
                                type="text"
                                placeholder="OTP"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={loading}
                            />
                            <div className="timer">
                                {resendAvailable ? (
                                    <button
                                        type="button"
                                        className="resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    <p>Resend OTP in {timer} seconds</p>
                                )}
                            </div>
                        </>
                    )}
                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading || (!otpSent && !email)}
                    >
                        {loading ? 'Loading...' : otpSent ? 'Verify OTP' : 'Send OTP'}
                    </button>
                </form>
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign-In failed. Please try again.')}
                        render={(renderProps) => (
                            <button
                                className="google-signin-btn"
                                onClick={renderProps.onClick}
                                disabled={loading}
                            >
                                <img src="/path-to-google-logo.png" alt="Google Logo" />
                                Sign in with Google
                            </button>
                        )}
                    />
                </GoogleOAuthProvider>
            </div>
            {loading && <div className="overlay"><div className="loading-spinner"></div></div>}
        </div>
    );
};

export default Login;
