import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "./ClientLogin.css";

const ClientLogin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRandomId, setOtpRandomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false); // State to manage verification status

  const clientId = params.get('client_id');
  const transactionId = params.get('channel_transaction');
  const origin = params.get('origin');

  useEffect(() => {
    // Call client_verification API on component mount
    const verifyClient = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/client_verification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
          },
          body: JSON.stringify({ client_id: clientId, origin }),
        });

        const data = await response.json();
        if (data.status_code === 200) {
          setIsVerified(true); // Set the client as verified
        } else {
          setError("This client is not verified for OneAccess. Contact technical support.");
        }
      } catch (error) {
        setError("An error occurred while verifying the client. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (clientId && origin) {
      verifyClient(); // Verify client only if clientId and origin are available
    } else {
      setError("Client ID or Origin missing in the URL parameters.");
    }
  }, [clientId, origin]);

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
    if (e) e.preventDefault();
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
      if (data.status_code === 200) {
        setOtpSent(true);
        setTimer(60); // Reset the timer to 60 seconds
        setOtpRandomId(data.otp_random_id);
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
        body: JSON.stringify({ email, otp, otp_random_id: otpRandomId }),
      });

      const data = await response.json();
      if (data.status_code === 200) {
        try {
          const user_response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/client_login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, clientId, transactionId, origin }),
          });
          const response_data = await user_response.json();
          if (response_data.status_code === 200) {
            // if registered user
            const redirectURL = `${response_data.redirect_uri}?token=${response_data.id_token}&error=0`;
            window.location.href = redirectURL;
          } else if (response_data.status_code === 404) {
            // if new user
            const signupButton = `${process.env.REACT_APP_HOST_URL}/cr_gsi?client_id=${clientId}&channel_transaction=${transactionId}&origin=${origin}&user=${email}`;
            window.location.href = signupButton;
          } else {
            const error = `An error occurred - ${response_data.detail}. Please try again later.`;
            setError(error);
          }
        } catch (error) {
          setError("An error occurred. Please try again later.");
        } finally {
          setLoading(false);
        }
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
        <img src="/OneAccess.png" style={{ width: '150px', height: '150px' }} alt="OneAccess" className="OneAccess-image" />
        {error && <div className="error-message">{error}</div>}
        {isVerified ? (
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
        ) : (
          <p className="error-message">Client verification is required.</p>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;
