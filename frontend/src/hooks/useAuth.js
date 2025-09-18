import { useState, useEffect, useContext } from "react";
import { authAPI, handleAPIError } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Auth Hook with full implementation
export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        // Verify token is still valid
        const response = await authAPI.getMe();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      logout(); // Clear invalid auth
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      // Store auth data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      // Store auth data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(newUser));

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const clearError = () => {
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Check if user is authenticated
  const isAuthenticated = Boolean(user);

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
  };
};

export { useAuth };
export default useAuth;
