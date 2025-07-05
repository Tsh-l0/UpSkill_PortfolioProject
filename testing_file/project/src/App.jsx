import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/onboarding" element={<Onboarding />} />
			</Routes>
		</Router>
	);
}

export default App;
