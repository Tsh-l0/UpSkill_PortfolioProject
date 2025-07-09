// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import MeetTalent from './pages/MeetTalent';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="signup" element={<Signup />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="talent" element={<MeetTalent />} />
      </Route>
    </Routes>
  );
};

export default App;
