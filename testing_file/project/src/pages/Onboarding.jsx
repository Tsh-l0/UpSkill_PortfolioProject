import React from 'react';
import '../styles/shared.css';
import '../styles/onboarding.css';
import Navbar from '../components/Navbar';

const Onboarding = () => {
	return (
		<div className="onboarding-wrapper">
			<div className="onboarding-form">
				<h2>Tell Us About Yourself</h2>
				<form>

					{/* Name */}
					<div className="form-group">
						<label htmlFor="name">Name</label>
						<input id="name" type="text" required />
					</div>

					{/* Surname */}
					<div className="form-group">
						<label htmlFor="surname">Surname</label>
						<input id="surname" type="text" required />
					</div>

					{/* Work Experience */}
					<div className="form-group">
						<label htmlFor="experience">Work Experience</label>
						<textarea
							id="experience"
							rows="3"
							placeholder="e.g., 2 years tutoring, 1 year retail sales"
						></textarea>
					</div>

					{/* Email */}
					<div className="form-group">
						<label htmlFor="email">Email Address</label>
						<input id="email" type="email" required />
					</div>

					{/* Education Level */}
					<div className="form-group">
						<label htmlFor="education">Highest Level of Education</label>
						<select id="education">
							<option value="">Select an option</option>
							<option value="high-school">High School</option>
							<option value="diploma">Diploma / Certificate</option>
							<option value="degree">Bachelor’s Degree</option>
							<option value="postgrad">Postgraduate Degree</option>
						</select>
					</div>

					{/* Skills */}
					<div className="form-group">
						<label htmlFor="skills">List of Skills / Competencies</label>
						<textarea
							id="skills"
							rows="3"
							placeholder="e.g., HTML, JavaScript, Customer Service..."
						></textarea>
					</div>

					{/* Upload Document */}
					<div className="form-group">
						<label htmlFor="docUpload">Upload Proof of Qualification (Optional)</label>
						<input id="docUpload" type="file" />
					</div>

					<button type="submit" className="form-submit">
						Submit Information
					</button>
				</form>
			</div>
		</div>
	);
};

export default Onboarding;
