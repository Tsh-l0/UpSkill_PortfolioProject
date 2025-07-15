import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit3,
  Code,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  Star,
  Eye,
  Heart,
  Share2,
  Trash2,
  Image,
  Award,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { SectionLoading } from '../../components/ui/Loading';

// API Services
import { projectsAPI } from '../../services/api/users';

// SA Utils
import saUtils from '../../services/utils/southAfrica';
import {
  formatDate,
  formatRelativeTime,
} from '../../utils/formatters';

const ProjectsSection = ({
  userId,
  isOwnProfile = false,
  onProjectsUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedProjects, setLikedProjects] = useState(new Set());

  // Fetch projects data from backend
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await projectsAPI.getUserProjects(userId);

        if (response.success) {
          setProjectsData(response.data);
          onProjectsUpdate?.(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch projects');
        }
      } catch (error) {
        console.error('Projects fetch error:', error);

        // Use SA-localized mock data as fallback
        const mockData = generateSAProjectsData();
        setProjectsData(mockData);

        if (isOwnProfile) {
          toast.error('Using demo data - connection issue detected');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [userId, isOwnProfile, onProjectsUpdate]);

  // Generate SA-localized mock projects data
  const generateSAProjectsData = () => {
    const saCompanies = saUtils.SA_TECH_COMPANIES;
    const saTechStack = [
      'React',
      'Node.js',
      'Python',
      'Django',
      'Flask',
      'Vue.js',
      'Angular',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'AWS',
      'Azure',
      'Docker',
      'Kubernetes',
      'TypeScript',
      'GraphQL',
      'Express.js',
      'FastAPI',
    ];

    return [
      {
        id: 1,
        title: 'SA FinTech Dashboard',
        description:
          'Modern banking dashboard for South African financial institutions with real-time transaction monitoring.',
        longDescription:
          'A comprehensive financial dashboard built for SA banks and financial institutions. Features include real-time transaction monitoring, fraud detection, customer analytics, and compliance reporting. Integrated with South African banking APIs and follows POPIA regulations.',
        githubUrl: 'https://github.com/dev/sa-fintech-dashboard',
        liveUrl: 'https://sa-fintech-demo.co.za',
        images: ['/images/projects/fintech-dashboard.jpg'],
        technologies: [
          'React',
          'Node.js',
          'PostgreSQL',
          'Redis',
          'AWS',
          'TypeScript',
        ],
        category: 'web',
        isFeatured: true,
        isPublic: true,
        completionDate: '2024-01-15',
        metrics: {
          stars: 45,
          views: 1247,
          likes: 89,
          forks: 12,
        },
        highlights: [
          'Real-time transaction processing',
          'POPIA compliance implementation',
          'Multi-language support (English, Afrikaans, Zulu)',
          'Integration with major SA banks',
        ],
        createdAt: '2023-10-01',
        updatedAt: '2024-01-15',
      },
      {
        id: 2,
        title: 'Cape Town Tourism Mobile App',
        description:
          'React Native app showcasing Cape Town attractions with AR features and local business integration.',
        longDescription:
          'A tourism mobile application specifically designed for Cape Town visitors. Features include interactive maps, AR experiences at landmarks, local business directory, event calendar, and offline mode for tourists with limited data.',
        githubUrl: 'https://github.com/dev/cpt-tourism-app',
        liveUrl: 'https://play.google.com/store/apps/details?id=com.cpttourism',
        images: ['/images/projects/cpt-tourism.jpg'],
        technologies: [
          'React Native',
          'TypeScript',
          'Firebase',
          'Google Maps API',
          'AR Core',
        ],
        category: 'mobile',
        isFeatured: true,
        isPublic: true,
        completionDate: '2023-11-20',
        metrics: {
          stars: 32,
          views: 856,
          likes: 67,
          downloads: 5000,
        },
        highlights: [
          '5000+ downloads on Google Play',
          'AR experiences at Table Mountain',
          'Local business partnerships',
          'Offline map functionality',
        ],
        createdAt: '2023-08-15',
        updatedAt: '2023-11-20',
      },
      {
        id: 3,
        title: 'SA Jobs Portal API',
        description:
          'RESTful API for South African job portal with skills matching and salary insights.',
        longDescription:
          'A robust API powering a job portal specifically for the South African market. Includes advanced skills matching algorithms, salary benchmarking based on SA market data, company verification system, and integration with SARS for tax calculations.',
        githubUrl: 'https://github.com/dev/sa-jobs-api',
        liveUrl: 'https://api.sajobs.co.za',
        images: ['/images/projects/jobs-api.jpg'],
        technologies: [
          'Node.js',
          'Express.js',
          'MongoDB',
          'Redis',
          'Jest',
          'Docker',
        ],
        category: 'api',
        isFeatured: false,
        isPublic: true,
        completionDate: '2023-09-30',
        metrics: {
          stars: 28,
          views: 634,
          likes: 41,
          apiCalls: 50000,
        },
        highlights: [
          '50K+ monthly API calls',
          'Skills matching algorithm',
          'SA salary benchmarking',
          'SARS integration for tax calc',
        ],
        createdAt: '2023-06-01',
        updatedAt: '2023-09-30',
      },
      {
        id: 4,
        title: 'Joburg Traffic Monitor',
        description:
          'Real-time traffic monitoring system for Johannesburg using IoT sensors and machine learning.',
        longDescription:
          'An IoT-based traffic monitoring system for Johannesburg that uses sensor data and machine learning to predict traffic patterns, optimize traffic light timing, and provide real-time updates to commuters via mobile app and web dashboard.',
        githubUrl: 'https://github.com/dev/jhb-traffic-monitor',
        liveUrl: 'https://traffic.joburg.gov.za',
        images: ['/images/projects/traffic-monitor.jpg'],
        technologies: [
          'Python',
          'Django',
          'TensorFlow',
          'PostgreSQL',
          'IoT',
          'React',
        ],
        category: 'web',
        isFeatured: false,
        isPublic: true,
        completionDate: '2023-08-15',
        metrics: {
          stars: 19,
          views: 423,
          likes: 29,
          sensors: 150,
        },
        highlights: [
          '150+ IoT sensors deployed',
          'ML traffic prediction model',
          'City of Joburg partnership',
          '30% improvement in traffic flow',
        ],
        createdAt: '2023-04-01',
        updatedAt: '2023-08-15',
      },
    ];
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsEditModalOpen(true);
  };

  const handleEditProject = project => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = async projectId => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await projectsAPI.deleteProject(projectId);
      if (response.success) {
        setProjectsData(prev => prev.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleSubmitProject = async projectData => {
    setIsSubmitting(true);
    try {
      let response;

      if (selectedProject) {
        // Update existing project
        response = await projectsAPI.updateProject(
          selectedProject.id,
          projectData
        );
      } else {
        // Create new project
        response = await projectsAPI.createProject(projectData);
      }

      if (response.success) {
        if (selectedProject) {
          setProjectsData(prev =>
            prev.map(p => (p.id === selectedProject.id ? response.data : p))
          );
          toast.success('Project updated successfully');
        } else {
          setProjectsData(prev => [response.data, ...prev]);
          toast.success('Project created successfully');
        }
        setIsEditModalOpen(false);
        onProjectsUpdate?.(projectsData);
      }
    } catch (error) {
      console.error('Submit project error:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = projectId => {
    setLikedProjects(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(projectId)) {
        newLiked.delete(projectId);
      } else {
        newLiked.add(projectId);
      }
      return newLiked;
    });
  };

  const getCategoryIcon = category => {
    switch (category) {
      case 'web':
        return Globe;
      case 'mobile':
        return Users;
      case 'api':
        return Code;
      case 'desktop':
        return Award;
      default:
        return Code;
    }
  };

  const getCategoryColor = category => {
    switch (category) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'mobile':
        return 'bg-green-100 text-green-800';
      case 'api':
        return 'bg-purple-100 text-purple-800';
      case 'desktop':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <SectionLoading rows={6} />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Projects Portfolio
            </h2>
            <p className="text-gray-600">
              Showcasing {projectsData.length} innovative SA tech projects
            </p>
          </div>

          {isOwnProfile && (
            <div className="mt-4 flex space-x-3 sm:mt-0">
              <Button
                onClick={handleCreateProject}
                variant="secondary"
                size="sm"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Manage Projects
              </Button>
              <Button onClick={handleCreateProject} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {projectsData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projectsData.map((project, index) => {
              const CategoryIcon = getCategoryIcon(project.category);
              const isLiked = likedProjects.has(project.id);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                >
                  {/* Featured Badge */}
                  {project.isFeatured && (
                    <div className="absolute top-4 left-4 z-10 flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </div>
                  )}

                  {/* Project Image/Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(project.category)}`}
                      >
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {project.category}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {isOwnProfile && (
                      <div className="absolute right-4 bottom-4 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="rounded-full bg-white/90 p-2 text-gray-600 transition-colors hover:bg-white hover:text-indigo-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="rounded-full bg-white/90 p-2 text-gray-600 transition-colors hover:bg-white hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    {/* Title and Description */}
                    <div className="mb-4">
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                        {project.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies
                          .slice(0, 4)
                          .map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                            >
                              {tech}
                            </span>
                          ))}
                        {project.technologies.length > 4 && (
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                            +{project.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Highlights */}
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {project.highlights
                            .slice(0, 2)
                            .map((highlight, idx) => (
                              <li
                                key={idx}
                                className="flex items-start text-xs text-gray-600"
                              >
                                <Zap className="mt-0.5 mr-1 h-3 w-3 flex-shrink-0 text-yellow-500" />
                                {highlight}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center text-lg font-semibold text-indigo-600">
                          <Star className="mr-1 h-4 w-4" />
                          {project.metrics?.stars || 0}
                        </div>
                        <div className="text-xs text-gray-500">Stars</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-lg font-semibold text-green-600">
                          <Eye className="mr-1 h-4 w-4" />
                          {project.metrics?.views || 0}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-lg font-semibold text-red-600">
                          <Heart className="mr-1 h-4 w-4" />
                          {project.metrics?.likes || 0}
                        </div>
                        <div className="text-xs text-gray-500">Likes</div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      {/* Links */}
                      <div className="flex space-x-3">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 transition-colors hover:text-green-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {/* Completion Date */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(project.completionDate)}
                      </div>

                      {/* Like Button */}
                      <button
                        onClick={() => toggleLike(project.id)}
                        className={`transition-colors ${
                          isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Code className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No projects added yet
            </h3>
            <p className="mb-6 text-gray-600">
              {isOwnProfile
                ? 'Showcase your work by adding your projects and portfolio pieces.'
                : "This developer hasn't added their projects yet."}
            </p>
            {isOwnProfile && (
              <Button onClick={handleCreateProject}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Project
              </Button>
            )}
          </div>
        )}

        {/* Projects Summary */}
        {projectsData.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {projectsData.length}
                </div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {projectsData.filter(p => p.isFeatured).length}
                </div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(projectsData.flatMap(p => p.technologies)).size}
                </div>
                <div className="text-sm text-gray-600">Technologies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {projectsData.reduce(
                    (sum, p) => sum + (p.metrics?.stars || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Stars</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit/Create Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
        size="4xl"
      >
        <ProjectForm
          project={selectedProject}
          onSubmit={handleSubmitProject}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </>
  );
};

// Project Form Component
const ProjectForm = ({ project, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    longDescription: project?.longDescription || '',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    technologies: project?.technologies || [],
    category: project?.category || 'web',
    isFeatured: project?.isFeatured || false,
    isPublic: project?.isPublic || true,
    completionDate: project?.completionDate || '',
  });

  const [newTechnology, setNewTechnology] = useState('');

  const categories = [
    { value: 'web', label: 'Web Application' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'api', label: 'API/Backend' },
    { value: 'desktop', label: 'Desktop App' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTechnology = () => {
    if (
      newTechnology.trim() &&
      !formData.technologies.includes(newTechnology.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()],
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = tech => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={e =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="SA FinTech Dashboard"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Short Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={e =>
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Brief description of your project..."
        />
      </div>

      {/* Long Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Detailed Description
        </label>
        <textarea
          value={formData.longDescription}
          onChange={e =>
            setFormData(prev => ({ ...prev, longDescription: e.target.value }))
          }
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Detailed project description, features, challenges solved..."
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={e =>
              setFormData(prev => ({ ...prev, githubUrl: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="https://github.com/username/project"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Live Demo URL
          </label>
          <input
            type="url"
            value={formData.liveUrl}
            onChange={e =>
              setFormData(prev => ({ ...prev, liveUrl: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="https://yourproject.co.za"
          />
        </div>
      </div>

      {/* Category and Date */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={e =>
              setFormData(prev => ({ ...prev, category: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Completion Date
          </label>
          <input
            type="date"
            value={formData.completionDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, completionDate: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Technologies */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Technologies Used
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {formData.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            value={newTechnology}
            onChange={e => setNewTechnology(e.target.value)}
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), addTechnology())
            }
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Add technology (e.g., React, Node.js)"
          />
          <Button type="button" onClick={addTechnology} variant="secondary">
            Add
          </Button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={e =>
              setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700">Featured Project</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={e =>
              setFormData(prev => ({ ...prev, isPublic: e.target.checked }))
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700">Public Project</span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectsSection;
