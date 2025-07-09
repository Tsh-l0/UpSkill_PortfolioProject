import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/shared.css';
import '../styles/home.css';

const Home = () => {
	return (
		<div className="homepage">
			{/* Navbar */}
			<nav className="navbar">
				<ul className="nav-links">
					<li><Link to="/">Home</Link></li>
					<li><Link to="/blog">Blog</Link></li>
					<li><Link to="/profile">Profile</Link></li>
					<li><Link to="/dashboard">Dashboard</Link></li>
				</ul>
			</nav>

			{/* Hero Section */}
			<section className="hero">
				<h1>Building a Better Future Together</h1>
				<p>Empowering individuals and teams to track and grow their skills.</p>
				<div className="hero-buttons">
					<Link to="/signup" className="btn primary">Explore Skills</Link>
					<button className="btn secondary">Join a Team</button>
				</div>
			</section>

			{/* Blog Preview Section */}
			<section className="blog-preview">
				<h2>Career Tips &amp; Job Resources</h2>
				<div className="card-grid">
					{[
						{
							title: '5 Tips to Stand Out in Tech Interviews',
							desc: 'Learn how to impress recruiters and prepare for common technical challenges.',
						},
						{
							title: 'How to Build a Winning Online Portfolio',
							desc: 'Showcase your skills with impact using modern tools and best design practices.',
						},
						{
							title: 'LinkedIn Endorsements that Actually Matter',
							desc: 'Get meaningful endorsements by engaging your network authentically.',
						},
					].map((blog, index) => (
						<div className="blog-card" key={index}>
							<h3>{blog.title}</h3>
							<p>{blog.desc}</p>
							<Link to="/blog">Read more →</Link>
						</div>
					))}
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="newsletter">
				<h2>Get Weekly Career Insights</h2>
				<p>Subscribe to our newsletter for job tips, skill updates, and dashboard features.</p>
				<form className="newsletter-form">
					<input type="email" placeholder="you@example.com" />
					<button type="submit">Subscribe</button>
				</form>
			</section>
		</div>
	);
};

export default Home;
