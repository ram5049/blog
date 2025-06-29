const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    featuredImage: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
      trim: true,
    },
    readTime: {
      type: Number,
      default: 0,
      min: [0, "Read time cannot be negative"],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ title: "text", content: "text" }); // Text search

// Virtual for URL
PostSchema.virtual("url").get(function () {
  return `/post/${this.slug}`;
});

// Pre-save middleware to auto-generate excerpt if not provided
PostSchema.pre("save", function (next) {
  // Generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    // Remove HTML tags and get first 150 characters
    const plainText = this.content.replace(/<[^>]*>/g, "");
    this.excerpt =
      plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;
  }

  // Calculate estimated read time (average 200 words per minute)
  if (this.content) {
    const wordsPerMinute = 200;
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(words / wordsPerMinute);
  }

  next();
});

// Static method to find posts by status
PostSchema.statics.findByStatus = function (status) {
  return this.find({ status })
    .populate("author", "username email")
    .sort({ createdAt: -1 });
};

// Static method to find published posts for public view
PostSchema.statics.findPublished = function () {
  return this.find({ status: "published" })
    .populate("author", "username")
    .sort({ createdAt: -1 })
    .select("-content"); // Exclude content for listing
};

// Instance method to increment views
PostSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

module.exports = mongoose.model("Post", PostSchema);
