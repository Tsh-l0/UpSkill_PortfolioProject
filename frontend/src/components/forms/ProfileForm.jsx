import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  Camera,
  Upload,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import Loading from '../ui/Loading';

// Validation schema
const profileSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  location: yup.string().max(100, 'Location must be less than 100 characters'),
  currentRole: yup
    .string()
    .max(100, 'Current role must be less than 100 characters'),
  experienceLevel: yup
    .string()
    .oneOf(
      ['junior', 'mid', 'senior', 'lead'],
      'Please select a valid experience level'
    ),
  githubUsername: yup
    .string()
    .matches(/^[a-zA-Z0-9_-]*$/, 'Invalid GitHub username format'),
  linkedinUrl: yup
    .string()
    .url('Please enter a valid LinkedIn URL')
    .matches(/linkedin\.com/, 'Must be a LinkedIn URL'),
  personalWebsite: yup.string().url('Please enter a valid website URL'),
});

const ProfileForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  showImageUpload = true,
  className = '',
}) => {
  const [profileImage, setProfileImage] = useState(
    initialData.profileImage || null
  );
  const [imagePreview, setImagePreview] = useState(
    initialData.profileImage || null
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      email: initialData.email || '',
      bio: initialData.bio || '',
      location: initialData.location || '',
      currentRole: initialData.currentRole || '',
      experienceLevel: initialData.experienceLevel || '',
      githubUsername: initialData.githubUsername || '',
      linkedinUrl: initialData.linkedinUrl || '',
      personalWebsite: initialData.personalWebsite || '',
      isProfilePublic: initialData.isProfilePublic ?? true,
      allowMessages: initialData.allowMessages ?? true,
      allowEndorsements: initialData.allowEndorsements ?? true,
    },
    mode: 'onBlur',
  });

  const watchedBio = watch('bio');

  const experienceLevels = [
    { value: '', label: 'Select Experience Level' },
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid-level (2-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' },
  ];

  // Handle image upload
  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Simulate upload (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you'd upload to a service and get back a URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async data => {
    const formData = {
      ...data,
      profileImage: profileImage,
    };

    await onSubmit?.(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-8 ${className}`}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* Profile Image Section */}
      {showImageUpload && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar
              src={imagePreview || profileImage}
              name={watch('fullName')}
              size="2xl"
              className="shadow-lg ring-4 ring-white"
            />

            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loading type="spinner" size="md" className="text-white" />
              </div>
            )}

            {(imagePreview || profileImage) && !uploadingImage && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              <Camera className="mr-2 h-4 w-4" />
              {profileImage || imagePreview ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative">
            <User className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('fullName')}
              id="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('email')}
              id="email"
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              error={errors.email?.message}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('location')}
              id="location"
              label="Location"
              placeholder="City, Country"
              error={errors.location?.message}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('currentRole')}
              id="currentRole"
              label="Current Role"
              placeholder="e.g., Frontend Developer"
              error={errors.currentRole?.message}
              className="pl-10"
            />
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Experience Level
          </label>
          <select
            {...register('experienceLevel')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {experienceLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.experienceLevel && (
            <p className="mt-1 text-sm text-red-600">
              {errors.experienceLevel.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={4}
            placeholder="Tell us about yourself, your interests, and what you're passionate about..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="mt-1 flex justify-between text-sm">
            {errors.bio ? (
              <p className="text-red-600">{errors.bio.message}</p>
            ) : (
              <p className="text-gray-500">
                Share your background, interests, and what makes you unique
              </p>
            )}
            <span
              className={`${
                watchedBio?.length > 450 ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {watchedBio?.length || 0}/500
            </span>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Social Links
        </h3>

        <div className="space-y-4">
          <div className="relative">
            <Github className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('githubUsername')}
              id="githubUsername"
              label="GitHub Username"
              placeholder="yourusername"
              error={errors.githubUsername?.message}
              className="pl-10"
              helper="Enter just your username, not the full URL"
            />
          </div>

          <div className="relative">
            <Linkedin className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('linkedinUrl')}
              id="linkedinUrl"
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/yourprofile"
              error={errors.linkedinUrl?.message}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Globe className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
            <Input
              {...register('personalWebsite')}
              id="personalWebsite"
              label="Personal Website"
              placeholder="https://yourwebsite.com"
              error={errors.personalWebsite?.message}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-6">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Privacy & Settings
        </h3>

        <div className="space-y-4">
          {[
            {
              name: 'isProfilePublic',
              label: 'Make profile public',
              description: 'Allow other users to find and view your profile',
            },
            {
              name: 'allowMessages',
              label: 'Allow messages',
              description: 'Let other users send you direct messages',
            },
            {
              name: 'allowEndorsements',
              label: 'Allow endorsements',
              description: 'Let other users endorse your skills',
            },
          ].map(setting => (
            <div key={setting.name} className="flex items-start space-x-3">
              <input
                {...register(setting.name)}
                id={setting.name}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <label
                  htmlFor={setting.name}
                  className="text-sm font-medium text-gray-700"
                >
                  {setting.label}
                </label>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </Button>
      </div>
    </motion.form>
  );
};

export default ProfileForm;
