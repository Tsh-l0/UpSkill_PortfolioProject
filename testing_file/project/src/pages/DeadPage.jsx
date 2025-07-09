import React, { useEffect } from 'react';
import '../styles/deadpage.css';

const DeadPage = () => {
	useEffect(() => {
		const interval = setInterval(() => {
			window.location.reload();
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="deadpage-wrapper">
			<div className="deadpage-message">
				<h2>Page In Progress</h2>
				<p>This page is under construction... auto-refreshing until it lives.</p>
				<div className="loading-bar">
					<div className="loading-fill"></div>
				</div>
			</div>
		</div>
	);
};

export default DeadPage;
