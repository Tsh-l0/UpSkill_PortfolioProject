import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-inner">

      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/">
          <img
            src="/images/Upskill-logo.png"
            alt="UpSkill Logo"
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
          />
        </Link>
      </div>

      {/* Nav Links */}
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dead">Blog</Link></li>
        <li><Link to="/login">Profile</Link></li>
        <li><Link to="/dead">Dashboard</Link></li>
      </ul>

      {/* Auth Buttons */}
      <div className="navbar-auth">
        <Link to="/signup" className="btn-signup">Sign Up</Link>
        <Link to="/login" className="btn-signin">Sign In</Link>
      </div>

    </div>
  </nav>
);

export default Navbar;
