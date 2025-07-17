import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Mail,
  Globe,
  Github,
  Linkedin,
  Edit3,
  MessageSquare,
  UserPlus,
  Check,
  Star,
  Award,
  Users,
  Briefcase,
  ExternalLink,
  Settings,
  DollarSign,
  Building,
  Clock,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import ProfileForm from '../../components/forms/ProfileForm';

// Hooks & Store
import useAuthStore from '../../store/authStore';

// API Services
import { usersAPI, connectionsAPI } from '../../services/api/users';

// SA Utils
import saUtils, { formatZAR } from '../../services/utils/southAfrica';
import {
  formatDate,
  formatRelativeTime,
} from '../../utils/formatters';

const ProfileHeader = ({
  user,
  isOwnProfile = false,
  onProfileUpdate,
  analytics,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'pending', 'connected'
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useAuthStore();

  // Enhanced profile data with SA defaults
  const profileData = {
    // Default values
    id: 1,
    fullName: 'SA Developer',
    name: 'SA Developer',
    title: 'Software Developer',
    bio: 'Passionate about building solutions in the South African tech ecosystem.',
    location: 'Johannesburg, Gauteng',
    joinDate: '2022-03-15',
    email: 'dev@example.co.za',
    profileImage: '/images/avatars/default.jpg',
    githubUsername: '',
    linkedinUrl: '',
    personalWebsite: '',
    isOnline: true,
    isProfilePublic: true,
    allowMessages: true,
    allowEndorsements: true,
    totalEndorsements: 0,
    totalConnections: 0,
    profileViews: 0,
    profileCompletionScore: 70,
    currentCompany: '',
    experienceLevel: 'mid',
    yearsOfExperience: 3,
    country: 'South Africa',
    currency: 'ZAR',
    salaryRange: saUtils.getSalaryRange('mid'),
    // Override with actual user data
    ...user,
  };

  const handleConnect = async () => {
    if (isOwnProfile) return;

    setIsLoading(true);
    try {
      const response = await connectionsAPI.sendRequest(profileData.id);

      if (response.success) {
        setConnectionStatus('pending');
        toast.success(
          `Connection request sent to ${profileData.fullName || profileData.name}!`
        );
      } else {
        throw new Error(
          response.message || 'Failed to send connection request'
        );
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(error.message || 'Failed to send connection request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    // Implement messaging functionality
    toast.info('Messaging feature coming soon!');
  };

  const handleProfileSave = async formData => {
    setIsLoading(true);
    try {
      // Call real backend API
      const response = await usersAPI.updateProfile(formData);

      if (response.success) {
        // Update local state
        updateUser(response.data);
        onProfileUpdate?.(response.data);
        setIsEditModalOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionButtonProps = () => {
    switch (connectionStatus) {
      case 'pending':
        return {
          variant: 'ghost',
          children: 'Request Sent',
          disabled: true,
        };
      case 'connected':
        return {
          variant: 'secondary',
          children: (
            <>
              <Check className="mr-2 h-4 w-4" />
              Connected
            </>
          ),
        };
      default:
        return {
          variant: 'primary',
          children: (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Connect
            </>
          ),
        };
    }
  };

  const formatJoinDate = dateString => {
    return formatDate(dateString, 'MMMM yyyy');
  };

  const getCompletionColor = score => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get tech hub info for location
  const techHub = profileData.location
    ? saUtils.getTechHub(profileData.location.split(',')[0])
    : null;

  // Calculate estimated market value
  const estimatedValue = profileData.experienceLevel
    ? saUtils.getSalaryRange(profileData.experienceLevel)
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        {/* Cover/Background */}
        <div className="relative h-32 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 md:h-40">
          <div className="absolute inset-0 bg-black/20" />

          {/* SA Flag Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
          </div>

          {isOwnProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-16 flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            <div className="relative">
              <Avatar
                src={profileData.profileImage}
                name={profileData.fullName || profileData.name}
                size="2xl"
                className="shadow-lg ring-4 ring-white"
                online={profileData.isOnline}
              />

              {/* Verification Badge */}
              <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 ring-4 ring-white">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:ml-auto sm:flex-row">
              {!isOwnProfile && (
                <>
                  <Button
                    onClick={handleConnect}
                    loading={isLoading}
                    size="lg"
                    {...getConnectionButtonProps()}
                  />

                  {profileData.allowMessages && (
                    <Button
                      onClick={handleMessage}
                      variant="secondary"
                      size="lg"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  )}
                </>
              )}

              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="mt-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  {profileData.fullName || profileData.name}
                </h1>
                <p className="mt-1 text-lg text-gray-600">
                  {profileData.title}
                  {profileData.currentCompany && (
                    <span className="text-indigo-600">
                      {' '}
                      @ {profileData.currentCompany}
                    </span>
                  )}
                </p>
                {techHub && (
                  <p className="mt-1 text-sm text-gray-500">
                    {techHub.description} • {profileData.location}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="mt-2 flex items-center space-x-1 sm:mt-0">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span className="text-lg font-semibold text-gray-900">
                  {(4.2 + Math.random() * 0.7).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({profileData.totalEndorsements} endorsements)
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="mb-6 leading-relaxed text-gray-700">
              {profileData.bio}
            </p>

            {/* SA-Specific Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  icon: Award,
                  label: 'Endorsements',
                  value: profileData.totalEndorsements,
                  color: 'text-yellow-600',
                },
                {
                  icon: Users,
                  label: 'SA Connections',
                  value: profileData.totalConnections,
                  color: 'text-blue-600',
                },
                {
                  icon: Briefcase,
                  label: 'Experience',
                  value: `${profileData.yearsOfExperience}+ years`,
                  color: 'text-green-600',
                },
                {
                  icon: DollarSign,
                  label: 'Market Value',
                  value: estimatedValue
                    ? estimatedValue.split(' - ')[0]
                    : 'R 500k+',
                  color: 'text-purple-600',
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="rounded-lg bg-gray-50 p-4 text-center"
                  >
                    <Icon className={`mx-auto mb-2 h-6 w-6 ${stat.color}`} />
                    <div className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact Info & SA Location */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{profileData.location} 🇿🇦</span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatJoinDate(profileData.joinDate)}</span>
              </div>

              {profileData.currentCompany && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{profileData.currentCompany}</span>
                </div>
              )}

              {profileData.email && (
                <a
                  href={`mailto:${profileData.email}`}
                  className="flex items-center space-x-2 transition-colors hover:text-indigo-600"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-4 flex items-center space-x-4">
              {profileData.githubUsername && (
                <a
                  href={`https://github.com/${profileData.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <Github className="h-5 w-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}

              {profileData.linkedinUrl && (
                <a
                  href={profileData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-blue-600"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              )}

              {profileData.personalWebsite && (
                <a
                  href={profileData.personalWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-indigo-600"
                >
                  <Globe className="h-5 w-5" />
                  <span className="hidden sm:inline">Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* SA Market Insights */}
            {techHub && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">
                      {techHub.city} Tech Hub
                    </h4>
                    <p className="mt-1 text-sm text-green-700">
                      {techHub.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {techHub.techFocus.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {estimatedValue && (
                      <p className="mt-2 text-xs text-green-600">
                        Local market range: <strong>{estimatedValue}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Completion (for own profile) */}
            {isOwnProfile && profileData.profileCompletionScore < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-blue-900">
                    Complete Your SA Profile
                  </h4>
                  <span className="text-sm text-blue-700">
                    {profileData.profileCompletionScore}% complete
                  </span>
                </div>

                <div className="mb-3 h-2 w-full rounded-full bg-blue-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${profileData.profileCompletionScore}%`,
                    }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-2 rounded-full bg-blue-600"
                  />
                </div>

                <p className="text-sm text-blue-700">
                  Complete your profile to stand out in the SA tech community
                  and increase your visibility to top companies like{' '}
                  {saUtils.SA_TECH_COMPANIES[0]}, {saUtils.SA_TECH_COMPANIES[1]}
                  , and {saUtils.SA_TECH_COMPANIES[2]}.
                </p>
              </motion.div>
            )}

            {/* Analytics Summary (for own profile) */}
            {isOwnProfile && analytics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Your SA Network Impact
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-indigo-600">
                      {analytics.profileViews?.thisMonth || 0}
                    </div>
                    <div className="text-xs text-gray-600">Monthly Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {analytics.networking?.newConnections || 0}
                    </div>
                    <div className="text-xs text-gray-600">New Connections</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {analytics.skillsGrowth?.endorsedSkills || 0}
                    </div>
                    <div className="text-xs text-gray-600">Skills Endorsed</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Your SA Developer Profile"
        size="3xl"
      >
        <ProfileForm
          initialData={profileData}
          onSubmit={handleProfileSave}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isLoading}
          showImageUpload={true}
          // SA-specific options
          locationOptions={saUtils.SA_MAJOR_CITIES.map(city => ({
            value: city.fullName,
            label: city.fullName,
          }))}
          companyOptions={saUtils.SA_TECH_COMPANIES.map(company => ({
            value: company,
            label: company,
          }))}
          placeholders={{
            bio: 'Tell the SA tech community about yourself, your passion for technology, and your career goals in South Africa...',
            currentRole: 'e.g., Senior React Developer',
            company: 'e.g., Takealot, Discovery, Standard Bank',
            personalWebsite: 'e.g., https://yourname.co.za',
          }}
        />
      </Modal>
    </>
  );
};

export default ProfileHeader;
