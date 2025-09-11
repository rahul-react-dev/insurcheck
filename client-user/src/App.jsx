import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState, useEffect } from 'react';
import { store } from './store';
import { queryClient } from './utils/query-client';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/Toast';
import PageLoader from './components/ui/PageLoader';
import './index.css';

// Lazy load all pages for automatic code splitting and loading states
const Homepage = lazy(() => import('./pages/Homepage'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

// Navigation loader component that ensures visibility
function NavigationLoader() {
  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    // Force loader to show for at least 300ms to ensure visibility
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!showLoader) return null;
  return <PageLoader message="Loading page..." />;
}

// Navigation wrapper to detect route changes
function NavigationWrapper({ children }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    // Show loader on route change
    setIsNavigating(true);
    
    // Hide loader after route has loaded and minimum display time
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 200); // Minimum loader display time
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  if (isNavigating) {
    return <NavigationLoader />;
  }
  
  return children;
}

function AppContent() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="App">
      <NavigationWrapper>
        <Suspense fallback={<NavigationLoader />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </Suspense>
      </NavigationWrapper>
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
