import React from 'react';
import '../styles/shared.css';

const Signup = () => {
	return (
		<div className="form-bg">
			<div className="form-card">
				<h2 className="form-title">Create Your Account</h2>
				<form>
					<div className="form-group">
						<label htmlFor="name">Full Name</label>
						<input type="text" id="name" />
					</div>

					<div className="form-group">
						<label htmlFor="email">Email Address</label>
						<input type="email" id="email" />
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input type="password" id="password" />
					</div>

					<div className="form-group">
						<label htmlFor="confirm">Confirm Password</label>
						<input type="password" id="confirm" />
					</div>

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
