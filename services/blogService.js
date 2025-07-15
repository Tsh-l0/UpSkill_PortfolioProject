const axios = require("axios");
const BlogPost = require("../models/BlogPost");
const { cacheHelper, cacheKeys } = require("../config/redis");

class BlogService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.rapidApiHost = process.env.RAPIDAPI_HOST;
    this.baseUrl = "https://rapidapi.p.rapidapi.com";

    // Fallback APIs if RapidAPI fails
    this.fallbackApis = [
      {
        name: "dev.to",
        url: "https://dev.to/api/articles",
        headers: {},
      },
      {
        name: "hashnode",
        url: "https://api.hashnode.com",
        headers: {},
      },
    ];
  }

  async fetchBlogPosts(category = "all", limit = 20, page = 1) {
    try {
      const cacheKey = cacheKeys.blogPosts(category, page);

      // Check cache first
      let posts = await cacheHelper.get(cacheKey);
      if (posts) {
        console.log("📱 Blog posts served from cache");
        return posts;
      }

      // Try primary API first
      try {
        posts = await this.fetchFromRapidAPI(category, limit, page);
      } catch (error) {
        console.log("RapidAPI failed, trying fallback APIs");
        posts = await this.fetchFromFallbackAPIs(category, limit);
      }

      // If all APIs fail, get from database
      if (!posts || posts.length === 0) {
        console.log("Serving blog posts from database");
        posts = await this.getFromDatabase(category, limit, page);
      } else {
        // Process and save new posts to database
        await this.processBlogPosts(posts);
      }

      // Cache for 1 hour
      await cacheHelper.set(cacheKey, posts, 3600);

      return posts;
    } catch (error) {
      console.error("Blog service error:", error);
      // Fallback to database
      return await this.getFromDatabase(category, limit, page);
    }
  }

  async fetchFromRapidAPI(category, limit, page) {
    if (!this.rapidApiKey) {
      throw new Error("RapidAPI key not configured");
    }

    const response = await axios.get(`${this.baseUrl}/articles`, {
      headers: {
        "X-RapidAPI-Key": this.rapidApiKey,
        "X-RapidAPI-Host": this.rapidApiHost,
      },
      params: {
        category: category !== "all" ? category : undefined,
        limit,
        page,
        sort: "latest",
      },
      timeout: 10000, // 10 second timeout
    });

    return response.data.articles || response.data;
  }

  async fetchFromFallbackAPIs(category, limit) {
    // Try Dev.to API
    try {
      const response = await axios.get("https://dev.to/api/articles", {
        params: {
          tag: this.mapCategoryToTag(category),
          per_page: limit,
          state: "fresh",
        },
        timeout: 8000,
      });

      return response.data.map(this.transformDevToArticle);
    } catch (error) {
      console.log("Dev.to API failed:", error.message);
    }

    // Try other fallback APIs here...

    throw new Error("All fallback APIs failed");
  }

  async getFromDatabase(category, limit, page) {
    const query = { isActive: true, moderationStatus: "approved" };
    if (category !== "all") query.category = category;

    const skip = (page - 1) * limit;

    return await BlogPost.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async processBlogPosts(posts) {
    const processedPosts = posts.map((post) => ({
      externalId: post.id || post.slug,
      title: post.title,
      excerpt:
        post.excerpt || post.description || this.generateExcerpt(post.content),
      content: post.content || post.body_markdown,
      author: {
        name: post.author?.name || post.user?.name || "Unknown Author",
        avatar: post.author?.avatar || post.user?.profile_image,
        bio: post.author?.bio || post.user?.summary,
        socialLinks: {
          twitter: post.author?.twitter || post.user?.twitter_username,
          github: post.author?.github || post.user?.github_username,
          website: post.author?.website || post.user?.website_url,
        },
      },
      source: "rapidapi",
      category: this.categorizePost(post.tags || []),
      tags: post.tags || [],
      originalUrl: post.url || post.canonical_url,
      imageUrl: post.image || post.cover_image,
      publishedAt: new Date(post.publishedAt || post.published_at),
      fetchedAt: new Date(),
      isActive: true,
      readTime: this.calculateReadTime(post.content || post.body_markdown),
      qualityScore: this.calculateQualityScore(post),
    }));

    // Upsert posts to database
    for (const post of processedPosts) {
      try {
        await BlogPost.findOneAndUpdate({ externalId: post.externalId }, post, {
          upsert: true,
          new: true,
        });
      } catch (error) {
        console.error("Error saving blog post:", error);
      }
    }

    return processedPosts;
  }

  // Helper methods
  mapCategoryToTag(category) {
    const categoryMap = {
      career: "career",
      technical: "programming",
      industry: "technology",
      skills: "beginners",
      tutorial: "tutorial",
      news: "news",
    };
    return categoryMap[category] || "programming";
  }

  transformDevToArticle(article) {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.description,
      content: article.body_markdown,
      author: {
        name: article.user.name,
        avatar: article.user.profile_image,
        bio: article.user.summary,
      },
      tags: article.tag_list,
      url: article.canonical_url,
      image: article.cover_image,
      publishedAt: article.published_at,
      category: this.categorizePost(article.tag_list),
    };
  }

  categorizePost(tags) {
    const categories = {
      career: ["career", "job", "interview", "resume", "hiring", "salary"],
      technical: [
        "programming",
        "coding",
        "development",
        "tech",
        "javascript",
        "python",
        "react",
        "node",
      ],
      industry: ["trends", "news", "industry", "market", "startup", "business"],
      skills: ["learning", "tutorial", "guide", "skill", "beginners", "tips"],
      tutorial: ["tutorial", "howto", "guide", "course", "lesson"],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (
        tags.some((tag) =>
          keywords.some((keyword) => tag.toLowerCase().includes(keyword))
        )
      ) {
        return category;
      }
    }

    return "technical"; // Default category
  }

  generateExcerpt(content, maxLength = 200) {
    if (!content) return "";

    // Remove markdown and HTML
    const plainText = content
      .replace(/[#*_`\[\]()]/g, "")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (plainText.length <= maxLength) return plainText;

    return plainText.substring(0, maxLength).trim() + "...";
  }

  calculateReadTime(content) {
    if (!content) return 1;

    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  calculateQualityScore(post) {
    let score = 50; // Base score

    // Title quality
    if (post.title && post.title.length > 10) score += 10;

    // Content length
    const contentLength = (post.content || "").length;
    if (contentLength > 500) score += 15;
    if (contentLength > 2000) score += 10;

    // Has image
    if (post.image) score += 10;

    // Has tags
    if (post.tags && post.tags.length > 0) score += 10;

    // Author info
    if (post.author?.name) score += 5;

    return Math.min(100, score);
  }

  // Search blog posts
  async searchPosts(query, filters = {}) {
    const { category, tags, limit = 20 } = filters;

    try {
      // Search in database first
      const searchQuery = {
        isActive: true,
        moderationStatus: "approved",
        $text: { $search: query },
      };

      if (category) searchQuery.category = category;
      if (tags) searchQuery.tags = { $in: tags.split(",") };

      const posts = await BlogPost.find(searchQuery)
        .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
        .limit(limit)
        .lean();

      return posts;
    } catch (error) {
      console.error("Blog search error:", error);
      return [];
    }
  }

  // Get trending posts
  async getTrendingPosts(timeframe = 7, limit = 10) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      return await BlogPost.find({
        isActive: true,
        publishedAt: { $gte: startDate },
      })
        .sort({ views: -1, bookmarkCount: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Get trending posts error:", error);
      return [];
    }
  }
}

module.exports = new BlogService();
