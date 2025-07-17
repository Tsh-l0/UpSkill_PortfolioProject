import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Hooks and utilities
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';

// Components
import TalentFilters from './TalentFilters';
import TalentList from './TalentList';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SectionLoading } from '../../components/ui/Loading';

// API Services
import { usersAPI, skillsAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import { formatNumber } from '../../utils/formatters';

const MeetTalent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    skills: searchParams.getAll('skills') || [],
    experience: searchParams.get('experience') || '',
    location: searchParams.get('location') || '',
    workType: searchParams.get('workType') || '',
    availability: searchParams.get('availability') || '',
    minRating: searchParams.get('minRating') || '',
    salary: searchParams.get('salary') || '',
    company: searchParams.get('company') || '',
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [viewMode, setViewMode] = useLocalStorage('talent-view-mode', 'grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Debounced search
  const { debouncedValue: debouncedSearch } = useDebounce(searchQuery, 300);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to browse SA developers');
      navigate('/login', { state: { from: { pathname: '/talent' } } });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch available skills for filters
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillsAPI.getAllSkills({
          featured: true,
          limit: 50,
        });
        if (response.success) {
          setAvailableSkills(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
        // Use SA tech skills as fallback
        setAvailableSkills(
          saUtils.SA_TECH_SKILLS.map(skill => ({
            _id: skill,
            name: skill,
            category: 'tech',
          }))
        );
      }
    };

    if (isAuthenticated) {
      fetchSkills();
    }
  }, [isAuthenticated]);

  // Fetch developers from backend
  const fetchDevelopers = async (page = 1, resetData = true) => {
    if (!isAuthenticated) return;

    setIsLoading(resetData);
    setError(null);

    try {
      const searchParams = {
        q: debouncedSearch,
        page,
        limit: 12,
        sortBy,
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

      let response;

      if (
        debouncedSearch ||
        Object.keys(filters).some(
          key =>
            filters[key] &&
            (!Array.isArray(filters[key]) || filters[key].length > 0)
        )
      ) {
        // Use search endpoint for filtered results
        response = await usersAPI.searchUsers(searchParams);
      } else {
        // Use trending users for default view
        response = await usersAPI.getTrendingUsers({
          page,
          limit: 12,
          sortBy,
        });
      }

      if (response.success) {
        const developersData = response.data.users || response.data;
        const total =
          response.data.total || response.totalCount || developersData.length;

        if (resetData || page === 1) {
          setDevelopers(developersData);
        } else {
          // Append for pagination
          setDevelopers(prev => [...prev, ...developersData]);
        }

        setTotalCount(total);
      } else {
        throw new Error(response.message || 'Failed to fetch developers');
      }
    } catch (error) {
      console.error('Failed to fetch developers:', error);
      setError('Failed to load developers');

      // Fallback to SA mock data
      const mockData = generateSADevelopersData();
      setDevelopers(mockData);
      setTotalCount(mockData.length);

      if (resetData) {
        toast.error('Using demo data - connection issue detected');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate SA-localized mock developers data as fallback
  const generateSADevelopersData = () => {
    const saCities = saUtils.SA_MAJOR_CITIES;
    const saCompanies = saUtils.SA_TECH_COMPANIES;
    const saSkills = saUtils.SA_TECH_SKILLS;
    const salaryRanges = saUtils.SA_SALARY_RANGES;

    return Array.from({ length: 20 }, (_, i) => {
      const city = saCities[i % saCities.length];
      const company = saCompanies[i % saCompanies.length];
      const experienceLevel = ['junior', 'mid', 'senior'][i % 3];
      const salaryRange = salaryRanges[experienceLevel];

      return {
        id: `sa-dev-${i + 1}`,
        name: `${saUtils.SA_NAMES[i % saUtils.SA_NAMES.length]}`,
        title: `${['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'][i % 5]} Developer`,
        location: city.fullName,
        avatar: `/images/avatars/sa-dev${i + 1}.jpg`,
        bio: `Experienced SA developer specializing in ${saSkills[i % saSkills.length]} and modern web technologies. Passionate about building scalable solutions for the African market.`,
        skills: saSkills.slice(i % 5, (i % 5) + 4).map(skill => ({
          name: skill,
          level: ['beginner', 'intermediate', 'advanced', 'expert'][
            Math.floor(Math.random() * 4)
          ],
          endorsements: Math.floor(Math.random() * 30) + 5,
        })),
        experience: experienceLevel,
        workType: ['remote', 'hybrid', 'onsite'][i % 3],
        availability: ['open-to-work', 'networking'][i % 2],
        endorsements: Math.floor(Math.random() * 50) + 20,
        connections: Math.floor(Math.random() * 200) + 50,
        rating: 4.5 + Math.random() * 0.4,
        joinedDate: '2023-01-01',
        lastActive: '2024-01-15',
        github: `sa-dev-${i + 1}`,
        linkedin: `sa-developer-${i + 1}`,
        website: i % 3 === 0 ? `https://sadev${i + 1}.co.za` : null,
        currentCompany: company,
        hourlyRate: `R${salaryRange.min}-${salaryRange.max}/hour`,
        responseTime: `< ${1 + (i % 6)} hours`,
        projects: 10 + i,
        featured: i < 3,
        country: 'South Africa',
        province: city.province,
        techHub: city.techHub,
        isOnline: Math.random() > 0.3,
        isProfilePublic: true,
        allowMessages: true,
        allowEndorsements: true,
      };
    });
  };

  // Fetch developers when filters or search changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1);
      fetchDevelopers(1, true);
    }
  }, [debouncedSearch, filters, sortBy, isAuthenticated]);

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (filters.skills.length) {
      filters.skills.forEach(skill => params.append('skills', skill));
    }
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.location) params.set('location', filters.location);
    if (filters.workType) params.set('workType', filters.workType);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.salary) params.set('salary', filters.salary);
    if (filters.company) params.set('company', filters.company);
    if (sortBy !== 'relevance') params.set('sort', sortBy);

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, filters, sortBy, setSearchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      skills: [],
      experience: '',
      location: '',
      workType: '',
      availability: '',
      minRating: '',
      salary: '',
      company: '',
    });
    setSortBy('relevance');
  };

  const hasActiveFilters =
    debouncedSearch ||
    filters.skills.length > 0 ||
    filters.experience ||
    filters.location ||
    filters.workType ||
    filters.availability ||
    filters.minRating ||
    filters.salary ||
    filters.company;

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchDevelopers(nextPage, false);
  };

  // Filter and sort developers locally for better UX
  const filteredDevelopers = useMemo(() => {
    return developers; // Backend already filters, but we could add client-side refinements here
  }, [developers]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading && developers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionLoading rows={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                      Meet South African Talent
                    </h1>
                    <p className="mt-1 text-lg text-gray-600">
                      Connect with {formatNumber(totalCount)}+ skilled
                      developers from across SA
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <div className="flex items-center space-x-3">
                  {/* View Toggle */}
                  <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-indigo-600" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, title, location, or company..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-4 pl-10"
                />
              </div>
            </div>

            {/* SA Location Shortcuts */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Quick filters:</span>
                {saUtils.SA_MAJOR_CITIES.slice(0, 5).map(city => (
                  <button
                    key={city.name}
                    onClick={() =>
                      setFilters(prev => ({ ...prev, location: city.fullName }))
                    }
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    {city.name}
                  </button>
                ))}
                {saUtils.SA_TECH_COMPANIES.slice(0, 3).map(company => (
                  <button
                    key={company}
                    onClick={() => setFilters(prev => ({ ...prev, company }))}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    <Briefcase className="mr-1 h-3 w-3" />
                    {company}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3"
              >
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <span className="font-medium">Active filters:</span>
                  {debouncedSearch && (
                    <span className="rounded bg-indigo-100 px-2 py-1">
                      &quot;{debouncedSearch}&quot;
                    </span>
                  )}
                  {filters.skills.map(skill => (
                    <span
                      key={skill}
                      className="rounded bg-indigo-100 px-2 py-1"
                    >
                      {skill}
                    </span>
                  ))}
                  {filters.experience && (
                    <span className="rounded bg-indigo-100 px-2 py-1">
                      {filters.experience} level
                    </span>
                  )}
                  {filters.location && (
                    <span className="rounded bg-indigo-100 px-2 py-1">
                      📍 {filters.location}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Clear all
                </Button>
              </motion.div>
            )}

            {/* Results Count and Sort */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  'Searching SA developers...'
                ) : error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  <>
                    {formatNumber(filteredDevelopers.length)} developer
                    {filteredDevelopers.length !== 1 ? 's' : ''} found
                    {totalCount > filteredDevelopers.length && (
                      <span className="text-gray-500">
                        {' '}
                        of {formatNumber(totalCount)} total
                      </span>
                    )}
                  </>
                )}
              </p>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="endorsements">Endorsements</option>
                  <option value="joinDate">Recently Joined</option>
                  <option value="lastActive">Last Active</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="lg:sticky lg:top-8"
                >
                  <TalentFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilters(false)}
                    availableSkills={availableSkills}
                    className="lg:block"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Developers List */}
          <div className="mt-8 lg:col-span-3 lg:mt-0">
            <TalentList
              developers={filteredDevelopers}
              viewMode={viewMode}
              isLoading={isLoading && developers.length === 0}
              hasMore={totalCount > developers.length}
              onLoadMore={loadMore}
              loadingMore={isLoading && developers.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetTalent;
