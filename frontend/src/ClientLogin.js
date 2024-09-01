import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "./ClientLogin.css";

const ClientLogin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // State to manage OTP input
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [otpSent, setOtpSent] = useState(false); // State to track OTP sent status
  const [timer, setTimer] = useState(60); // State for the countdown timer

  const clientId = params.get('client_id');
  const transactionId = params.get('channel_transaction');
  const origin = params.get('origin');

  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(countdown);
    }

    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send_otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({ to_email: email }),
      });

      const data = await response.json();
      if (data.status_code== 200) {
        setOtpSent(true);
        setTimer(60); // Reset the timer to 60 seconds
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    handleSendOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verify_otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, transaction_id: transactionId }),
      });

      const data = await response.json();
      if (data.status_code== 200) {
        const redirectURL = `${data.redirect_uri}?token=${data.id_token}&error=0`;
        window.location.href = redirectURL;
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="form-container">
        <h2 className="title">Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || otpSent}
            required
          />
          {otpSent && (
            <>
              <input
                className="input"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
                required
              />
              {timer > 0 ? (
                <p className="timer">You can resend OTP in {timer} seconds</p>
              ) : (
                <button type="button" className="button" onClick={handleResendOtp}>
                  Resend OTP
                </button>
              )}
            </>
          )}
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Loading..." : otpSent ? "Verify OTP" : "Next"}
          </button>
          <div className="spacing"></div>
        </form>
      </div>
    </div>
  );
};

export default ClientLogin;
