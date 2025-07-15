import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Calendar,
  AlertCircle,
} from 'lucide-react';

// API Services
import { usersAPI, analyticsAPI } from '../../services/api/users';

// Hooks and stores
import useAuth from '../../hooks/useAuth';

// Components
import OverviewCards from './OverviewCards';
import AnalyticsSection from './AnalyticsSection';
import RecommendationsSection from './RecommendationsSection';
import Button from '../../components/ui/Button';
import { SectionLoading } from '../../components/ui/Loading';

// Utils
import { formatDate } from '../../utils/formatters';

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();

  // State management
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch analytics data from backend
  const fetchAnalytics = async (timeframe = selectedTimeframe) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call the real backend analytics endpoint
      const response = await usersAPI.getAnalytics(timeframe);

      if (response.success) {
        setAnalytics(response.data);
        setLastUpdated(new Date());
        toast.success('Dashboard updated successfully');
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);

      // Use fallback mock data with SA localization
      setAnalytics(generateSAMockAnalytics(user));
      toast.error('Using offline data - connection issue detected');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate South African localized mock data as fallback
  const generateSAMockAnalytics = userData => {
    const baseViews =
      userData?.profileViews || Math.floor(Math.random() * 500) + 50;
    const baseEndorsements =
      userData?.totalEndorsements || Math.floor(Math.random() * 30) + 5;
    const baseConnections =
      userData?.totalConnections || Math.floor(Math.random() * 100) + 10;

    return {
      profileViews: {
        total: baseViews,
        thisMonth: Math.floor(baseViews * 0.3),
        growth: Math.floor(Math.random() * 30) + 5,
        weeklyAverage: Math.floor(baseViews / 4),
      },
      skillsGrowth: {
        totalSkills: Math.floor(Math.random() * 15) + 5,
        endorsedSkills: Math.floor(Math.random() * 8) + 2,
        trendingSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        skillsByCategory: {
          frontend: 8,
          backend: 6,
          devops: 4,
          mobile: 3,
        },
      },
      networking: {
        totalConnections: baseConnections,
        newConnections: Math.floor(Math.random() * 10) + 1,
        endorsementsReceived: baseEndorsements,
        endorsementsGiven: Math.floor(baseEndorsements * 0.6),
        mutualConnections: Math.floor(baseConnections * 0.4),
        responseRate: Math.floor(Math.random() * 20) + 80, // 80-100%
        averageResponseTime: '2.3h',
      },
      careerProgress: {
        profileCompletion:
          userData?.profileCompletionScore ||
          Math.floor(Math.random() * 30) + 70,
        recommendedActions: [
          {
            type: 'profile',
            message: 'Add more skills to your profile',
            priority: 'high',
            estimatedImpact: '+40% profile views',
          },
          {
            type: 'network',
            message: 'Connect with 5 more professionals in Johannesburg',
            priority: 'medium',
            estimatedImpact: '+25% network growth',
          },
          {
            type: 'content',
            message: 'Engage with South African tech community content',
            priority: 'low',
            estimatedImpact: '+15% visibility',
          },
        ],
      },
      // South African specific data
      geographicData: {
        primaryLocation: 'Johannesburg, Gauteng',
        topCities: [
          {
            city: 'Johannesburg',
            count: Math.floor(baseConnections * 0.4),
            percentage: 40,
          },
          {
            city: 'Cape Town',
            count: Math.floor(baseConnections * 0.25),
            percentage: 25,
          },
          {
            city: 'Durban',
            count: Math.floor(baseConnections * 0.15),
            percentage: 15,
          },
          {
            city: 'Pretoria',
            count: Math.floor(baseConnections * 0.12),
            percentage: 12,
          },
          {
            city: 'Remote',
            count: Math.floor(baseConnections * 0.08),
            percentage: 8,
          },
        ],
      },
      // Currency in Rands
      financialMetrics: {
        averageSalaryRange: 'R 450,000 - R 850,000',
        currency: 'ZAR',
        marketValue: `R ${(Math.floor(Math.random() * 400) + 600) * 1000}`,
      },
    };
  };

  // Fetch analytics when component mounts or timeframe changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchAnalytics();
    }
  }, [user, authLoading, selectedTimeframe]);

  const handleRefresh = async () => {
    await fetchAnalytics();
  };

  const handleExport = async () => {
    try {
      const blob = new Blob([JSON.stringify(analytics, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upskill-analytics-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Analytics exported successfully');
    } catch (err) {
      toast.error('Failed to export analytics');
    }
  };

  const timeframeOptions = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '3 months' },
    { value: '1y', label: '1 year' },
  ];

  // Loading state
  if (authLoading || (isLoading && !analytics)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionLoading rows={12} />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <h3 className="ml-3 text-sm font-medium text-red-800">
                Unable to load dashboard
              </h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button onClick={handleRefresh} variant="secondary" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                      Dashboard
                    </h1>
                    <p className="mt-1 text-lg text-gray-600">
                      Welcome back,{' '}
                      {user?.fullName || user?.name || 'Developer'}! Here&apos;s
                      your progress overview.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <div className="flex items-center space-x-3">
                  {/* Timeframe Selector */}
                  <select
                    value={selectedTimeframe}
                    onChange={e => setSelectedTimeframe(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {timeframeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Refresh Button */}
                  <Button
                    variant="secondary"
                    onClick={handleRefresh}
                    loading={isLoading}
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>

                  {/* Export Button */}
                  <Button
                    variant="ghost"
                    className="flex items-center"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Export</span>
                  </Button>

                  {/* Settings Button */}
                  <Button variant="ghost" className="flex items-center">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Last Updated & Connection Status */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  Last updated: {formatDate(lastUpdated, 'MMM d, yyyy h:mm a')}
                </span>
              </div>

              {error && (
                <div className="flex items-center text-sm text-amber-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>Using offline data</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <OverviewCards
              analytics={analytics}
              timeframe={selectedTimeframe}
              user={user}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnalyticsSection
              analytics={analytics}
              timeframe={selectedTimeframe}
              user={user}
            />
          </motion.div>

          {/* Recommendations Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <RecommendationsSection
              analytics={analytics}
              user={user}
              onRefresh={handleRefresh}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
