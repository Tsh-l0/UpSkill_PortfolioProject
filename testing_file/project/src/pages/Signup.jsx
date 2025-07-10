import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/shared.css';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setError('');
    navigate('/onboarding');
  };

  return (
    <div className="form-bg">
      <div className="form-card">
        <h2 className="form-title">Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input type="password" id="confirm" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          <button type="submit" className="btn primary w-full">Create Account</button>
        </form>
        <p className="form-footer">
          Already have an account? <a href="#" className="link">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
