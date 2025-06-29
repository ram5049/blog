const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test configuration
const testUser = {
  username: `testuser_${Date.now()}`, // Make username unique
  email: `test_${Date.now()}@example.com`, // Make email unique
  password: "Test123!@#",
  name: "Test User",
};

const testPost = {
  title: "Test Blog Post",
  content:
    "This is a test blog post content. It should be long enough to be valid.",
  excerpt: "This is a test excerpt",
  tags: ["test", "nodejs", "blog"],
  featured: false,
  status: "draft", // Create as draft so we can test publishing
};

let authToken = "";
let postId = "";

// Helper function to make authenticated requests
const makeAuthRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  // Only add content-type and data for requests that can have a body
  if (data && ["post", "put", "patch"].includes(method.toLowerCase())) {
    config.headers["Content-Type"] = "application/json";
    config.data = data;
  }

  return axios(config);
};

// Test functions
const testHealthCheck = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", response.data);
    return true;
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log("✅ User registration passed:", response.data.message);
    return true;
  } catch (error) {
    console.log(
      "❌ User registration failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testUserLogin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password,
    });
    authToken = response.data.data.accessToken;
    console.log("✅ User login passed, token received");
    return true;
  } catch (error) {
    console.log(
      "❌ User login failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testCreatePost = async () => {
  try {
    const response = await makeAuthRequest("post", "/posts", testPost);
    postId = response.data.data.post._id;
    console.log("✅ Post creation passed:", response.data.message);
    return true;
  } catch (error) {
    console.log(
      "❌ Post creation failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testGetPosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/posts`);
    console.log(
      "✅ Get posts passed, found",
      response.data.data.posts.length,
      "posts"
    );
    return true;
  } catch (error) {
    console.log(
      "❌ Get posts failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testGetPostById = async () => {
  if (!postId) {
    console.log("❌ Cannot test get post by ID - no post ID available");
    return false;
  }

  try {
    const response = await makeAuthRequest("get", `/posts/id/${postId}`);
    console.log("✅ Get post by ID passed:", response.data.data.post.title);
    return true;
  } catch (error) {
    console.log(
      "❌ Get post by ID failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testPublishPost = async () => {
  if (!postId) {
    console.log("❌ Cannot test publish post - no post ID available");
    return false;
  }

  try {
    const response = await makeAuthRequest("post", `/posts/${postId}/publish`);
    console.log("✅ Publish post passed:", response.data.message);
    return true;
  } catch (error) {
    console.log(
      "❌ Publish post failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

const testGetProfile = async () => {
  try {
    const response = await makeAuthRequest("get", "/auth/profile");
    console.log("✅ Get profile passed:", response.data.data.username);
    return true;
  } catch (error) {
    console.log(
      "❌ Get profile failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log("🧪 Starting Blog API Tests...\n");

  let passedTests = 0;
  let totalTests = 0;

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "User Registration", fn: testUserRegistration },
    { name: "User Login", fn: testUserLogin },
    { name: "Get Profile", fn: testGetProfile },
    { name: "Create Post", fn: testCreatePost },
    { name: "Get Posts", fn: testGetPosts },
    { name: "Get Post by ID", fn: testGetPostById },
    { name: "Publish Post", fn: testPublishPost },
  ];

  for (const test of tests) {
    totalTests++;
    console.log(`\n📋 Testing: ${test.name}`);
    const passed = await test.fn();
    if (passed) passedTests++;

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Backend is working correctly.");
  } else {
    console.log("❌ Some tests failed. Please check the logs above.");
  }

  process.exit(passedTests === totalTests ? 0 : 1);
};

// Handle errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error.message);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testCreatePost,
  testGetPosts,
  testGetPostById,
  testPublishPost,
  testGetProfile,
};
