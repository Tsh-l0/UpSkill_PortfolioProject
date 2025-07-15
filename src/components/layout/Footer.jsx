import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setLoading(false);
      setEmail('');

      // Reset success message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1000);
  };

  const footerLinks = {
    Platform: [
      { name: 'Find Talent', href: '/talent' },
      { name: 'Browse Skills', href: '/skills' },
      { name: 'Career Resources', href: '/blog' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
    ],
    Resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'API Docs', href: '/api' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@upskill.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Get Weekly Career Insights
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-indigo-100">
                Subscribe to our newsletter for job tips, skill updates, and
                platform features. Join thousands of developers advancing their
                careers.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <form
                onSubmit={handleNewsletterSubmit}
                className="sm:flex sm:max-w-md lg:max-w-lg"
              >
                <div className="min-w-0 flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full rounded-md border border-transparent bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-white focus:outline-none sm:text-sm"
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <Button
                    type="submit"
                    variant="secondary"
                    loading={loading}
                    className="w-full h-[45px] bg-white text-indigo-600 hover:bg-gray-50"
                  >
                    {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                    {!isSubscribed && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-indigo-100"
                >
                  ✨ Thanks for subscribing! Check your inbox for confirmation.
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company Info */}
          <div className="xl:col-span-1">
            <Link to="/" className="flex items-center">
              <img
                src="/images/Upskill-logo.png"
                alt="UpSkill"
                className="h-8 w-auto brightness-0 invert filter"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm text-gray-300">
              Empowering developers to connect, grow, and showcase their skills.
              Build your professional network and advance your career with peer
              endorsements and skill verification.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <span className="sr-only">{social.name}</span>
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                    {category}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {links.map(link => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm text-gray-300 transition-colors hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
            <p className="mt-8 text-sm text-gray-400 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} UpSkill Platform. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
