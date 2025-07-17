import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if current page should have a different layout style
  const isHomePage = location.pathname === '/';
  const isAuthPage = [
    '/login',
    '/signup',
    '/onboarding',
    '/forgot-password',
  ].includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar - only show if not auth page */}
      {!isAuthPage && <Navbar isScrolled={isScrolled} />}

      {/* Main Content */}
      <motion.main
        className={`flex-1 ${!isAuthPage ? 'mt-16' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>

      {/* Footer - only show if not auth page */}
      {!isAuthPage && <Footer />}

      {/* Back to top button */}
      {isScrolled && !isAuthPage && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-8 bottom-8 z-40 rounded-full bg-indigo-600 p-3 text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl focus:ring-4 focus:ring-indigo-200 focus:outline-none"
          aria-label="Back to top"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default Layout;
