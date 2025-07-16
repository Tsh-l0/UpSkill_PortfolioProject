import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  Star,
  Users,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Zap,
  Award,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import saUtils from '../../services/utils/southAfrica';

// Get skill level color
const getSkillLevelColor = level => {
  switch (level?.toLowerCase()) {
    case 'expert':
      return 'bg-red-100 text-red-800';
    case 'advanced':
      return 'bg-orange-100 text-orange-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'beginner':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get SA tech hub for city
const getSATechHub = location => {
  if (!location) return null;

  const city = saUtils.SA_MAJOR_CITIES.find(city =>
    location.toLowerCase().includes(city.name.toLowerCase())
  );
  return city?.techHub || null;
};

// Format relative time
const formatRelativeTime = dateString => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Active today';
  if (diffInDays === 1) return 'Active yesterday';
  if (diffInDays < 7) return `Active ${diffInDays} days ago`;
  if (diffInDays < 30) return `Active ${Math.floor(diffInDays / 7)} weeks ago`;

  return `Active ${Math.floor(diffInDays / 30)} months ago`;
};

// Developer Card Component
const TalentCard = ({ developer, viewMode = 'grid', index = 0 }) => {
  // Safely extract developer data with fallbacks
  const {
    id = `dev-${index}`,
    _id,
    name = developer.fullName || 'Unknown Developer',
    fullName,
    title = developer.currentRole || 'Developer',
    currentRole,
    location = 'Location not specified',
    avatar = developer.profileImage || null,
    profileImage,
    bio = 'No bio available',
    skills = [],
    experience = 'Not specified',
    experienceLevel,
    workType = 'Not specified',
    availability = 'Not specified',
    endorsements = 0,
    endorsementCount,
    connections = 0,
    connectionsCount,
    rating = 0,
    joinedDate,
    lastActive,
    github = developer.githubUrl || null,
    githubUrl,
    linkedin = developer.linkedinUrl || null,
    linkedinUrl,
    website = developer.portfolioUrl || null,
    portfolioUrl,
    currentCompany = developer.company || null,
    company,
    isVerified = false,
    isOpenToWork = false,
  } = developer || {};

  // Use consistent field names
  const developerName = name || fullName || 'Unknown Developer';
  const developerTitle = title || currentRole || 'Developer';
  const developerAvatar = avatar || profileImage;
  const developerEndorsements = endorsements || endorsementCount || 0;
  const developerConnections = connections || connectionsCount || 0;
  const developerGithub = github || githubUrl;
  const developerLinkedin = linkedin || linkedinUrl;
  const developerWebsite = website || portfolioUrl;
  const developerCompany = currentCompany || company;
  const developerId = id || _id || `dev-${index}`;

  // Get tech hub
  const techHub = getSATechHub(location);

  // Ensure skills is an array
  const developerSkills = Array.isArray(skills) ? skills : [];

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar
              src={developerAvatar}
              alt={developerName}
              size="lg"
              fallback={developerName}
            />
            {isVerified && (
              <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1">
                <Award className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white ${
                isOpenToWork ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {/* Name and Title */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                    {developerName}
                  </h3>
                  <p className="text-gray-600">{developerTitle}</p>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span>{location}</span>
                    {developerCompany && (
                      <>
                        <span className="mx-2">•</span>
                        <Building className="mr-1 h-3 w-3" />
                        <span>{developerCompany}</span>
                      </>
                    )}
                    {techHub && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium text-indigo-600">
                          {techHub}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{bio}</p>

                {/* Skills */}
                <div className="mb-3 flex flex-wrap gap-1">
                  {developerSkills.slice(0, 4).map((skill, skillIndex) => {
                    const skillName =
                      typeof skill === 'string' ? skill : skill.name || skill;
                    const skillLevel =
                      typeof skill === 'object' ? skill.level : null;

                    return (
                      <span
                        key={`${developerId}-skill-${skillIndex}-${skillName}`}
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          skillLevel
                            ? getSkillLevelColor(skillLevel)
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {skillName}
                        {skillLevel === 'expert' && (
                          <Zap className="ml-1 h-2 w-2" />
                        )}
                      </span>
                    );
                  })}
                  {developerSkills.length > 4 && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      +{developerSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="ml-4 flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                    <span>{rating ? rating.toFixed(1) : '4.8'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{developerConnections}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="mr-1 h-4 w-4" />
                    <span>{developerEndorsements}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-2">
                  {developerGithub && (
                    <a
                      href={
                        developerGithub.startsWith('http')
                          ? developerGithub
                          : `https://github.com/${developerGithub}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors hover:text-gray-600"
                      onClick={e => e.stopPropagation()}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {developerLinkedin && (
                    <a
                      href={
                        developerLinkedin.startsWith('http')
                          ? developerLinkedin
                          : `https://linkedin.com/in/${developerLinkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors hover:text-blue-600"
                      onClick={e => e.stopPropagation()}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {developerWebsite && (
                    <a
                      href={
                        developerWebsite.startsWith('http')
                          ? developerWebsite
                          : `https://${developerWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors hover:text-gray-600"
                      onClick={e => e.stopPropagation()}
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Last Active */}
                {lastActive && (
                  <div className="text-xs text-gray-400">
                    {formatRelativeTime(lastActive)}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center space-x-3">
              <Button
                as={Link}
                to={`/profile/${developerId}`}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="mr-2 h-3 w-3" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
    >
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar
              src={developerAvatar}
              alt={developerName}
              size="xl"
              fallback={developerName}
            />
            {isVerified && (
              <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1">
                <Award className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${
                isOpenToWork ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
              {developerName}
            </h3>
            <p className="text-gray-600">{developerTitle}</p>
            <div className="mt-1 flex items-center justify-center text-sm text-gray-500">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{location}</span>
            </div>
            {techHub && (
              <div className="mt-1 text-xs font-medium text-indigo-600">
                {techHub}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 pb-4">
        <p className="line-clamp-3 text-sm text-gray-600">{bio}</p>
      </div>

      {/* Skills */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-1">
          {developerSkills.slice(0, 3).map((skill, skillIndex) => {
            const skillName =
              typeof skill === 'string' ? skill : skill.name || skill;
            const skillLevel = typeof skill === 'object' ? skill.level : null;

            return (
              <span
                key={`${developerId}-grid-skill-${skillIndex}-${skillName}`}
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  skillLevel
                    ? getSkillLevelColor(skillLevel)
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {skillName}
                {skillLevel === 'expert' && <Zap className="ml-1 h-2 w-2" />}
              </span>
            );
          })}
          {developerSkills.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              +{developerSkills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {developerEndorsements}
            </div>
            <div className="text-xs text-gray-500">Endorsements</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {developerConnections}
            </div>
            <div className="text-xs text-gray-500">Connections</div>
          </div>
          <div>
            <div className="flex items-center justify-center text-lg font-semibold text-gray-900">
              <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
              {rating ? rating.toFixed(1) : '4.8'}
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {developerGithub && (
              <a
                href={
                  developerGithub.startsWith('http')
                    ? developerGithub
                    : `https://github.com/${developerGithub}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                onClick={e => e.stopPropagation()}
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {developerLinkedin && (
              <a
                href={
                  developerLinkedin.startsWith('http')
                    ? developerLinkedin
                    : `https://linkedin.com/in/${developerLinkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-blue-600"
                onClick={e => e.stopPropagation()}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {developerWebsite && (
              <a
                href={
                  developerWebsite.startsWith('http')
                    ? developerWebsite
                    : `https://${developerWebsite}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                onClick={e => e.stopPropagation()}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Last Active */}
          {lastActive && (
            <div className="text-xs text-gray-400">
              {formatRelativeTime(lastActive)}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          as={Link}
          to={`/profile/${developerId}`}
          variant="primary"
          size="sm"
          className="mt-3 w-full"
        >
          <ExternalLink className="mr-2 h-3 w-3" />
          View Profile
        </Button>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ hasFilters = false, onClearFilters = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div className="mb-6 rounded-full bg-gray-100 p-6">
      <Users className="h-12 w-12 text-gray-400" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-gray-900">
      {hasFilters ? 'No developers found' : 'No developers available'}
    </h3>
    <p className="mb-6 max-w-md text-sm text-gray-500">
      {hasFilters
        ? 'Try adjusting your filters to see more South African talent.'
        : 'Check back later as we add more talented developers to our platform.'}
    </p>
    {hasFilters && onClearFilters && (
      <Button onClick={onClearFilters} variant="secondary">
        Clear Filters
      </Button>
    )}
  </motion.div>
);

// Main TalentList Component
const TalentList = ({
  developers = [],
  viewMode = 'grid',
  isLoading = false,
  hasMore = false,
  onLoadMore = null,
  loadingMore = false,
  onClearFilters = null,
  hasFilters = false,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 rounded bg-gray-200" />
              <div className="h-3 w-5/6 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(developers) || developers.length === 0) {
    return (
      <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
    );
  }

  return (
    <div>
      {/* Results Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}
      >
        <AnimatePresence>
          {developers.map((developer, index) => (
            <TalentCard
              key={developer?.id || developer?._id || `dev-fallback-${index}`}
              developer={developer}
              viewMode={viewMode}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={onLoadMore}
            size="lg"
            variant="secondary"
            loading={loadingMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading more developers...' : 'Load More'}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TalentList;
