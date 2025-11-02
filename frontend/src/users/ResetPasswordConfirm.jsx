import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { confirmPasswordReset } from '../users/UserAuth';
import "./form.css";

const ResetPasswordConfirm = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    password_confirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (apiErrors[name] || apiErrors.general) {
      setApiErrors(prevErrors => ({ ...prevErrors, [name]: null, general: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiErrors({});

    if (formData.password !== formData.password_confirm) {
      setApiErrors({ password_confirm: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    const resetData = {
      uidb64,
      token,
      password: formData.password,
      password_confirm: formData.password_confirm
    };

    const result = await confirmPasswordReset(resetData);
    
    if (result.success) {
      // On success, redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      const mappedErrors = {};
      if (result.errors.password) mappedErrors.password = result.errors.password;
      if (result.errors.error) mappedErrors.general = result.errors.error;
      setApiErrors(mappedErrors);
    }
    setIsLoading(false);
  };

  const getFieldError = (fieldName) => apiErrors[fieldName];
  const getGeneralError = () => apiErrors.general;

  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Set New Password</h2>
          {getGeneralError() && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{getGeneralError()}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {getFieldError('password') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('password')}</span>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password_confirm"
                placeholder="Confirm new password"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
              {getFieldError('password_confirm') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('password_confirm')}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Set New Password'}
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

export default ResetPasswordConfirm;