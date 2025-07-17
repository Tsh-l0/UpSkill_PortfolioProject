import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Target,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  Lightbulb,
  ArrowRight,
  UserPlus,
  Briefcase,
  Code,
  Zap,
  Heart,
  ChevronRight,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Globe,
  RefreshCw,
} from 'lucide-react';

// API Services
import { usersAPI, connectionsAPI } from '../../services/api/users';

// Components
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const ActionCard = ({ action, onComplete, onDismiss, index }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Here you could call a backend API to mark action as completed
      // await analyticsAPI.completeAction(action.id);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsCompleted(true);
      onComplete?.(action.id);
      toast.success('Action completed!');
    } catch (error) {
      toast.error('Failed to complete action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    onDismiss?.(action.id);
    toast.success('Recommendation dismissed');
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getPriorityDot = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative rounded-xl border p-6 transition-all duration-300 ${
        isCompleted
          ? 'border-green-200 bg-green-50 opacity-75'
          : getPriorityColor(action.priority)
      }`}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 text-gray-400 transition-colors hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-start space-x-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isCompleted ? 'bg-green-100' : 'border border-gray-200 bg-white'
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <action.icon
              className={`h-5 w-5 ${
                action.priority === 'high'
                  ? 'text-red-600'
                  : action.priority === 'medium'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
              }`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h3
              className={`font-semibold ${
                isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
              }`}
            >
              {action.title}
            </h3>
            <div
              className={`h-2 w-2 rounded-full ${getPriorityDot(action.priority)}`}
            />
          </div>
          <p
            className={`mt-1 text-sm ${
              isCompleted ? 'text-green-700' : 'text-gray-600'
            }`}
          >
            {action.description}
          </p>

          {action.impact && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Impact: {action.impact}</span>
            </div>
          )}

          {action.location && (
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{action.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="mr-1 h-3 w-3" />
            <span>{action.timeEstimate}</span>
          </div>

          <div className="flex space-x-2">
            {action.learnMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(action.learnMore, '_blank')}
              >
                Learn More
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}
            <Button size="sm" onClick={handleComplete} loading={isLoading}>
              {action.actionText || 'Complete'}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PersonCard = ({ person, onConnect, index }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Call real backend API for connection request
      await connectionsAPI.sendRequest(person.id);
      onConnect?.(person.id);
      toast.success(`Connection request sent to ${person.name}`);
    } catch (error) {
      toast.error('Failed to send connection request');
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar
            src={person.avatar}
            name={person.name}
            size="md"
            className="ring-2 ring-gray-100"
          />
          {person.featured && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400">
              <Star className="h-2 w-2 text-yellow-800" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-600">{person.title}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Building className="h-3 w-3" />
            <span>{person.company}</span>
            {person.location && (
              <>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{person.location}</span>
              </>
            )}
          </div>

          <div className="mt-2 flex items-center space-x-2">
            {person.mutualConnections > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                <Users className="mr-1 h-2 w-2" />
                {person.mutualConnections} mutual
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              {person.matchScore}% match
            </span>
            {person.salaryRange && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                <DollarSign className="mr-1 h-2 w-2" />
                {person.salaryRange}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{person.reason}</div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            as={Link}
            to={`/profile/${person.id}`}
          >
            View Profile
          </Button>
          <Button size="sm" onClick={handleConnect} loading={isConnecting}>
            Connect
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const LearningCard = ({ resource, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
    onClick={() => window.open(resource.url, '_blank')}
  >
    <div className="flex items-start space-x-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${resource.color}-100 transition-transform group-hover:scale-110`}
      >
        <resource.icon className={`h-5 w-5 text-${resource.color}-600`} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
          {resource.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{resource.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{resource.type}</span>
            <span>•</span>
            <span>{resource.duration}</span>
            <span>•</span>
            <span className="flex items-center">
              <Star className="mr-1 h-2 w-2 fill-yellow-400 text-yellow-400" />
              {resource.rating}
            </span>
            {resource.price && (
              <>
                <span>•</span>
                <span className="font-medium text-green-600">
                  {resource.price}
                </span>
              </>
            )}
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-600" />
        </div>
      </div>
    </div>
  </motion.div>
);

const RecommendationsSection = ({ analytics, user, onRefresh }) => {
  const [completedActions, setCompletedActions] = useState(new Set());
  const [dismissedActions, setDismissedActions] = useState(new Set());
  const [connectedPeople, setConnectedPeople] = useState(new Set());
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch AI-powered suggestions from backend (if available)
  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      // This would call your backend AI recommendation service
      // const response = await analyticsAPI.getRecommendations(user.id);
      // setSuggestions(response.data);

      // For now, use SA-localized mock data
      setSuggestions(generateSALocalizedSuggestions(analytics, user));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(generateSALocalizedSuggestions(analytics, user));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (analytics && user) {
      fetchSuggestions();
    }
  }, [analytics, user]);

  // Generate South African localized suggestions
  const generateSALocalizedSuggestions = (analyticsData, userData) => {
    const profileCompletion =
      analyticsData?.careerProgress?.profileCompletion || 70;
    const skillsCount = analyticsData?.skillsGrowth?.totalSkills || 5;
    const connectionsCount = analyticsData?.networking?.totalConnections || 20;

    const actions = [
      {
        id: 1,
        title: 'Complete your profile for SA market',
        description:
          'Add professional bio and update skills to attract South African employers. 85% complete profiles get 40% more views.',
        icon: Target,
        priority: profileCompletion < 80 ? 'high' : 'medium',
        timeEstimate: '5 min',
        impact: '+40% profile views',
        actionText: 'Update Profile',
        location: 'Recommended for SA market',
        learnMore: 'https://help.upskill.com/sa-profile-tips',
      },
      {
        id: 2,
        title: 'Connect with Johannesburg tech leaders',
        description:
          'Build your network in the Gauteng tech hub. Connect with 5 senior developers in your area.',
        icon: Users,
        priority: connectionsCount < 50 ? 'high' : 'medium',
        timeEstimate: '15 min',
        impact: '+25% local opportunities',
        actionText: 'Find Connections',
        location: 'Johannesburg, Gauteng',
      },
      {
        id: 3,
        title: 'Request skill endorsements',
        description:
          'Ask colleagues to endorse your React skills. Endorsed skills in SA market show 30% higher credibility.',
        icon: Award,
        priority: 'medium',
        timeEstimate: '10 min',
        impact: '+30% skill credibility',
        actionText: 'Send Requests',
        location: 'Local colleagues preferred',
      },
      {
        id: 4,
        title: 'Join Cape Town React meetup',
        description:
          'React is trending in SA. Join local meetups to expand your professional network.',
        icon: Calendar,
        priority: 'low',
        timeEstimate: '2 hours',
        impact: '+20% community visibility',
        actionText: 'Join Meetup',
        location: 'Cape Town or Virtual',
        learnMore: 'https://meetup.com/cape-town-react',
      },
    ];

    const connections = [
      {
        id: 1,
        name: 'Thabo Mkhize',
        title: 'Senior React Developer',
        company: 'Takealot',
        location: 'Cape Town, WC',
        avatar: '/images/avatars/thabo.jpg',
        mutualConnections: 5,
        matchScore: 94,
        reason: 'Similar React expertise in SA e-commerce',
        featured: true,
        salaryRange: 'R 650k - R 850k',
      },
      {
        id: 2,
        name: 'Priya Sharma',
        title: 'Frontend Architect',
        company: 'Discovery',
        location: 'Johannesburg, GP',
        avatar: '/images/avatars/priya.jpg',
        mutualConnections: 3,
        matchScore: 89,
        reason: 'TypeScript specialist in fintech',
        featured: false,
        salaryRange: 'R 700k - R 900k',
      },
      {
        id: 3,
        name: 'Sipho Ndaba',
        title: 'Full Stack Engineer',
        company: 'Naspers',
        location: 'Cape Town, WC',
        avatar: '/images/avatars/sipho.jpg',
        mutualConnections: 7,
        matchScore: 87,
        reason: 'Node.js expertise in media tech',
        featured: false,
        salaryRange: 'R 600k - R 800k',
      },
    ];

    const learningResources = [
      {
        id: 1,
        title: 'Advanced React Patterns for SA Developers',
        description:
          'Master React patterns used by top SA companies like Takealot and Discovery',
        type: 'Course',
        duration: '4 hours',
        rating: 4.8,
        price: 'R 299',
        url: 'https://wethinkcode.co.za/react-patterns',
        icon: Code,
        color: 'blue',
      },
      {
        id: 2,
        title: 'TypeScript in SA Fintech',
        description:
          'Learn TypeScript patterns used by Standard Bank, Discovery, and other SA fintech leaders',
        type: 'Workshop',
        duration: '2 hours',
        rating: 4.9,
        price: 'R 199',
        url: 'https://codecollege.co.za/typescript-fintech',
        icon: BookOpen,
        color: 'purple',
      },
      {
        id: 3,
        title: 'Building Developer Communities in SA',
        description:
          'Learn from organizers of JHB JS, CT Frontend, and other SA tech communities',
        type: 'Webinar',
        duration: '1 hour',
        rating: 4.7,
        price: 'Free',
        url: 'https://zatech.co.za/community-building',
        icon: Users,
        color: 'green',
      },
      {
        id: 4,
        title: 'Remote Work Success for SA Developers',
        description:
          'Master remote work skills to access global opportunities while living in SA',
        type: 'Guide',
        duration: '30 min',
        rating: 4.6,
        price: 'R 99',
        url: 'https://offerzen.com/remote-work-guide',
        icon: Globe,
        color: 'orange',
      },
    ];

    return { actions, connections, learningResources };
  };

  const handleCompleteAction = actionId => {
    setCompletedActions(prev => new Set(prev).add(actionId));
  };

  const handleDismissAction = actionId => {
    setDismissedActions(prev => new Set(prev).add(actionId));
  };

  const handleConnect = personId => {
    setConnectedPeople(prev => new Set(prev).add(personId));
  };

  if (isLoading || !suggestions) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recommendations
          </h2>
          <Button variant="ghost" size="sm" loading={isLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  const activeActions = suggestions.actions.filter(
    action =>
      !completedActions.has(action.id) && !dismissedActions.has(action.id)
  );

  const activeConnections = suggestions.connections.filter(
    person => !connectedPeople.has(person.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            SA Tech Recommendations
          </h2>
          <p className="text-sm text-gray-600">
            Personalized suggestions for the South African tech market
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={fetchSuggestions}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Lightbulb className="h-4 w-4" />
            <span className="ml-2">More Tips</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activeActions.length}
          </div>
          <div className="text-sm text-blue-700">Action Items</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {activeConnections.length}
          </div>
          <div className="text-sm text-green-700">SA Connections</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {suggestions.learningResources.length}
          </div>
          <div className="text-sm text-purple-700">Local Resources</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">R 750k</div>
          <div className="text-sm text-orange-700">Avg SA Salary</div>
        </div>
      </div>

      {/* Suggested Actions */}
      {activeActions.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Suggested Actions
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Zap className="mr-1 h-4 w-4" />
              <span>Quick wins for SA market</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeActions.map((action, index) => (
              <ActionCard
                key={action.id}
                action={action}
                onComplete={handleCompleteAction}
                onDismiss={handleDismissAction}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* South African Connections */}
      {activeConnections.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              SA Tech Professionals
            </h3>
            <Button variant="ghost" size="sm" as={Link} to="/talent">
              View All SA Talent
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeConnections.map((person, index) => (
              <PersonCard
                key={person.id}
                person={person}
                onConnect={handleConnect}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* South African Learning Resources */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            SA Learning Resources
          </h3>
          <Button variant="ghost" size="sm" as={Link} to="/blog">
            View All Resources
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.learningResources.map((resource, index) => (
            <LearningCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>
      </div>

      {/* Motivation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-xl border border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
          <Heart className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Growing Strong in SA Tech! 🇿🇦
        </h3>
        <p className="mt-2 text-gray-600">
          You&apos;ve completed {completedActions.size} recommendation
          {completedActions.size !== 1 ? 's' : ''} this month. Keep building
          your presence in the South African tech ecosystem!
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Button variant="secondary">Share on LinkedIn</Button>
          <Button onClick={onRefresh}>Get More SA Insights</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RecommendationsSection;
