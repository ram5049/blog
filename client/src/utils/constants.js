// Application Constants
export const APP_CONFIG = {
  APP_NAME: "Blog Hub",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION:
    "A modern blog platform with rich content and seamless reading experience",
  CONTACT_EMAIL: "contact@modernblog.com",
  SOCIAL_LINKS: {
    twitter: "https://twitter.com/modernblog",
    github: "https://github.com/modernblog",
    linkedin: "https://linkedin.com/company/modernblog",
  },
};

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL || "https://your-backend-url.com/api"
      : "http://localhost:5000/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  ADMIN_PAGE_SIZE: 20,
};

// Post Status
export const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  USER: "user",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "user",
  THEME: "theme",
  PREFERENCES: "userPreferences",
};

// Routes
export const ROUTES = {
  // Public Routes
  HOME: "/",
  POST: "/post/:slug",
  NOT_FOUND: "/404",

  // Admin Routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_POSTS: "/admin/posts",
  ADMIN_CREATE_POST: "/admin/posts/create",
  ADMIN_EDIT_POST: "/admin/posts/edit/:slug",
  ADMIN_PROFILE: "/admin/profile",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You don't have permission.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully!",
  LOGOUT_SUCCESS: "Logged out successfully!",
  POST_CREATED: "Post created successfully!",
  POST_UPDATED: "Post updated successfully!",
  POST_DELETED: "Post deleted successfully!",
  POST_PUBLISHED: "Post published successfully!",
  POST_UNPUBLISHED: "Post unpublished successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
};

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: "light",
  THEMES: {
    LIGHT: "light",
    DARK: "dark",
    AUTO: "auto",
  },
};

// Rich Text Editor Configuration
export const EDITOR_CONFIG = {
  TOOLBAR_OPTIONS: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
  FORMATS: [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "align",
    "color",
    "background",
  ],
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_FILE_TYPES: ["application/pdf", "text/plain", "application/msword"],
};

// SEO Configuration
export const SEO_CONFIG = {
  DEFAULT_TITLE: "Blog Hub - Insights, Stories & Ideas",
  DEFAULT_DESCRIPTION:
    "Discover insights, stories, and ideas on our modern blog platform. Read the latest articles from our community of writers.",
  DEFAULT_KEYWORDS: [
    "blog",
    "articles",
    "insights",
    "stories",
    "modern",
    "writing",
  ],
  DEFAULT_AUTHOR: "Blog Hub Team",
  DEFAULT_IMAGE: "/og-image.jpg",
  TWITTER_HANDLE: "@modernblog",
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  TITLE_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 300,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS_PER_POST: 10,
};

// Date Formats
export const DATE_FORMATS = {
  FULL_DATE: "MMMM d, yyyy",
  SHORT_DATE: "MMM d, yyyy",
  DATE_TIME: "MMM d, yyyy at h:mm a",
  TIME_ONLY: "h:mm a",
  ISO_DATE: "yyyy-MM-dd",
};

export default {
  APP_CONFIG,
  API_CONFIG,
  PAGINATION,
  POST_STATUS,
  USER_ROLES,
  STORAGE_KEYS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONFIG,
  EDITOR_CONFIG,
  UPLOAD_CONFIG,
  SEO_CONFIG,
  ANIMATION,
  BREAKPOINTS,
  VALIDATION_RULES,
  DATE_FORMATS,
};
