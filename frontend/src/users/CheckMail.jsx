import { Link } from 'react-router-dom';
import './form.css';

const CheckEmail = () => {
  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Check Your Email</h2>
          <p style={{ textAlign: 'center', margin: '20px 0' }}>
            We've sent an activation link to your email address. 
            Please check your inbox (and spam folder!) to complete your registration.
          </p>
          <p className="cta-link">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;