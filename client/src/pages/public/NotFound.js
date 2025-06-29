import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft, Search } from "lucide-react";

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Blog Hub</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              {/* 404 Illustration */}
              <div className="relative mx-auto w-64 h-64 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary-100 to-gray-100 rounded-full"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute inset-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <span className="text-6xl font-bold text-gray-300">404</span>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 h-8 w-8 bg-primary-500 rounded-lg opacity-60"
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute -bottom-6 -left-6 h-6 w-6 bg-gray-400 rounded-full opacity-40"
                />
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute top-1/2 -right-8 h-4 w-4 bg-primary-300 rounded-sm opacity-50"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Oops! The page you're looking for doesn't exist. It might have
                been moved, deleted, or you entered the wrong URL.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Or try searching for what you need:
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search our blog
                </Link>
              </div>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Latest Posts
                </Link>
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Admin Dashboard
                </Link>
                <a
                  href="mailto:contact@modernblog.com"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Help Center
                </a>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NotFound;
