import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Code,
  Server,
  Smartphone,
  Cloud,
  Database,
  Palette,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { SectionLoading } from '../../components/ui/Loading';
import { skillsAPI } from '../../services/api/users';
import saUtils from '../../services/utils/southAfrica';

const CATEGORIES = [
  { value: 'all', label: 'All Skills', icon: TrendingUp },
  { value: 'frontend', label: 'Frontend', icon: Code },
  { value: 'backend', label: 'Backend', icon: Server },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'devops', label: 'DevOps', icon: Cloud },
  { value: 'database', label: 'Database', icon: Database },
  { value: 'design', label: 'Design', icon: Palette },
];

const TrendingSkills = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);

  // Fetch trending skills from API with proper error handling
  const {
    data: skillsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trendingSkills', selectedCategory],
    queryFn: async () => {
      try {
        const response = await skillsAPI.getTrendingSkills({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          limit: 20,
          includeStats: true,
        });
        return response;
      } catch (error) {
        console.warn('Trending skills API failed, using fallback data:', error);
        // Return fallback data
        return {
          success: true,
          data: generateFallbackSkills(selectedCategory),
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 1, // Reduced retry to fail faster to fallback
  });

  // Safely extract skills array with proper validation
  const rawSkills = skillsResponse?.data;
  let skills = [];

  // Handle different response formats
  if (Array.isArray(rawSkills)) {
    skills = rawSkills;
  } else if (rawSkills && Array.isArray(rawSkills.skills)) {
    skills = rawSkills.skills;
  } else if (rawSkills && typeof rawSkills === 'object' && rawSkills.trending) {
    skills = Array.isArray(rawSkills.trending) ? rawSkills.trending : [];
  } else {
    // Use fallback skills
    skills = generateFallbackSkills(selectedCategory);
  }

  // Ensure skills is always an array
  skills = Array.isArray(skills) ? skills : [];

  // Filter and display skills safely
  const displayedSkills = skills.slice(0, displayCount);

  // Generate fallback trending skills data
  function generateFallbackSkills(category = 'all') {
    const trendingData = saUtils.getTrendingSkills();

    const fullSkillsData = [
      // Frontend Skills
      {
        name: 'React',
        category: 'frontend',
        growth: 25,
        userCount: 4500,
        jobCount: 125,
        difficulty: 'intermediate',
        description: 'Popular JavaScript library for building user interfaces',
      },
      {
        name: 'TypeScript',
        category: 'frontend',
        growth: 30,
        userCount: 3200,
        jobCount: 98,
        difficulty: 'intermediate',
        description:
          'Typed superset of JavaScript that compiles to plain JavaScript',
      },
      {
        name: 'Vue.js',
        category: 'frontend',
        growth: 18,
        userCount: 2100,
        jobCount: 67,
        difficulty: 'beginner',
        description:
          'Progressive JavaScript framework for building user interfaces',
      },
      {
        name: 'Angular',
        category: 'frontend',
        growth: 12,
        userCount: 2800,
        jobCount: 89,
        difficulty: 'advanced',
        description:
          'Platform for building mobile and desktop web applications',
      },

      // Backend Skills
      {
        name: 'Node.js',
        category: 'backend',
        growth: 22,
        userCount: 3800,
        jobCount: 112,
        difficulty: 'intermediate',
        description:
          "JavaScript runtime built on Chrome's V8 JavaScript engine",
      },
      {
        name: 'Python',
        category: 'backend',
        growth: 28,
        userCount: 5200,
        jobCount: 156,
        difficulty: 'beginner',
        description:
          'High-level programming language for web development and data science',
      },
      {
        name: 'Java',
        category: 'backend',
        growth: 8,
        userCount: 4100,
        jobCount: 134,
        difficulty: 'intermediate',
        description:
          'Object-oriented programming language for enterprise applications',
      },
      {
        name: 'C#',
        category: 'backend',
        growth: 15,
        userCount: 3100,
        jobCount: 95,
        difficulty: 'intermediate',
        description:
          'Modern, object-oriented programming language developed by Microsoft',
      },

      // Mobile Skills
      {
        name: 'React Native',
        category: 'mobile',
        growth: 35,
        userCount: 1800,
        jobCount: 45,
        difficulty: 'intermediate',
        description: 'Framework for building native mobile apps using React',
      },
      {
        name: 'Flutter',
        category: 'mobile',
        growth: 42,
        userCount: 1200,
        jobCount: 32,
        difficulty: 'intermediate',
        description: 'UI toolkit for building natively compiled applications',
      },

      // DevOps Skills
      {
        name: 'AWS',
        category: 'devops',
        growth: 32,
        userCount: 2900,
        jobCount: 87,
        difficulty: 'advanced',
        description: 'Amazon Web Services cloud computing platform',
      },
      {
        name: 'Docker',
        category: 'devops',
        growth: 28,
        userCount: 2600,
        jobCount: 76,
        difficulty: 'intermediate',
        description:
          'Platform for developing, shipping, and running applications in containers',
      },
      {
        name: 'Kubernetes',
        category: 'devops',
        growth: 38,
        userCount: 1500,
        jobCount: 43,
        difficulty: 'advanced',
        description:
          'Container orchestration platform for automating deployment',
      },

      // Database Skills
      {
        name: 'PostgreSQL',
        category: 'database',
        growth: 20,
        userCount: 2400,
        jobCount: 65,
        difficulty: 'intermediate',
        description: 'Advanced open source relational database',
      },
      {
        name: 'MongoDB',
        category: 'database',
        growth: 18,
        userCount: 2100,
        jobCount: 58,
        difficulty: 'beginner',
        description: 'Document-oriented NoSQL database',
      },

      // Design Skills
      {
        name: 'Figma',
        category: 'design',
        growth: 25,
        userCount: 1600,
        jobCount: 34,
        difficulty: 'beginner',
        description: 'Collaborative interface design tool',
      },
      {
        name: 'UI/UX Design',
        category: 'design',
        growth: 22,
        userCount: 1900,
        jobCount: 42,
        difficulty: 'intermediate',
        description: 'User interface and user experience design principles',
      },
    ];

    // Filter by category if not 'all'
    const filteredSkills =
      category === 'all'
        ? fullSkillsData
        : fullSkillsData.filter(skill => skill.category === category);

    // Add required fields
    return filteredSkills.map((skill, index) => ({
      _id: `skill-${index}`,
      id: `skill-${index}`,
      ...skill,
      averageSalary: getAverageSalary(skill.name),
      trending: skill.growth > 20,
      demandLevel:
        skill.growth > 30 ? 'Very High' : skill.growth > 20 ? 'High' : 'Medium',
    }));
  }

  function getAverageSalary(skillName) {
    const salaryMap = {
      React: 650000,
      TypeScript: 720000,
      'Vue.js': 580000,
      Angular: 680000,
      'Node.js': 620000,
      Python: 590000,
      Java: 670000,
      'C#': 650000,
      'React Native': 680000,
      Flutter: 650000,
      AWS: 780000,
      Docker: 690000,
      Kubernetes: 820000,
      PostgreSQL: 580000,
      MongoDB: 560000,
      Figma: 450000,
      'UI/UX Design': 520000,
    };
    return salaryMap[skillName] || 500000;
  }

  const getDifficultyColor = difficulty => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = salary => {
    if (!salary) return 'N/A';
    return saUtils.formatCurrency(salary, { maximumFractionDigits: 0 });
  };

  const getCategoryIcon = category => {
    const categoryData = CATEGORIES.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : Code;
  };

  // Error state
  if (error && !isLoading && skills.length === 0) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Unable to load trending skills
            </h2>
            <p className="mb-6 text-gray-600">
              There was an error loading the skills data. Please try again.
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
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionLoading rows={8} />
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
            Trending Skills in South Africa
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Stay ahead of the curve with the most in-demand skills in the South
            African developer community. Track growth trends and discover
            opportunities.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setDisplayCount(6); // Reset display count when changing category
                }}
                className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? 'scale-105 bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:scale-105 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* No data state */}
        {skills.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No trending skills found
            </h3>
            <p className="mb-6 text-gray-600">
              {selectedCategory === 'all'
                ? 'No skills data available at the moment.'
                : `No trending skills found in the ${selectedCategory} category.`}
            </p>
            <Button onClick={() => setSelectedCategory('all')} variant="ghost">
              View All Categories
            </Button>
          </div>
        )}

        {/* Skills Grid */}
        {skills.length > 0 && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedSkills.map((skill, index) => {
                const Icon = getCategoryIcon(skill.category);
                const growth = skill.growthRate || skill.growth || 0;
                const isPositive = growth >= 0;

                return (
                  <motion.div
                    key={skill._id || skill.id || `skill-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                  >
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 transition-colors group-hover:bg-indigo-200">
                          <Icon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                            {skill.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {skill.category}
                          </p>
                        </div>
                      </div>

                      {/* Trend Indicator */}
                      <div
                        className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium ${
                          isPositive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(growth)}%</span>
                      </div>
                    </div>

                    {/* Description */}
                    {skill.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {skill.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {(
                            skill.userCount ||
                            skill.developers ||
                            0
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Developers</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {skill.jobCount || skill.jobs || 0}
                        </div>
                        <div className="text-xs text-gray-500">Open Jobs</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex space-x-2">
                        {skill.difficulty && (
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(
                              skill.difficulty
                            )}`}
                          >
                            {skill.difficulty}
                          </span>
                        )}
                        {skill.trending && (
                          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                            🔥 Hot
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Salary */}
                    {skill.averageSalary && (
                      <div className="text-sm text-gray-600">
                        Avg Salary: {formatSalary(skill.averageSalary)}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Show More Button */}
            {skills.length > displayCount && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-8 text-center"
              >
                <Button
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  variant="ghost"
                  size="lg"
                >
                  Show More Skills
                </Button>
              </motion.div>
            )}

            {/* View All Skills CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Button as={Link} to="/talent" size="lg" className="px-8">
                Explore Developer Profiles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Stats Summary */}
        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 gap-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8 md:grid-cols-4"
          >
            {[
              {
                number: `${skills.length}+`,
                label: 'Skills Tracked',
                description: 'Comprehensive skill database',
              },
              {
                number: '10K+',
                label: 'Active Developers',
                description: 'Growing community',
              },
              {
                number: '2.3K',
                label: 'Job Openings',
                description: 'Current opportunities',
              },
              {
                number: '25%',
                label: 'Avg Growth',
                description: 'Year-over-year skill demand',
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-1 text-2xl font-bold text-indigo-600 md:text-3xl">
                  {stat.number}
                </div>
                <div className="mb-1 font-medium text-gray-900">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TrendingSkills;
