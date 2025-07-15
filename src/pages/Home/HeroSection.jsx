import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store';

const HeroSection = () => {
  const { isAuthenticated } = useAuthStore();

  const slides = [
    {
      id: 1,
      image: '/images/slide1.jpg',
      title: 'Building a Better Future Together',
      subtitle:
        'Empowering individuals and teams to track and grow their skills.',
      cta: 'Explore Skills',
      ctaLink: '/talent',
    },
    {
      id: 2,
      image: '/images/slide2.jpg',
      title: 'Connect with Top Developers',
      subtitle: 'Network with skilled professionals and advance your career.',
      cta: 'Find Talent',
      ctaLink: '/talent',
    },
    {
      id: 3,
      image: '/images/slide3.jpg',
      title: 'Showcase Your Expertise',
      subtitle: 'Get endorsed by peers and build credibility in your skills.',
      cta: isAuthenticated ? 'View Dashboard' : 'Join Now',
      ctaLink: isAuthenticated ? '/dashboard' : '/signup',
    },
    {
      id: 4,
      image: '/images/test-slide.jpg',
      title: 'Track Your Growth',
      subtitle: 'Monitor your skill development and career progression.',
      cta: 'Start Learning',
      ctaLink: '/blog',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = index => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentSlideData.image})` }}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Main Title */}
              <motion.h1
                className="text-4xl leading-tight font-bold text-white md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="mx-auto max-w-3xl text-lg text-gray-200 md:text-xl lg:text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {currentSlideData.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Button
                  as={Link}
                  to={currentSlideData.ctaLink}
                  size="lg"
                  className="transform bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
                >
                  {currentSlideData.cta}
                </Button>

                <Button
                  as={Link}
                  to={isAuthenticated ? '/profile' : '/login'}
                  variant="secondary"
                  size="lg"
                  className="bg-white/90 px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg backdrop-blur-sm hover:bg-white hover:shadow-xl"
                >
                  {isAuthenticated ? 'View Profile' : 'Join Community'}
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats */}
        <motion.div
          className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { icon: Users, number: '10K+', label: 'Active Developers' },
            { icon: Award, number: '50K+', label: 'Skills Endorsed' },
            { icon: TrendingUp, number: '95%', label: 'Career Growth' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="text-center text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold md:text-3xl">
                  {stat.number}
                </div>
                <div className="text-gray-200">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="group absolute top-1/2 left-4 z-20 -translate-y-1/2 transform rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 transition-transform group-hover:scale-110" />
      </button>

      <button
        onClick={nextSlide}
        className="group absolute top-1/2 right-4 z-20 -translate-y-1/2 transform rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 transition-transform group-hover:scale-110" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 transform space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'scale-125 bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 transform items-center space-x-2 text-sm text-white/75">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="flex items-center space-x-1 transition-colors hover:text-white"
        >
          <Play
            className={`h-3 w-3 ${isAutoPlaying ? 'opacity-100' : 'opacity-50'}`}
          />
          <span>{isAutoPlaying ? 'Auto-playing' : 'Paused'}</span>
        </button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/50">
          <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-white/75" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
