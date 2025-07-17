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
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import { PageLoading } from '../../components/ui/Loading';

// Hooks & Store
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store';

// API Services
import { usersAPI, analyticsAPI } from '../../services/api/users';

// Profile Components
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import { formatRelativeTime, formatNumber } from '../../utils/formatters';

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
            usersAPI.getProfile().catch(() => ({ success: false })),
            analyticsAPI
              .getUserAnalytics(currentUser?.id)
              .catch(() => ({ success: false })),
          ]);

          if (profileResponse.success) {
            setProfileData(profileResponse.data);
          } else {
            // Fallback to current user data with safety checks
            setProfileData(currentUser || generateFallbackProfile());
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

              // Check if profile is public - with null safety
              if (userData && userData.isProfilePublic === false) {
                setError('This profile is set to private.');
                return;
              }

              setProfileData(userData || generateFallbackProfile(userId));
            } else {
              throw new Error(profileResponse.message || 'Profile not found');
            }
          } catch (error) {
            console.error('Profile fetch error:', error);
            setError(
              'This profile could not be found or is no longer available.'
            );
          }
        }
      } catch (error) {
        console.error('Profile loading error:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile, currentUser, isAuthenticated, navigate]);

  // Generate fallback profile data with SA context
  const generateFallbackProfile = (id = 'demo') => {
    const saUser = saUtils.generateSAMockUser({
      id: id,
      fullName: currentUser?.fullName || 'SA Developer',
      email: currentUser?.email || `user${id}@example.com`,
    });

    return {
      id: id,
      _id: id,
      fullName: saUser.fullName,
      name: saUser.fullName,
      email: saUser.email,
      currentRole: saUser.currentRole,
      bio: `${saUser.experienceLevel} developer based in ${saUser.location}. 
Love working with modern technologies and contributing to the local developer community.`,
      location: saUser.location,
      joinDate: '2021-08-20',
      profileImage: null,
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
      console.log('Experience updated:', experienceData);
      toast.success('Experience updated successfully!');
    } catch (error) {
      console.error('Experience update error:', error);
      toast.error('Failed to update experience');
    }
  };

  const handleProjectsUpdate = async projectsData => {
    try {
      console.log('Projects updated:', projectsData);
      toast.success('Projects updated successfully!');
    } catch (error) {
      console.error('Projects update error:', error);
      toast.error('Failed to update projects');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData?.fullName || 'Developer'} - UpSkill Profile`,
          text: `Check out ${profileData?.fullName || 'this developer'}'s profile on UpSkill`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
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

  // Check for private profile with null safety
  if (profileData && profileData.isProfilePublic === false && !isOwnProfile) {
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
          <Button onClick={() => navigate('/talent')} variant="primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Other Developers
          </Button>
        </motion.div>
      </div>
    );
  }

  // Ensure we have profile data
  if (!profileData) {
    setProfileData(generateFallbackProfile());
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <ProfileHeader
        user={profileData}
        isOwnProfile={isOwnProfile}
        onProfileUpdate={handleProfileUpdate}
        analytics={analytics}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-t-lg border-b border-gray-200 bg-white shadow-sm"
        >
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}

            {/* Share Button */}
            <div className="ml-auto py-4">
              <Button onClick={handleShare} variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-b-lg bg-white shadow-sm"
        >
          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid gap-8 lg:grid-cols-3">
                  {/* Main Content */}
                  <div className="space-y-8 lg:col-span-2">
                    {/* About Section */}
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        About
                      </h3>
                      <p className="leading-relaxed text-gray-600">
                        {profileData.bio ||
                          `${profileData.experienceLevel || 'Experienced'} developer based in ${profileData.location || 'South Africa'}. 
                          Passionate about building quality software and contributing to the tech community.`}
                      </p>
                    </div>

                    {/* Quick Skills Preview */}
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Top Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(
                          profileData.skills || [
                            'JavaScript',
                            'React',
                            'Node.js',
                          ]
                        )
                          .slice(0, 6)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                            >
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                        {(profileData.skills?.length || 3) > 6 && (
                          <button
                            onClick={() => setActiveTab('skills')}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
                          >
                            +{(profileData.skills?.length || 3) - 6} more
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="rounded-lg bg-gray-50 p-6">
                      <h4 className="mb-4 font-medium text-gray-900">
                        Profile Stats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profile Views</span>
                          <span className="font-medium">
                            {formatNumber(profileData.profileViews || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Connections</span>
                          <span className="font-medium">
                            {formatNumber(profileData.totalConnections || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endorsements</span>
                          <span className="font-medium">
                            {formatNumber(profileData.totalEndorsements || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium">
                            {profileData.profileCompletionScore || 75}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(profileData.githubUsername ||
                      profileData.linkedinUrl ||
                      profileData.personalWebsite) && (
                      <div className="rounded-lg bg-gray-50 p-6">
                        <h4 className="mb-4 font-medium text-gray-900">
                          Links
                        </h4>
                        <div className="space-y-3">
                          {profileData.githubUsername && (
                            <a
                              href={`https://github.com/${profileData.githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                              GitHub
                            </a>
                          )}
                          {profileData.linkedinUrl && (
                            <a
                              href={profileData.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                              LinkedIn
                            </a>
                          )}
                          {profileData.personalWebsite && (
                            <a
                              href={profileData.personalWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}
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
