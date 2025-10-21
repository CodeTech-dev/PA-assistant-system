import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from './UserAuth';
import "./form.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    const result = await loginUser(formData);

    if (result.success) {
      console.log('Login successful:', result.data);
      // Navigate to the dashboard after successful login
      navigate('/dashboard');
    } else {
      console.error('Login failed:', result.errors);
      // Set errors received from the API/service
      // Map potential API error keys to form field names or general errors
      const mappedErrors = {};
      // SimpleJWT often returns 'detail' for incorrect credentials
      if (result.errors.detail) {
        mappedErrors.general = result.errors.detail;
      } else if (result.errors.non_field_errors) {
        mappedErrors.general = result.errors.non_field_errors;
      }
      // If backend sends errors keyed by 'email' or 'password' (less common for JWT login)
      if (result.errors.email) mappedErrors.email = result.errors.email;
      if (result.errors.password) mappedErrors.password = result.errors.password;
      // If backend sends errors keyed by 'username' (as used in the fetch call)
      if (result.errors.username) mappedErrors.email = result.errors.username; // Map 'username' error to email field display

      setApiErrors(mappedErrors);
    }
    setIsLoading(false);
  };

  const toggleRegister = () => {
    navigate('/register');
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
          <h2>Login</h2>
          {/* Display general errors if any */}
          {getGeneralError() && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{getGeneralError()}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email" // Name attribute for handleChange
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {/* Display email/username error if present */}
              {(getFieldError('email')) && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('email')}</span>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {getFieldError('password') && <span className="error-message" style={{ color: 'red', display: 'block' }}>{getFieldError('password')}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="cta-link">
            Don't have an account?
            <a href="#" onClick={(e) => {
              e.preventDefault();
              toggleRegister();
            }}>Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
