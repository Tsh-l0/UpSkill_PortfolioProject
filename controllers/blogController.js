const BlogPost = require("../models/BlogPost");
const { validationResult } = require("express-validator");

/**
 * @desc    Get blog posts
 * @route   GET /api/blog/posts
 * @access  Public
 */
const getBlogPosts = async (req, res, next) => {
  try {
    const {
      category,
      tags,
      search,
      featured,
      page = 1,
      limit = 12,
      sortBy = "recent",
    } = req.query;

    // Build query
    const query = { isActive: true, moderationStatus: "approved" };

    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (tags) {
      const tagArray = tags.split(",");
      query.tags = { $in: tagArray };
    }
    if (search) query.$text = { $search: search };

    // Sort options
    const sortOptions = {
      recent: { publishedAt: -1 },
      popular: { views: -1, bookmarkCount: -1 },
      trending: { engagementScore: -1 },
      quality: { qualityScore: -1, views: -1 },
    };

    const sort = sortOptions[sortBy] || sortOptions.recent;

    // Execute query
    const skip = (page - 1) * limit;
    const posts = await BlogPost.find(query)
      .populate("skills", "name icon category")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await BlogPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    next(error);
  }
};

/**
 * @desc    Get blog post by ID
 * @route   GET /api/blog/posts/:id
 * @access  Public
 */
const getBlogPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id).populate(
      "skills",
      "name icon category"
    );

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      });
    }

    // Increment view count
    await post.incrementViews();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get blog post by ID error:", error);
    next(error);
  }
};

/**
 * @desc    Get blog categories
 * @route   GET /api/blog/categories
 * @access  Public
 */
const getBlogCategories = async (req, res, next) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgViews: { $avg: "$views" },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          avgViews: { $round: ["$avgViews", 0] },
          featured: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get blog categories error:", error);
    next(error);
  }
};

/**
 * @desc    Bookmark/unbookmark blog post
 * @route   POST /api/blog/posts/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      });
    }

    const isBookmarked = post.bookmarks.includes(userId);

    if (isBookmarked) {
      await post.removeBookmark(userId);
    } else {
      await post.addBookmark(userId);
    }

    res.status(200).json({
      success: true,
      message: isBookmarked ? "Bookmark removed" : "Post bookmarked",
      data: {
        isBookmarked: !isBookmarked,
        bookmarkCount: post.bookmarkCount,
      },
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    next(error);
  }
};

/**
 * @desc    Get user bookmarks
 * @route   GET /api/blog/bookmarks
 * @access  Private
 */
const getUserBookmarks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const skip = (page - 1) * limit;

    const bookmarks = await BlogPost.find({
      bookmarks: userId,
      isActive: true,
    })
      .populate("skills", "name icon category")
      .sort({ bookmarkCount: -1, publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogPost.countDocuments({
      bookmarks: userId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user bookmarks error:", error);
    next(error);
  }
};

module.exports = {
  getBlogPosts,
  getBlogPostById,
  getBlogCategories,
  toggleBookmark,
  getUserBookmarks,
};
