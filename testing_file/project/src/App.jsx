import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import MeetTalent from './pages/MeetTalent';
import Profile from './pages/Profile';
import Login from './pages/Login';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/onboarding" element={<Onboarding />} />
				<Route path="/talent" element={<MeetTalent />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/login" element={<Login />} />
			</Routes>
		</Router>
	);
}

export default App;
