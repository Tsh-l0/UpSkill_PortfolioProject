import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit3,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  Award,
  Users,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Star,
  Briefcase,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

// API Services
import { usersAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import { formatDate, formatCurrency as formatZAR } from '../../utils/formatters';

const ExperienceSection = ({
  userId,
  isOwnProfile = false,
  onExperienceUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [experienceData, setExperienceData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch experience data from backend
  useEffect(() => {
    const fetchExperience = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await usersAPI.getUserExperience(userId);

        if (response.success) {
          setExperienceData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch experience');
        }
      } catch (error) {
        console.error('Experience fetch error:', error);

        // Use SA-localized mock data as fallback
        const mockData = generateSAExperienceData();
        setExperienceData(mockData);

        if (isOwnProfile) {
          toast.error('Using demo data - connection issue detected');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperience();
  }, [userId, isOwnProfile]);

  // Generate SA-localized mock experience data
  const generateSAExperienceData = () => {
    const saCompanies = saUtils.SA_TECH_COMPANIES;
    const saCities = saUtils.SA_MAJOR_CITIES;

    return [
      {
        id: 1,
        jobTitle: 'Senior Frontend Developer',
        company: saCompanies[Math.floor(Math.random() * 5)], // Get SA company
        companyWebsite: `https://${saCompanies[0].toLowerCase().replace(/\s+/g, '')}.co.za`,
        location: saCities[0].fullName, // Johannesburg
        employmentType: 'full-time',
        startDate: '2022-03-01',
        endDate: null,
        isCurrent: true,
        description: `Leading frontend development at one of South Africa's top tech companies. Focused on building scalable React applications that serve millions of South African users across mobile and web platforms.`,
        achievements: [
          'Improved page load times by 40% for SA users through optimization',
          'Led implementation of mobile-first design for 2M+ SA mobile users',
          'Mentored 3 junior developers in the Johannesburg office',
          'Built responsive components used across 8 different SA market products',
        ],
        technologies: [
          'React',
          'TypeScript',
          'Node.js',
          'GraphQL',
          'AWS',
          'Tailwind CSS',
        ],
        companyLogo: '/images/logos/sa-company-1.png',
        highlights: [
          { icon: Award, text: 'Employee of the Quarter Q3 2024' },
          { icon: Users, text: 'Led team of 6 SA developers' },
          { icon: TrendingUp, text: '40% performance improvement' },
        ],
        salaryRange: saUtils.formatSalaryRange(650000, 850000), // ZAR
        saSpecific: {
          techHub: 'Johannesburg Fintech Hub',
          localImpact: 'Built payment solutions for SA market',
          beeLevel: 'Level 2 BBBEE Company',
        },
      },
      {
        id: 2,
        jobTitle: 'Full Stack Developer',
        company: saCompanies[1],
        companyWebsite: `https://${saCompanies[1].toLowerCase().replace(/\s+/g, '')}.co.za`,
        location: saCities[1].fullName, // Cape Town
        employmentType: 'full-time',
        startDate: '2020-06-01',
        endDate: '2022-02-28',
        isCurrent: false,
        description: `Developed e-commerce solutions at South Africa's leading online retailer. Worked on payment integrations, inventory management, and mobile commerce features specifically for the SA market.`,
        achievements: [
          'Built mobile commerce platform serving 1M+ SA customers',
          'Integrated with SA payment providers (Ozow, PayFast, SnapScan)',
          'Reduced cart abandonment by 25% through UX improvements',
          'Implemented multilingual support for 11 official SA languages',
        ],
        technologies: [
          'React',
          'JavaScript',
          'Python',
          'Django',
          'PostgreSQL',
          'Redis',
        ],
        companyLogo: '/images/logos/sa-company-2.png',
        highlights: [
          { icon: TrendingUp, text: '25% reduction in cart abandonment' },
          { icon: Clock, text: '50% faster checkout process' },
        ],
        salaryRange: saUtils.formatSalaryRange(450000, 600000),
        saSpecific: {
          techHub: 'Cape Town E-commerce Hub',
          localImpact: 'Served 1M+ SA customers',
          beeLevel: 'Level 1 BBBEE Company',
        },
      },
      {
        id: 3,
        jobTitle: 'Junior Software Developer',
        company: saCompanies[2],
        companyWebsite: `https://${saCompanies[2].toLowerCase().replace(/\s+/g, '')}.co.za`,
        location: saCities[2].fullName, // Durban
        employmentType: 'full-time',
        startDate: '2019-01-15',
        endDate: '2020-05-31',
        isCurrent: false,
        description: `Started my career in software development at a leading SA financial services company. Worked on mobile banking applications and learned enterprise-grade development practices in the South African financial sector.`,
        achievements: [
          'Contributed to mobile banking app used by 500k+ SA customers',
          'Fixed over 80 bugs and improved code coverage by 20%',
          'Implemented responsive design for SA mobile banking features',
          'Participated in agile development with cross-functional SA teams',
        ],
        technologies: [
          'Java',
          'Spring Boot',
          'Angular',
          'MySQL',
          'Git',
          'Jenkins',
        ],
        companyLogo: '/images/logos/sa-company-3.png',
        highlights: [
          { icon: Award, text: 'Graduate of the Year 2019' },
          { icon: TrendingUp, text: '20% increase in code coverage' },
        ],
        salaryRange: saUtils.formatSalaryRange(280000, 380000),
        saSpecific: {
          techHub: 'Durban Financial Services',
          localImpact: 'Banking for 500k+ SA customers',
          beeLevel: 'Level 3 BBBEE Company',
        },
      },
    ];
  };

  const formatDateSA = dateString => {
    if (!dateString) return 'Present';
    return formatDate(dateString, 'MMM yyyy');
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  const getEmploymentTypeLabel = type => {
    const types = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance',
    };
    return types[type] || type;
  };

  const getEmploymentTypeColor = type => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      contract: 'bg-orange-100 text-orange-800',
      internship: 'bg-purple-100 text-purple-800',
      freelance: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const totalExperience = experienceData.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return total + months;
  }, 0);

  const totalYears = Math.floor(totalExperience / 12);
  const totalMonths = totalExperience % 12;

  // Calculate estimated career earnings in ZAR
  const estimatedEarnings = experienceData.reduce((total, exp) => {
    const duration = calculateDuration(exp.startDate, exp.endDate);
    const years = parseFloat(duration.split(' ')[0]) || 1;
    const avgSalary = exp.salaryRange
      ? parseInt(exp.salaryRange.replace(/[R,k\s-]/g, '').split('R')[0]) * 1000
      : 500000;
    return total + avgSalary * years;
  }, 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="mb-4 h-8 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
              SA Work Experience
            </h2>
            <p className="text-gray-600">
              {totalYears} years {totalMonths} months in the South African tech
              market
            </p>
            {estimatedEarnings > 0 && (
              <p className="mt-1 text-sm text-green-600">
                Estimated career earnings:{' '}
                {formatZAR(estimatedEarnings, { abbreviated: true })}
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
                Edit Experience
              </Button>
              <Button onClick={() => setIsEditModalOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          )}
        </div>

        {/* Experience Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 bottom-8 left-6 w-0.5 bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 md:left-8" />

          <div className="space-y-8">
            {experienceData.map((experience, index) => {
              const isExpanded = expandedExperience === experience.id;

              return (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-4 h-4 w-4 rounded-full border-4 border-white shadow-lg md:left-6 ${
                      experience.isCurrent ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                  />

                  {/* Experience Card */}
                  <div className="ml-12 rounded-xl bg-gray-50 p-6 transition-all duration-300 hover:shadow-md md:ml-16">
                    {/* Header */}
                    <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {experience.jobTitle}
                          </h3>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getEmploymentTypeColor(
                              experience.employmentType
                            )}`}
                          >
                            {getEmploymentTypeLabel(experience.employmentType)}
                          </span>
                          {experience.isCurrent && (
                            <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Current Role
                            </span>
                          )}
                        </div>

                        <div className="mb-2 flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          {experience.companyWebsite ? (
                            <a
                              href={experience.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              {experience.company}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-medium text-gray-900">
                              {experience.company}
                            </span>
                          )}
                          {experience.saSpecific?.beeLevel && (
                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              {experience.saSpecific.beeLevel}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col text-sm text-gray-600 sm:flex-row sm:items-center sm:space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDateSA(experience.startDate)} -{' '}
                              {formatDateSA(experience.endDate)}
                            </span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            {calculateDuration(
                              experience.startDate,
                              experience.endDate
                            )}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{experience.location} 🇿🇦</span>
                          </div>
                        </div>

                        {/* SA Salary Range */}
                        {experience.salaryRange && (
                          <div className="mt-2 flex items-center space-x-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-700">
                              {experience.salaryRange}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Company Logo */}
                      {experience.companyLogo && (
                        <div className="mt-4 lg:mt-0 lg:ml-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-white p-2">
                            <img
                              src={experience.companyLogo}
                              alt={`${experience.company} logo`}
                              className="h-full w-full object-contain"
                              onError={e => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mb-4 leading-relaxed text-gray-700">
                      {experience.description}
                    </p>

                    {/* SA-Specific Info */}
                    {experience.saSpecific && (
                      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="mb-2 flex items-center space-x-2">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            SA Market Impact
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-green-700">
                          {experience.saSpecific.techHub && (
                            <p>• Tech Hub: {experience.saSpecific.techHub}</p>
                          )}
                          {experience.saSpecific.localImpact && (
                            <p>
                              • Local Impact:{' '}
                              {experience.saSpecific.localImpact}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Highlights */}
                    {experience.highlights &&
                      experience.highlights.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-3">
                          {experience.highlights.map((highlight, idx) => {
                            const Icon = highlight.icon;
                            return (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                              >
                                <Icon className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {highlight.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* Technologies */}
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() =>
                        setExpandedExperience(isExpanded ? null : experience.id)
                      }
                      className="flex items-center space-x-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      <span>
                        {isExpanded ? 'Show less' : 'Show achievements'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Expanded Content - Achievements */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 border-t border-gray-200 pt-4"
                        >
                          <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Key Achievements & SA Impact
                          </h4>
                          <ul className="space-y-2">
                            {experience.achievements.map((achievement, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="flex items-start space-x-3"
                              >
                                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                                <span className="text-sm text-gray-700">
                                  {achievement}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SA Experience Summary */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {experienceData.length}
              </div>
              <div className="text-sm text-gray-600">SA Positions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {
                  experienceData.filter(
                    exp => exp.employmentType === 'full-time'
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Full-time SA Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(experienceData.flatMap(exp => exp.technologies)).size}
              </div>
              <div className="text-sm text-gray-600">Technologies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {formatZAR(estimatedEarnings / 1000000, { showDecimals: true })}
                M
              </div>
              <div className="text-sm text-gray-600">Est. Career Value</div>
            </div>
          </div>

          {/* SA Market Insights */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              SA Tech Market Journey
            </h4>
            <p className="text-sm text-blue-700">
              Career progression through South Africa&apos;s leading tech companies,
              contributing to local innovation and economic growth in the
              digital economy.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {experienceData.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Briefcase className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No SA work experience added
            </h3>
            <p className="mb-6 text-gray-600">
              {isOwnProfile
                ? 'Showcase your professional journey in the South African tech market.'
                : "This developer hasn't added their SA work experience yet."}
            </p>
            {isOwnProfile && (
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add SA Experience
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Edit Experience Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Manage SA Work Experience"
        size="4xl"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-600">
            Add your work experience in the South African tech market. Include
            companies, roles, achievements, and technologies you&apos;ve worked with.
          </p>
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 font-medium text-green-900">
              SA Company Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
              {saUtils.SA_TECH_COMPANIES.slice(0, 8).map((company, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button onClick={() => setIsEditModalOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExperienceSection;
