import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Clock, User, Tag } from "lucide-react";

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner, {
  CardSkeleton,
} from "../../components/common/LoadingSpinner";
import PostCard from "../../components/common/PostCard";
import SEOHead from "../../components/common/SEOHead";
import { usePosts } from "../../hooks/usePosts";
import {
  formatDate,
  calculateReadingTime,
  truncateText,
} from "../../utils/helpers";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const { posts, loading, error, pagination, refetch } = usePosts({
    limit: 9,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      refetch({ search: searchTerm, tag: selectedTag });
    }
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    refetch({ search: searchTerm, tag: tag });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    refetch();
  };

  // Get unique tags from posts, handle cases where posts might be null/undefined
  const allTags =
    posts && Array.isArray(posts)
      ? [...new Set(posts.flatMap((post) => post.tags || []))]
      : [];

  return (
    <>
      <SEOHead
        title="Blog Hub - Insights, Stories & Ideas"
        description="Discover insights, stories, and ideas on our modern blog platform. Read the latest articles from our community of writers."
        keywords={[
          "blog",
          "articles",
          "insights",
          "stories",
          "modern",
          "writing",
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-section"
        >
          <div className="hero-container">
            <div className="hero-content">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hero-title"
              >
                Discover Stories That
                <span className="text-gradient"> Inspire</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="hero-subtitle"
              >
                Fresh perspectives, expert insights, and engaging stories from
                our community of writers.
              </motion.p>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSearch}
                className="search-form"
              >
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </motion.form>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="tag-filters"
                >
                  <button
                    onClick={clearFilters}
                    className={`tag-filter ${
                      selectedTag === "" ? "active" : ""
                    }`}
                  >
                    All Articles
                  </button>
                  {allTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagFilter(tag)}
                      className={`tag-filter ${
                        selectedTag === tag ? "active" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Posts Grid */}
        <section className="posts-section" id="recent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="posts-header"
            >
              <h2 className="posts-title">
                {searchTerm || selectedTag
                  ? "Search Results"
                  : "Latest Articles"}
              </h2>
              <p className="posts-subtitle">
                {searchTerm || selectedTag
                  ? `${posts?.length || 0} posts found`
                  : "Explore our newest stories and insights"}
              </p>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <div className="posts-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load articles
                </h3>
                <p className="text-gray-600 mb-4">
                  Please try again in a moment
                </p>
                <button onClick={() => refetch()} className="btn-primary">
                  Try Again
                </button>
              </div>
            )}

            {/* Posts Grid */}
            {!loading && !error && posts && (
              <>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="h-12 w-12 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedTag
                        ? "Try different search terms"
                        : "New content coming soon"}
                    </p>
                    {(searchTerm || selectedTag) && (
                      <button onClick={clearFilters} className="btn-primary">
                        Show All Articles
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, staggerChildren: 0.1 }}
                    className="posts-grid"
                  >
                    {posts.map((post, index) => (
                      <PostCard key={post._id} post={post} index={index} />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
