import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from '../users/UserAuth';
import "./form.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiErrors({});
    
    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setMessageSent(true);
    } else {
      setApiErrors(result.errors);
    }
    setIsLoading(false);
  };

  const getGeneralError = () => apiErrors.non_field_errors || apiErrors.error;

  if (messageSent) {
    return (
      <div className="user">
        <h1 className="user-title">PAs Assistant</h1>
        <div className="form-container">
          <div className="form-card">
            <h2>Check Your Email</h2>
            <p style={{ textAlign: 'center', margin: '20px 0' }}>
              If an account with that email exists, a password reset link has been sent.
            </p>
            <p className="cta-link">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Forgot Password</h2>
          <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '14px' }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
          {getGeneralError() && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{getGeneralError()}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {apiErrors.email && <span className="error-message" style={{ color: 'red', display: 'block' }}>{apiErrors.email}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="cta-link">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;