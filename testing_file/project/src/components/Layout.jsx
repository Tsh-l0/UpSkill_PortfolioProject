import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
	return (
		<>
			<Navbar />
			<main style={{ paddingTop: '4.5rem' }}>
				<Outlet />
			</main>
		</>
	);
};

export default Layout;
