import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  MapPin,
  Briefcase,
  Star,
  Users,
  Filter,
  ChevronDown,
  Check,
  DollarSign,
  Clock,
  Award,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import useDebounce from '../../hooks/useDebounce';

// SA Utils
import saUtils from '../../services/utils/southAfrica';

// SA Tech Skills - Define locally since it doesn't exist in saUtils
const SA_TECH_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Express.js',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'HTML/CSS',
  'Tailwind CSS',
  'Bootstrap',
  'SCSS',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'Git',
  'GraphQL',
  'REST APIs',
  'Microservices',
  'DevOps',
  'CI/CD',
  'React Native',
  'Flutter',
  'iOS',
  'Android',
  'Figma',
  'UI/UX Design',
  'Photoshop',
  'Sketch',
];

// SA-specific filter options
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'junior', label: 'Junior (2-4 years)' },
  { value: 'mid', label: 'Mid Level (4-7 years)' },
  { value: 'senior', label: 'Senior (7+ years)' },
  { value: 'lead', label: 'Lead (10+ years)' },
  { value: 'principal', label: 'Principal (12+ years)' },
];

const WORK_TYPES = [
  { value: 'remote', label: 'Remote', icon: '🌍' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏢' },
  { value: 'onsite', label: 'On-site', icon: '🏛️' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'open-to-work', label: 'Open to Work', color: 'green' },
  { value: 'networking', label: 'Open to Network', color: 'blue' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4.0', label: '4.0+ Stars' },
  { value: '3.5', label: '3.5+ Stars' },
  { value: '3.0', label: '3.0+ Stars' },
];

// SA Salary ranges
const SA_SALARY_RANGES = [
  { value: 'entry', label: 'R15k - R25k/month', min: 15000, max: 25000 },
  { value: 'junior', label: 'R25k - R40k/month', min: 25000, max: 40000 },
  { value: 'mid', label: 'R40k - R60k/month', min: 40000, max: 60000 },
  { value: 'senior', label: 'R60k - R80k/month', min: 60000, max: 80000 },
  { value: 'lead', label: 'R80k+ /month', min: 80000, max: 150000 },
];

const TalentFilters = ({
  filters,
  onFiltersChange,
  onClose,
  availableSkills = [],
  className = '',
}) => {
  const [skillSearch, setSkillSearch] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [openSections, setOpenSections] = useState({
    skills: true,
    experience: true,
    location: false,
    workType: true,
    availability: true,
    salary: false,
    rating: false,
    company: false,
  });

  const skillInputRef = useRef(null);

  // Debounced skill search
  const { debouncedValue: debouncedSkillSearch } = useDebounce(
    skillSearch,
    200
  );

  // Get SA skills - combine backend skills with SA tech skills
  // Handle case where saUtils.SA_TECH_SKILLS might not exist
  const saUtilsSkills = saUtils.SA_TECH_SKILLS || SA_TECH_SKILLS;
  const saSkills = [
    ...new Set([
      ...saUtilsSkills,
      ...availableSkills.map(skill => skill.name || skill),
    ]),
  ];

  // Filter skills based on search
  const filteredSkills = saSkills.filter(skill =>
    skill.toLowerCase().includes(debouncedSkillSearch.toLowerCase())
  );

  const displayedSkills = showAllSkills
    ? filteredSkills
    : filteredSkills.slice(0, 8);

  const updateFilters = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSkill = skill => {
    const currentSkills = filters.skills || [];
    const isSelected = currentSkills.includes(skill);

    if (isSelected) {
      updateFilters(
        'skills',
        currentSkills.filter(s => s !== skill)
      );
    } else {
      updateFilters('skills', [...currentSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (skillSearch.trim() && !filters.skills.includes(skillSearch.trim())) {
      updateFilters('skills', [...(filters.skills || []), skillSearch.trim()]);
      setSkillSearch('');
    }
  };

  const handleSkillKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const removeSkill = skillToRemove => {
    updateFilters(
      'skills',
      filters.skills.filter(skill => skill !== skillToRemove)
    );
  };

  const toggleSection = section => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      skills: [],
      experience: '',
      location: '',
      workType: '',
      availability: '',
      minRating: '',
      salary: '',
      company: '',
    });
  };

  const hasActiveFilters =
    (filters.skills && filters.skills.length > 0) ||
    filters.experience ||
    filters.location ||
    filters.workType ||
    filters.availability ||
    filters.minRating ||
    filters.salary ||
    filters.company;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`bg-white lg:bg-transparent ${className}`}
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 lg:hidden">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="ml-2 text-lg font-semibold text-gray-900">
            SA Talent Filters
          </h2>
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6 p-4 lg:p-0">
        {/* Filter Header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter SA Developers
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Skills Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('skills')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Skills & Technologies</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.skills ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.skills && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Skill Search */}
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={skillInputRef}
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Selected Skills */}
                  {filters.skills && filters.skills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-700">
                        Selected Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filters.skills.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {displayedSkills.map(skill => (
                      <label
                        key={skill}
                        className="flex cursor-pointer items-center space-x-2 rounded-lg border p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills?.includes(skill) || false}
                          onChange={() => toggleSkill(skill)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>

                  {/* Show More/Less Skills */}
                  {filteredSkills.length > 8 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="w-full"
                    >
                      {showAllSkills
                        ? 'Show Less'
                        : `Show All (${filteredSkills.length})`}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Experience Level Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('experience')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Experience Level</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.experience ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.experience && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <label
                      key={level.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={level.value}
                        checked={filters.experience === level.value}
                        onChange={e =>
                          updateFilters('experience', e.target.value)
                        }
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('location')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Location</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.location ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.location && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <select
                  value={filters.location}
                  onChange={e => updateFilters('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All locations</option>
                  {(saUtils.SA_MAJOR_CITIES || []).map(city => (
                    <option
                      key={city.name || city}
                      value={city.fullName || city}
                    >
                      {city.fullName || city}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Work Type Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('workType')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Work Type</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.workType ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.workType && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {WORK_TYPES.map(type => (
                    <label
                      key={type.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="workType"
                        value={type.value}
                        checked={filters.workType === type.value}
                        onChange={e =>
                          updateFilters('workType', e.target.value)
                        }
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">
                        {type.icon} {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Availability Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('availability')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Availability</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.availability ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.availability && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {AVAILABILITY_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={filters.availability === option.value}
                        onChange={e =>
                          updateFilters('availability', e.target.value)
                        }
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full bg-${option.color}-500`}
                      />
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Salary Range Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('salary')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Salary Range</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.salary ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.salary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {SA_SALARY_RANGES.map(range => (
                    <label
                      key={range.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="salary"
                        value={range.value}
                        checked={filters.salary === range.value}
                        onChange={e => updateFilters('salary', e.target.value)}
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Minimum Rating</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.rating ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {RATING_OPTIONS.map(rating => (
                    <label
                      key={rating.value}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="minRating"
                        value={rating.value}
                        checked={filters.minRating === rating.value}
                        onChange={e =>
                          updateFilters('minRating', e.target.value)
                        }
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {rating.label}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < parseFloat(rating.value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TalentFilters;
