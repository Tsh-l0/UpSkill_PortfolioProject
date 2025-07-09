// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      
      {/* Logo */}
      <div className="text-xl font-bold text-indigo-600">
        <Link to="/">UpSkill</Link>
      </div>

      {/* Nav Links */}
      <ul className="flex gap-6 text-gray-700">
        <li><Link to="/" className="hover:text-indigo-500">Home</Link></li>
        <li><Link to="/blog" className="hover:text-indigo-500">Blog</Link></li>
        <li><Link to="/profile" className="hover:text-indigo-500">Profile</Link></li>
        <li><Link to="/dashboard" className="hover:text-indigo-500">Dashboard</Link></li>
      </ul>

      {/* Auth Buttons */}
      <div className="flex gap-3">
        <Link
          to="/signup"
          className="text-sm px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-100"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
