import React from 'react';

const ViewToggle = ({ currentView, setView }) => {
	return (
		<div className="view-toggle">
			<button
				className={currentView === 'grid' ? 'active' : ''}
				onClick={() => setView('grid')}
			>
				🔲 Grid
			</button>
			
			<button
				className={currentView === 'list' ? 'active' : ''}
				onClick={() => setView('list')}
			>
				📃 List
			</button>
		</div>
	);
};

export default ViewToggle;
