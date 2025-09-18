import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { InterviewProvider } from "./contexts/InterviewContext";

// Components & Pages
import Layout from "./components/Common/Layout";
import Loading, { LoadingScreen } from "./components/Common/Loading";

// Auth Components
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Reports from "./pages/Reports";
import Home from "./pages/Home";

// Hooks
import { useAuth } from "./hooks/useAuth";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Loading application..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/interviews/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateInterview />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/interviews/:id"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interviews/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditInterview />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <Navigate to="/dashboard" replace />
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Lazy loaded components for better performance
const InterviewList = React.lazy(() =>
  import("./components/Dashboard/InterviewList")
);
const CreateInterview = React.lazy(() =>
  import("./components/Interview/CreateInterview")
);
const EditInterview = React.lazy(() =>
  import("./components/Interview/EditInterview")
);
const ReportDetail = React.lazy(() =>
  import("./components/Dashboard/ReportDetail")
);
const Settings = React.lazy(() => import("./components/Common/Settings"));

// Main App Component
function App() {
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Service Worker registration for PWA features (optional)
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return (
    <div className="App min-h-screen bg-gray-50">
      <Router>
        <AuthProvider>
          <InterviewProvider>
            <React.Suspense fallback={<LoadingScreen message="Loading..." />}>
              <AppRoutes />
            </React.Suspense>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: "#4aed88",
                  },
                },
                error: {
                  duration: 5000,
                  theme: {
                    primary: "#f56565",
                  },
                },
              }}
            />
          </InterviewProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
