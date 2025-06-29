import api from "./api";

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      const { accessToken, user } = response.data.data;

      // Store auth data
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put("/auth/profile", userData);

      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...response.data.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  }

  async refreshToken() {
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken } = response.data.data;

      localStorage.setItem("authToken", accessToken);
      return accessToken;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put("/auth/password", passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }

  isEditor() {
    const user = this.getCurrentUser();
    return user?.role === "editor" || user?.role === "admin";
  }

  handleError(error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred";

    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.error?.code;

    return {
      message,
      statusCode,
      errorCode,
      details: error.response?.data?.error?.details,
    };
  }
}

export default new AuthService();
