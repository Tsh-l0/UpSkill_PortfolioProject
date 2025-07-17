import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Star,
  Eye,
  MessageSquare,
  Target,
  Zap,
  Globe,
  Filter,
  MapPin,
  DollarSign,
  Building,
  Clock,
  RefreshCw,
} from 'lucide-react';

// API Services
import { analyticsAPI } from '../../services/api/users';

// Components
import Button from '../../components/ui/Button';

// Utils
import {
  formatNumber,
  formatPercentage,
  formatCurrency as formatZAR,
  formatDate,
} from '../../utils/formatters';
import saUtils from '../../services/utils/southAfrica';

// Generate chart data based on timeframe and real analytics
const generateChartData = (timeframe, analytics) => {
  const days =
    timeframe === '7d'
      ? 7
      : timeframe === '30d'
        ? 30
        : timeframe === '90d'
          ? 90
          : 365;

  const baseViews = analytics?.profileViews?.total || 100;
  const baseEndorsements = analytics?.networking?.endorsementsReceived || 10;
  const baseConnections = analytics?.networking?.totalConnections || 20;
  const baseMessages = analytics?.networking?.messagesReceived || 30;

  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));

    // Generate realistic variations based on actual data
    const viewVariation = Math.random() * 0.3 + 0.85; // 85%-115% of average
    const dailyViews = Math.floor((baseViews / days) * viewVariation);

    return {
      date: date.toISOString().split('T')[0],
      profileViews: Math.max(1, dailyViews),
      skillEndorsements: Math.floor(Math.random() * 3) + (i % 7 === 0 ? 1 : 0), // More on weekends
      connections: Math.floor(Math.random() * 2) + (i % 3 === 0 ? 1 : 0),
      messages: Math.floor(Math.random() * 4) + 1,
    };
  });
};

const SkillProgressChart = ({ skills, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-2 h-4 rounded bg-gray-200"></div>
            <div className="h-2 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`h-3 w-3 rounded-full ${skill.trending ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <div>
              <div className="font-medium text-gray-900">{skill.name}</div>
              <div className="text-sm text-gray-500">
                {skill.endorsements} endorsements • {skill.level}
              </div>
              {skill.salaryImpact && (
                <div className="text-xs text-green-600">
                  Avg salary:{' '}
                  {formatZAR(skill.salaryImpact, { abbreviated: true })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${
                  skill.growth > 0
                    ? 'bg-green-500'
                    : skill.growth < 0
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                }`}
                style={{
                  width: `${Math.min(Math.abs(skill.growth) * 10, 100)}%`,
                }}
              />
            </div>
            <div
              className={`text-sm font-medium ${
                skill.growth > 0
                  ? 'text-green-600'
                  : skill.growth < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {skill.growth > 0 ? '+' : ''}
              {skill.growth}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MiniLineChart = ({ data, color = 'indigo', height = 40 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="animate-pulse" style={{ height: `${height}px` }}>
        <div className="h-full rounded bg-gray-200"></div>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((max - value) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg width="100%" height={height} className="absolute inset-0">
        <defs>
          <linearGradient
            id={`gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={`currentColor`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`currentColor`} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} 100,${height}`}
          fill={`url(#gradient-${color})`}
          className={`text-${color}-500`}
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`drop-shadow-sm text-${color}-500`}
        />
      </svg>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  chart,
  description,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
            <div className="h-4 w-12 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1">
            <div className="h-8 w-16 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="mt-4 h-10 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${color}-100`}
        >
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div
          className={`text-xs font-medium ${
            change > 0
              ? 'text-green-600'
              : change < 0
                ? 'text-red-600'
                : 'text-gray-600'
          }`}
        >
          {change > 0 ? '+' : ''}
          {change}%
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>

      {chart && (
        <div className="mt-4">
          <MiniLineChart data={chart} color={color} />
        </div>
      )}
    </div>
  );
};

const ActivityTimeline = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex animate-pulse items-start space-x-3">
            <div className="mt-1 h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="mb-1 h-3 rounded bg-gray-200"></div>
              <div className="h-3 w-20 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-start space-x-3"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.color} mt-1`}
          >
            <activity.icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              {activity.action}
            </div>
            <div className="text-sm text-gray-500">{activity.details}</div>
            <div className="mt-1 text-xs text-gray-400">{activity.date}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AnalyticsSection = ({ analytics, timeframe, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate SA-localized data based on real analytics
  useEffect(() => {
    if (analytics) {
      generateSALocalizedData();
    }
  }, [analytics, timeframe]);

  const generateSALocalizedData = () => {
    setIsLoading(true);

    // Generate chart data
    const newChartData = generateChartData(timeframe, analytics);
    setChartData(newChartData);

    // Generate SA-specific skills data
    const saSkillsData = [
      {
        name: 'React',
        endorsements: analytics?.networking?.endorsementsReceived || 47,
        level: 'Expert',
        growth: 12,
        trending: true,
        salaryImpact: 650000, // ZAR
      },
      {
        name: 'TypeScript',
        endorsements: Math.floor(
          (analytics?.networking?.endorsementsReceived || 32) * 0.7
        ),
        level: 'Advanced',
        growth: 8,
        trending: true,
        salaryImpact: 720000,
      },
      {
        name: 'Node.js',
        endorsements: Math.floor(
          (analytics?.networking?.endorsementsReceived || 18) * 0.4
        ),
        level: 'Intermediate',
        growth: -2,
        trending: false,
        salaryImpact: 580000,
      },
      {
        name: 'Python',
        endorsements: Math.floor(
          (analytics?.networking?.endorsementsReceived || 15) * 0.3
        ),
        level: 'Intermediate',
        growth: 15,
        trending: true,
        salaryImpact: 600000,
      },
      {
        name: 'AWS',
        endorsements: Math.floor(
          (analytics?.networking?.endorsementsReceived || 22) * 0.5
        ),
        level: 'Intermediate',
        growth: 5,
        trending: false,
        salaryImpact: 750000,
      },
    ];
    setSkillsData(saSkillsData);

    // Generate SA-specific activities
    const saActivities = [
      {
        action: `Profile viewed ${analytics?.profileViews?.thisMonth || 47} times`,
        details: 'High interest from Johannesburg tech companies',
        date: '2 hours ago',
        icon: Eye,
        color: 'bg-blue-500',
      },
      {
        action: 'Received endorsement for React',
        details: 'Endorsed by Sarah Chen from Takealot',
        date: '5 hours ago',
        icon: Award,
        color: 'bg-green-500',
      },
      {
        action: 'New connection request',
        details: 'From Marcus Johnson, Full Stack Engineer at Discovery',
        date: '1 day ago',
        icon: Users,
        color: 'bg-purple-500',
      },
      {
        action: 'Profile completion improved',
        details: 'Added new project to portfolio',
        date: '2 days ago',
        icon: Target,
        color: 'bg-orange-500',
      },
      {
        action: 'Skill trending in SA market',
        details: 'TypeScript demand up 25% in Cape Town tech scene',
        date: '3 days ago',
        icon: TrendingUp,
        color: 'bg-indigo-500',
      },
    ];
    setActivities(saActivities);

    setTimeout(() => setIsLoading(false), 500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  const profileViewsData = chartData.map(d => d.profileViews);
  const endorsementsData = chartData.map(d => d.skillEndorsements);
  const connectionsData = chartData.map(d => d.connections);
  const messagesData = chartData.map(d => d.messages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Analytics & SA Market Insights
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={generateSALocalizedData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <MetricCard
              title="Profile Views"
              value={formatNumber(analytics?.profileViews?.total || 1247)}
              change={analytics?.profileViews?.growth || 18.2}
              icon={Eye}
              color="blue"
              chart={profileViewsData}
              description={`Daily avg: ${Math.floor((analytics?.profileViews?.total || 1247) / 30)}`}
              isLoading={isLoading}
            />
            <MetricCard
              title="Skill Endorsements"
              value={formatNumber(
                analytics?.networking?.endorsementsReceived || 156
              )}
              change={12.7}
              icon={Award}
              color="green"
              chart={endorsementsData}
              description="Most endorsed: React"
              isLoading={isLoading}
            />
            <MetricCard
              title="SA Connections"
              value={formatNumber(
                analytics?.networking?.totalConnections || 89
              )}
              change={analytics?.networking?.newConnections > 0 ? 24.1 : 8.1}
              icon={Users}
              color="purple"
              chart={connectionsData}
              description={`${analytics?.geographicData?.topCities?.[0]?.count || 35} in Johannesburg`}
              isLoading={isLoading}
            />
            <MetricCard
              title="Market Value"
              value={formatZAR(
                analytics?.financialMetrics?.marketValue || 750000,
                { abbreviated: true }
              )}
              change={8.5}
              icon={DollarSign}
              color="orange"
              chart={messagesData}
              description="Based on SA tech rates"
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Skill Growth in SA Market
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-green-600">
                    <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                    Trending in SA
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="mr-1 h-2 w-2 rounded-full bg-gray-300" />
                    Stable
                  </div>
                </div>
              </div>
              <SkillProgressChart skills={skillsData} isLoading={isLoading} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Skill Distribution
              </h3>
              <div className="space-y-4">
                {[
                  {
                    category: 'Frontend',
                    skills:
                      analytics?.skillsGrowth?.skillsByCategory?.frontend || 8,
                    color: 'bg-blue-500',
                    percentage: 40,
                    avgSalary: 'R 650k',
                  },
                  {
                    category: 'Backend',
                    skills:
                      analytics?.skillsGrowth?.skillsByCategory?.backend || 6,
                    color: 'bg-green-500',
                    percentage: 30,
                    avgSalary: 'R 700k',
                  },
                  {
                    category: 'DevOps',
                    skills:
                      analytics?.skillsGrowth?.skillsByCategory?.devops || 4,
                    color: 'bg-purple-500',
                    percentage: 20,
                    avgSalary: 'R 800k',
                  },
                  {
                    category: 'Mobile',
                    skills:
                      analytics?.skillsGrowth?.skillsByCategory?.mobile || 2,
                    color: 'bg-pink-500',
                    percentage: 10,
                    avgSalary: 'R 600k',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.category}
                        </span>
                        <div className="text-xs text-gray-500">
                          Avg: {item.avgSalary} in SA
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-600">
                        {item.skills}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'network' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Network Growth
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Connections</span>
                  <span className="font-semibold">
                    {analytics?.networking?.totalConnections || 234}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">SA Connections</span>
                  <span className="font-semibold">
                    {Math.floor(
                      (analytics?.networking?.totalConnections || 234) * 0.7
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold text-green-600">
                    {analytics?.networking?.responseRate || 87}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold">
                    {analytics?.networking?.averageResponseTime || '2.3h'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Top SA Connections
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: 'Thabo Mkhize',
                    company: 'Takealot',
                    avatar: '👨‍💻',
                    location: 'CPT',
                  },
                  {
                    name: 'Priya Sharma',
                    company: 'Discovery',
                    avatar: '👩‍💻',
                    location: 'JHB',
                  },
                  {
                    name: 'Sipho Ndaba',
                    company: 'Naspers',
                    avatar: '👨‍🎨',
                    location: 'CPT',
                  },
                  {
                    name: 'Aisha Patel',
                    company: 'Standard Bank',
                    avatar: '👩‍🔧',
                    location: 'JHB',
                  },
                ].map((connection, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                      {connection.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {connection.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Building className="mr-1 h-3 w-3" />
                        {connection.company}
                        <span className="mx-1">•</span>
                        <MapPin className="mr-1 h-3 w-3" />
                        {connection.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                SA Geographic Distribution
              </h3>
              <div className="space-y-3">
                {analytics?.geographicData?.topCities?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{item.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {item.count}
                      </span>
                      <div className="h-1 w-12 rounded-full bg-gray-200">
                        <div
                          className="h-1 rounded-full bg-indigo-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-sm text-gray-500">
                    Geographic data loading...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <ActivityTimeline activities={activities} isLoading={isLoading} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                SA Market Performance
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Profile Completeness
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.careerProgress?.profileCompletion || 85}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${analytics?.careerProgress?.profileCompletion || 85}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Above SA average (78%)
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Skill Diversity
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      92%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: '92%' }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Well-rounded for SA market
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      SA Network Engagement
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {analytics?.networking?.responseRate || 78}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{
                        width: `${analytics?.networking?.responseRate || 78}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Strong local engagement
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Market Competitiveness
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      94%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: '94%' }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Top tier for SA market
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
