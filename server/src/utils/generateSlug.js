/**
 * Generate SEO-friendly slug from title
 * @param {string} title - The title to convert to slug
 * @returns {string} - SEO-friendly slug
 */
const generateSlug = (title) => {
  if (!title || typeof title !== "string") {
    throw new Error("Title must be a non-empty string");
  }

  return (
    title
      .toLowerCase()
      .trim()
      // Replace spaces with hyphens
      .replace(/\s+/g, "-")
      // Remove special characters except hyphens
      .replace(/[^\w\-]+/g, "")
      // Replace multiple hyphens with single hyphen
      .replace(/\-\-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
};

/**
 * Generate unique slug by checking database
 * @param {string} title - The title to convert to slug
 * @param {Model} model - Mongoose model to check against
 * @param {string} excludeId - ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (title, model, excludeId = null) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingPost = await model.findOne(query);

    if (!existingPost) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Check slug format: only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  return (
    slugRegex.test(slug) &&
    slug.length >= 1 &&
    slug.length <= 100 &&
    !slug.startsWith("-") &&
    !slug.endsWith("-")
  );
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
};
