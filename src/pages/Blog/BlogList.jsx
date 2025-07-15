import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  User,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ExternalLink,
  Calendar,
  Tag,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Search,
  Globe,
  MapPin,
  Building,
  Star,
  Flag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Loading';

// API Services
import { blogAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import {
  formatRelativeTime,
  formatNumber,
} from '../../utils/formatters';

const BlogList = ({
  filters = {},
  viewMode = 'grid', // 'grid' or 'list'
  isLoading = false,
  className = '',
}) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const postsPerPage = 9;

  // Fetch posts from backend/third-party API
  const fetchPosts = async (page = 1, resetData = true) => {
    setIsLoadingPosts(resetData);
    setError(null);

    try {
      const searchParams = {
        page,
        limit: postsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(searchParams).forEach(key => {
        if (
          !searchParams[key] ||
          (Array.isArray(searchParams[key]) && searchParams[key].length === 0)
        ) {
          delete searchParams[key];
        }
      });

      const response = await blogAPI.getBlogPosts(searchParams);

      if (response.success) {
        const postsData = response.data.posts || response.data;
        const total = response.data.total || postsData.length;

        if (resetData || page === 1) {
          setPosts(postsData);
        } else {
          // Append for pagination
          setPosts(prev => [...prev, ...postsData]);
        }

        setTotalPosts(total);
        setHasMore(
          postsData.length === postsPerPage &&
            posts.length + postsData.length < total
        );
      } else {
        throw new Error(response.message || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Blog fetch error:', error);
      setError('Failed to load articles');

      // Fallback to SA-focused mock data
      const mockData = generateSABlogData(page);
      if (resetData || page === 1) {
        setPosts(mockData);
      } else {
        setPosts(prev => [...prev, ...mockData]);
      }
      setTotalPosts(150);

      if (resetData) {
        toast.error('Using demo content - connection issue detected');
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Generate SA-focused mock blog data as fallback
  const generateSABlogData = (page = 1) => {
    const saTopics = [
      'South African Tech Scene',
      'Cape Town Startups',
      'Johannesburg Innovation',
      'Discovery Bank Technology',
      'Takealot Engineering',
      'Naspers Ventures',
      'Remote Work in SA',
      'SA Developer Salaries',
      'Silicon Cape Community',
    ];

    const saTechTrends = [
      'Fintech in South Africa',
      'E-commerce Growth',
      'Digital Banking',
      'Mobile-First Development',
      'Load Shedding Solutions',
      'African Innovation',
    ];

    const baseIndex = (page - 1) * postsPerPage;

    return Array.from({ length: postsPerPage }, (_, i) => {
      const index = baseIndex + i;
      const isSAContent = index % 3 === 0; // Every 3rd post is SA-focused
      const topic = isSAContent
        ? saTopics[index % saTopics.length]
        : saTechTrends[index % saTechTrends.length];

      return {
        id: `post-${index + 1}`,
        title: isSAContent
          ? `${topic}: Insights from the ${saUtils.SA_MAJOR_CITIES[index % saUtils.SA_MAJOR_CITIES.length].name} Tech Hub`
          : `Mastering ${saUtils.SA_TECH_SKILLS[index % saUtils.SA_TECH_SKILLS.length]}: A Complete Guide for SA Developers`,
        excerpt: isSAContent
          ? `Discover how ${topic.toLowerCase()} is shaping South Africa's digital future with insights from leading local innovators and entrepreneurs.`
          : `Learn ${saUtils.SA_TECH_SKILLS[index % saUtils.SA_TECH_SKILLS.length]} with practical examples tailored for the South African tech market and job opportunities.`,
        content: 'Full article content would be here...',
        category: isSAContent ? 'sa-tech' : 'technical',
        tags: isSAContent
          ? ['SA Tech', 'Innovation', 'Startups', 'Local Business']
          : ['Programming', 'Career', 'Skills', 'Tutorial'],
        author: {
          name: saUtils.SA_NAMES[index % saUtils.SA_NAMES.length],
          avatar: `/images/avatars/sa-author${(index % 10) + 1}.jpg`,
          bio: isSAContent
            ? `Tech entrepreneur and thought leader based in ${saUtils.SA_MAJOR_CITIES[index % saUtils.SA_MAJOR_CITIES.length].name}`
            : `Senior developer at ${saUtils.SA_TECH_COMPANIES[index % saUtils.SA_TECH_COMPANIES.length]}`,
          isVerified: index % 4 === 0,
          isSABased: true,
        },
        publishedAt: new Date(
          Date.now() - index * 24 * 60 * 60 * 1000
        ).toISOString(),
        readTime: Math.floor(Math.random() * 10) + 5,
        views: Math.floor(Math.random() * 5000) + 1000,
        likes: Math.floor(Math.random() * 200) + 50,
        bookmarks: Math.floor(Math.random() * 100) + 20,
        comments: Math.floor(Math.random() * 50) + 5,
        featured: index < 2,
        image: `/images/blog/sa-tech-${(index % 20) + 1}.jpg`,
        sourceUrl: `https://sa-tech-blog.co.za/article/${index + 1}`,
        region: isSAContent ? 'south-africa' : 'global',
        difficulty: ['Beginner', 'Intermediate', 'Advanced'][index % 3],
        estimatedEarning: isSAContent
          ? `R${50 + index * 10}k - R${80 + index * 15}k`
          : null,
        jobRelevance: Math.floor(Math.random() * 30) + 70, // 70-100% job relevance
      };
    });
  };

  // Fetch posts when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchPosts(1, true);
  }, [filters]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage, false);
  };

  const toggleBookmark = async postId => {
    try {
      const isBookmarked = bookmarkedPosts.has(postId);

      if (isBookmarked) {
        await blogAPI.removeBookmark(postId);
        setBookmarkedPosts(prev => {
          const newBookmarks = new Set(prev);
          newBookmarks.delete(postId);
          return newBookmarks;
        });
        toast.success('Article removed from bookmarks');
      } else {
        await blogAPI.addBookmark(postId);
        setBookmarkedPosts(prev => new Set([...prev, postId]));
        toast.success('Article bookmarked successfully');
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      // Fallback to local state
      setBookmarkedPosts(prev => {
        const newBookmarks = new Set(prev);
        if (newBookmarks.has(postId)) {
          newBookmarks.delete(postId);
          toast.success('Article removed from bookmarks');
        } else {
          newBookmarks.add(postId);
          toast.success('Article bookmarked successfully');
        }
        return newBookmarks;
      });
    }
  };

  const toggleLike = async postId => {
    try {
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        await blogAPI.unlikePost(postId);
        setLikedPosts(prev => {
          const newLikes = new Set(prev);
          newLikes.delete(postId);
          return newLikes;
        });
      } else {
        await blogAPI.likePost(postId);
        setLikedPosts(prev => new Set([...prev, postId]));
      }
    } catch (error) {
      console.error('Like error:', error);
      // Fallback to local state
      setLikedPosts(prev => {
        const newLikes = new Set(prev);
        if (newLikes.has(postId)) {
          newLikes.delete(postId);
        } else {
          newLikes.add(postId);
        }
        return newLikes;
      });
    }
  };

  const sharePost = async post => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.origin + `/blog/${post.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        window.location.origin + `/blog/${post.id}`
      );
      toast.success('Article link copied to clipboard');
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRegionBadge = region => {
    if (region === 'south-africa') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          <Flag className="mr-1 h-3 w-3" />
          SA Content
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
        <Globe className="mr-1 h-3 w-3" />
        Global
      </span>
    );
  };

  if (isLoadingPosts && posts.length === 0) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-12 text-center ${className}`}
      >
        <div className="mx-auto max-w-sm">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Failed to Load Articles
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            We're having trouble connecting to our content sources. Please try
            again.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => fetchPosts(1, true)}
          >
            Retry Loading
          </Button>
        </div>
      </motion.div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-12 text-center ${className}`}
      >
        <div className="mx-auto max-w-sm">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No articles found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search criteria or explore different categories.
          </p>
          <Button variant="secondary" className="mt-4">
            Browse All Articles
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Featured Post (if any) */}
      {posts.find(post => post.featured) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {(() => {
            const featuredPost = posts.find(post => post.featured);
            const isBookmarked = bookmarkedPosts.has(featuredPost.id);
            const isLiked = likedPosts.has(featuredPost.id);

            return (
              <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl">
                <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2">
                  <div className="text-white">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Featured Article
                        </span>
                      </div>
                      {getRegionBadge(featuredPost.region)}
                    </div>

                    <h2 className="mb-4 line-clamp-2 text-2xl font-bold md:text-3xl">
                      {featuredPost.title}
                    </h2>

                    <p className="mb-6 line-clamp-3 text-indigo-100">
                      {featuredPost.excerpt}
                    </p>

                    {/* Author Info */}
                    <div className="mb-4 flex items-center space-x-3">
                      <Avatar
                        src={featuredPost.author.avatar}
                        name={featuredPost.author.name}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {featuredPost.author.name}
                          </span>
                          {featuredPost.author.isVerified && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                          {featuredPost.author.isSABased && (
                            <Flag className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-indigo-200">
                          {featuredPost.author.bio}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime} min read</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(featuredPost.views)} views</span>
                      </div>
                    </div>

                    {/* SA Specific Info */}
                    {featuredPost.estimatedEarning && (
                      <div className="mb-6 rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                        <div className="text-sm font-medium">
                          💼 SA Salary Relevance
                        </div>
                        <div className="text-lg">
                          {featuredPost.estimatedEarning}
                        </div>
                        <div className="text-xs text-indigo-200">
                          {featuredPost.jobRelevance}% relevant to current SA
                          job market
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Button
                        as={Link}
                        to={`/blog/${featuredPost.id}`}
                        variant="secondary"
                        className="bg-white text-indigo-600 hover:bg-gray-50"
                      >
                        Read Article
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>

                      <button
                        onClick={() => toggleBookmark(featuredPost.id)}
                        className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            isBookmarked
                              ? 'fill-current text-yellow-300'
                              : 'text-white'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => sharePost(featuredPost)}
                        className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="aspect-video rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm" />
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPage}-${JSON.stringify(filters)}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {posts.map((post, index) => {
            const isBookmarked = bookmarkedPosts.has(post.id);
            const isLiked = likedPosts.has(post.id);

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    {getRegionBadge(post.region)}
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                      {post.difficulty}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className="absolute right-4 bottom-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isBookmarked
                          ? 'fill-current text-indigo-600'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  {/* Tags */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                    {post.excerpt}
                  </p>

                  {/* SA Salary Info */}
                  {post.estimatedEarning && post.region === 'south-africa' && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-800">
                            💼 SA Earning Potential
                          </div>
                          <div className="text-lg font-semibold text-green-700">
                            {post.estimatedEarning}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {post.jobRelevance}%
                          </div>
                          <div className="text-xs text-green-600">
                            Job Relevance
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Author & Meta */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={post.author.avatar}
                        name={post.author.name}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-gray-900">
                            {post.author.name}
                          </p>
                          {post.author.isVerified && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                          {post.author.isSABased && (
                            <Flag className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(post.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`transition-colors ${
                          isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                        />
                      </button>

                      <button
                        onClick={() => sharePost(post)}
                        className="text-gray-400 transition-colors hover:text-indigo-500"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>

                      <Link
                        to={`/blog/${post.id}`}
                        className="font-medium text-indigo-600 transition-all group-hover:underline hover:text-indigo-700"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Load More */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={loadMore}
            size="lg"
            variant="secondary"
            loading={isLoadingPosts}
            disabled={isLoadingPosts}
          >
            {isLoadingPosts ? 'Loading More Articles...' : 'Load More Articles'}
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Showing {posts.length} of {formatNumber(totalPosts)} articles
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BlogList;
