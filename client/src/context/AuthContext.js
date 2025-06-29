import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService";
import toast from "react-hot-toast";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const token = authService.getToken();
      const user = authService.getCurrentUser();

      console.log("Auth initialization - Token exists:", !!token);
      console.log("Auth initialization - Token length:", token?.length);
      console.log("Auth initialization - User from localStorage:", user);
      console.log("Auth initialization - User role:", user?.role);
      console.log("Auth initialization - User name:", user?.name);

      if (token && user) {
        // Verify token with server, but don't show toast on failure during init
        try {
          const response = await authService.getProfile();
          console.log("Profile fetch successful:", response.data);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: response.data.user || user,
          });
        } catch (error) {
          console.warn(
            "Token verification failed during initialization:",
            error
          );
          console.log("Error details:", {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });

          // Instead of logging out immediately, try to use the stored user data
          // Only logout if the error is specifically about invalid token
          if (
            error.response?.status === 401 ||
            error.message?.includes("401") ||
            error.message?.includes("Unauthorized")
          ) {
            console.log("401 error detected, logging out user");
            await authService.logout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          } else {
            // Use stored user data if server is unreachable or other error
            console.log(
              "Using stored user data due to server error:",
              error.message
            );
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: user,
            });
          }
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(credentials);
      const user = response.data.user;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: user,
      });

      toast.success("Logged in successfully!");
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.success("Registration successful! Please log in.");
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.user;

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || "Profile update failed";
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const checkPermission = (requiredRole = "user") => {
    if (!state.isAuthenticated || !state.user) return false;

    const userRole = state.user.role;
    const roleHierarchy = { user: 1, editor: 2, admin: 3 };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 1;

    return userLevel >= requiredLevel;
  };

  const isAdmin = () => checkPermission("admin");
  const isEditor = () => checkPermission("editor");

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    register,
    updateProfile,
    clearError,

    // Utility functions
    checkPermission,
    isAdmin,
    isEditor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
