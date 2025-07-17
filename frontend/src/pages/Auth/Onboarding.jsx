import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Briefcase,
  Code,
  User,
  Camera,
  Star,
  Award,
  ArrowRight,
  Loader2,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

// Hooks & Store
import { useAuthStore } from '../../store';
import { usersAPI, skillsAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to UpSkill!',
    description:
      "Let's set up your developer profile to connect you with South Africa's tech community.",
    icon: Star,
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about yourself and your location in South Africa.',
    icon: User,
  },
  {
    id: 'experience',
    title: 'Experience Level',
    description: 'Help us understand your professional background.',
    icon: Briefcase,
  },
  {
    id: 'skills',
    title: 'Your Skills',
    description: 'Select the technologies and skills you work with.',
    icon: Code,
  },
  {
    id: 'profile-photo',
    title: 'Profile Photo',
    description: 'Add a photo to personalize your profile.',
    icon: Camera,
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description:
      "Welcome to South Africa's premier developer networking platform.",
    icon: Award,
  },
];

const EXPERIENCE_LEVELS = [
  {
    value: 'entry',
    label: 'Entry Level',
    description: '0-2 years of experience',
  },
  {
    value: 'junior',
    label: 'Junior Developer',
    description: '2-4 years of experience',
  },
  {
    value: 'mid',
    label: 'Mid-Level Developer',
    description: '4-7 years of experience',
  },
  {
    value: 'senior',
    label: 'Senior Developer',
    description: '7+ years of experience',
  },
  {
    value: 'lead',
    label: 'Tech Lead',
    description: '10+ years with leadership experience',
  },
  {
    value: 'principal',
    label: 'Principal/Architect',
    description: '12+ years with strategic experience',
  },
];

const POPULAR_SA_SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  '.NET',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'Git',
  'TypeScript',
  'PHP',
  'Laravel',
  'React Native',
  'Flutter',
  'HTML/CSS',
  'Tailwind CSS',
  'Bootstrap',
  'SCSS',
  'GraphQL',
  'REST APIs',
  'Microservices',
  'DevOps',
  'CI/CD',
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    currentRole: '',
    bio: '',
    experienceLevel: '',
    skills: [],
    profileImage: null,
  });

  const currentStepData = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;
  const isCompleteStep = currentStepData.id === 'complete';

  // Initialize form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        location: user.location || '',
        currentRole: user.currentRole || '',
        bio: user.bio || '',
        experienceLevel: user.experienceLevel || '',
        skills: user.skills || [],
        profileImage: user.profileImage || null,
      }));
    }
  }, [user]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSkill = skill => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = currentStepData.id;

    switch (step) {
      case 'welcome':
        return true;
      case 'basic-info':
        return formData.location && formData.currentRole;
      case 'experience':
        return formData.experienceLevel;
      case 'skills':
        return formData.skills.length > 0;
      case 'profile-photo':
        return true; // Optional step
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);

    try {
      // Update user profile with onboarding data
      const updateData = {
        ...formData,
        onboardingCompleted: true,
        profileCompletionScore: calculateCompletionScore(),
      };

      const response = await usersAPI.updateProfile(updateData);

      if (response.success) {
        // Update user in store
        updateUser(response.user || response.data);

        toast.success('Profile setup completed! Welcome to UpSkill.');

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionScore = () => {
    let score = 0;
    const weights = {
      location: 15,
      currentRole: 15,
      bio: 20,
      experienceLevel: 15,
      skills: 25,
      profileImage: 10,
    };

    Object.keys(weights).forEach(field => {
      if (field === 'skills') {
        if (formData[field].length > 0) score += weights[field];
      } else if (formData[field]) {
        score += weights[field];
      }
    });

    return score;
  };

  const skipToEnd = () => {
    setCurrentStep(STEPS.length - 1);
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Star className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Welcome to UpSkill, {user?.fullName?.split(' ')[0] || 'Developer'}
              !
            </h2>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              You're about to join South Africa's leading platform for developer
              networking, skill endorsements, and career growth. Let's get your
              profile set up!
            </p>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                ✨ This will only take 2-3 minutes and you can always update
                your profile later.
              </p>
            </div>
          </div>
        );

      case 'basic-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Location in South Africa
              </label>
              <select
                value={formData.location}
                onChange={e => updateFormData('location', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select your city...</option>
                {saUtils.SA_MAJOR_CITIES.map(city => (
                  <option key={city.name} value={city.fullName}>
                    {city.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Role
              </label>
              <Input
                type="text"
                placeholder="e.g. Frontend Developer, Full Stack Engineer"
                value={formData.currentRole}
                onChange={e => updateFormData('currentRole', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bio (Optional)
              </label>
              <textarea
                placeholder="Tell the SA tech community about yourself..."
                value={formData.bio}
                onChange={e => updateFormData('bio', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <p className="mb-6 text-gray-600">
              Select the option that best describes your current experience
              level:
            </p>
            {EXPERIENCE_LEVELS.map(level => (
              <label
                key={level.value}
                className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.experienceLevel === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={formData.experienceLevel === level.value}
                  onChange={e =>
                    updateFormData('experienceLevel', e.target.value)
                  }
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div
                    className={`mr-3 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      formData.experienceLevel === level.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.experienceLevel === level.value && (
                      <Check className="h-2 w-2 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {level.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Select the technologies and skills you work with. This helps other
              developers find and endorse you for relevant skills.
            </p>

            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                💡 Choose at least 3-5 skills that represent your main expertise
                areas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {POPULAR_SA_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    formData.skills.includes(skill)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {formData.skills.length > 0 && (
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-2 text-sm font-medium text-green-800">
                  Selected Skills ({formData.skills.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'profile-photo':
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-32 w-32">
              <Avatar
                src={formData.profileImage || user?.profileImage}
                alt={user?.fullName || 'Profile'}
                size="xl"
                fallbackText={user?.fullName}
              />
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Add a Profile Photo
              </h3>
              <p className="mb-4 text-gray-600">
                Profiles with photos get 5x more views and connection requests!
              </p>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <p className="text-xs text-gray-500">
                  You can upload a photo later from your profile settings
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Award className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              🎉 You're All Set!
            </h2>

            <p className="mx-auto max-w-md text-gray-600">
              Welcome to South Africa's premier developer networking platform!
              Your profile is {calculateCompletionScore()}% complete.
            </p>

            <div className="space-y-4 rounded-lg bg-blue-50 p-6">
              <h3 className="font-medium text-blue-900">What's Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Explore top developers in your area</li>
                <li>• Get endorsed for your skills</li>
                <li>• Connect with other SA developers</li>
                <li>• Check out the latest tech blog posts</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {currentStepData.title}
                </h1>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>

              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {!isFirstStep && !isCompleteStep && (
              <Button
                variant="ghost"
                onClick={prevStep}
                className="text-gray-600"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {!isCompleteStep && (
              <Button
                variant="ghost"
                onClick={skipToEnd}
                className="text-gray-600"
              >
                Skip Setup
              </Button>
            )}

            {isCompleteStep ? (
              <Button
                onClick={completeOnboarding}
                loading={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                size="lg"
                className="px-8"
              >
                {isLastStep ? 'Complete Setup' : 'Continue'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
