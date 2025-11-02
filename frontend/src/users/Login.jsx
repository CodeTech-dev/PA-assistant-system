import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { resendActivationEmail } from '../users/UserAuth'; 
import { toast } from 'react-toastify'; 
import "./form.css";

const Login = () => {
  const navigate = useNavigate();
  // 2. GET THE LOGIN FUNCTION FROM THE CONTEXT
  const { login } = useAuth(); 

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [apiErrors, setApiErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (apiErrors[name]) {
      setApiErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
    if (showResend) {
      setShowResend(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiErrors({});
    setShowResend(false)

    // 3. CALL THE CONTEXT's LOGIN FUNCTION
    const result = await login(formData.email, formData.password);

    if (result.success) {
      console.log('Login successful');
      navigate('/dashboard');
    } else {
      console.error('Login failed:', result.errors);
      const mappedErrors = {};
      // Check for the general error (from Django's 'error' key)
      const generalError = result.errors.error || result.errors.detail || result.errors.non_field_errors;
      
      if (generalError) {
        mappedErrors.general = generalError;
        // --- THIS IS THE NEW LOGIC ---
        if (generalError.includes('Account not activated')) {
            setShowResend(true);
        }
      }
      if (result.errors.detail) {
        mappedErrors.general = result.errors.detail;
      } else if (result.errors.non_field_errors) {
        mappedErrors.general = result.errors.non_field_errors;
      }
      if (result.errors.email) mappedErrors.email = result.errors.email;
      if (result.errors.password) mappedErrors.password = result.errors.password;
      if (result.errors.username) mappedErrors.email = result.errors.username;

      setApiErrors(mappedErrors);
    }
    setIsLoading(false);
  };

const handleResend = async () => {
    if (!formData.email) {
        toast.error("Please enter your email address first.");
        return;
    }
    setIsLoading(true);
    await resendActivationEmail(formData.email);
    setIsLoading(false);
    setShowResend(false); // Hide link after click
  };

  const toggleRegister = () => {
    navigate('/register');
  };

  const getFieldError = (fieldName) => apiErrors[fieldName];
  const getGeneralError = () => apiErrors.general;

  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Login</h2>
          {getGeneralError() && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{getGeneralError()}</div>}

          {showResend && !isLoading && (
            <p className="cta-link" style={{ marginTop: '-10px', marginBottom: '15px' }}>
              <a href="#" onClick={(e) => {
                  e.preventDefault();
                  handleResend();
                }}>
                Resend activation email?
              </a>
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
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
          <p className="cta-link" style={{ marginTop: '10px' }}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
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