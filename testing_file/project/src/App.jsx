import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import MeetTalent from './pages/MeetTalent';
import Profile from './pages/Profile';
import Login from './pages/Login';
import DeadPage from './pages/DeadPage';

function App() {
	return (
		<Router>
			<Routes>
				{/* Routes wrapped in Layout with Navbar */}
				<Route element={<Layout />}>
					<Route path="/" element={<Home />} />
					<Route path="/talent" element={<MeetTalent />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/dead" element={<DeadPage />} />
				</Route>
				{/* Routes without Navbar */}
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<Login />} />
				<Route path="/onboarding" element={<Onboarding />} />
			</Routes>
		</Router>
	);
}

export default App;
