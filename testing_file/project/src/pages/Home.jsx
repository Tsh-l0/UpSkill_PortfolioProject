import React from 'react';

const Home = () => {
	return (
		<div className="bg-white text-gray-800 font-sans">

		{/* Navbar */}
		<nav className="flex justify-between items-center p-6 shadow-md bg-white fixed w-full z-10">
			<ul className="hidden md:flex gap-6 text-gray-700">
				<li><a href="#" className="hover:text-indigo-500">Home</a></li>
				<li><a href="#" className="hover:text-indigo-500">Blog</a></li>
				<li><a href="#" className="hover:text-indigo-500">Profile</a></li>
				<li><a href="#" className="hover:text-indigo-500">Dashboard</a></li>
			</ul>
		</nav>

		{/* Hero Section */}
		<section className="flex flex-col items-center justify-center text-center pt-32 pb-24 bg-gradient-to-br from-indigo-600 to-blue-700 text-white px-6">
			<h1 className="text-4xl md:text-6xl font-bold mb-4">Building a Better Future Together</h1>
			<p className="text-lg md:text-xl mb-6">
				Empowering individuals and teams to track and grow their skills.
			</p>
			<div className="flex gap-4 flex-wrap justify-center">
				<button className="bg-white text-indigo-700 py-2 px-6 rounded font-semibold hover:bg-indigo-100 transition transform hover:scale-105">
					Explore Skills
				</button>
				<button className="bg-indigo-900 border border-white text-white py-2 px-6 rounded font-semibold hover:bg-indigo-800 transition transform hover:scale-105">
					Join a Team
				</button>
			</div>
		</section>

		{/* Blog Preview Section */}
		<section className="py-16 px-6 bg-gray-100 text-gray-800">
			<h2 className="text-3xl font-bold text-center mb-10">Career Tips & Job Resources</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[
					{
						title: '5 Tips to Stand Out in Tech Interviews',
							description:
								'Learn how to impress recruiters and prepare for common technical challenges.',
					},
					{
						title: 'How to Build a Winning Online Portfolio',
						description:
							'Showcase your skills with impact using modern tools and best design practices.',
					},
					{
						title: 'LinkedIn Endorsements that Actually Matter',
						description:
							'Get meaningful endorsements by engaging your network authentically.',
					},
				].map((blog, i) => (
					<div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
						<h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
						<p className="text-sm mb-4 text-gray-600">{blog.description}</p>
						<a href="#" className="text-indigo-600 hover:underline font-medium">
							Read more →
						</a>
					</div>
				))}
			</div>
		</section>

		{/* Newsletter Section */}
		<section className="py-16 px-6 bg-indigo-700 text-white text-center">
			<h2 className="text-2xl md:text-3xl font-bold mb-4">Get Weekly Career Insights</h2>
			<p className="mb-6">
				Subscribe to our newsletter for job tips, skill updates, and dashboard features.
			</p>
			<form className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
				<input
					type="email"
					placeholder="you@example.com"
					className="w-full md:w-auto px-4 py-2 rounded text-gray-800 focus:outline-none"
				/>
				<button
					type="submit"
					className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded hover:bg-indigo-100 transition"
				>
					Subscribe
				</button>
			</form>
		</section>
		</div>
	);
};

export default Home;
