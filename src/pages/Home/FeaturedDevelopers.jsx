import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Loading';
import { usersAPI } from '../../services/api/users';

const FeaturedDevelopers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // Fetch trending developers from API
  const {
    data: developersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trendingDevelopers'],
    queryFn: () =>
      usersAPI.getTrendingUsers({
        limit: 12,
        featured: true,
        includeStats: true,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const developers = developersResponse?.data || [];

  // Responsive visible cards
  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isLoading || developers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % developers.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isLoading, developers.length]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % developers.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + developers.length) % developers.length);
  };

  const getVisibleDevelopers = () => {
    if (developers.length === 0) return [];

    const devs = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % developers.length;
      devs.push(developers[index]);
    }
    return devs;
  };

  // Error state
  if (error && !isLoading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Unable to load featured developers
            </h2>
            <p className="mb-6 text-gray-600">
              There was an error loading the developer profiles. Please try
              again.
            </p>
            <Button onClick={() => refetch()} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No data state
  if (!developers || developers.length === 0) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Featured Developers
            </h2>
            <p className="mb-8 text-gray-600">
              No featured developers available at the moment. Check back soon!
            </p>
            <Button as={Link} to="/talent" variant="primary">
              Browse All Developers
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Meet Featured Developers
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Connect with top-rated developers from around the world. Discover
            their expertise and build meaningful professional relationships.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {developers.length > visibleCards && (
            <>
              <button
                onClick={prevSlide}
                className="group absolute top-1/2 left-0 z-10 -translate-x-4 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                aria-label="Previous developers"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600 transition-colors group-hover:text-indigo-600" />
              </button>

              <button
                onClick={nextSlide}
                className="group absolute top-1/2 right-0 z-10 translate-x-4 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                aria-label="Next developers"
              >
                <ChevronRight className="h-6 w-6 text-gray-600 transition-colors group-hover:text-indigo-600" />
              </button>
            </>
          )}

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className={`grid gap-8 ${
                visibleCards === 1
                  ? 'grid-cols-1'
                  : visibleCards === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {getVisibleDevelopers().map((developer, index) => (
                <motion.div
                  key={`${developer._id || developer.id}-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar
                        src={developer.profileImage || developer.avatar}
                        name={developer.name || developer.fullName}
                        size="lg"
                        className="ring-2 ring-gray-100 transition-all group-hover:ring-indigo-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                          {developer.name || developer.fullName}
                        </h3>
                        <p className="truncate text-sm text-gray-600">
                          {developer.title || developer.currentRole}
                        </p>
                        {developer.location && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span className="truncate">
                              {developer.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      {developer.rating && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {developer.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {developer.bio && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {developer.bio}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  {developer.topSkills && developer.topSkills.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {developer.topSkills
                          .slice(0, 3)
                          .map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
                            >
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                        {developer.topSkills.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            +{developer.topSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="rounded-b-xl bg-gray-50 px-6 py-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {developer.stats?.endorsements ||
                            developer.endorsements ||
                            0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Endorsements
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {developer.stats?.projects ||
                            developer.projectCount ||
                            0}
                        </div>
                        <div className="text-xs text-gray-500">Projects</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {developer.stats?.connections ||
                            developer.connectionCount ||
                            0}
                        </div>
                        <div className="text-xs text-gray-500">Connections</div>
                      </div>
                    </div>
                  </div>

                  {/* Social Links & CTA */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      {/* Social Links */}
                      <div className="flex space-x-2">
                        {developer.social?.github && (
                          <a
                            href={`https://github.com/${developer.social.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {developer.social?.linkedin && (
                          <a
                            href={developer.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 transition-colors hover:text-blue-600"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {developer.social?.website && (
                          <a
                            href={developer.social.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 transition-colors hover:text-green-600"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {/* View Profile Button */}
                      <Button
                        as={Link}
                        to={`/profile/${developer._id || developer.id}`}
                        size="sm"
                        variant="ghost"
                        className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        View Profile
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        {developers.length > visibleCards && (
          <div className="mt-8 flex justify-center space-x-2">
            {developers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'w-8 bg-indigo-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to developer ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button as={Link} to="/talent" size="lg" className="px-8">
            View All Developers
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDevelopers;
