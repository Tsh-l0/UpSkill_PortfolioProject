import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Grid,
  List,
  BookOpen,
  Tag,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import BlogList from './BlogList';
import BlogFilters from './BlogFilters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SectionLoading } from '../../components/ui/Loading';

// API Services
import { blogAPI } from '../../services/api/users';

// Utils
import { formatNumber } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';

const CATEGORIES = [
  { value: 'all', label: 'All Articles', count: 150 },
  { value: 'career', label: 'Career Development', count: 45 },
  { value: 'technical', label: 'Technical Tutorials', count: 60 },
  { value: 'sa-tech', label: 'SA Tech Scene', count: 25 },
  { value: 'networking', label: 'Professional Networking', count: 20 },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
];

const Blog = () => {
  const { postId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage('blog-view-mode', 'grid');

  // Debounced search
  const { debouncedValue: debouncedSearch } = useDebounce(searchQuery, 300);

  // Fetch blog posts with React Query
  const {
    data: postsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blogPosts', debouncedSearch, selectedCategory, sortBy],
    queryFn: async () => {
      try {
        const params = {
          q: debouncedSearch || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy,
          limit: 20,
          status: 'published',
        };

        // Remove undefined values
        Object.keys(params).forEach(key => {
          if (params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await blogAPI.getPosts(params);
        return response;
      } catch (error) {
        console.warn('Blog API failed, using fallback data:', error);
        // Return fallback data instead of throwing
        return {
          success: true,
          data: generateFallbackPosts(),
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Generate fallback blog posts
  function generateFallbackPosts() {
    const fallbackPosts = [
      {
        id: 'post-1',
        title: '10 Essential Skills for South African Developers in 2024',
        excerpt:
          'Discover the most in-demand technical skills that will boost your career in the South African tech market.',
        content: 'As the South African tech industry continues to grow...',
        category: 'sa-tech',
        tags: ['Career', 'Skills', 'South Africa', 'Development'],
        author: {
          name: 'Sarah Chen',
          avatar: '/images/avatars/author1.jpg',
          bio: 'Senior Developer at Discovery Bank',
        },
        featuredImage: '/images/blog/sa-skills-2024.jpg',
        publishedAt: '2024-01-15T10:00:00Z',
        readTime: '8 min read',
        views: 1250,
        likes: 89,
        bookmarks: 34,
        slug: 'essential-skills-sa-developers-2024',
      },
      {
        id: 'post-2',
        title: 'Building Your First React App: A Complete Guide',
        excerpt:
          'Step-by-step tutorial for creating a modern React application with hooks, routing, and state management.',
        content: 'React has become one of the most popular...',
        category: 'technical',
        tags: ['React', 'JavaScript', 'Tutorial', 'Frontend'],
        author: {
          name: 'Marcus Johnson',
          avatar: '/images/avatars/author2.jpg',
          bio: 'Frontend Architect at Takealot',
        },
        featuredImage: '/images/blog/react-guide.jpg',
        publishedAt: '2024-01-12T14:30:00Z',
        readTime: '12 min read',
        views: 890,
        likes: 67,
        bookmarks: 45,
        slug: 'building-first-react-app-guide',
      },
      {
        id: 'post-3',
        title: 'Networking Tips for Tech Professionals in Cape Town',
        excerpt:
          'Learn how to build meaningful professional relationships in the Cape Town tech scene.',
        content: 'Cape Town has emerged as a major tech hub...',
        category: 'networking',
        tags: ['Networking', 'Cape Town', 'Career', 'Professional'],
        author: {
          name: 'Elena Rodriguez',
          avatar: '/images/avatars/author3.jpg',
          bio: 'Tech Community Manager',
        },
        featuredImage: '/images/blog/cape-town-networking.jpg',
        publishedAt: '2024-01-10T09:15:00Z',
        readTime: '6 min read',
        views: 650,
        likes: 42,
        bookmarks: 28,
        slug: 'networking-tips-cape-town-tech',
      },
      {
        id: 'post-4',
        title: 'Remote Work Best Practices for SA Developers',
        excerpt:
          'Maximize your productivity and maintain work-life balance while working remotely in South Africa.',
        content: 'Remote work has become the new normal...',
        category: 'career',
        tags: ['Remote Work', 'Productivity', 'Career', 'South Africa'],
        author: {
          name: 'Thabo Mthembu',
          avatar: '/images/avatars/author4.jpg',
          bio: 'Senior Developer at Naspers',
        },
        featuredImage: '/images/blog/remote-work-sa.jpg',
        publishedAt: '2024-01-08T16:45:00Z',
        readTime: '10 min read',
        views: 1100,
        likes: 78,
        bookmarks: 52,
        slug: 'remote-work-best-practices-sa-developers',
      },
      {
        id: 'post-5',
        title: 'Getting Started with Python for Data Science',
        excerpt:
          'A beginner-friendly introduction to Python programming for data science applications.',
        content: 'Python has become the go-to language...',
        category: 'technical',
        tags: ['Python', 'Data Science', 'Tutorial', 'Beginner'],
        author: {
          name: 'Naledi Motsepe',
          avatar: '/images/avatars/author5.jpg',
          bio: 'Data Scientist at Standard Bank',
        },
        featuredImage: '/images/blog/python-data-science.jpg',
        publishedAt: '2024-01-05T11:20:00Z',
        readTime: '15 min read',
        views: 750,
        likes: 55,
        bookmarks: 38,
        slug: 'getting-started-python-data-science',
      },
      {
        id: 'post-6',
        title: 'The Rise of Fintech in South Africa',
        excerpt:
          'Exploring the growth of financial technology companies and opportunities in the SA market.',
        content: "South Africa's fintech sector has experienced...",
        category: 'sa-tech',
        tags: ['Fintech', 'South Africa', 'Innovation', 'Finance'],
        author: {
          name: 'Riaan du Plessis',
          avatar: '/images/avatars/author6.jpg',
          bio: 'Fintech Consultant',
        },
        featuredImage: '/images/blog/sa-fintech-rise.jpg',
        publishedAt: '2024-01-03T13:10:00Z',
        readTime: '7 min read',
        views: 920,
        likes: 63,
        bookmarks: 41,
        slug: 'rise-of-fintech-south-africa',
      },
    ];

    // Filter by category if not 'all'
    const filteredPosts =
      selectedCategory === 'all'
        ? fallbackPosts
        : fallbackPosts.filter(post => post.category === selectedCategory);

    // Filter by search query
    const searchFiltered = debouncedSearch
      ? filteredPosts.filter(
          post =>
            post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            post.excerpt
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()) ||
            post.tags.some(tag =>
              tag.toLowerCase().includes(debouncedSearch.toLowerCase())
            )
        )
      : filteredPosts;

    // Sort posts
    const sortedPosts = [...searchFiltered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt) - new Date(b.publishedAt);
        case 'popular':
          return b.views - a.views;
        case 'trending':
          return b.likes - a.likes;
        case 'newest':
        default:
          return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
    });

    return sortedPosts;
  }

  // Extract posts safely
  const rawPosts = postsResponse?.data;
  let posts = [];

  if (Array.isArray(rawPosts)) {
    posts = rawPosts;
  } else if (rawPosts && Array.isArray(rawPosts.posts)) {
    posts = rawPosts.posts;
  } else {
    posts = generateFallbackPosts();
  }

  // Ensure posts is always an array
  posts = Array.isArray(posts) ? posts : [];

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, sortBy, setSearchParams]);

  // Handle search
  const handleSearch = value => {
    setSearchQuery(value);
  };

  // Handle category change
  const handleCategoryChange = category => {
    setSelectedCategory(category);
  };

  // Handle sort change
  const handleSortChange = sort => {
    setSortBy(sort);
  };

  // If viewing a specific post, handle that here (could be a separate component)
  if (postId) {
    // This would typically load and display a single blog post
    // For now, redirect to blog list
    return <div>Single post view for ID: {postId}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Developer Insights & Resources
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100 md:text-xl">
              Stay updated with the latest trends, tutorials, and career advice
              for developers in South Africa and beyond.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles, tutorials, and resources..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full rounded-full bg-white pr-4 pl-12 text-lg"
                  size="lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Categories */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {CATEGORIES.map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  <span className="ml-1 text-xs opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden w-80 flex-shrink-0 md:block">
              <BlogFilters
                filters={{}}
                onFiltersChange={() => {}}
                categories={CATEGORIES}
              />
            </aside>
          )}

          {/* Blog Posts */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {debouncedSearch
                    ? `Search results for "${debouncedSearch}"`
                    : 'Latest Articles'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isLoading
                    ? 'Loading...'
                    : `${formatNumber(posts.length)} articles found`}
                </p>
              </div>
            </div>

            {/* Error State */}
            {error && !isLoading && posts.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Unable to load articles
                </h3>
                <p className="mb-6 text-gray-600">
                  There was an error loading the blog posts. Please try again.
                </p>
                <Button onClick={() => refetch()} variant="primary">
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <SectionLoading rows={6} />}

            {/* Blog List */}
            {!isLoading && posts.length > 0 && (
              <BlogList posts={posts} viewMode={viewMode} isLoading={false} />
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && !error && (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No articles found
                </h3>
                <p className="mb-6 text-gray-600">
                  {debouncedSearch || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Check back later for new articles and resources.'}
                </p>
                {(debouncedSearch || selectedCategory !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    variant="secondary"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Blog;
