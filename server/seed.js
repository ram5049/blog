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

    // Create admin user
    console.log("👤 Creating admin user...");

    const adminUser = await User.create({
      username: "admin",
      email: "admin@modernblog.com",
      password: "Admin123!@#", // Let the pre-save hook handle hashing
      name: "Admin User",
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin user created:", adminUser.username);

    // Create sample blog posts
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
          </ul>
          <p>Start exploring and create amazing content today!</p>
          <blockquote>
            <p>"The best way to share knowledge is through well-crafted blog posts."</p>
          </blockquote>
        `,
        slug: "welcome-to-modern-blog-platform",
        excerpt:
          "Welcome to our modern blog platform! Discover the features that make content creation a breeze.",
        status: "published",
        author: adminUser._id,
        tags: ["welcome", "features", "introduction"],
        metaDescription:
          "Welcome to our modern blog platform with rich text editing, SEO optimization, and responsive design.",
        readTime: 3,
        views: 245,
      },
      {
        title: "Getting Started with Rich Text Editing",
        content: `
          <h2>Master the Art of Rich Text Editing</h2>
          <p>Our blog platform features a powerful rich text editor that makes content creation intuitive and enjoyable.</p>
          
          <h3>Key Features:</h3>
          <ul>
            <li><strong>Formatting Options</strong> - Bold, italic, underline, and more</li>
            <li><strong>Lists and Tables</strong> - Organize your content effectively</li>
            <li><strong>Links and Media</strong> - Embed links and enhance with media</li>
            <li><strong>Code Blocks</strong> - Perfect for technical content</li>
          </ul>

          <pre><code>// Example code block
function createPost(title, content) {
  return {
    title,
    content,
    createdAt: new Date()
  };
}</code></pre>

          <p>The editor automatically saves your work and provides real-time preview functionality.</p>
          
          <h3>Tips for Better Content:</h3>
          <ol>
            <li>Use headings to structure your content</li>
            <li>Keep paragraphs concise and readable</li>
            <li>Add visual elements to break up text</li>
            <li>Include relevant links and references</li>
          </ol>
        `,
        slug: "getting-started-with-rich-text-editing",
        excerpt:
          "Learn how to make the most of our powerful rich text editor with formatting, lists, links, and more.",
        status: "published",
        author: adminUser._id,
        tags: ["tutorial", "editor", "guide"],
        metaDescription:
          "Master rich text editing with our comprehensive guide covering all editor features and best practices.",
        readTime: 5,
        views: 189,
      },
      {
        title: "SEO Best Practices for Blog Posts",
        content: `
          <h2>Optimize Your Content for Search Engines</h2>
          <p>Search Engine Optimization (SEO) is crucial for increasing your blog's visibility and reach. Here's how to optimize your posts:</p>

          <h3>1. Keyword Research</h3>
          <p>Start with thorough keyword research to understand what your audience is searching for:</p>
          <ul>
            <li>Use tools like Google Keyword Planner</li>
            <li>Analyze competitor content</li>
            <li>Focus on long-tail keywords</li>
            <li>Consider search intent</li>
          </ul>

          <h3>2. Content Structure</h3>
          <p>Well-structured content is easier for both users and search engines to understand:</p>
          <ul>
            <li><strong>Use descriptive headings</strong> (H1, H2, H3)</li>
            <li><strong>Create clear paragraphs</strong> with one main idea each</li>
            <li><strong>Add bullet points and lists</strong> for easy scanning</li>
            <li><strong>Include internal links</strong> to related content</li>
          </ul>

          <h3>3. Meta Information</h3>
          <p>Our platform automatically handles many SEO elements:</p>
          <ul>
            <li>✅ Automatic slug generation from titles</li>
            <li>✅ Meta description optimization</li>
            <li>✅ Open Graph tags for social sharing</li>
            <li>✅ Schema markup for rich snippets</li>
          </ul>

          <blockquote>
            <p>"Good SEO is about creating valuable content that answers user questions and provides genuine value."</p>
          </blockquote>

          <h3>4. Performance Matters</h3>
          <p>Page speed and user experience are ranking factors:</p>
          <ul>
            <li>Optimize images and media</li>
            <li>Keep content loading fast</li>
            <li>Ensure mobile responsiveness</li>
            <li>Minimize external dependencies</li>
          </ul>
        `,
        slug: "seo-best-practices-for-blog-posts",
        excerpt:
          "Learn essential SEO techniques to improve your blog's search engine visibility and attract more readers.",
        status: "published",
        author: adminUser._id,
        tags: ["seo", "optimization", "marketing", "guide"],
        metaDescription:
          "Comprehensive guide to SEO best practices for blog posts, including keyword research, content structure, and optimization tips.",
        readTime: 7,
        views: 321,
      },
      {
        title: "Building Responsive Web Applications",
        content: `
          <h2>Creating Modern, Responsive Web Experiences</h2>
          <p>In today's mobile-first world, responsive design isn't optional—it's essential. Let's explore how to build applications that work beautifully across all devices.</p>

          <h3>Mobile-First Approach</h3>
          <p>Start designing for the smallest screen first, then enhance for larger devices:</p>
          
          <pre><code>/* Mobile-first CSS */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 3rem;
  }
}</code></pre>

          <h3>Flexible Grid Systems</h3>
          <p>Use CSS Grid and Flexbox for responsive layouts:</p>
          <ul>
            <li><strong>CSS Grid</strong> - Perfect for complex, two-dimensional layouts</li>
            <li><strong>Flexbox</strong> - Ideal for one-dimensional component layouts</li>
            <li><strong>Container Queries</strong> - The future of responsive design</li>
          </ul>

          <h3>Testing Across Devices</h3>
          <p>Ensure your application works on all devices:</p>
          <ol>
            <li>Use browser developer tools</li>
            <li>Test on real devices when possible</li>
            <li>Consider different screen orientations</li>
            <li>Validate touch interactions</li>
          </ol>

          <p>Our blog platform is built with these principles in mind, ensuring a great experience whether you're reading on a phone, tablet, or desktop computer.</p>
        `,
        slug: "building-responsive-web-applications",
        excerpt:
          "Master responsive web design with mobile-first approaches, flexible grids, and cross-device testing strategies.",
        status: "published",
        author: adminUser._id,
        tags: ["web development", "responsive design", "css", "mobile"],
        metaDescription:
          "Learn how to build responsive web applications using mobile-first design, CSS Grid, Flexbox, and effective testing strategies.",
        readTime: 6,
        views: 156,
      },
      {
        title: "Draft: Upcoming Features and Roadmap",
        content: `
          <h2>What's Coming Next</h2>
          <p>We're constantly working to improve our blog platform. Here's what's on our roadmap:</p>

          <h3>Upcoming Features</h3>
          <ul>
            <li>📷 <strong>Image Upload</strong> - Direct image uploads and management</li>
            <li>💬 <strong>Comment System</strong> - Engage with your readers</li>
            <li>📊 <strong>Analytics Dashboard</strong> - Track your blog's performance</li>
            <li>🎨 <strong>Theme Customization</strong> - Personalize your blog's appearance</li>
            <li>🔗 <strong>Social Media Integration</strong> - Easy sharing and cross-posting</li>
          </ul>

          <h3>Technical Improvements</h3>
          <ul>
            <li>⚡ Enhanced performance optimizations</li>
            <li>🔒 Advanced security features</li>
            <li>🌐 Multi-language support</li>
            <li>📱 Progressive Web App capabilities</li>
          </ul>

          <p>Stay tuned for these exciting updates!</p>
        `,
        slug: "upcoming-features-and-roadmap",
        excerpt:
          "Get a sneak peek at upcoming features including image uploads, comments, analytics, and theme customization.",
        status: "draft",
        author: adminUser._id,
        tags: ["roadmap", "features", "updates"],
        metaDescription:
          "Discover upcoming features and improvements planned for our blog platform including new tools and capabilities.",
        readTime: 4,
        views: 12,
      },
    ];

    const createdPosts = await Post.insertMany(samplePosts);
    console.log(`✅ Created ${createdPosts.length} sample posts`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("Username: admin");
    console.log("Password: Admin123!@#");
    console.log("Email: admin@modernblog.com");

    console.log("\n📊 Created Content:");
    console.log(
      `- ${
        createdPosts.filter((p) => p.status === "published").length
      } Published posts`
    );
    console.log(
      `- ${createdPosts.filter((p) => p.status === "draft").length} Draft posts`
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
