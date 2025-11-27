// src/apps/social/SocialFeedPage.jsx
// Social feed with gratitude, wins, reflections, milestones

import React, { useState, useEffect } from "react";
import { Heart, Sparkles, Trophy, BookOpen, Plus, Eye, EyeOff } from "lucide-react";
import { getFeedPosts, postToFeed, reactToPost } from "@/services/socialService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const SocialFeedPage = () => {
  const { userId } = useSessionIdentity();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState("reflection");
  const [anonymized, setAnonymized] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
    // Refresh every 30 seconds
    const interval = setInterval(loadPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await getFeedPosts(50);
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postText.trim() || posting) return;

    setPosting(true);
    try {
      const result = await postToFeed(postText, postType, anonymized, userId);
      if (result.ok) {
        setPostText("");
        setShowPostForm(false);
        await loadPosts();
      } else {
        alert(result.error || "Failed to post");
      }
    } catch (err) {
      console.error("Failed to post:", err);
      alert("Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId, emoji) => {
    try {
      await reactToPost(postId, emoji, userId);
      await loadPosts();
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "gratitude":
        return <Heart className="h-4 w-4 text-pink-400" />;
      case "win":
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case "milestone":
        return <Sparkles className="h-4 w-4 text-wcGold" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-400" />;
    }
  };

  const reactions = [
    { emoji: "💙", label: "Here with you" },
    { emoji: "🌱", label: "Breathing with you" },
    { emoji: "🙏", label: "Thank you for sharing" },
    { emoji: "✨", label: "Grateful" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Social Feed" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Social Feed"
        subtitle="Share gratitude, wins, reflections, and milestones"
      />
      <div className="lux-shell py-10 space-y-6">
        {/* Post Form */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-wcGold/30 bg-wcGold/10 text-wcGold hover:bg-wcGold/20 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {showPostForm && (
          <div className="lux-card p-6 border border-white/10 bg-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Share to Feed</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["gratitude", "win", "reflection", "milestone"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${
                        postType === type
                          ? "bg-wcGold/20 text-wcGold border-wcGold/30"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Message
                </label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What would you like to share?"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnonymized(!anonymized)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition ${
                    anonymized
                      ? "bg-wcGold/20 text-wcGold border border-wcGold/30"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {anonymized ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{anonymized ? "Anonymous" : "Visible"}</span>
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPostForm(false);
                    setPostText("");
                  }}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!postText.trim() || posting}
                  className="px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            No posts yet. Be the first to share!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="lux-card p-6 border border-white/10 bg-white/5"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getTypeIcon(post.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white/70 capitalize">
                        {post.type}
                      </span>
                      {post.anonymized && (
                        <span className="text-xs text-white/50">Anonymous</span>
                      )}
                      <span className="text-xs text-white/50 ml-auto">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-white leading-relaxed">{post.text}</p>
                  </div>
                </div>
                
                {/* Reactions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => handleReaction(post.id, reaction.emoji)}
                      className="text-lg hover:scale-110 transition"
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeedPage;

