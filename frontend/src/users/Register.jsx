import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from './UserAuth';
import "./form.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  // State to hold errors from the API or service
  const [apiErrors, setApiErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear specific field error when user starts typing
    if (apiErrors[name]) {
      setApiErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiErrors({}); // Clear previous API errors

    const result = await registerUser(formData);

    if (result.success) {
      console.log('Registration successful:', result.data);
      // Navigate to the login page after successful registration
      navigate('/login');
    } else {
      console.error('Registration failed:', result.errors);
      // Set errors received from the API/service
      // Map potential API error keys to form field names or general errors
      const mappedErrors = {};
      if (result.errors.full_name) mappedErrors.full_name = result.errors.full_name;
      if (result.errors.email) mappedErrors.email = result.errors.email;
      if (result.errors.password) mappedErrors.password = result.errors.password;
      if (result.errors.password_confirm) mappedErrors.password_confirm = result.errors.password_confirm;
      // Handle non-field errors (e.g., email already exists, general failure)
      if (result.errors.non_field_errors || result.errors.detail) {
        mappedErrors.general = result.errors.non_field_errors || result.errors.detail;
      }
      setApiErrors(mappedErrors);
    }
    setIsLoading(false);
  };

  const toggleLogin = () => {
    navigate('/login');
  };

  // Helper function to get error message for a specific field
  const getFieldError = (fieldName) => {
    return apiErrors[fieldName];
  };

  // Helper function to get general error message
  const getGeneralError = () => {
    return apiErrors.general;
  };

  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Register</h2>
          {/* Display general errors if any */}
          {getGeneralError() && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{getGeneralError()}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="full_name"
                placeholder="Enter your fullname"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              {getFieldError('full_name') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('full_name')}</span>}
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {getFieldError('email') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('email')}</span>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Create a password"
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
                placeholder="Confirm your password"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
              {getFieldError('password_confirm') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('password_confirm')}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Signup'}
            </button>
          </form>
          <p className="cta-link">
            Already have an account?
            <a href="#" onClick={(e) => {
              e.preventDefault();
              toggleLogin();
            }}>Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
