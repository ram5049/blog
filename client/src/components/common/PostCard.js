import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDate } from "../../utils/helpers";

const PostCard = ({ post, index = 0 }) => {
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getExcerpt = (content, maxLength = 150) => {
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substr(0, maxLength).trim() + "...";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="post-card"
    >
      <div className="post-card-content">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.slice(0, 3).map((tag, tagIndex) => (
              <span key={tagIndex} className="post-card-tag">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="post-card-tag">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="post-card-title">
          <Link
            to={`/blog/${post.slug}`}
            className="hover:text-indigo-600 transition-colors duration-300"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="post-card-excerpt">
          {post.excerpt || getExcerpt(post.content)}
        </p>

        {/* Meta Information */}
        <div className="post-card-footer">
          <div className="post-card-meta">
            <span>
              📝{" "}
              {typeof post.author === "string"
                ? "Admin"
                : post.author?.username || post.author?.name || "Admin"}
            </span>
            <span>•</span>
            <time dateTime={post.publishedAt || post.createdAt}>
              📅 {formatDate(post.publishedAt || post.createdAt)}
            </time>
          </div>

          <Link to={`/blog/${post.slug}`} className="post-card-link">
            Read more →
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
