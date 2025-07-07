import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // ✅ Add this line
import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import MeetTalent from './pages/MeetTalent';
import Profile from './pages/Profile';

function App() {
	return (
		<Router>
			<Navbar /> {/* ✅ Add this line */}
			<Routes>
				<Route path="/blog" element={<Blog />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/" element={<Home />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/onboarding" element={<Onboarding />} />
				<Route path="/talent" element={<MeetTalent />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</Router>
	);
}

export default App;
