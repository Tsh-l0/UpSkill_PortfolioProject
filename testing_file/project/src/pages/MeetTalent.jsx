import React, { useState, useEffect } from 'react';
import ViewToggle from '../components/ViewToggle';
import '../styles/shared.css';
import '../styles/talent.css';

const MeetTalent = () => {
	const [viewMode, setViewMode] = useState('grid');

	useEffect(() => {
		const stored = localStorage.getItem('meetTalentView');
		if (stored) setViewMode(stored);
	}, []);

	const handleViewChange = (mode) => {
		setViewMode(mode);
		localStorage.setItem('meetTalentView', mode);
	};

	const people = [
		{
			initials: 'JD',
			name: 'Jane Doe',
			role: 'Frontend Developer',
			description: 'Passionate about building interactive, responsive web apps using modern frameworks.',
			skills: ['React', 'Tailwind CSS', 'UI/UX'],
		},
		{
			initials: 'MA',
			name: 'Michael Ade',
			role: 'Data Analyst',
			description: 'Turning raw data into clear stories with dashboards and visualizations.',
			skills: ['Python', 'Power BI', 'SQL'],
		},
		{
			initials: 'ZM',
			name: 'Zanele Moyo',
			role: 'Digital Marketer',
			description: 'Helping brands grow online through content, campaigns, and analytics.',
			skills: ['SEO', 'Google Ads', 'Copywriting'],
		},
	];

	return (
		<section className="talent-section">
			<h1 className="talent-heading">Meet the Talent</h1>
			<ViewToggle currentView={viewMode} setView={handleViewChange} />
			
			<div className={`talent-grid ${viewMode}`}>
				{people.map((person, index) => (
					<div className={`talent-card ${viewMode}`} key={index}>
						<div className="talent-header">
							<div className="talent-initials">{person.initials}</div>
							<div className="talent-info">
								<h3>{person.name}</h3>
								<p className="role">{person.role}</p>
							</div>
						</div>
						<p className="description">{person.description}</p>
						<div className="skills">
							{person.skills.map((skill, i) => (
								<span className="skill-pill" key={i}>{skill}</span>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default MeetTalent;
