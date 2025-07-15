import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  TrendingUp,
  BookOpen,
  Code,
  Briefcase,
  Users,
  Award,
  Zap,
  ChevronDown,
  Globe,
  MapPin,
  Building,
  Smartphone,
  Database,
  Cloud,
  Palette,
} from 'lucide-react';
import Button from '../../components/ui/Button';

// API Services
import { blogAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';

const BlogFilters = ({
  onFiltersChange,
  totalPosts = 0,
  isLoading = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all'); // SA-specific
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Backend data
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Fetch filter options from backend
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const [categoriesResponse, tagsResponse, authorsResponse] =
          await Promise.all([
            blogAPI.getCategories(),
            blogAPI.getPopularTags(),
            blogAPI.getAuthors(),
          ]);

        if (categoriesResponse.success) {
          setCategories([
            {
              value: 'all',
              label: 'All Articles',
              icon: BookOpen,
              count: totalPosts,
            },
            ...categoriesResponse.data.map(cat => ({
              value: cat.slug,
              label: cat.name,
              icon: getCategoryIcon(cat.slug),
              count: cat.postCount,
            })),
          ]);
        }

        if (tagsResponse.success) {
          setPopularTags(tagsResponse.data);
        }

        if (authorsResponse.success) {
          setAuthors([
            { value: 'all', label: 'All Authors' },
            ...authorsResponse.data.map(author => ({
              value: author.slug,
              label: author.name,
              postCount: author.postCount,
            })),
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);

        // Fallback to SA-focused static data
        setCategories([
          {
            value: 'all',
            label: 'All Articles',
            icon: BookOpen,
            count: totalPosts,
          },
          {
            value: 'career',
            label: 'Career Development',
            icon: TrendingUp,
            count: 68,
          },
          {
            value: 'technical',
            label: 'Technical Tutorials',
            icon: Code,
            count: 92,
          },
          { value: 'sa-tech', label: 'SA Tech Scene', icon: MapPin, count: 45 },
          {
            value: 'industry',
            label: 'Industry News',
            icon: Briefcase,
            count: 38,
          },
          { value: 'networking', label: 'Networking', icon: Users, count: 29 },
          {
            value: 'skills',
            label: 'Skill Development',
            icon: Award,
            count: 34,
          },
          { value: 'startup', label: 'SA Startups', icon: Zap, count: 23 },
        ]);

        setPopularTags([
          'React',
          'JavaScript',
          'Python',
          'Career Growth',
          'Remote Work',
          'TypeScript',
          'Interview Tips',
          'Salary Negotiation',
          'Leadership',
          'Node.js',
          'Portfolio',
          'Freelancing',
          'SA Startups',
          'Cape Town Tech',
          'Johannesburg Tech',
          'Discovery Bank',
          'Takealot',
          'Naspers',
          'Open Source',
          'DevOps',
          'Mobile Dev',
          'Fintech',
        ]);

        setAuthors([
          { value: 'all', label: 'All Authors' },
          { value: 'sarah-chen', label: 'Sarah Chen', postCount: 24 },
          { value: 'marcus-johnson', label: 'Marcus Johnson', postCount: 18 },
          { value: 'elena-rodriguez', label: 'Elena Rodriguez', postCount: 16 },
          { value: 'thabo-mthembu', label: 'Thabo Mthembu', postCount: 22 },
          { value: 'priya-naidoo', label: 'Priya Naidoo', postCount: 19 },
        ]);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, [totalPosts]);

  // Get category icon
  const getCategoryIcon = category => {
    const iconMap = {
      career: TrendingUp,
      technical: Code,
      'sa-tech': MapPin,
      industry: Briefcase,
      networking: Users,
      skills: Award,
      startup: Zap,
      mobile: Smartphone,
      backend: Database,
      devops: Cloud,
      design: Palette,
      frontend: Globe,
    };
    return iconMap[category] || BookOpen;
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'sa-relevant', label: 'SA Relevant' }, // SA-specific sort
  ];

  const regionOptions = [
    { value: 'all', label: 'Global + SA Content' },
    { value: 'sa-only', label: 'SA Content Only', icon: '🇿🇦' },
    { value: 'global-only', label: 'Global Content Only', icon: '🌍' },
  ];

  // Update filters when any filter changes
  useEffect(() => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      tags: selectedTags,
      sortBy,
      author: authorFilter,
      region: regionFilter,
    };

    onFiltersChange?.(filters);
  }, [
    searchTerm,
    selectedCategory,
    selectedTags,
    sortBy,
    authorFilter,
    regionFilter,
    onFiltersChange,
  ]);

  const toggleTag = tag => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSortBy('newest');
    setAuthorFilter('all');
    setRegionFilter('all');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== 'all' ||
    selectedTags.length > 0 ||
    sortBy !== 'newest' ||
    authorFilter !== 'all' ||
    regionFilter !== 'all';

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (sortBy !== 'newest') count++;
    if (authorFilter !== 'all') count++;
    if (regionFilter !== 'all') count++;
    return count;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          placeholder="Search articles, tutorials, SA tech news..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </motion.div>

      {/* Quick SA Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-gray-900">
          Quick SA Filters
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { tag: 'SA Startups', icon: '🚀' },
            { tag: 'Cape Town Tech', icon: '🏔️' },
            { tag: 'Discovery Bank', icon: '🏛️' },
            { tag: 'Takealot', icon: '🛒' },
            { tag: 'Remote Work SA', icon: '🏠' },
          ].map((item, index) => (
            <button
              key={item.tag}
              onClick={() => toggleTag(item.tag)}
              className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                selectedTags.includes(item.tag)
                  ? 'bg-green-100 text-green-800 ring-1 ring-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.tag}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Categories</h3>
        {isLoadingFilters ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.value;

              return (
                <motion.button
                  key={category.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isSelected
                        ? 'bg-indigo-200 text-indigo-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {category.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Region Filter (SA-specific) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Content Region
        </h3>
        <div className="space-y-2">
          {regionOptions.map(region => (
            <label key={region.value} className="flex items-center">
              <input
                type="radio"
                name="region"
                value={region.value}
                checked={regionFilter === region.value}
                onChange={e => setRegionFilter(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 flex items-center text-sm text-gray-700">
                {region.icon && <span className="mr-1">{region.icon}</span>}
                {region.label}
              </span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Advanced Filters Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showAdvanced ? 'rotate-180' : ''
            }`}
          />
        </button>
      </motion.div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 border-t border-gray-200 pt-4"
          >
            {/* Sort Options */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Sort By
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Author Filter */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Author
              </h3>
              {isLoadingFilters ? (
                <div className="h-10 animate-pulse rounded bg-gray-200" />
              ) : (
                <select
                  value={authorFilter}
                  onChange={e => setAuthorFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  {authors.map(author => (
                    <option key={author.value} value={author.value}>
                      {author.label}
                      {author.postCount && ` (${author.postCount} posts)`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Popular Tags */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Popular Tags
                {selectedTags.length > 0 && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                    {selectedTags.length} selected
                  </span>
                )}
              </h3>
              {isLoadingFilters ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 animate-pulse rounded bg-gray-200"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    const isSATag =
                      tag.includes('SA') ||
                      tag.includes('Cape Town') ||
                      tag.includes('Johannesburg') ||
                      tag.includes('Discovery') ||
                      tag.includes('Takealot');

                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? 'scale-105 bg-indigo-600 text-white shadow-md'
                            : isSATag
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:scale-105 hover:bg-gray-200'
                        }`}
                      >
                        {isSATag && !isSelected && '🇿🇦 '}
                        {tag}
                        {isSelected && <X className="ml-1 inline h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary & Clear Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-between border-t border-gray-200 pt-4"
      >
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span>Searching global & SA content...</span>
              </span>
            ) : (
              <span>
                <span className="font-semibold text-gray-900">
                  {totalPosts.toLocaleString()}
                </span>{' '}
                articles found
              </span>
            )}
          </p>

          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="mr-1 h-4 w-4" />
              Clear all ({getFilterCount()})
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Search: &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                {categories.find(c => c.value === selectedCategory)?.label}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {regionFilter !== 'all' && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                {regionOptions.find(r => r.value === regionFilter)?.label}
                <button onClick={() => setRegionFilter('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedTags.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                <button onClick={() => setSelectedTags([])} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlogFilters;
