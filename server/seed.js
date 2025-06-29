const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const { User, Post } = require("./src/models");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for seeding");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Post.deleteMany({});

    // Create users (admin and editors)
    console.log("👤 Creating users...");

    const adminUser = await User.create({
      username: "admin",
      email: "admin@modernblog.com",
      password: "Admin123!@#",
      name: "Admin User",
      role: "admin",
      isActive: true,
    });

    const editor1 = await User.create({
      username: "john_editor",
      email: "john@modernblog.com",
      password: "Editor123!@#",
      name: "John Smith",
      role: "editor",
      isActive: true,
    });

    const editor2 = await User.create({
      username: "sarah_writer",
      email: "sarah@modernblog.com",
      password: "Writer123!@#",
      name: "Sarah Johnson",
      role: "editor",
      isActive: true,
    });

    const editor3 = await User.create({
      username: "mike_tech",
      email: "mike@modernblog.com",
      password: "TechWriter123!@#",
      name: "Mike Chen",
      role: "editor",
      isActive: true,
    });

    console.log("✅ Created users:");
    console.log(`   - Admin: ${adminUser.username} (${adminUser.email})`);
    console.log(`   - Editor: ${editor1.username} (${editor1.email})`);
    console.log(`   - Editor: ${editor2.username} (${editor2.email})`);
    console.log(`   - Editor: ${editor3.username} (${editor3.email})`);

    // Create sample blog posts with variety
    console.log("📝 Creating sample blog posts...");

    const samplePosts = [
      {
        title: "Welcome to Modern Blog Platform",
        content: `
          <h2>Welcome to our modern blog platform!</h2>
          <p>This is a fully-featured blog application built with the latest web technologies. Our platform offers:</p>
          <ul>
            <li><strong>Rich Text Editing</strong> - Create beautiful content with our WYSIWYG editor</li>
            <li><strong>SEO Optimization</strong> - Automatic slug generation and meta tags</li>
            <li><strong>Responsive Design</strong> - Looks great on all devices</li>
            <li><strong>Secure Admin Panel</strong> - Manage your content with ease</li>
            <li><strong>Multi-user Support</strong> - Admin and editor roles</li>
          </ul>
          <p>Start exploring and create amazing content today!</p>
          <blockquote>
            <p>"The best way to share knowledge is through well-crafted blog posts."</p>
          </blockquote>
          <p>Join our community of writers and readers as we explore technology, development, and digital innovation together.</p>
        `,
        slug: "welcome-to-modern-blog-platform",
        excerpt:
          "Welcome to our modern blog platform! Discover the features that make content creation a breeze.",
        status: "published",
        author: adminUser._id,
        tags: ["welcome", "features", "introduction", "platform"],
        metaDescription:
          "Welcome to our modern blog platform with rich text editing, SEO optimization, and responsive design.",
        readTime: 3,
        views: 1245,
        publishedAt: new Date("2024-12-01"),
        createdAt: new Date("2024-12-01"),
        updatedAt: new Date("2024-12-01"),
      },
      {
        title: "The Future of Web Development: Trends to Watch in 2025",
        content: `
          <h2>Web Development Trends Shaping the Future</h2>
          <p>As we move through 2025, web development continues to evolve at a rapid pace. Here are the key trends every developer should be aware of:</p>
          
          <h3>1. AI-Powered Development Tools</h3>
          <p>Artificial Intelligence is revolutionizing how we write code:</p>
          <ul>
            <li><strong>Code Generation</strong> - AI assistants help write boilerplate code</li>
            <li><strong>Bug Detection</strong> - Automated testing and error detection</li>
            <li><strong>Performance Optimization</strong> - AI-driven performance suggestions</li>
            <li><strong>Accessibility Auditing</strong> - Automated accessibility improvements</li>
          </ul>

          <h3>2. Edge Computing and CDNs</h3>
          <p>Moving computation closer to users for better performance:</p>
          <ul>
            <li>Reduced latency for global applications</li>
            <li>Better user experience across all regions</li>
            <li>Improved SEO through faster loading times</li>
          </ul>

          <h3>3. WebAssembly (WASM) Adoption</h3>
          <p>WebAssembly is enabling high-performance applications in the browser:</p>
          <pre><code>// Example: Using WASM for intensive calculations
import wasmModule from './math-operations.wasm';

async function performComplexCalculation(data) {
  const wasm = await wasmModule();
  return wasm.processLargeDataset(data);
}</code></pre>

          <h3>4. Serverless Architecture</h3>
          <p>Function-as-a-Service (FaaS) continues to gain popularity:</p>
          <ul>
            <li>Cost-effective scaling</li>
            <li>Reduced infrastructure management</li>
            <li>Faster deployment cycles</li>
          </ul>

          <blockquote>
            <p>"The future of web development is about building faster, more accessible, and more intelligent applications."</p>
          </blockquote>
        `,
        slug: "future-of-web-development-trends-2025",
        excerpt:
          "Explore the cutting-edge trends shaping web development in 2025, from AI-powered tools to edge computing.",
        status: "published",
        author: editor3._id,
        tags: ["web development", "trends", "2025", "AI", "technology"],
        metaDescription:
          "Discover the latest web development trends for 2025 including AI tools, edge computing, WebAssembly, and serverless architecture.",
        readTime: 8,
        views: 892,
        publishedAt: new Date("2024-12-15"),
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-15"),
      },
      {
        title: "Building Scalable React Applications: Best Practices",
        content: `
          <h2>Master React Architecture for Large-Scale Applications</h2>
          <p>Building scalable React applications requires careful planning and adherence to best practices. Here's your comprehensive guide:</p>

          <h3>1. Component Architecture</h3>
          <p>Design components with reusability and maintainability in mind:</p>
          <pre><code>// Example: Reusable Button Component
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  children,
  ...props 
}) => {
  const classNames = \`btn btn--\${variant} btn--\${size} \${disabled ? 'btn--disabled' : ''}\`;
  
  return (
    <button 
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;</code></pre>

          <h3>2. State Management</h3>
          <p>Choose the right state management solution for your application size:</p>
          <ul>
            <li><strong>Local State</strong> - useState and useReducer for component-level state</li>
            <li><strong>Context API</strong> - For moderate complexity and theme/auth state</li>
            <li><strong>Redux Toolkit</strong> - For complex applications with extensive state</li>
            <li><strong>Zustand</strong> - Lightweight alternative for medium-sized apps</li>
          </ul>

          <h3>3. Performance Optimization</h3>
          <p>Key strategies to keep your React app fast:</p>
          <ul>
            <li><strong>Code Splitting</strong> - Use React.lazy() and Suspense</li>
            <li><strong>Memoization</strong> - React.memo, useMemo, useCallback</li>
            <li><strong>Virtual Scrolling</strong> - For large lists</li>
            <li><strong>Bundle Analysis</strong> - webpack-bundle-analyzer</li>
          </ul>

          <h3>4. Testing Strategy</h3>
          <p>Comprehensive testing ensures reliability:</p>
          <pre><code>// Example: Component Testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});</code></pre>

          <p>Following these practices will help you build React applications that scale gracefully and remain maintainable as your team grows.</p>
        `,
        slug: "building-scalable-react-applications-best-practices",
        excerpt:
          "Learn essential best practices for building scalable React applications including component architecture, state management, and performance optimization.",
        status: "published",
        author: editor1._id,
        tags: [
          "react",
          "javascript",
          "frontend",
          "best practices",
          "scalability",
        ],
        metaDescription:
          "Comprehensive guide to building scalable React applications with best practices for architecture, state management, and performance.",
        readTime: 12,
        views: 654,
        publishedAt: new Date("2024-12-10"),
        createdAt: new Date("2024-12-10"),
        updatedAt: new Date("2024-12-10"),
      },
      {
        title: "Node.js Performance Optimization: From Basics to Advanced",
        content: `
          <h2>Optimize Your Node.js Applications for Peak Performance</h2>
          <p>Node.js performance optimization is crucial for building scalable backend applications. Let's dive into techniques that will make your applications faster and more efficient.</p>

          <h3>1. Profiling and Monitoring</h3>
          <p>You can't optimize what you don't measure:</p>
          <pre><code>// Basic performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(\`\${entry.name}: \${entry.duration}ms\`);
  });
});

performanceObserver.observe({ entryTypes: ['measure'] });

// Measure function execution time
performance.mark('api-start');
await processApiRequest();
performance.mark('api-end');
performance.measure('api-duration', 'api-start', 'api-end');</code></pre>

          <h3>2. Database Optimization</h3>
          <p>Database queries often become the bottleneck:</p>
          <ul>
            <li><strong>Indexing</strong> - Create proper indexes for frequently queried fields</li>
            <li><strong>Query Optimization</strong> - Use explain() to analyze query performance</li>
            <li><strong>Connection Pooling</strong> - Reuse database connections</li>
            <li><strong>Caching</strong> - Implement Redis or in-memory caching</li>
          </ul>

          <h3>3. Memory Management</h3>
          <p>Prevent memory leaks and optimize garbage collection:</p>
          <pre><code>// Monitor memory usage
const formatMemoryUsage = (data) => \`\${Math.round(data / 1024 / 1024 * 100) / 100} MB\`;

const memUsage = process.memoryUsage();
console.log({
  rss: formatMemoryUsage(memUsage.rss),
  heapTotal: formatMemoryUsage(memUsage.heapTotal),
  heapUsed: formatMemoryUsage(memUsage.heapUsed),
  external: formatMemoryUsage(memUsage.external),
});</code></pre>

          <h3>4. Async Operations</h3>
          <p>Leverage Node.js's non-blocking nature:</p>
          <ul>
            <li>Use async/await for cleaner asynchronous code</li>
            <li>Implement proper error handling</li>
            <li>Avoid blocking the event loop</li>
            <li>Use worker threads for CPU-intensive tasks</li>
          </ul>

          <h3>5. Caching Strategies</h3>
          <p>Implement multiple layers of caching:</p>
          <ul>
            <li><strong>Application-level caching</strong> - In-memory caches</li>
            <li><strong>Database query caching</strong> - Cache frequent queries</li>
            <li><strong>HTTP caching</strong> - Use appropriate cache headers</li>
            <li><strong>CDN caching</strong> - Cache static assets</li>
          </ul>

          <blockquote>
            <p>"Premature optimization is the root of all evil, but timely optimization is the foundation of scalable applications."</p>
          </blockquote>
        `,
        slug: "nodejs-performance-optimization-guide",
        excerpt:
          "Master Node.js performance optimization with profiling, database optimization, memory management, and caching strategies.",
        status: "published",
        author: editor3._id,
        tags: [
          "nodejs",
          "performance",
          "backend",
          "optimization",
          "scalability",
        ],
        metaDescription:
          "Complete guide to Node.js performance optimization covering profiling, database optimization, memory management, and caching.",
        readTime: 10,
        views: 743,
        publishedAt: new Date("2024-12-12"),
        createdAt: new Date("2024-12-12"),
        updatedAt: new Date("2024-12-12"),
      },
      {
        title: "CSS Grid vs Flexbox: When to Use Which?",
        content: `
          <h2>Master Modern CSS Layout Techniques</h2>
          <p>CSS Grid and Flexbox are powerful layout tools, but knowing when to use each one is key to efficient web development.</p>

          <h3>Understanding the Fundamentals</h3>
          <p>Both Grid and Flexbox solve layout problems, but they approach them differently:</p>
          <ul>
            <li><strong>Flexbox</strong> - One-dimensional layouts (row OR column)</li>
            <li><strong>CSS Grid</strong> - Two-dimensional layouts (rows AND columns)</li>
          </ul>

          <h3>When to Use Flexbox</h3>
          <p>Flexbox excels at these scenarios:</p>
          <ul>
            <li>Navigation bars and menus</li>
            <li>Centering content (both horizontally and vertically)</li>
            <li>Card layouts within a container</li>
            <li>Form controls alignment</li>
            <li>Media objects (image + text)</li>
          </ul>

          <pre><code>/* Flexbox Example: Navigation Bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* Perfect centering */
.hero-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}</code></pre>

          <h3>When to Use CSS Grid</h3>
          <p>CSS Grid is ideal for:</p>
          <ul>
            <li>Page layouts (header, sidebar, main, footer)</li>
            <li>Card grids with varying sizes</li>
            <li>Complex responsive layouts</li>
            <li>Overlapping elements</li>
            <li>Magazine-style layouts</li>
          </ul>

          <pre><code>/* CSS Grid Example: Page Layout */
.page-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}</code></pre>

          <h3>Combining Both Techniques</h3>
          <p>The most powerful approach is using Grid and Flexbox together:</p>
          <pre><code>/* Grid for overall layout, Flexbox for components */
.blog-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.article-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
}</code></pre>

          <h3>Decision Framework</h3>
          <p>Use this simple decision tree:</p>
          <ol>
            <li><strong>Do you need 2D control?</strong> → Use CSS Grid</li>
            <li><strong>Is it a component layout?</strong> → Consider Flexbox</li>
            <li><strong>Do you need flexible sizing?</strong> → Flexbox might be better</li>
            <li><strong>Is it a page-level layout?</strong> → Grid is probably ideal</li>
          </ol>

          <p>Remember: There's no wrong choice if it solves your problem efficiently!</p>
        `,
        slug: "css-grid-vs-flexbox-when-to-use-which",
        excerpt:
          "Learn when to use CSS Grid vs Flexbox with practical examples and a decision framework for modern web layouts.",
        status: "published",
        author: editor2._id,
        tags: ["css", "grid", "flexbox", "layout", "responsive design"],
        metaDescription:
          "Complete guide to choosing between CSS Grid and Flexbox for your layouts with examples and best practices.",
        readTime: 9,
        views: 521,
        publishedAt: new Date("2024-12-08"),
        createdAt: new Date("2024-12-08"),
        updatedAt: new Date("2024-12-08"),
      },
      {
        title: "Database Design Patterns for Modern Applications",
        content: `
          <h2>Design Robust Database Architectures</h2>
          <p>Proper database design is the foundation of any successful application. Let's explore patterns and practices that will serve your applications well.</p>

          <h3>1. Normalization vs Denormalization</h3>
          <p>Understanding when to normalize and when to denormalize:</p>
          <ul>
            <li><strong>Normalization</strong> - Reduces redundancy, maintains data integrity</li>
            <li><strong>Denormalization</strong> - Improves read performance, increases storage</li>
          </ul>

          <h3>2. Indexing Strategies</h3>
          <p>Strategic indexing dramatically improves query performance:</p>
          <pre><code>// MongoDB indexing examples
// Single field index
db.posts.createIndex({ "publishedAt": -1 })

// Compound index for complex queries
db.posts.createIndex({ 
  "status": 1, 
  "publishedAt": -1, 
  "author": 1 
})

// Text index for search functionality
db.posts.createIndex({ 
  "title": "text", 
  "content": "text", 
  "tags": "text" 
})</code></pre>

          <h3>3. Relationship Patterns</h3>
          <p>Choose the right relationship pattern for your data:</p>
          <ul>
            <li><strong>Embedding</strong> - For one-to-few relationships</li>
            <li><strong>Referencing</strong> - For one-to-many relationships</li>
            <li><strong>Hybrid</strong> - Combination based on access patterns</li>
          </ul>

          <h3>4. Caching Patterns</h3>
          <p>Implement effective caching strategies:</p>
          <ul>
            <li><strong>Cache-Aside</strong> - Application manages cache</li>
            <li><strong>Write-Through</strong> - Cache and database written simultaneously</li>
            <li><strong>Write-Behind</strong> - Cache written first, database later</li>
          </ul>

          <h3>5. Scalability Patterns</h3>
          <p>Prepare for growth from the beginning:</p>
          <ul>
            <li>Read replicas for scaling read operations</li>
            <li>Sharding for horizontal scaling</li>
            <li>Connection pooling for efficient resource usage</li>
            <li>Database partitioning strategies</li>
          </ul>

          <blockquote>
            <p>"A well-designed database schema is like a good foundation – it supports everything you build on top of it."</p>
          </blockquote>
        `,
        slug: "database-design-patterns-modern-applications",
        excerpt:
          "Master database design patterns including normalization, indexing, relationships, caching, and scalability strategies.",
        status: "published",
        author: editor1._id,
        tags: [
          "database",
          "design patterns",
          "mongodb",
          "scalability",
          "performance",
        ],
        metaDescription:
          "Comprehensive guide to database design patterns for modern applications covering indexing, relationships, and scalability.",
        readTime: 11,
        views: 389,
        publishedAt: new Date("2024-12-05"),
        createdAt: new Date("2024-12-05"),
        updatedAt: new Date("2024-12-05"),
      },
      {
        title: "API Security: Protecting Your Endpoints",
        content: `
          <h2>Secure Your APIs Against Common Threats</h2>
          <p>API security is more critical than ever. Learn how to protect your endpoints from common attacks and implement robust security measures.</p>

          <h3>1. Authentication & Authorization</h3>
          <p>Implement strong authentication mechanisms:</p>
          <pre><code>// JWT Token Implementation
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};</code></pre>

          <h3>2. Rate Limiting</h3>
          <p>Prevent abuse with proper rate limiting:</p>
          <pre><code>// Express rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);</code></pre>

          <h3>3. Input Validation & Sanitization</h3>
          <p>Always validate and sanitize user input:</p>
          <ul>
            <li>Use validation libraries like Joi or Yup</li>
            <li>Sanitize HTML content</li>
            <li>Validate file uploads</li>
            <li>Check parameter types and ranges</li>
          </ul>

          <h3>4. HTTPS & Security Headers</h3>
          <p>Secure data in transit and set proper headers:</p>
          <pre><code>// Security headers with Helmet.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));</code></pre>

          <h3>5. SQL Injection Prevention</h3>
          <p>Protect against database attacks:</p>
          <ul>
            <li>Use parameterized queries</li>
            <li>Implement ORMs with built-in protection</li>
            <li>Validate input data types</li>
            <li>Use least privilege database accounts</li>
          </ul>

          <h3>6. API Versioning</h3>
          <p>Plan for changes and maintain backward compatibility:</p>
          <pre><code>// URL-based versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Header-based versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});</code></pre>

          <p>Security is not a one-time implementation but an ongoing process. Regular security audits and updates are essential.</p>
        `,
        slug: "api-security-protecting-your-endpoints",
        excerpt:
          "Learn essential API security practices including authentication, rate limiting, input validation, and protection against common attacks.",
        status: "published",
        author: editor3._id,
        tags: ["api", "security", "authentication", "nodejs", "backend"],
        metaDescription:
          "Comprehensive guide to API security covering authentication, rate limiting, input validation, and endpoint protection strategies.",
        readTime: 13,
        views: 467,
        publishedAt: new Date("2024-12-07"),
        createdAt: new Date("2024-12-07"),
        updatedAt: new Date("2024-12-07"),
      },
      {
        title: "Draft: Advanced TypeScript Patterns",
        content: `
          <h2>Master Advanced TypeScript Techniques</h2>
          <p>This article covers advanced TypeScript patterns for experienced developers.</p>

          <h3>Utility Types</h3>
          <p>TypeScript provides powerful utility types:</p>
          <ul>
            <li>Partial&lt;T&gt;</li>
            <li>Required&lt;T&gt;</li>
            <li>Pick&lt;T, K&gt;</li>
            <li>Omit&lt;T, K&gt;</li>
          </ul>

          <h3>Generic Constraints</h3>
          <pre><code>interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}</code></pre>

          <p>More content coming soon...</p>
        `,
        slug: "advanced-typescript-patterns",
        excerpt:
          "Explore advanced TypeScript patterns including utility types, generic constraints, and complex type manipulations.",
        status: "draft",
        author: editor1._id,
        tags: ["typescript", "advanced", "patterns", "generics"],
        metaDescription:
          "Advanced TypeScript patterns and techniques for experienced developers.",
        readTime: 15,
        views: 23,
        createdAt: new Date("2024-12-16"),
        updatedAt: new Date("2024-12-16"),
      },
      {
        title: "Draft: Microservices Architecture Guide",
        content: `
          <h2>Building Scalable Microservices</h2>
          <p>A comprehensive guide to microservices architecture.</p>

          <h3>Service Decomposition</h3>
          <p>How to break down monoliths into microservices...</p>

          <h3>Communication Patterns</h3>
          <ul>
            <li>Synchronous communication</li>
            <li>Asynchronous messaging</li>
            <li>Event-driven architecture</li>
          </ul>

          <p>Draft in progress...</p>
        `,
        slug: "microservices-architecture-guide",
        excerpt:
          "Learn how to design and implement scalable microservices architecture with proper service decomposition and communication patterns.",
        status: "draft",
        author: editor2._id,
        tags: ["microservices", "architecture", "scalability", "backend"],
        metaDescription:
          "Complete guide to microservices architecture including service decomposition and communication patterns.",
        readTime: 20,
        views: 8,
        createdAt: new Date("2024-12-17"),
        updatedAt: new Date("2024-12-17"),
      },
    ];

    const createdPosts = await Post.insertMany(samplePosts);
    console.log(`✅ Created ${createdPosts.length} sample posts`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("👤 Admin User:");
    console.log("   Username: admin");
    console.log("   Email: admin@modernblog.com");
    console.log("   Password: Admin123!@#");
    console.log("\n✏️ Editor Users:");
    console.log(
      "   Username: john_editor | Email: john@modernblog.com | Password: Editor123!@#"
    );
    console.log(
      "   Username: sarah_writer | Email: sarah@modernblog.com | Password: Writer123!@#"
    );
    console.log(
      "   Username: mike_tech | Email: mike@modernblog.com | Password: TechWriter123!@#"
    );

    console.log("\n📊 Created Content:");
    console.log(
      `   - ${
        createdPosts.filter((p) => p.status === "published").length
      } Published posts`
    );
    console.log(
      `   - ${
        createdPosts.filter((p) => p.status === "draft").length
      } Draft posts`
    );
    console.log(
      `   - Total views: ${createdPosts.reduce(
        (sum, post) => sum + post.views,
        0
      )}`
    );
    console.log(
      `   - Average read time: ${Math.round(
        createdPosts.reduce((sum, post) => sum + post.readTime, 0) /
          createdPosts.length
      )} minutes`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log("\n✅ Database connection closed");
  process.exit(0);
};

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
