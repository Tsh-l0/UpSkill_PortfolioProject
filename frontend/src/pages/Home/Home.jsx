import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import HeroSection from './HeroSection';
import FeaturedDevelopers from './FeaturedDevelopers';
import TrendingSkills from './TrendingSkills';
import ContactSection from './ContactSection';
import Button from '../../components/ui/Button';
import { blogAPI } from '../../services/api/users';

// Blog Preview Component with API Integration
const BlogPreviewSection = () => {
  // Fetch latest blog posts
  const {
    data: blogResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blogPosts', 'homepage'],
    queryFn: () =>
      blogAPI.getPosts({
        limit: 3,
        featured: true,
        status: 'published',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const blogPosts = blogResponse?.data || [];

  // Fallback data if API fails or no posts
  const fallbackPosts = [
    {
      id: 'fallback-1',
      title: '5 Tips to Stand Out in Tech Interviews',
      excerpt:
        'Learn how to impress recruiters and prepare for common technical challenges.',
      category: 'Career',
      readTime: '5 min read',
      image: '/images/blog/interview-tips.jpg',
      author: { name: 'Sarah Chen', profileImage: null },
      publishedAt: '2024-01-15',
      slug: 'tech-interview-tips',
    },
    {
      id: 'fallback-2',
      title: 'How to Build a Winning Online Portfolio',
      excerpt:
        'Showcase your skills with impact using modern tools and best design practices.',
      category: 'Development',
      readTime: '8 min read',
      image: '/images/blog/portfolio-guide.jpg',
      author: { name: 'Marcus Johnson', profileImage: null },
      publishedAt: '2024-01-12',
      slug: 'winning-portfolio-guide',
    },
    {
      id: 'fallback-3',
      title: 'LinkedIn Endorsements that Actually Matter',
      excerpt:
        'Get meaningful endorsements by engaging your network authentically.',
      category: 'Networking',
      readTime: '6 min read',
      image: '/images/blog/linkedin-tips.jpg',
      author: { name: 'Elena Rodriguez', profileImage: null },
      publishedAt: '2024-01-10',
      slug: 'linkedin-endorsements-guide',
    },
  ];

  // Use API data if available, otherwise fallback
  const displayPosts = blogPosts.length > 0 ? blogPosts : fallbackPosts;

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = category => {
    const colors = {
      Career: 'bg-blue-100 text-blue-700',
      Development: 'bg-green-100 text-green-700',
      Networking: 'bg-purple-100 text-purple-700',
      Design: 'bg-pink-100 text-pink-700',
      Technology: 'bg-indigo-100 text-indigo-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.default;
  };

  // Error state
  if (error && !isLoading && blogPosts.length === 0) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Unable to load blog posts
            </h2>
            <p className="mb-6 text-gray-600">
              There was an error loading the latest articles. Showing featured
              content instead.
            </p>
            <Button onClick={() => refetch()} variant="ghost">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
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
            Career Tips & Job Resources
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Stay updated with the latest insights, career advice, and industry
            trends to accelerate your professional growth in South Africa.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-t-xl bg-gray-200" />
                <div className="rounded-b-xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 h-4 w-20 rounded bg-gray-200" />
                  <div className="mb-3 h-6 rounded bg-gray-200" />
                  <div className="mb-4 h-4 rounded bg-gray-200" />
                  <div className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Blog Cards */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.slice(0, 3).map((post, index) => (
                <motion.article
                  key={post.id || post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                >
                  <Link to={`/blog/${post.slug || post.id}`}>
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                      {post.image || post.featuredImage ? (
                        <img
                          src={post.image || post.featuredImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <span className="text-4xl font-bold text-white/50">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${getCategoryColor(post.category)}`}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                        {post.title}
                      </h3>

                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                        {post.excerpt || post.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{post.author?.name || post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime || '5 min read'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="mt-4">
                        <span className="text-sm font-medium text-indigo-600 transition-all group-hover:underline hover:text-indigo-700">
                          Read more →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* View All Blog CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Button as={Link} to="/blog" size="lg" className="px-8">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Page metadata
  useEffect(() => {
    document.title =
      'UpSkill - Connect, Grow, and Showcase Your Developer Skills';

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        "Join South Africa's premier developer community. Connect with professionals, showcase your skills, get endorsed by peers, and advance your tech career."
      );
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section - Full screen with carousel */}
      <HeroSection />

      {/* Featured Developers Section */}
      <FeaturedDevelopers />

      {/* Blog Preview Section */}
      <BlogPreviewSection />

      {/* Trending Skills Section */}
      <TrendingSkills />

      {/* Contact Section */}
      <ContactSection />
    </motion.div>
  );
};

export default Home;
