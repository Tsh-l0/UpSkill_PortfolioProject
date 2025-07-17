import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  User,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ExternalLink,
  Calendar,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Loading';

// Utils
import { formatRelativeTime, formatNumber } from '../../utils/formatters';

const BlogList = ({
  posts = [],
  viewMode = 'grid',
  isLoading = false,
  hasMore = false,
  onLoadMore = null,
  loadingMore = false,
  className = '',
}) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];

  // Handle bookmark toggle
  const toggleBookmark = async postId => {
    try {
      // Optimistic update
      const newBookmarks = new Set(bookmarkedPosts);
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId);
        toast.success('Removed from bookmarks');
      } else {
        newBookmarks.add(postId);
        toast.success('Added to bookmarks');
      }
      setBookmarkedPosts(newBookmarks);

      // TODO: Call API to update bookmark status
      // await blogAPI.toggleBookmark(postId);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  // Handle like toggle
  const toggleLike = async postId => {
    try {
      // Optimistic update
      const newLikes = new Set(likedPosts);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      setLikedPosts(newLikes);

      // TODO: Call API to update like status
      // await blogAPI.toggleLike(postId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
    }
  };

  // Handle share
  const sharePost = async post => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.origin + `/blog/${post.id || post.slug}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          window.location.origin + `/blog/${post.id || post.slug}`
        );
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share post');
    }
  };

  // Get category color
  const getCategoryColor = category => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      career: 'bg-green-100 text-green-800',
      'sa-tech': 'bg-purple-100 text-purple-800',
      networking: 'bg-orange-100 text-orange-800',
      tutorial: 'bg-indigo-100 text-indigo-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.default;
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        } ${className}`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={`blog-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Empty state
  if (safePosts.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No articles found
        </h3>
        <p className="text-gray-600">
          Check back later for new articles and resources.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Posts Grid/List */}
      <AnimatePresence>
        <motion.div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {safePosts.map((post, index) => {
            const postId = post.id || post._id || `post-${index}`;
            const isBookmarked = bookmarkedPosts.has(postId);
            const isLiked = likedPosts.has(postId);

            return (
              <motion.article
                key={postId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(
                            post.category
                          )}`}
                        >
                          {post.category.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Bookmark Button */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(postId);
                      }}
                      className="absolute top-4 right-4 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          isBookmarked
                            ? 'fill-current text-indigo-600'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-3">
                    <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                      {post.title}
                    </h2>
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags &&
                    Array.isArray(post.tags) &&
                    post.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={`${postId}-tag-${tagIndex}`}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            <Tag className="mr-1 h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  {/* Author & Meta */}
                  <div className="mb-4 flex items-center space-x-3">
                    <Avatar
                      src={post.author?.avatar || post.author?.profileImage}
                      alt={post.author?.name}
                      size="sm"
                      fallback={post.author?.name}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {post.author?.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {post.publishedAt
                            ? formatRelativeTime(post.publishedAt)
                            : 'Recently'}
                        </span>
                        {post.readTime && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {post.views && (
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          <span>{formatNumber(post.views)}</span>
                        </div>
                      )}
                      {post.likes !== undefined && (
                        <div className="flex items-center">
                          <Heart className="mr-1 h-4 w-4" />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                      )}
                      {post.comments !== undefined && (
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(postId);
                        }}
                        className={`transition-colors ${
                          isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                        />
                      </button>

                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          sharePost(post);
                        }}
                        className="text-gray-400 transition-colors hover:text-indigo-500"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>

                      <Link
                        to={`/blog/${post.id || post.slug}`}
                        className="font-medium text-indigo-600 transition-all group-hover:underline hover:text-indigo-700"
                        onClick={e => e.stopPropagation()}
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={onLoadMore}
            size="lg"
            variant="secondary"
            loading={loadingMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading More Articles...' : 'Load More Articles'}
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Showing {formatNumber(safePosts.length)} articles
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BlogList;
