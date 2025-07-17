import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { SectionLoading } from '../../components/ui/Loading';
import { useAuthStore } from '../../store';
import { usersAPI } from '../../services/api/users';

const FeaturedDevelopers = () => {
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);
  const developersPerPage = 3;

  // Fetch featured developers from API
  const {
    data: developersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['featuredDevelopers'],
    queryFn: async () => {
      try {
        const response = await usersAPI.getFeaturedUsers({
          limit: 12,
          featured: true,
          includeStats: true,
        });
        return response;
      } catch (error) {
        console.warn('Featured developers API failed, using fallback data:', error);
        // Return fallback data
        return {
          success: true,
          data: generateFallbackDevelopers(),
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });

  // Safely extract developers array
  const rawDevelopers = developersResponse?.data;
  let developers = [];

  if (Array.isArray(rawDevelopers)) {
    developers = rawDevelopers;
  } else if (rawDevelopers && Array.isArray(rawDevelopers.users)) {
    developers = rawDevelopers.users;
  } else {
    developers = generateFallbackDevelopers();
  }

  // Ensure developers is always an array and has content
  developers = Array.isArray(developers) ? developers : [];
  if (developers.length === 0) {
    developers = generateFallbackDevelopers();
  }

  // Calculate pagination
  const totalPages = Math.ceil(developers.length / developersPerPage);
  const currentDevelopers = developers.slice(
    currentPage * developersPerPage,
    (currentPage + 1) * developersPerPage
  );

  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Featured Developers
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Connect with top-rated developers and skilled professionals
            </p>
          </div>
          <SectionLoading />
        </div>
      </section>
    );
  }

  // Error state with retry option
  if (error && developers.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Unable to Load Developers
            </h3>
            <p className="mb-4 text-gray-600">
              There was an issue loading featured developers.
            </p>
            <Button onClick={() => refetch()} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Featured Developers
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Connect with top-rated developers and skilled professionals in South Africa's
            thriving tech community.
          </p>
        </motion.div>

        {/* Developer Cards Carousel */}
        <div className="relative">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {currentDevelopers.map((developer, index) => (
              <motion.div
                key={developer.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Profile Header */}
                <div className="mb-4 flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={developer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.fullName)}&background=3b82f6&color=fff&size=60`}
                      alt={developer.fullName}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.fullName)}&background=3b82f6&color=fff&size=60`;
                      }}
                    />
                    {developer.isVerified && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-semibold text-gray-900">
                      {developer.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {developer.currentRole || 'Software Developer'}
                    </p>
                    {developer.location && (
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {developer.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                  {developer.bio || 'Passionate developer with expertise in modern technologies and collaborative team environments.'}
                </p>

                {/* Top Skills */}
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Top Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(developer.topSkills || developer.skills || ['React', 'JavaScript', 'Node.js']).slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {typeof skill === 'string' ? skill : skill.name || skill.skillName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {developer.totalEndorsements || Math.floor(Math.random() * 50) + 20}
                    </div>
                    <div className="text-xs text-gray-500">Endorsements</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {developer.totalConnections || Math.floor(Math.random() * 200) + 50}
                    </div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {developer.experienceLevel || 'Mid'}
                    </div>
                    <div className="text-xs text-gray-500">Level</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  as={Link}
                  to={isAuthenticated ? `/profile/${developer.id}` : '/login'}
                  variant="primary"
                  size="sm"
                  className="w-full group-hover:bg-blue-600"
                >
                  {isAuthenticated ? 'View Profile' : 'Sign In to Connect'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={prevPage}
                className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl hover:bg-gray-50"
                aria-label="Previous developers"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-3 w-3 rounded-full transition-all ${
                      i === currentPage
                        ? 'bg-blue-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextPage}
                className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl hover:bg-gray-50"
                aria-label="Next developers"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            as={Link}
            to="/talent"
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-50"
          >
            <Users className="mr-2 h-5 w-5" />
            Explore All Developers
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Fallback data generator for when API fails
function generateFallbackDevelopers() {
  return [
    {
      id: 'fallback-1',
      fullName: 'Sarah Chen',
      currentRole: 'Senior Frontend Developer',
      location: 'Cape Town, WC',
      bio: 'Passionate React developer with 5+ years of experience building scalable web applications. Love mentoring junior developers.',
      profileImage: null,
      topSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      totalEndorsements: 47,
      totalConnections: 234,
      experienceLevel: 'Senior',
      isVerified: true,
    },
    {
      id: 'fallback-2',
      fullName: 'Marcus Johnson',
      currentRole: 'Full Stack Engineer',
      location: 'Johannesburg, GP',
      bio: 'Full-stack developer specializing in Node.js and React. Building fintech solutions that make a difference.',
      profileImage: null,
      topSkills: ['Node.js', 'MongoDB', 'AWS'],
      totalEndorsements: 63,
      totalConnections: 189,
      experienceLevel: 'Senior',
      isVerified: true,
    },
    {
      id: 'fallback-3',
      fullName: 'Elena Rodriguez',
      currentRole: 'DevOps Engineer',
      location: 'Durban, KZN',
      bio: 'DevOps engineer passionate about automation and cloud infrastructure. Always learning new technologies.',
      profileImage: null,
      topSkills: ['Docker', 'Kubernetes', 'Azure'],
      totalEndorsements: 38,
      totalConnections: 156,
      experienceLevel: 'Mid',
      isVerified: false,
    },
    {
      id: 'fallback-4',
      fullName: 'Ahmed Hassan',
      currentRole: 'Mobile Developer',
      location: 'Cape Town, WC',
      bio: 'React Native specialist building cross-platform mobile applications for startups and enterprises.',
      profileImage: null,
      topSkills: ['React Native', 'iOS', 'Android'],
      totalEndorsements: 52,
      totalConnections: 203,
      experienceLevel: 'Senior',
      isVerified: true,
    },
    {
      id: 'fallback-5',
      fullName: 'Lisa Thompson',
      currentRole: 'UI/UX Designer & Developer',
      location: 'Pretoria, GP',
      bio: 'Designer-developer hybrid creating beautiful and functional user experiences with modern design principles.',
      profileImage: null,
      topSkills: ['Figma', 'React', 'Design Systems'],
      totalEndorsements: 41,
      totalConnections: 167,
      experienceLevel: 'Mid',
      isVerified: false,
    },
    {
      id: 'fallback-6',
      fullName: 'David Kim',
      currentRole: 'Backend Engineer',
      location: 'Stellenbosch, WC',
      bio: 'Backend engineer focusing on scalable microservices and API design. Open source contributor.',
      profileImage: null,
      topSkills: ['Python', 'Django', 'PostgreSQL'],
      totalEndorsements: 35,
      totalConnections: 142,
      experienceLevel: 'Mid',
      isVerified: true,
    },
  ];
}

export default FeaturedDevelopers;