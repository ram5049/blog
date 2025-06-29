import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Share2, Tag } from "lucide-react";
import DOMPurify from "dompurify";

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SEOHead from "../../components/common/SEOHead";
import { usePost } from "../../hooks/usePosts";
import {
  formatDate,
  calculateReadingTime,
  copyToClipboard,
} from "../../utils/helpers";
import toast from "react-hot-toast";
import "../../styles/pages/blogPost.css";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error } = usePost(slug);
  const [isSharing, setIsSharing] = useState(false);

  // Calculate reading time and sanitize content
  const readingTime = post ? calculateReadingTime(post.content || "") : 0;
  const sanitizedContent = post ? DOMPurify.sanitize(post.content || "") : "";

  useEffect(() => {
    if (error) {
      // If post not found, redirect to 404
      if (error.includes("not found") || error.includes("404")) {
        navigate("/404", { replace: true });
      }
    }
  }, [error, navigate]);

  const handleShare = async () => {
    setIsSharing(true);
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url,
        });
      } else {
        await copyToClipboard(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Post Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || post.metaDescription}
        keywords={post.tags || []}
        author={post.author?.username}
        type="article"
        url={`/blog/${post.slug}`}
      />

      <div className="min-h-screen bg-white">
        <Header />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="blog-meta-info">
              <div
                className="blog-author-info"
                data-anonymous={
                  !post.author?.name || post.author.name === "Anonymous"
                }
              >
                {post.author?.name && post.author.name !== "Anonymous" && (
                  <div className="blog-author-avatar">
                    {post.author.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="author-details">
                  <div className="blog-meta-item">
                    <User className="h-4 w-4" />
                    <span className="blog-author-name">
                      {post.author?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="blog-author-label">Author</div>
                </div>
              </div>

              <div className="blog-meta-item">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt, "full")}</span>
              </div>

              <div className="blog-meta-item">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="blog-header-share-btn ml-auto"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </motion.header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Article Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="badge badge-gray">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.author?.name || "Anonymous"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.author?.bio ||
                      "Passionate writer sharing insights and stories with the community."}
                  </p>
                  {post.author?.email && (
                    <a
                      href={`mailto:${post.author.email}`}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                    >
                      Get in touch →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="blog-footer-nav">
              <button
                onClick={() => navigate("/")}
                className="blog-all-posts-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                All Posts
              </button>
            </div>
          </motion.footer>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
