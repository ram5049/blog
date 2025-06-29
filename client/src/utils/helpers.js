import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The HTML content to sanitize
 * @param {object} options - DOMPurify options
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHtml = (dirty, options = {}) => {
  const defaultOptions = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "div",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "target",
      "rel",
    ],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Plain text content
 */
export const extractPlainText = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

/**
 * Generate a slug from a title
 * @param {string} title - The title to convert
 * @returns {string} - URL-friendly slug
 */
export const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Format a date string into a readable format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('full', 'short', 'relative')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = "full") => {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  switch (format) {
    case "relative":
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return formatDate(date, "short");

    case "short":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "full":
    default:
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  }
};

/**
 * Calculate reading time for content
 * @param {string} content - The content to analyze
 * @param {number} wpm - Words per minute (default: 200)
 * @returns {number} - Reading time in minutes
 */
export const calculateReadingTime = (content, wpm = 200) => {
  const textContent = extractPlainText(content);
  const wordCount = textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return Math.ceil(wordCount / wpm);
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 150, suffix = "...") => {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if a string is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a password meets requirements
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: [],
  };

  if (!password) {
    result.isValid = false;
    result.errors.push("Password is required");
    return result;
  }

  if (password.length < 8) {
    result.isValid = false;
    result.errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    result.isValid = false;
    result.errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    result.isValid = false;
    result.errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    result.isValid = false;
    result.errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    result.isValid = false;
    result.errors.push("Password must contain at least one special character");
  }

  return result;
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @param {string} chars - Characters to use
 * @returns {string} - Random string
 */
export const generateRandomString = (
  length = 10,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Generate meta tags for SEO
 * @param {object} data - Meta data
 * @returns {object} - Meta tags object
 */
export const generateMetaTags = (data = {}) => {
  const {
    title = "Blog Hub",
    description = "A modern blog platform with rich content",
    image = "/og-image.jpg",
    url = window.location.href,
    type = "website",
    author = "Blog Hub Team",
    keywords = ["blog", "modern", "content"],
  } = data;

  return {
    title,
    description,
    keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    author,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "og:url": url,
    "og:type": type,
    "twitter:card": "summary_large_image",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
  };
};

/**
 * Check if user prefers dark mode
 * @returns {boolean} - Whether dark mode is preferred
 */
export const prefersDarkMode = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

/**
 * Scroll to element smoothly
 * @param {string|Element} element - Element selector or element
 * @param {object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  const target =
    typeof element === "string" ? document.querySelector(element) : element;

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
      ...options,
    });
  }
};

export default {
  sanitizeHtml,
  extractPlainText,
  createSlug,
  formatDate,
  calculateReadingTime,
  truncateText,
  debounce,
  throttle,
  isValidEmail,
  validatePassword,
  generateRandomString,
  copyToClipboard,
  formatFileSize,
  generateMetaTags,
  prefersDarkMode,
  scrollToElement,
};
