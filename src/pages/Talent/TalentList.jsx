import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Award,
  Users,
  Clock,
  Briefcase,
  MessageSquare,
  Heart,
  Crown,
  Zap,
  TrendingUp,
  Flag,
  Building,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { toast } from 'react-hot-toast';

// API Services
import { connectionsAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import {
  formatRelativeTime,
  formatNumber,
  formatCurrency as formatZAR,
} from '../../utils/formatters';

const TalentCard = ({ developer, viewMode = 'grid', index }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async e => {
    e.preventDefault();
    e.stopPropagation();

    setIsConnecting(true);

    try {
      const response = await connectionsAPI.sendConnectionRequest({
        recipientId: developer.id,
        message: `Hi ${developer.name.split(' ')[0]}, I'd love to connect and learn more about your work in South Africa's tech scene!`,
      });

      if (response.success) {
        toast.success(`Connection request sent to ${developer.name}`);
      } else {
        throw new Error(
          response.message || 'Failed to send connection request'
        );
      }
    } catch (error) {
      console.error('Connection request error:', error);
      toast.error('Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLike = e => {
    e.preventDefault();
    e.stopPropagation();

    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleMessage = e => {
    e.preventDefault();
    e.stopPropagation();

    toast.success(`Opening conversation with ${developer.name}`);
  };

  const getAvailabilityColor = availability => {
    switch (availability) {
      case 'open-to-work':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'networking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityLabel = availability => {
    switch (availability) {
      case 'open-to-work':
        return 'Open to Work';
      case 'networking':
        return 'Networking';
      default:
        return 'Not Available';
    }
  };

  const getSkillLevelColor = level => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Get SA tech hub info
  const techHub =
    developer.techHub ||
    saUtils.SA_MAJOR_CITIES.find(city =>
      developer.location?.includes(city.name)
    )?.techHub;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
      >
        <Link to={`/profile/${developer.id}`} className="block">
          <div className="flex items-start space-x-4">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar
                  src={developer.avatar}
                  name={developer.name}
                  size="lg"
                  className="ring-2 ring-gray-100 transition-all group-hover:ring-indigo-200"
                />
                {developer.featured && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
                    <Crown className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
                {/* SA Flag */}
                <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <Flag className="h-3 w-3 text-green-600" />
                </div>
                <div
                  className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${
                    developer.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  {/* Name and Title */}
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                      {developer.name}
                    </h3>
                    <p className="text-gray-600">{developer.title}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span>{developer.location}</span>
                      {developer.currentCompany && (
                        <>
                          <span className="mx-2">•</span>
                          <Building className="mr-1 h-3 w-3" />
                          <span>{developer.currentCompany}</span>
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
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {developer.bio}
                  </p>

                  {/* Skills */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {developer.skills.slice(0, 4).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                      >
                        {skill.name}
                        {skill.endorsements > 0 && (
                          <span className="ml-1 text-xs">
                            ({skill.endorsements})
                          </span>
                        )}
                        {skill.level === 'expert' && (
                          <Zap className="ml-1 h-2 w-2" />
                        )}
                      </span>
                    ))}
                    {developer.skills.length > 4 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        +{developer.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* SA-Specific Info */}
                  {developer.hourlyRate && (
                    <div className="mb-3 flex items-center text-sm text-gray-600">
                      <span className="font-medium text-green-600">
                        {developer.hourlyRate}
                      </span>
                      <span className="mx-2">•</span>
                      <span>SA Market Rate</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {developer.rating?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Award className="mr-1 h-3 w-3" />
                      <span>
                        {formatNumber(developer.endorsements)} endorsements
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      <span>
                        {formatNumber(developer.connections)} connections
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Responds {developer.responseTime}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getAvailabilityColor(developer.availability)}`}
                  >
                    {getAvailabilityLabel(developer.availability)}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Social Links */}
                    <div className="flex space-x-1">
                      {developer.github && (
                        <a
                          href={`https://github.com/${developer.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <Github className="h-3 w-3" />
                        </a>
                      )}
                      {developer.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${developer.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <Linkedin className="h-3 w-3" />
                        </a>
                      )}
                      {developer.website && (
                        <a
                          href={developer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 transition-colors hover:text-green-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      loading={isConnecting}
                      className="text-xs"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
    >
      <Link to={`/profile/${developer.id}`} className="block">
        {/* Header */}
        <div className="relative p-6 pb-4">
          {/* Featured Badge */}
          {developer.featured && (
            <div className="absolute top-4 right-4 flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              <Crown className="mr-1 h-3 w-3" />
              Featured
            </div>
          )}

          {/* Availability Status */}
          <div className="absolute top-4 left-4">
            <div
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getAvailabilityColor(developer.availability)}`}
            >
              {getAvailabilityLabel(developer.availability)}
            </div>
          </div>

          {/* Avatar and Basic Info */}
          <div className="mt-8 text-center">
            <div className="relative mx-auto w-fit">
              <Avatar
                src={developer.avatar}
                name={developer.name}
                size="xl"
                className="ring-2 ring-gray-100 transition-all group-hover:ring-indigo-200"
              />
              {/* SA Flag */}
              <div className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                <Flag className="h-4 w-4 text-green-600" />
              </div>
              <div
                className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${
                  developer.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                {developer.name}
              </h3>
              <p className="text-gray-600">{developer.title}</p>
              <div className="mt-1 flex items-center justify-center text-sm text-gray-500">
                <MapPin className="mr-1 h-3 w-3" />
                <span>{developer.location}</span>
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
          <p className="line-clamp-3 text-sm text-gray-600">{developer.bio}</p>
        </div>

        {/* Skills */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1">
            {developer.skills.slice(0, 3).map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSkillLevelColor(skill.level)}`}
              >
                {skill.name}
                {skill.level === 'expert' && <Zap className="ml-1 h-2 w-2" />}
              </span>
            ))}
            {developer.skills.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                +{developer.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* SA Hourly Rate */}
        {developer.hourlyRate && (
          <div className="px-6 pb-4">
            <div className="rounded-lg bg-green-50 px-3 py-2 text-center">
              <div className="text-sm font-semibold text-green-700">
                {developer.hourlyRate}
              </div>
              <div className="text-xs text-green-600">SA Market Rate</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center">
                <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {developer.rating?.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {formatNumber(developer.endorsements)}
              </div>
              <div className="text-xs text-gray-500">Endorsements</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {developer.projects}
              </div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between">
            {/* Social Links */}
            <div className="flex space-x-2">
              {developer.github && (
                <a
                  href={`https://github.com/${developer.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                  onClick={e => e.stopPropagation()}
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {developer.linkedin && (
                <a
                  href={`https://linkedin.com/in/${developer.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                  onClick={e => e.stopPropagation()}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {developer.website && (
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 transition-colors hover:text-green-600"
                  onClick={e => e.stopPropagation()}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleLike}
                className={`rounded p-2 transition-colors ${
                  isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <Button
                size="sm"
                onClick={handleConnect}
                loading={isConnecting}
                className="px-4"
              >
                Connect
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const EmptyState = ({ hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full py-12 text-center"
  >
    <div className="mx-auto max-w-sm">
      <Users className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {hasFilters ? 'No SA developers found' : 'No developers available'}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {hasFilters
          ? 'Try adjusting your filters to see more SA talent.'
          : 'Check back later as we add more talented SA developers to our platform.'}
      </p>
      {hasFilters && (
        <Button variant="secondary" className="mt-4">
          Clear Filters
        </Button>
      )}
    </div>
  </motion.div>
);

const TalentList = ({
  developers,
  viewMode = 'grid',
  isLoading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) => {
  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
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

  if (developers.length === 0) {
    return <EmptyState hasFilters={true} />;
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
              key={developer.id}
              developer={developer}
              viewMode={viewMode}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && (
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
            {loadingMore
              ? 'Loading More SA Developers...'
              : 'Load More SA Developers'}
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Showing {developers.length} SA developers
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TalentList;
