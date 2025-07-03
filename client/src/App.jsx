import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Blogs from './pages/Blogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/blogs" element={<Blogs />} />
        {/* You can add more routes here later */}
      </Routes>
    </Router>
  );
}

export default App;

