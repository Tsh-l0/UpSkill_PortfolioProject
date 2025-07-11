import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/shared.css';
import '../styles/home.css';

const Home = () => {
	const images = [
		'/images/slide1.jpg',
		'/images/slide2.jpg',
		'/images/slide3.jpg',
		'/images/test-slide.jpg',
	];

	const [current, setCurrent] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % images.length);
		}, 4000);
		return () => clearInterval(interval);
	}, [images.length]);


	return (
		<div className="homepage">
		{/* Navbar */}
		

		{/* Hero Section */}
		<section
			className="hero"
			style={{
				backgroundImage: `url(${images[current]})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<h1>Building a Better Future Together</h1>
			<p>Empowering individuals and teams to track and grow their skills.</p>
			<div className="hero-buttons">
				<Link to="/talent" className="btn primary">Explore Skills</Link>
				<Link to="/login" className="btn secondary">Join a Team</Link>
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
						<a href="#">Read more →</a>
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

export default Home
