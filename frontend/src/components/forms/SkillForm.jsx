import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Plus,
  Minus,
  Search,
  Star,
  Eye,
  EyeOff,
  Code,
  Smartphone,
  Server,
  Database,
  Cloud,
  Palette,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Loading from '../ui/Loading';

// Mock skills data (in real app, this would come from API)
const POPULAR_SKILLS = {
  frontend: [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'HTML',
    'CSS',
    'Tailwind CSS',
    'SASS/SCSS',
    'Next.js',
    'Nuxt.js',
    'Svelte',
  ],
  backend: [
    'Node.js',
    'Python',
    'Java',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'Express.js',
    'Django',
    'Spring Boot',
    'Laravel',
    'Ruby on Rails',
  ],
  mobile: [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'Ionic',
    'Xamarin',
    'Android Development',
    'iOS Development',
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Google Cloud',
    'Jenkins',
    'Git',
    'Linux',
    'Terraform',
    'Ansible',
    'CI/CD',
  ],
  database: [
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Elasticsearch',
    'SQLite',
    'Oracle',
    'SQL Server',
    'DynamoDB',
  ],
  design: [
    'Figma',
    'Adobe XD',
    'Sketch',
    'UI/UX Design',
    'Photoshop',
    'Illustrator',
    'Prototyping',
    'Wireframing',
  ],
};

const ALL_SKILLS = Object.values(POPULAR_SKILLS).flat();

// Validation schema
const skillSchema = yup.object({
  skills: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required('Skill name is required'),
        category: yup.string().required('Category is required'),
        proficiencyLevel: yup
          .string()
          .oneOf(
            ['beginner', 'intermediate', 'advanced', 'expert'],
            'Please select a valid proficiency level'
          )
          .required('Proficiency level is required'),
        yearsOfExperience: yup
          .number()
          .min(0, 'Years cannot be negative')
          .max(50, 'Years cannot exceed 50')
          .required('Years of experience is required'),
        isVisible: yup.boolean(),
      })
    )
    .min(1, 'At least one skill is required'),
});

const SkillForm = ({
  initialSkills = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'add', // 'add' or 'edit'
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(skillSchema),
    defaultValues: {
      skills:
        initialSkills.length > 0
          ? initialSkills
          : [
              {
                name: '',
                category: 'frontend',
                proficiencyLevel: 'intermediate',
                yearsOfExperience: 1,
                isVisible: true,
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: Search },
    { value: 'frontend', label: 'Frontend', icon: Code },
    { value: 'backend', label: 'Backend', icon: Server },
    { value: 'mobile', label: 'Mobile', icon: Smartphone },
    { value: 'devops', label: 'DevOps', icon: Cloud },
    { value: 'database', label: 'Database', icon: Database },
    { value: 'design', label: 'Design', icon: Palette },
  ];

  const proficiencyLevels = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'Learning the basics',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Comfortable with fundamentals',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Highly skilled and experienced',
    },
    {
      value: 'expert',
      label: 'Expert',
      description: 'Deep expertise and thought leadership',
    },
  ];

  // Filter skills based on search and category
  const filteredSkills = ALL_SKILLS.filter(skill => {
    const matchesSearch = skill
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && POPULAR_SKILLS[selectedCategory]?.includes(skill);
  });

  const addSkill = skillName => {
    const category =
      Object.keys(POPULAR_SKILLS).find(cat =>
        POPULAR_SKILLS[cat].includes(skillName)
      ) || 'frontend';

    append({
      name: skillName,
      category,
      proficiencyLevel: 'intermediate',
      yearsOfExperience: 1,
      isVisible: true,
    });

    setSearchTerm('');
    setShowSuggestions(false);
  };

  const addCustomSkill = () => {
    if (searchTerm.trim()) {
      addSkill(searchTerm.trim());
    }
  };

  const getProficiencyColor = level => {
    const colors = {
      beginner: 'bg-yellow-100 text-yellow-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      expert: 'bg-green-100 text-green-800',
    };
    return colors[level] || colors.intermediate;
  };

  const getProficiencyStars = level => {
    const stars = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    return stars[level] || 2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === 'edit' ? 'Edit Skills' : 'Add Your Skills'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {mode === 'edit'
            ? 'Update your skills and proficiency levels'
            : 'Add skills to showcase your expertise to other developers'}
        </p>
      </div>

      {/* Skill Search & Add */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for skills (e.g., React, Python, Docker...)"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchTerm.length > 0)}
            className="block w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          {searchTerm && (
            <Button
              type="button"
              size="sm"
              onClick={addCustomSkill}
              className="absolute top-1.5 right-2"
            >
              Add "{searchTerm}"
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Skill Suggestions */}
        <AnimatePresence>
          {showSuggestions && filteredSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm"
            >
              {filteredSkills.slice(0, 10).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {skill}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Your Skills</h3>

          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Skill Name & Category */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        {...register(`skills.${index}.name`)}
                        label="Skill Name"
                        placeholder="e.g., React"
                        error={errors.skills?.[index]?.name?.message}
                        required
                      />

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register(`skills.${index}.category`)}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          {categories.slice(1).map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        {errors.skills?.[index]?.category && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.skills[index].category.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Proficiency & Experience */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Proficiency Level{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register(`skills.${index}.proficiencyLevel`)}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          {proficiencyLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label} - {level.description}
                            </option>
                          ))}
                        </select>

                        {/* Proficiency Display */}
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getProficiencyColor(
                              watch(`skills.${index}.proficiencyLevel`)
                            )}`}
                          >
                            {watch(`skills.${index}.proficiencyLevel`)}
                          </span>
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i <
                                  getProficiencyStars(
                                    watch(`skills.${index}.proficiencyLevel`)
                                  )
                                    ? 'fill-current text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {errors.skills?.[index]?.proficiencyLevel && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.skills[index].proficiencyLevel.message}
                          </p>
                        )}
                      </div>

                      <Input
                        {...register(`skills.${index}.yearsOfExperience`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        max="50"
                        label="Years of Experience"
                        placeholder="1"
                        error={
                          errors.skills?.[index]?.yearsOfExperience?.message
                        }
                        required
                      />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        {...register(`skills.${index}.isVisible`)}
                        id={`visible-${index}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`visible-${index}`}
                        className="flex cursor-pointer items-center text-sm text-gray-700"
                      >
                        {watch(`skills.${index}.isVisible`) ? (
                          <Eye className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="mr-2 h-4 w-4 text-gray-400" />
                        )}
                        Visible on profile
                      </label>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Another Skill */}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              append({
                name: '',
                category: 'frontend',
                proficiencyLevel: 'intermediate',
                yearsOfExperience: 1,
                isVisible: true,
              })
            }
            className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Skill
          </Button>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isLoading} disabled={!isDirty}>
            {mode === 'edit' ? 'Update Skills' : 'Save Skills'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SkillForm;
