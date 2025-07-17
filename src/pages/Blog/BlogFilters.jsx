import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  Tag,
  Clock,
  Star,
  Filter,
  X,
} from 'lucide-react';
import Button from '../../components/ui/Button';

const READING_TIMES = [
  { value: 'short', label: 'Quick Read (< 5 min)', icon: Clock },
  { value: 'medium', label: 'Medium Read (5-10 min)', icon: Clock },
  { value: 'long', label: 'Deep Dive (10+ min)', icon: Clock },
];

const POPULAR_TAGS = [
  'React', 'JavaScript', 'Python', 'Career', 'Tutorial',
  'South Africa', 'Remote Work', 'Networking', 'Data Science',
  'Mobile Development', 'Web Development', 'DevOps', 'Cloud',
  'AI/ML', 'Blockchain', 'Cybersecurity', 'Fintech'
];

const AUTHORS = [
  'Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez', 'Thabo Mthembu',
  'Naledi Motsepe', 'Riaan du Plessis', 'Lerato Mahlangu', 'Johan Botha'
];

const BlogFilters = ({ 
  filters = {}, 
  onFiltersChange = () => {}, 
  categories = [],
  className = '' 
}) => {
  const [localFilters, setLocalFilters] = useState({
    readingTime: [],
    tags: [],
    authors: [],
    dateRange: '',
    ...filters
  });

  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  // Handle filter updates
  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters };
    
    if (Array.isArray(newFilters[key])) {
      // Toggle array values
      if (newFilters[key].includes(value)) {
        newFilters[key] = newFilters[key].filter(item => item !== value);
      } else {
        newFilters[key] = [...newFilters[key], value];
      }
    } else {
      // Set single values
      newFilters[key] = value;
    }
    
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      readingTime: [],
      tags: [],
      authors: [],
      dateRange: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(localFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  const displayedTags = showAllTags ? POPULAR_TAGS : POPULAR_TAGS.slice(0, 12);
  const displayedAuthors = showAllAuthors ? AUTHORS : AUTHORS.slice(0, 6);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-lg font-semibold text-gray-900">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Reading Time Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Reading Time</h4>
        <div className="space-y-2">
          {READING_TIMES.map((time) => {
            const Icon = time.icon;
            const isSelected = localFilters.readingTime.includes(time.value);
            
            return (
              <label
                key={time.value}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateFilter('readingTime', time.value)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{time.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Popular Topics</h4>
        <div className="flex flex-wrap gap-2">
          {displayedTags.map((tag) => {
            const isSelected = localFilters.tags.includes(tag);
            
            return (
              <button
                key={tag}
                onClick={() => updateFilter('tags', tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        
        {POPULAR_TAGS.length > 12 && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {showAllTags ? 'Show Less' : `Show ${POPULAR_TAGS.length - 12} More`}
          </button>
        )}
      </div>

      {/* Authors Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Authors</h4>
        <div className="space-y-2">
          {displayedAuthors.map((author) => {
            const isSelected = localFilters.authors.includes(author);
            
            return (
              <label
                key={author}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateFilter('authors', author)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{author}</span>
              </label>
            );
          })}
        </div>
        
        {AUTHORS.length > 6 && (
          <button
            onClick={() => setShowAllAuthors(!showAllAuthors)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {showAllAuthors ? 'Show Less' : `Show ${AUTHORS.length - 6} More`}
          </button>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Published</h4>
        <div className="space-y-2">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
          ].map((range) => (
            <label
              key={range.value}
              className="flex cursor-pointer items-center space-x-3"
            >
              <input
                type="radio"
                name="dateRange"
                value={range.value}
                checked={localFilters.dateRange === range.value}
                onChange={() => updateFilter('dateRange', range.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-indigo-50 p-4"
        >
          <h5 className="mb-2 text-sm font-medium text-indigo-900">
            Active Filters:
          </h5>
          <div className="space-y-1 text-xs text-indigo-700">
            {localFilters.readingTime.length > 0 && (
              <div>Reading Time: {localFilters.readingTime.join(', ')}</div>
            )}
            {localFilters.tags.length > 0 && (
              <div>Topics: {localFilters.tags.slice(0, 3).join(', ')}
                {localFilters.tags.length > 3 && ` +${localFilters.tags.length - 3} more`}
              </div>
            )}
            {localFilters.authors.length > 0 && (
              <div>Authors: {localFilters.authors.slice(0, 2).join(', ')}
                {localFilters.authors.length > 2 && ` +${localFilters.authors.length - 2} more`}
              </div>
            )}
            {localFilters.dateRange && (
              <div>Date: {localFilters.dateRange}</div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BlogFilters;