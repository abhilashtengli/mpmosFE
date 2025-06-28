// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, fetchUser, isLoading, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // If user is not authenticated and not already loading, fetch user info
      if (!isAuthenticated && !isLoading) {
        await fetchUser();
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [isAuthenticated, fetchUser, isLoading]);

  // Show loading spinner while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to signin with return URL
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/admin/signin"
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/admin/signin"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
