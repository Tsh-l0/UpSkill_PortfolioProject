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
//import { Loading } from './components/ui/Loading';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Pages
import Home from './pages/Home/Home';
import { Login, Signup, Onboarding, ForgotPassword } from './pages/Auth';
import { Blog } from './pages/Blog';
import MeetTalent from './pages/Talent';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Hooks
import useAuth from './hooks/useAuth';
import useAuthStore from './store/authStore';

// Auth initialization component
const AuthInitializer = ({ children }) => {
  const { initializeAuth } = useAuthStore();
  const { isLoading, isInitialized } = useAuth();

  useEffect(() => {
    // Initialize auth on app startup
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading while initializing auth
  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        {/* <Loading size="lg" text="Initializing UpSkill..." /> */}
      </div>
    );
  }

  return children;
};

// Protected route wrapper that checks profile completion
const ProfileProtectedRoute = ({ children, requireComplete = false }) => {
  const { user, isProfileComplete } = useAuth();

  if (requireComplete && user && !isProfileComplete()) {
    return <Navigate to="/onboarding" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

// Guest route component - redirects authenticated users
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
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

                  {/* Talent page - public but enhanced when authenticated */}
                  <Route path="/talent" element={<MeetTalent />} />
                </Route>

                {/* Protected routes with Layout */}
                <Route element={<Layout />}>
                  {/* Profile pages - require authentication */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard requires complete profile */}
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

                {/* Onboarding - requires auth but allows incomplete profile */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />

                {/* Forgot password - guest only */}
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPassword />
                    </GuestRoute>
                  }
                />

                {/* Additional useful routes */}
                <Route
                  path="/about"
                  element={
                    <Layout>
                      <div className="flex min-h-screen items-center justify-center">
                        <div className="text-center">
                          <h1 className="mb-4 text-4xl font-bold text-gray-900">
                            About UpSkill
                          </h1>
                          <p className="text-lg text-gray-600">
                            Coming soon...
                          </p>
                        </div>
                      </div>
                    </Layout>
                  }
                />

                <Route
                  path="/contact"
                  element={
                    <Layout>
                      <div className="flex min-h-screen items-center justify-center">
                        <div className="text-center">
                          <h1 className="mb-4 text-4xl font-bold text-gray-900">
                            Contact Us
                          </h1>
                          <p className="text-lg text-gray-600">
                            Get in touch through our contact form on the
                            homepage.
                          </p>
                        </div>
                      </div>
                    </Layout>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </AuthInitializer>
        </Router>

        {/* React Query Devtools (only in development) */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            buttonPosition="bottom-right"
          />
        )}

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          containerClassName="z-50"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              fontSize: '14px',
              maxWidth: '500px',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            },
            success: {
              style: {
                borderLeft: '4px solid #10b981',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                borderLeft: '4px solid #6366f1',
              },
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
