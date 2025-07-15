import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Award,
  Briefcase,
  Code,
  Share2,
  AlertCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { PageLoading } from '../../components/ui/Loading';
import { useAuthStore } from '../../store';
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Determine if this is the current user's profile
  const isOwnProfile =
    !userId || (currentUser && userId === currentUser.id.toString());

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

          // Use current user data
          setProfileData(currentUser);
        } else {
          // For other users' profiles, fetch their data
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Mock profile data for other users
          const mockProfileData = {
            id: parseInt(userId),
            name: 'Alex Thompson',
            title: 'Senior Full Stack Developer',
            bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies.',
            location: 'Seattle, WA',
            joinDate: '2021-08-20',
            email: 'alex.thompson@example.com',
            profileImage: '/images/avatars/alex.jpg',
            githubUsername: 'alexthompson',
            linkedinUrl: 'https://linkedin.com/in/alex-thompson',
            personalWebsite: 'https://alexthompson.dev',
            isOnline: true,
            isProfilePublic: true,
            allowMessages: true,
            allowEndorsements: true,
            totalEndorsements: 67,
            totalConnections: 234,
            profileViews: 1876,
            profileCompletionScore: 95,
            currentCompany: 'Microsoft',
            experienceLevel: 'senior',
            yearsOfExperience: 8,
          };

          setProfileData(mockProfileData);
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

  const handleProfileUpdate = updatedData => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleSkillsUpdate = skillsData => {
    // Handle skills update
    console.log('Skills updated:', skillsData);
  };

  const handleExperienceUpdate = experienceData => {
    // Handle experience update
    console.log('Experience updated:', experienceData);
  };

  const handleProjectsUpdate = projectsData => {
    // Handle projects update
    console.log('Projects updated:', projectsData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.name} - Developer Profile`,
          text: `Check out ${profileData.name}'s developer profile on UpSkill`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      description: 'Profile summary and highlights',
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: Award,
      description: 'Technical skills and endorsements',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase,
      description: 'Work history and achievements',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Code,
      description: 'Portfolio and side projects',
    },
  ];

  if (isLoading) {
    return <PageLoading message="Loading profile..." />;
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
            <Button onClick={() => navigate('/')} variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
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
            This profile is set to private and can only be viewed by the owner.
          </p>
          <Button onClick={() => navigate('/')} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isOwnProfile ? 'My Profile' : `${profileData.name}'s Profile`}
            </h1>
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
              Profile Details
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
                    Quick Overview
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: 'Experience',
                        value: `${profileData.yearsOfExperience}+ years`,
                      },
                      {
                        label: 'Endorsements',
                        value: profileData.totalEndorsements,
                      },
                      {
                        label: 'Connections',
                        value: profileData.totalConnections,
                      },
                      {
                        label: 'Profile Views',
                        value: profileData.profileViews,
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
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        action: 'Updated skills',
                        time: '2 days ago',
                        type: 'skills',
                      },
                      {
                        action: 'Added new project',
                        time: '1 week ago',
                        type: 'project',
                      },
                      {
                        action: 'Received endorsement',
                        time: '2 weeks ago',
                        type: 'endorsement',
                      },
                      {
                        action: 'Updated experience',
                        time: '1 month ago',
                        type: 'experience',
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
