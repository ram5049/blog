import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const Header = ({ isPublic = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="header"
    >
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-icon">
            <span>B</span>
          </div>
          <span>Blog Hub</span>
        </Link>

        {/* Desktop Navigation */}
        {isPublic ? (
          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/#recent" className="nav-link">
              Recent Posts
            </Link>
            <Link to="/admin" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          </nav>
        ) : (
          <div className="nav">
            <Link to="/" className="nav-link">
              View Blog
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu open" onClick={closeMobileMenu}>
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <Link to="/" className="logo" onClick={closeMobileMenu}>
                <div className="logo-icon">
                  <span>B</span>
                </div>
                <span>Blog Hub</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="mobile-menu-close"
                aria-label="Close mobile menu"
              >
                <X size={20} />
              </button>
            </div>

            {isPublic ? (
              <nav className="mobile-nav">
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  to="/#recent"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Recent Posts
                </Link>
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Admin Panel
                </Link>
              </nav>
            ) : (
              <nav className="mobile-nav">
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  View Blog
                </Link>
              </nav>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
