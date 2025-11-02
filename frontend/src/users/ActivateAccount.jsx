import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "./form.css";

const ActivateAccount = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Activating your account...');
  const [error, setError] = useState(false);

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/activate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uidb64, token }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
          setError(false);
          // Redirect to login after a few seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setMessage(data.error || 'Activation failed.');
          setError(true);
        }
      } catch (err) {
        setMessage('An error occurred during activation.');
        setError(true);
      }
    };

    activate();
  }, [uidb64, token, navigate]);

  return (
    <div className="user">
      <h1 className="user-title">PAs Assistant</h1>
      <div className="form-container">
        <div className="form-card">
          <h2>Account Activation</h2>
          <p style={{ textAlign: 'center', margin: '20px 0', color: error ? 'red' : 'green' }}>
            {message}
          </p>
          {error ? (
            <p className="cta-link">
              <Link to="/register">Try registering again</Link>
            </p>
          ) : (
            <p className="cta-link">
              You will be redirected to login shortly...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;