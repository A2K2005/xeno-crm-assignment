import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../logo.svg';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('User Info:', decoded);

    try {
      await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email
        })
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to send to backend', err);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Xeno" />
          <h1>Sign in to Xeno</h1>
        </div>
        <div className="auth-action">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
};


export default Login;
