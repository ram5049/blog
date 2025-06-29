// Mock data disabled - using real backend data only

export const getMockPosts = () => {
  return {
    posts: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
};

export const getMockPostBySlug = () => {
  return {
    post: null,
  };
};

export const getMockStats = () => {
  return {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    thisMonth: 0,
    monthlyGrowth: 0,
    recentPosts: [],
  };
};
