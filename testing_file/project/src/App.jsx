import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-800">
				<Routes>
					<Route path="/" element={<Home />} />
					{/* We’ll add more routes like /blogs, /signup, etc. later */}
				</Routes>
			</div>
		</Router>
	);
}

export default App;
