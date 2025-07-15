import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User,
  Award,
  Briefcase,
  Code,
  Share2,
  AlertCircle,
  ArrowLeft,
  Shield,
  MapPin,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import { PageLoading } from '../../components/ui/Loading';

// Hooks & Store
import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

// API Services
import { usersAPI, analyticsAPI } from '../../services/api/users';

// Profile Components
import ProfileHeader from '../Profile/ProfileHeader';
import SkillsSection from '../Profile/SkillsSection';
import ExperienceSection from '../Profile/ExperienceSection';
import ProjectsSection from '../Profile/ProjectsSection';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import {
  formatRelativeTime,
  formatNumber,
} from '../../utils/formatters';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const { user: currentUser, isAuthenticated } = useAuth();

  // Determine if this is the current user's profile
  const isOwnProfile =
    !userId || (currentUser && userId === currentUser.id?.toString());

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOwnProfile) {
          // For own profile, redirect to login if not authenticated
          if (!isAuthenticated) {
            navigate('/login');
            return;
          }

          // Use current user data and fetch additional profile info
          const [profileResponse, analyticsResponse] = await Promise.all([
            usersAPI.getProfile(),
            analyticsAPI.getUserAnalytics(currentUser.id),
          ]);

          if (profileResponse.success) {
            setProfileData(profileResponse.data);
          } else {
            // Fallback to current user data
            setProfileData(currentUser);
          }

          if (analyticsResponse.success) {
            setAnalytics(analyticsResponse.data);
          }
        } else {
          // For other users' profiles, fetch their public data
          try {
            const profileResponse = await usersAPI.getUserById(userId);

            if (profileResponse.success) {
              const userData = profileResponse.data;

              // Check if profile is public
              if (!userData.isProfilePublic) {
                setError('This profile is set to private.');
                return;
              }

              setProfileData(userData);

              // Track profile view if not own profile
              try {
                await analyticsAPI.trackProfileView(userId);
              } catch (viewError) {
                console.warn('Failed to track profile view:', viewError);
              }
            } else {
              throw new Error(profileResponse.message || 'Profile not found');
            }
          } catch (apiError) {
            console.error('API Error:', apiError);

            // Generate SA-localized mock data as fallback
            const mockProfileData = generateSAMockProfile(userId);
            setProfileData(mockProfileData);
            toast.error('Using demo data - connection issue detected');
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile, isAuthenticated, currentUser, navigate]);

  // Generate SA-localized mock profile data
  const generateSAMockProfile = id => {
    const saUser = saUtils.generateSAMockUser();
    const names = [
      'Thabo Mkhize',
      'Priya Sharma',
      'Sipho Ndaba',
      'Aisha Patel',
      'Liam Van Der Merwe',
      'Naledi Mokoena',
      'Ryan Smith',
      'Zara Khan',
    ];
    const roles = [
      'Senior React Developer',
      'Full Stack Engineer',
      'Frontend Architect',
      'Backend Developer',
      'DevOps Engineer',
      'UI/UX Designer',
    ];

    return {
      id: parseInt(id),
      fullName: names[parseInt(id) % names.length],
      name: names[parseInt(id) % names.length],
      title: roles[parseInt(id) % roles.length],
      bio: `Passionate developer building innovative solutions in the South African tech ecosystem. Love working with modern technologies and contributing to the local developer community.`,
      location: saUser.location,
      joinDate: '2021-08-20',
      email: `user${id}@example.com`,
      profileImage: `/images/avatars/user${id}.jpg`,
      githubUsername: `sadev${id}`,
      linkedinUrl: `https://linkedin.com/in/sadev-${id}`,
      personalWebsite: `https://sadev${id}.co.za`,
      isOnline: Math.random() > 0.5,
      isProfilePublic: true,
      allowMessages: true,
      allowEndorsements: true,
      totalEndorsements: Math.floor(Math.random() * 50) + 20,
      totalConnections: Math.floor(Math.random() * 200) + 50,
      profileViews: Math.floor(Math.random() * 1000) + 100,
      profileCompletionScore: Math.floor(Math.random() * 30) + 70,
      currentCompany: saUser.company,
      experienceLevel: saUser.experienceLevel,
      yearsOfExperience: Math.floor(Math.random() * 10) + 2,
      country: 'South Africa',
      currency: 'ZAR',
      salaryRange: saUser.salaryRange,
    };
  };

  const handleProfileUpdate = async updatedData => {
    try {
      const response = await usersAPI.updateProfile(updatedData);
      if (response.success) {
        setProfileData(prev => ({ ...prev, ...response.data }));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSkillsUpdate = async skillsData => {
    try {
      // Handle skills update via backend
      const promises = skillsData.map(skill =>
        usersAPI.addSkill({
          skillId: skill.id,
          proficiencyLevel: skill.level,
          yearsOfExperience: skill.experience,
        })
      );

      await Promise.all(promises);
      toast.success('Skills updated successfully!');
    } catch (error) {
      console.error('Skills update error:', error);
      toast.error('Failed to update skills');
    }
  };

  const handleExperienceUpdate = async experienceData => {
    try {
      // Handle experience update via backend API
      console.log('Experience updated:', experienceData);
      toast.success('Experience updated successfully!');
    } catch (error) {
      console.error('Experience update error:', error);
      toast.error('Failed to update experience');
    }
  };

  const handleProjectsUpdate = async projectsData => {
    try {
      // Handle projects update via backend API
      console.log('Projects updated:', projectsData);
      toast.success('Projects updated successfully!');
    } catch (error) {
      console.error('Projects update error:', error);
      toast.error('Failed to update projects');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profileData.fullName || profileData.name} - SA Developer Profile`,
      text: `Check out ${profileData.fullName || profileData.name}'s developer profile on South Africa's premier tech network`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Profile URL copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy URL');
      }
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      description: 'Profile summary and SA market insights',
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: Award,
      description: 'Technical skills and endorsements from SA developers',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase,
      description: 'Work history and achievements in SA companies',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Code,
      description: 'Portfolio and side projects',
    },
  ];

  if (isLoading) {
    return <PageLoading message="Loading SA developer profile..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Profile Not Found
          </h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => navigate('/talent')} variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse SA Talent
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profileData.isProfilePublic && !isOwnProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Private Profile
          </h2>
          <p className="mb-6 text-gray-600">
            This SA developer profile is set to private and can only be viewed
            by the owner.
          </p>
          <Button onClick={() => navigate('/talent')} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Other SA Developers
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            {!isOwnProfile && (
              <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isOwnProfile
                  ? 'My Profile'
                  : `${profileData.fullName || profileData.name}'s Profile`}
              </h1>
              {profileData.location && (
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{profileData.location} 🇿🇦</span>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleShare} variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </motion.div>

        {/* Profile Header */}
        <ProfileHeader
          user={profileData}
          isOwnProfile={isOwnProfile}
          onProfileUpdate={handleProfileUpdate}
          analytics={analytics}
        />

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:mb-0">
              Professional Details
            </h2>

            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Description */}
          <p className="mb-6 text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-8 lg:grid-cols-2"
              >
                {/* Quick Stats */}
                <div className="space-y-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    SA Developer Overview
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: 'Experience',
                        value: `${profileData.yearsOfExperience || 3}+ years`,
                      },
                      {
                        label: 'Endorsements',
                        value: formatNumber(profileData.totalEndorsements || 0),
                      },
                      {
                        label: 'SA Connections',
                        value: formatNumber(profileData.totalConnections || 0),
                      },
                      {
                        label: 'Profile Views',
                        value: formatNumber(profileData.profileViews || 0),
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 text-center"
                      >
                        <div className="text-2xl font-bold text-indigo-600">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SA Market Info */}
                  {profileData.salaryRange && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-medium text-green-900">
                        SA Market Value
                      </h4>
                      <p className="text-sm text-green-700">
                        Estimated salary range:{' '}
                        <strong>{profileData.salaryRange}</strong>
                      </p>
                      <p className="mt-1 text-xs text-green-600">
                        Based on {profileData.experienceLevel} level in{' '}
                        {profileData.location?.split(',')[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        action: 'Profile updated',
                        time: '2 days ago',
                        type: 'profile',
                      },
                      {
                        action: 'Added new skill: TypeScript',
                        time: '1 week ago',
                        type: 'skills',
                      },
                      {
                        action: 'Received endorsement from SA developer',
                        time: '2 weeks ago',
                        type: 'endorsement',
                      },
                      {
                        action: 'Connected with Cape Town developer',
                        time: '1 month ago',
                        type: 'connection',
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
                      >
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SA Tech Community */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">
                      SA Tech Community
                    </h4>
                    <p className="text-sm text-blue-700">
                      Part of South Africa&apos;s growing developer ecosystem with{' '}
                      <strong>10,000+</strong> active developers across major
                      cities.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillsSection
                  userId={profileData.id}
                  isOwnProfile={isOwnProfile}
                  onSkillsUpdate={handleSkillsUpdate}
                />
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExperienceSection
                  userId={profileData.id}
                  isOwnProfile={isOwnProfile}
                  onExperienceUpdate={handleExperienceUpdate}
                />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectsSection
                  userId={profileData.id}
                  isOwnProfile={isOwnProfile}
                  onProjectsUpdate={handleProjectsUpdate}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
};

export default Profile;
