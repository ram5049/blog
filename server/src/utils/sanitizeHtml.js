const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Create a DOMPurify instance for server-side use
const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content
 * @returns {string} - Sanitized HTML content
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Configure DOMPurify to allow common blog elements
  const config = {
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
      "pre",
      "code",
      "a",
      "img",
      "div",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "alt",
      "src",
      "width",
      "height",
      "class",
      "id",
      "target",
      "rel",
      "style",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    ADD_TAGS: ["iframe"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input", "button"],
  };

  try {
    const sanitized = purify.sanitize(html, config);
    return sanitized;
  } catch (error) {
    console.error("HTML sanitization error:", error);
    return "";
  }
};

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
const extractPlainText = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  try {
    // Remove HTML tags and decode entities
    const plainText = html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    return plainText;
  } catch (error) {
    console.error("Plain text extraction error:", error);
    return "";
  }
};

/**
 * Validate if HTML content is safe
 * @param {string} html - HTML content to validate
 * @returns {boolean} - True if safe
 */
const isValidHtml = (html) => {
  if (!html || typeof html !== "string") {
    return false;
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<iframe(?![^>]*src="https?:\/\/)/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(html));
};

module.exports = {
  sanitizeHtml,
  extractPlainText,
  isValidHtml,
};
