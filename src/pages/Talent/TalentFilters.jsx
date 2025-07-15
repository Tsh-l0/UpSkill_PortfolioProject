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
  const saSkills = [
    ...new Set([
      ...saUtils.SA_TECH_SKILLS,
      ...availableSkills.map(skill => skill.name),
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Selected Skills */}
                {filters.skills && filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Search */}
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={skillInputRef}
                    type="text"
                    placeholder="Search or add skills..."
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Skill Options */}
                <div className="grid grid-cols-2 gap-2">
                  {displayedSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                        filters.skills?.includes(skill)
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{skill}</span>
                      {filters.skills?.includes(skill) && (
                        <Check className="h-3 w-3 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Show More Skills */}
                {filteredSkills.length > 8 && (
                  <button
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {showAllSkills
                      ? 'Show Less'
                      : `Show ${filteredSkills.length - 8} More`}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Experience Level */}
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="radio"
                      name="experience"
                      value={level.value}
                      checked={filters.experience === level.value}
                      onChange={e =>
                        updateFilters('experience', e.target.value)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {level.label}
                    </span>
                  </label>
                ))}
                {filters.experience && (
                  <button
                    onClick={() => updateFilters('experience', '')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location - SA Specific */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('location')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">SA Location</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.location ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.location && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter SA city or province..."
                    value={filters.location || ''}
                    onChange={e => updateFilters('location', e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Major SA cities:</p>
                  <div className="flex flex-wrap gap-1">
                    {saUtils.SA_MAJOR_CITIES.map(city => (
                      <button
                        key={city.name}
                        onClick={() => updateFilters('location', city.fullName)}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                      >
                        {city.name}, {city.province}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">SA Provinces:</p>
                  <div className="flex flex-wrap gap-1">
                    {saUtils.SA_PROVINCES.map(province => (
                      <button
                        key={province}
                        onClick={() => updateFilters('location', province)}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Work Type */}
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {WORK_TYPES.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      name="workType"
                      value={type.value}
                      checked={filters.workType === type.value}
                      onChange={e => updateFilters('workType', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {type.icon} {type.label}
                    </span>
                  </label>
                ))}
                {filters.workType && (
                  <button
                    onClick={() => updateFilters('workType', '')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Availability */}
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {AVAILABILITY_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={filters.availability === option.value}
                      onChange={e =>
                        updateFilters('availability', e.target.value)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 flex items-center text-sm text-gray-700">
                      <span
                        className={`mr-2 h-2 w-2 rounded-full ${
                          option.color === 'green'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      {option.label}
                    </span>
                  </label>
                ))}
                {filters.availability && (
                  <button
                    onClick={() => updateFilters('availability', '')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SA Salary Range */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('salary')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">SA Salary Range</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.salary ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.salary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {SA_SALARY_RANGES.map(range => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="radio"
                      name="salary"
                      value={range.value}
                      checked={filters.salary === range.value}
                      onChange={e => updateFilters('salary', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 flex items-center text-sm text-gray-700">
                      <DollarSign className="mr-1 h-3 w-3" />
                      {range.label}
                    </span>
                  </label>
                ))}
                {filters.salary && (
                  <button
                    onClick={() => updateFilters('salary', '')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Company Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('company')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">SA Companies</h3>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openSections.company ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openSections.company && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="relative">
                  <Briefcase className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter company name..."
                    value={filters.company || ''}
                    onChange={e => updateFilters('company', e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    Top SA tech companies:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {saUtils.SA_TECH_COMPANIES.map(company => (
                      <button
                        key={company}
                        onClick={() => updateFilters('company', company)}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating */}
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {RATING_OPTIONS.map(rating => (
                  <label key={rating.value} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={rating.value}
                      checked={filters.minRating === rating.value}
                      onChange={e => updateFilters('minRating', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 flex items-center text-sm text-gray-700">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {rating.label}
                    </span>
                  </label>
                ))}
                {filters.minRating && (
                  <button
                    onClick={() => updateFilters('minRating', '')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Apply Button */}
        <div className="border-t border-gray-200 pt-4 lg:hidden">
          <Button onClick={onClose} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TalentFilters;
