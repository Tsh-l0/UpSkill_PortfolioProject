const HeroSection = () => (
	<section className="flex flex-col items-center justify-center text-center pt-32 pb-24 bg-gradient-to-br from-indigo-600 to-blue-700 text-white px-6">
		<h1 className="text-4xl md:text-6xl font-bold mb-4">Building a Better Future Together</h1>
		<p className="text-lg md:text-xl mb-6">Empowering individuals and teams to track and grow their skills.</p>
		<div className="flex gap-4 flex-wrap justify-center">
			<button className="bg-white text-indigo-700 py-2 px-6 rounded font-semibold hover:bg-indigo-100 transition transform hover:scale-105">
				Explore Skills
			</button>
			<button className="bg-indigo-900 border border-white text-white py-2 px-6 rounded font-semibold hover:bg-indigo-800 transition transform hover:scale-105">
				Join a Team
			</button>
	</div>
	</section>
);

export default HeroSection;
