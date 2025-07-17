import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  ArrowLeft,
  Search,
  Users,
  BookOpen,
  Code,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      icon: Home,
      title: 'Home',
      description: 'Return to our homepage',
      href: '/',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      title: 'Find Developers',
      description: 'Browse our talent network',
      href: '/talent',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: BookOpen,
      title: 'Read Blog',
      description: 'Career tips and resources',
      href: '/blog',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Code,
      title: 'Your Profile',
      description: 'Manage your developer profile',
      href: '/profile',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const troubleshootingTips = [
    'Check the URL for typos or spelling errors',
    'Try going back to the previous page',
    "Use the search feature to find what you're looking for",
    'Browse our main sections using the navigation menu',
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative">
            {/* Large 404 */}
            <motion.h1
              className="text-8xl font-bold text-gray-200 select-none md:text-9xl"
              animate={{
                textShadow: [
                  '0 0 0 rgba(99, 102, 241, 0)',
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                  '0 0 0 rgba(99, 102, 241, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.h1>

            {/* Floating icons */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 left-1/4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100"
            >
              <Compass className="h-6 w-6 text-indigo-600" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute top-8 right-1/4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"
            >
              <Search className="h-5 w-5 text-purple-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Oops! Page not found
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            The page you&apos;re looking for seems to have wandered off into the
            digital void. Don&apos;t worry though – even the best developers
            encounter 404s sometimes!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              size="lg"
              className="px-6"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>

            <Button as={Link} to="/" size="lg" className="px-6">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            Popular destinations
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.href}
                    className="group block rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${link.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                      {link.title}
                    </h4>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Troubleshooting Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>

          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Troubleshooting Tips
          </h3>

          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            {troubleshootingTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-xs font-semibold text-indigo-600">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-gray-600">
            Still can&apos;t find what you&apos;re looking for?
          </p>
          <Button
            as={Link}
            to="/#contact"
            variant="ghost"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Contact Support
          </Button>
        </motion.div>

        {/* Fun Developer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 border-t border-gray-200 pt-8"
        >
          <blockquote className="text-gray-500 italic">
            &quot;There are only two hard things in Computer Science: cache
            invalidation and naming things... and apparently, finding the right
            URL.&quot;
            <br />
            <span className="text-sm">— Phil Karlton (modified)</span>
          </blockquote>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
