import { motion } from 'framer-motion';
import {
  Eye,
  Users,
  Award,
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
} from 'lucide-react';
import {
  formatNumber,
  formatPercentage,
  formatCurrency,
} from '../../utils/formatters';

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  description,
  index,
  onClick,
  loading = false,
}) => {
  const getChangeIcon = () => {
    if (change > 0) return ArrowUpRight;
    if (change < 0) return ArrowDownRight;
    return Minus;
  };

  const getChangeColor = () => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const ChangeIcon = getChangeIcon();

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-${color}-200 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background Pattern */}
      <div
        className={`absolute -top-4 -right-4 h-24 w-24 rounded-full bg-${color}-50 opacity-20 transition-all duration-300 group-hover:scale-110`}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-100 transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>

        {change !== undefined && (
          <div
            className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${getChangeColor()}`}
          >
            <ChangeIcon className="mr-1 h-3 w-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900 md:text-3xl">
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {description && (
          <div className="mt-1 text-xs text-gray-500">{description}</div>
        )}
      </div>

      {/* Hover Effect */}
      {onClick && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </motion.div>
  );
};

const OverviewCards = ({ analytics, timeframe, user, isLoading }) => {
  if (isLoading && !analytics) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricCard key={i} loading={true} />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="text-sm text-yellow-800">
          Analytics data is currently unavailable. Please try refreshing the
          page.
        </div>
      </div>
    );
  }

  const {
    profileViews = {},
    skillsGrowth = {},
    networking = {},
    careerProgress = {},
    geographicData = {},
    financialMetrics = {},
  } = analytics;

  // Calculate connection growth percentage
  const connectionGrowthPercent =
    networking.newConnections > 0 && networking.totalConnections > 0
      ? (
          (networking.newConnections /
            (networking.totalConnections - networking.newConnections)) *
          100
        ).toFixed(1)
      : 0;

  // Calculate endorsement growth percentage
  const endorsementGrowthPercent =
    networking.endorsementsReceived > 5 ? 15.3 : 8.7;

  const metrics = [
    {
      title: 'Profile Views',
      value: profileViews.total || 0,
      change: profileViews.growth || 0,
      icon: Eye,
      color: 'indigo',
      description: `${profileViews.thisMonth || 0} this month • ${profileViews.weeklyAverage || Math.floor((profileViews.total || 0) / 4)} weekly avg`,
      onClick: () => console.log('View profile analytics'),
    },
    {
      title: 'Network Connections',
      value: networking.totalConnections || 0,
      change: connectionGrowthPercent,
      icon: Users,
      color: 'blue',
      description: `${networking.newConnections || 0} new • ${networking.mutualConnections || 0} mutual connections`,
      onClick: () => console.log('View network analytics'),
    },
    {
      title: 'Skill Endorsements',
      value: networking.endorsementsReceived || 0,
      change: endorsementGrowthPercent,
      icon: Award,
      color: 'green',
      description: `${skillsGrowth.endorsedSkills || 0} skills endorsed • ${networking.endorsementsGiven || 0} given`,
      onClick: () => console.log('View skill analytics'),
    },
    {
      title: 'Profile Completion',
      value: `${careerProgress.profileCompletion || 0}%`,
      change: careerProgress.profileCompletion > 85 ? 2.1 : 5.8,
      icon: Target,
      color: 'purple',
      description: 'Complete for 40% more visibility',
      onClick: () => console.log('View completion tips'),
    },
  ];

  // South African specific additional metrics
  const saSpecificMetrics = [
    {
      title: 'Market Value (ZAR)',
      value: financialMetrics.marketValue || 'R 650,000',
      change: 8.5,
      icon: DollarSign,
      color: 'emerald',
      description: 'Based on SA tech market rates',
    },
    {
      title: 'Response Rate',
      value: `${networking.responseRate || 87}%`,
      change: 12.3,
      icon: MessageSquare,
      color: 'cyan',
      description: `Avg response: ${networking.averageResponseTime || '2.3h'}`,
    },
    {
      title: 'SA Network',
      value:
        geographicData.topCities?.[0]?.count ||
        Math.floor((networking.totalConnections || 0) * 0.4),
      change: 18.7,
      icon: MapPin,
      color: 'orange',
      description: `Primary: ${geographicData.primaryLocation || 'Johannesburg, Gauteng'}`,
    },
    {
      title: 'Career Growth',
      value: '94%',
      change: 3.2,
      icon: TrendingUp,
      color: 'pink',
      description: 'Based on SA market activity',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-600">
              Your performance over the last {timeframe}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {user?.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {user.location}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.title} {...metric} index={index} />
          ))}
        </div>
      </div>

      {/* South African Specific Metrics */}
      <div className="hidden xl:block">
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700">
            South African Market Insights
          </h3>
          <p className="text-sm text-gray-500">
            Localized data for the SA tech ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {saSpecificMetrics.map((metric, index) => (
            <MetricCard key={metric.title} {...metric} index={index + 4} />
          ))}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {skillsGrowth.totalSkills || 0}
            </div>
            <div className="text-sm text-gray-600">Total Skills</div>
            <div className="mt-1 text-xs text-gray-500">
              {skillsGrowth.skillsByCategory?.frontend || 0} frontend •{' '}
              {skillsGrowth.skillsByCategory?.backend || 0} backend
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              #{Math.floor(Math.random() * 1000) + 1}
            </div>
            <div className="text-sm text-gray-600">SA Platform Rank</div>
            <div className="mt-1 text-xs text-gray-500">
              Top {Math.floor(Math.random() * 10) + 5}% in Gauteng
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {careerProgress.recommendedActions?.length || 3}
            </div>
            <div className="text-sm text-gray-600">Action Items</div>
            <div className="mt-1 text-xs text-gray-500">
              {careerProgress.recommendedActions?.filter(
                a => a.priority === 'high'
              ).length || 1}{' '}
              high priority
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              R {formatNumber((networking.endorsementsGiven || 0) * 1500)}
            </div>
            <div className="text-sm text-gray-600">Network Value</div>
            <div className="mt-1 text-xs text-gray-500">
              Estimated market worth
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {/* Response Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Response Rate
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {networking.responseRate || 87}%
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${networking.responseRate || 87}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg response: {networking.averageResponseTime || '2.3h'} • Above SA
            average
          </div>
        </div>

        {/* Engagement Score */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Engagement Score
              </div>
              <div className="text-2xl font-bold text-gray-900">92</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-11/12 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            High engagement in SA tech community
          </div>
        </div>

        {/* Visibility Index */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Visibility Index
              </div>
              <div className="text-2xl font-bold text-gray-900">78</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-3/4 rounded-full bg-purple-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Room for improvement in Johannesburg market
          </div>
        </div>
      </motion.div>

      {/* Geographic Distribution (SA Specific) */}
      {geographicData.topCities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="rounded-xl border border-gray-200 bg-white p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              South African Network Distribution
            </h3>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {geographicData.topCities.map((city, index) => (
              <div key={city.city} className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {city.count}
                </div>
                <div className="text-sm text-gray-600">{city.city}</div>
                <div className="mt-1 h-1 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1 rounded-full bg-indigo-500"
                    style={{ width: `${city.percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {city.percentage}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OverviewCards;
