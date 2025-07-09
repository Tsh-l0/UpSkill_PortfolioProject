import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/shared.css';
import '../styles/login.css';

const Login = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: '' });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		let newErrors = {};

		if (!form.email.trim()) newErrors.email = 'Please enter your email or username';
		if (!form.password) newErrors.password = 'Please enter your password';

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
		} else {
			// In a real app, you'd do auth here
			navigate('/onboarding');
		}
	};

	return (
		<div className="login-wrapper">
			<div className="login-form">
				<h2>Login to Your Account</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="email">Email or Username</label>
						<input
							id="email"
							name="email"
							type="text"
							value={form.email}
							onChange={handleChange}
						/>
						{errors.email && <small className="error">{errors.email}</small>}
			</div>

			<div className="form-group">
				<label htmlFor="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					value={form.password}
					onChange={handleChange}
				/>
				{errors.password && <small className="error">{errors.password}</small>}
			</div>

			<button type="submit" className="form-submit">
				Login
			</button>
			
			<p className="signup-link">
				Don't have an account? <a href="/signup">Sign up</a>
			</p>
		</form>
		</div>
		</div>
	);
};

export default Login
