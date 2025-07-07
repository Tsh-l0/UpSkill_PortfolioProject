const Navbar = () => (
	<nav className="flex justify-between items-center p-6 shadow-md bg-white fixed w-full z-10">
		<ul className="hidden md:flex gap-6 text-gray-700">
			<li><a href="#" className="hover:text-indigo-500">Home</a></li>
			<li><a href="#" className="hover:text-indigo-500">Blog</a></li>
			<li><a href="#" className="hover:text-indigo-500">Profile</a></li>
			<li><a href="#" className="hover:text-indigo-500">Dashboard</a></li>
		</ul>
	</nav>
);

export default Navbar;
