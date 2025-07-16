import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Configuration
import { queryClient } from './services/config/queryClient';

// Layout & Components
import Layout from './components/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoading } from './components/ui/Loading';

// Pages
import Home from './pages/Home/Home';
import { Login, Signup, Onboarding, ForgotPassword } from './pages/Auth';
import { Blog } from './pages/Blog';
import MeetTalent from './pages/Talent';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Contact Page Component
import ContactSection from './pages/Home/ContactSection';

// Hooks
import useAuth from './hooks/useAuth';
import { useAuthStore } from './store';

// Auth initialization component
const AuthInitializer = ({ children }) => {
  const { initializeAuth } = useAuthStore();
  const { isLoading, isInitialized } = useAuth();

  useEffect(() => {
    // Initialize auth on app startup
    if (!isInitialized) {
      console.log('🔄 Initializing authentication...');
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading while initializing auth
  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <PageLoading text="Initializing UpSkill..." />
      </div>
    );
  }

  return children;
};

// Protected route wrapper that checks authentication
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <PageLoading text="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected route wrapper that checks profile completion
const ProfileProtectedRoute = ({ children, requireComplete = false }) => {
  const { user, isProfileComplete } = useAuth();

  if (requireComplete && user && !isProfileComplete()) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AuthenticatedRoute>{children}</AuthenticatedRoute>;
};

// Guest route component - redirects authenticated users
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <PageLoading text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Contact Page component
const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Contact Support</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Get in touch with our team for any questions, feedback, or technical support.
          </p>
        </div>
        <ContactSection />
      </div>
    </div>
  );
};

function App() {
  // Set up global error handling
  useEffect(() => {
    const handleError = (event) => {
      console.error('🚨 Global error caught:', event.error);
    };

    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthInitializer>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes with Layout (navbar + footer) */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:postId" element={<Blog />} />
                  
                  {/* Contact page - public access */}
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Talent page - public but enhanced when authenticated */}
                  <Route path="/talent" element={<MeetTalent />} />
                </Route>

                {/* Protected routes with Layout */}
                <Route element={<Layout />}>
                  {/* Profile pages - require authentication */}
                  <Route
                    path="/profile"
                    element={
                      <AuthenticatedRoute>
                        <Profile />
                      </AuthenticatedRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <AuthenticatedRoute>
                        <Profile />
                      </AuthenticatedRoute>
                    }
                  />

                  {/* Dashboard requires authentication */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProfileProtectedRoute requireComplete={false}>
                        <Dashboard />
                      </ProfileProtectedRoute>
                    }
                  />
                </Route>

                {/* Auth routes (no layout - full screen) */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <GuestRoute>
                      <Signup />
                    </GuestRoute>
                  }
                />

                {/* Password reset - guest only */}
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPassword />
                    </GuestRoute>
                  }
                />

                {/* Onboarding - requires auth but allows incomplete profile */}
                <Route
                  path="/onboarding"
                  element={
                    <AuthenticatedRoute>
                      <Onboarding />
                    </AuthenticatedRoute>
                  }
                />

                {/* Support & Help routes */}
                <Route path="/support" element={<Navigate to="/contact" replace />} />
                <Route path="/help" element={<Navigate to="/contact" replace />} />

                {/* Catch-all 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />

            {/* React Query DevTools (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthInitializer>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;