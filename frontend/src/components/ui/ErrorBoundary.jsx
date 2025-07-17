import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              {/* Error Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Message */}
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </h1>
              <p className="mb-8 text-gray-600">
                We're sorry, but something unexpected happened. Please try
                refreshing the page or go back to the homepage.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-4 rounded-lg bg-gray-100 p-4">
                    <pre className="overflow-auto text-xs whitespace-pre-wrap text-red-600">
                      {this.state.error && this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            {/* Additional Help */}
            <p className="mt-6 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a
                href="/contact"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                contact our support team
              </a>
              .
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
