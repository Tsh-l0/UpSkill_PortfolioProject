import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit3,
  Star,
  Users,
  ThumbsUp,
  Award,
  Code,
  Server,
  Smartphone,
  Cloud,
  Database,
  Palette,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  DollarSign,
  MapPin,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import SkillForm from '../../components/forms/SkillForm';

// API Services
import { usersAPI, skillsAPI, endorsementsAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import { formatCurrency as formatZAR } from '../../utils/formatters';

const SkillsSection = ({ userId, isOwnProfile = false, onSkillsUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState(new Set());
  const [skillsData, setSkillsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch skills data from backend
  useEffect(() => {
    const fetchSkills = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await usersAPI.getUserSkills(userId);

        if (response.success) {
          setSkillsData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch skills');
        }
      } catch (error) {
        console.error('Skills fetch error:', error);

        // Use SA-localized mock data as fallback
        const mockData = generateSASkillsData();
        setSkillsData(mockData);

        if (isOwnProfile) {
          toast.error('Using demo data - connection issue detected');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [userId, isOwnProfile]);

  // Generate SA-localized mock skills data
  const generateSASkillsData = () => {
    return [
      {
        id: 1,
        name: 'React',
        category: 'frontend',
        proficiencyLevel: 'expert',
        yearsOfExperience: 5,
        endorsementCount: 18,
        isVisible: true,
        icon: Code,
        description:
          'Building scalable web applications for SA businesses using React hooks, context, and modern patterns.',
        recentEndorsements: [
          {
            id: 1,
            endorser: {
              name: 'Thabo Mkhize',
              avatar: '/images/avatars/thabo.jpg',
              title: 'Tech Lead at Takealot',
              location: 'Cape Town, WC',
            },
            comment:
              'Excellent React skills. Built amazing e-commerce features for SA market.',
            date: '2024-01-10',
            rating: 5,
          },
          {
            id: 2,
            endorser: {
              name: 'Priya Sharma',
              avatar: '/images/avatars/priya.jpg',
              title: 'Senior Developer at Discovery',
              location: 'Johannesburg, GP',
            },
            comment:
              'Outstanding React expertise. Great at building responsive SA-focused applications.',
            date: '2024-01-05',
            rating: 5,
          },
        ],
        projects: [
          'E-commerce Platform',
          'SA Banking App',
          'FinTech Dashboard',
        ],
        saMarketData: {
          demandLevel: 'Very High',
          salaryRange:
            formatZAR(550000, { abbreviated: true }) +
            ' - ' +
            formatZAR(850000, { abbreviated: true }),
          topCompanies: ['Takealot', 'Discovery', 'Standard Bank'],
          growth: '+25% in SA market',
        },
      },
      {
        id: 2,
        name: 'TypeScript',
        category: 'frontend',
        proficiencyLevel: 'advanced',
        yearsOfExperience: 3,
        endorsementCount: 14,
        isVisible: true,
        icon: Code,
        description:
          'Strong typing and interface design for large-scale SA enterprise applications.',
        recentEndorsements: [
          {
            id: 3,
            endorser: {
              name: 'Alex Patel',
              avatar: '/images/avatars/alex.jpg',
              title: 'Frontend Architect at Naspers',
              location: 'Cape Town, WC',
            },
            comment:
              'Great TypeScript knowledge for building scalable SA products.',
            date: '2024-01-08',
            rating: 4,
          },
        ],
        projects: ['Component Library', 'API Client SDK'],
        saMarketData: {
          demandLevel: 'High',
          salaryRange:
            formatZAR(600000, { abbreviated: true }) +
            ' - ' +
            formatZAR(900000, { abbreviated: true }),
          topCompanies: ['Naspers', 'EOH', 'Dimension Data'],
          growth: '+30% in SA market',
        },
      },
      {
        id: 3,
        name: 'Node.js',
        category: 'backend',
        proficiencyLevel: 'intermediate',
        yearsOfExperience: 2,
        endorsementCount: 8,
        isVisible: true,
        icon: Server,
        description:
          'Backend API development for SA financial services and e-commerce platforms.',
        recentEndorsements: [],
        projects: ['Payment API', 'Banking Service'],
        saMarketData: {
          demandLevel: 'High',
          salaryRange:
            formatZAR(500000, { abbreviated: true }) +
            ' - ' +
            formatZAR(800000, { abbreviated: true }),
          topCompanies: ['Standard Bank', 'FNB', 'Absa'],
          growth: '+20% in SA market',
        },
      },
      {
        id: 4,
        name: 'AWS',
        category: 'devops',
        proficiencyLevel: 'intermediate',
        yearsOfExperience: 2,
        endorsementCount: 6,
        isVisible: true,
        icon: Cloud,
        description:
          'Cloud infrastructure and deployment for SA-based applications and services.',
        recentEndorsements: [],
        projects: ['Cloud Migration', 'Serverless SA Platform'],
        saMarketData: {
          demandLevel: 'Very High',
          salaryRange:
            formatZAR(650000, { abbreviated: true }) +
            ' - ' +
            formatZAR(1000000, { abbreviated: true }),
          topCompanies: ['Amazon', 'Microsoft SA', 'Oracle'],
          growth: '+40% in SA market',
        },
      },
      {
        id: 5,
        name: 'Python',
        category: 'backend',
        proficiencyLevel: 'advanced',
        yearsOfExperience: 4,
        endorsementCount: 12,
        isVisible: true,
        icon: Code,
        description:
          'Data analysis, web development, and automation for SA enterprises.',
        recentEndorsements: [
          {
            id: 4,
            endorser: {
              name: 'Sipho Ndaba',
              avatar: '/images/avatars/sipho.jpg',
              title: 'Data Engineer at MTN',
              location: 'Johannesburg, GP',
            },
            comment:
              'Excellent Python skills for data processing and analysis.',
            date: '2024-01-12',
            rating: 5,
          },
        ],
        projects: ['Data Pipeline', 'ML Platform'],
        saMarketData: {
          demandLevel: 'High',
          salaryRange:
            formatZAR(450000, { abbreviated: true }) +
            ' - ' +
            formatZAR(750000, { abbreviated: true }),
          topCompanies: ['MTN', 'Vodacom', 'Cell C'],
          growth: '+15% in SA market',
        },
      },
    ];
  };

  const categories = [
    { value: 'all', label: 'All Skills', icon: Star },
    { value: 'frontend', label: 'Frontend', icon: Code },
    { value: 'backend', label: 'Backend', icon: Server },
    { value: 'mobile', label: 'Mobile', icon: Smartphone },
    { value: 'devops', label: 'DevOps', icon: Cloud },
    { value: 'database', label: 'Database', icon: Database },
    { value: 'design', label: 'Design', icon: Palette },
  ];

  const filteredSkills =
    selectedCategory === 'all'
      ? skillsData
      : skillsData.filter(skill => skill.category === selectedCategory);

  const getProficiencyColor = level => {
    const colors = {
      beginner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
      advanced: 'bg-purple-100 text-purple-800 border-purple-200',
      expert: 'bg-green-100 text-green-800 border-green-200',
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

  const handleEndorse = async skillId => {
    if (isOwnProfile) return;

    setIsLoading(true);
    try {
      const response = await endorsementsAPI.endorseSkill({
        skillId,
        userId,
        rating: 5,
        comment: 'Great skill!',
      });

      if (response.success) {
        setEndorsedSkills(prev => {
          const newSet = new Set(prev);
          if (newSet.has(skillId)) {
            newSet.delete(skillId);
          } else {
            newSet.add(skillId);
          }
          return newSet;
        });

        // Update skill endorsement count
        setSkillsData(prev =>
          prev.map(skill =>
            skill.id === skillId
              ? { ...skill, endorsementCount: skill.endorsementCount + 1 }
              : skill
          )
        );

        toast.success('Skill endorsed successfully!');
      } else {
        throw new Error(response.message || 'Failed to endorse skill');
      }
    } catch (error) {
      console.error('Endorsement failed:', error);
      toast.error(error.message || 'Failed to endorse skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsUpdate = async formData => {
    setIsLoading(true);
    try {
      // Process skills for backend
      const promises = formData.skills.map(skill =>
        usersAPI.addSkill({
          skillId: skill.id,
          proficiencyLevel: skill.level,
          yearsOfExperience: skill.experience,
        })
      );

      await Promise.all(promises);

      onSkillsUpdate?.(formData);
      setIsEditModalOpen(false);
      toast.success('Skills updated successfully!');

      // Refresh skills data
      const response = await usersAPI.getUserSkills(userId);
      if (response.success) {
        setSkillsData(response.data);
      }
    } catch (error) {
      console.error('Skills update failed:', error);
      toast.error('Failed to update skills');
    } finally {
      setIsLoading(false);
    }
  };

  const totalEndorsements = skillsData.reduce(
    (sum, skill) => sum + skill.endorsementCount,
    0
  );

  // Calculate total market value of skills
  const totalMarketValue = skillsData.reduce((total, skill) => {
    if (skill.saMarketData?.salaryRange) {
      const range = skill.saMarketData.salaryRange;
      const maxSalary =
        parseInt(range.split(' - ')[1]?.replace(/[^\d]/g, '') || '0') * 1000;
      return Math.max(total, maxSalary);
    }
    return total;
  }, 0);

  if (isLoading && skillsData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="mb-4 h-8 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              SA Tech Skills & Expertise
            </h2>
            <p className="text-gray-600">
              {totalEndorsements} endorsements across {skillsData.length} skills
            </p>
            {totalMarketValue > 0 && (
              <p className="mt-1 text-sm text-green-600">
                Max market value:{' '}
                {formatZAR(totalMarketValue, { abbreviated: true })} in SA
              </p>
            )}
          </div>

          {isOwnProfile && (
            <div className="mt-4 flex space-x-3 sm:mt-0">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="secondary"
                size="sm"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Skills
              </Button>
              <Button onClick={() => setIsEditModalOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </div>
          )}
        </div>

        {/* SA Market Trends */}
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">
              SA Tech Market Trends
            </h3>
          </div>
          <p className="mb-3 text-sm text-green-700">
            High demand skills in South Africa's growing tech ecosystem
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'React (+25%)',
              'TypeScript (+30%)',
              'AWS (+40%)',
              'Python (+15%)',
              'Node.js (+20%)',
            ].map((trend, idx) => (
              <span
                key={idx}
                className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
              >
                {trend}
              </span>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            const count =
              category.value === 'all'
                ? skillsData.length
                : skillsData.filter(s => s.category === category.value).length;

            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? 'scale-105 bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:scale-105 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    selectedCategory === category.value
                      ? 'bg-indigo-500'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filteredSkills.map((skill, index) => {
              const Icon = skill.icon;
              const isExpanded = expandedSkill === skill.id;
              const isEndorsed = endorsedSkills.has(skill.id);

              return (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-md"
                >
                  {/* Skill Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 transition-colors group-hover:bg-indigo-200">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                          {skill.name}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getProficiencyColor(
                              skill.proficiencyLevel
                            )}`}
                          >
                            {skill.proficiencyLevel}
                          </span>
                          <span className="text-sm text-gray-500">
                            {skill.yearsOfExperience}y exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() =>
                        setExpandedSkill(isExpanded ? null : skill.id)
                      }
                      className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Proficiency Stars */}
                  <div className="mb-3 flex items-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < getProficiencyStars(skill.proficiencyLevel)
                            ? 'fill-current text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      ({getProficiencyStars(skill.proficiencyLevel)}/4)
                    </span>
                  </div>

                  {/* SA Market Info */}
                  {skill.saMarketData && (
                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
                      <div className="mb-1 flex items-center space-x-2">
                        <DollarSign className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">
                          SA Market: {skill.saMarketData.salaryRange}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-700">
                          Demand: {skill.saMarketData.demandLevel}
                        </span>
                        <span className="text-xs text-blue-600">
                          • {skill.saMarketData.growth}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Endorsements */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {skill.endorsementCount} endorsements
                      </span>
                    </div>

                    {!isOwnProfile && (
                      <Button
                        onClick={() => handleEndorse(skill.id)}
                        variant={isEndorsed ? 'primary' : 'ghost'}
                        size="sm"
                        loading={isLoading}
                        className={`text-xs ${isEndorsed ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        {isEndorsed ? 'Endorsed' : 'Endorse'}
                      </Button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-4 border-t border-gray-200 pt-4"
                      >
                        {/* Description */}
                        <p className="text-sm text-gray-600">
                          {skill.description}
                        </p>

                        {/* SA Market Details */}
                        {skill.saMarketData && (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <h5 className="mb-2 text-sm font-medium text-green-900">
                              SA Market Analysis
                            </h5>
                            <div className="space-y-2 text-xs text-green-700">
                              <div>
                                Top SA companies:{' '}
                                {skill.saMarketData.topCompanies?.join(', ')}
                              </div>
                              <div>
                                Market growth: {skill.saMarketData.growth}
                              </div>
                              <div>
                                Salary range: {skill.saMarketData.salaryRange}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Related Projects */}
                        {skill.projects && skill.projects.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-900">
                              Related SA Projects
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {skill.projects.map((project, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                >
                                  {project}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Endorsements */}
                        {skill.recentEndorsements &&
                          skill.recentEndorsements.length > 0 && (
                            <div>
                              <h4 className="mb-3 text-sm font-medium text-gray-900">
                                Recent SA Endorsements
                              </h4>
                              <div className="space-y-3">
                                {skill.recentEndorsements
                                  .slice(0, 2)
                                  .map(endorsement => (
                                    <div
                                      key={endorsement.id}
                                      className="flex space-x-3"
                                    >
                                      <Avatar
                                        src={endorsement.endorser.avatar}
                                        name={endorsement.endorser.name}
                                        size="sm"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            {endorsement.endorser.name}
                                          </span>
                                          <div className="flex">
                                            {[...Array(endorsement.rating)].map(
                                              (_, i) => (
                                                <Star
                                                  key={i}
                                                  className="h-3 w-3 fill-current text-yellow-400"
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                        <p className="mb-1 flex items-center text-xs text-gray-500">
                                          {endorsement.endorser.title}
                                          {endorsement.endorser.location && (
                                            <>
                                              <span className="mx-1">•</span>
                                              <MapPin className="mr-1 h-3 w-3" />
                                              {endorsement.endorser.location}
                                            </>
                                          )}
                                        </p>
                                        <p className="text-sm text-gray-700 italic">
                                          &quot;{endorsement.comment}&quot;
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Request Endorsement (for own profile) */}
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-indigo-600 hover:bg-indigo-50"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Request SA Endorsement for {skill.name}
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Star className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No skills in this category
            </h3>
            <p className="mb-6 text-gray-600">
              {isOwnProfile
                ? 'Add some skills to showcase your expertise in the SA market.'
                : "This developer hasn't added skills in this category yet."}
            </p>
            {isOwnProfile && (
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add SA Skills
              </Button>
            )}
          </div>
        )}

        {/* Skills Summary */}
        {skillsData.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {skillsData.length}
                </div>
                <div className="text-sm text-gray-600">Total Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {totalEndorsements}
                </div>
                <div className="text-sm text-gray-600">SA Endorsements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {
                    skillsData.filter(s => s.proficiencyLevel === 'expert')
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Expert Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatZAR(totalMarketValue, { abbreviated: true })}
                </div>
                <div className="text-sm text-gray-600">Max SA Value</div>
              </div>
            </div>

            {/* SA Skills Insights */}
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">
                SA Tech Skills Portfolio
              </h4>
              <p className="text-sm text-blue-700">
                Well-rounded skill set aligned with South Africa's top tech
                companies and market demands. Skills validated by local
                developers and industry experts.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Skills Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Manage SA Tech Skills"
        size="4xl"
      >
        <SkillForm
          initialSkills={skillsData}
          onSubmit={handleSkillsUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isLoading}
          mode="edit"
          // SA-specific skill suggestions
          suggestedSkills={[
            'React',
            'TypeScript',
            'Node.js',
            'Python',
            'Java',
            'AWS',
            'Docker',
            'Kubernetes',
            'Angular',
            'Vue.js',
            'C#',
            '.NET',
            'Spring Boot',
            'PostgreSQL',
            'MongoDB',
          ]}
          marketInfo={{
            title: 'SA Tech Market Insights',
            description:
              'Skills in high demand across South African tech companies',
            salaryRanges: {
              React: saUtils.formatSalaryRange(550000, 850000),
              TypeScript: saUtils.formatSalaryRange(600000, 900000),
              'Node.js': saUtils.formatSalaryRange(500000, 800000),
              Python: saUtils.formatSalaryRange(450000, 750000),
              AWS: saUtils.formatSalaryRange(650000, 1000000),
            },
          }}
        />
      </Modal>
    </>
  );
};

export default SkillsSection;
