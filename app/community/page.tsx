"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Plus,
  Search,
  Pin,
  Lock,
  CheckCircle2,
  User,
  Trophy,
} from "lucide-react";

type PostCategory =
  | "ONBOARDING"
  | "EQUIPMENT"
  | "PROCESS"
  | "QUALITY"
  | "LOGISTICS"
  | "SAFETY"
  | "GENERAL";

type Post = {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isLocked: boolean;
  acceptedAnswerId: string | null;
  author: {
    id: string;
    username: string;
    reputation: number;
  };
  votes: Array<{ id: string; userId: string; value: number }>;
  answers: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      username: string;
      reputation: number;
    };
  }>;
  voteScore: number;
  answerCount: number;
  userVote?: number | null;
};

type User = {
  id: string;
  username: string;
  reputation: number;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [topContributors, setTopContributors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [sort, setSort] = useState("newest");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>("GENERAL");
  const [newAnswerContent, setNewAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
    loadPosts();
    loadTopContributors();
  }, [search, category, sort]);

  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "ALL") params.set("category", category);
      params.set("sort", sort);

      const res = await fetch(`/api/community/posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopContributors = async () => {
    try {
      const res = await fetch("/api/community/contributors");
      if (res.ok) {
        const data = await res.json();
        setTopContributors(data);
      }
    } catch (error) {
      console.error("Failed to load contributors:", error);
    }
  };

  const loadPostDetail = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    }
  };

  const handleVote = async (postId: string, value: number) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  voteScore: data.voteScore,
                  userVote: data.userVote,
                }
              : p
          )
        );
        if (selectedPost?.id === postId) {
          setSelectedPost({
            ...selectedPost,
            voteScore: data.voteScore,
            userVote: data.userVote,
          });
        }
        loadTopContributors();
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
        }),
      });

      if (res.ok) {
        setIsCreateDialogOpen(false);
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostCategory("GENERAL");
        loadPosts();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnswer = async () => {
    if (!selectedPost || !newAnswerContent.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/community/posts/${selectedPost.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newAnswerContent }),
      });

      if (res.ok) {
        const answer = await res.json();
        setSelectedPost({
          ...selectedPost,
          answers: [...selectedPost.answers, answer],
          answerCount: selectedPost.answerCount + 1,
        });
        setNewAnswerContent("");
        loadPosts();
      }
    } catch (error) {
      console.error("Failed to create answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/community/posts/${selectedPost.id}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });

      if (res.ok) {
        await loadPostDetail(selectedPost.id);
        loadTopContributors();
      }
    } catch (error) {
      console.error("Failed to accept answer:", error);
    }
  };

  const getAvatar = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const categoryColors: Record<PostCategory, string> = {
    ONBOARDING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EQUIPMENT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    PROCESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    QUALITY: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    LOGISTICS: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    SAFETY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Topbar title="Community Forum" />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category || "ALL"} onValueChange={(v) => setCategory(v === "ALL" ? "" : v)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                  <SelectItem value="PROCESS">Process</SelectItem>
                  <SelectItem value="QUALITY">Quality</SelectItem>
                  <SelectItem value="LOGISTICS">Logistics</SelectItem>
                  <SelectItem value="SAFETY">Safety</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="most-commented">Most Commented</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Post title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Post content..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={8}
                  />
                  <Select
                    value={newPostCategory}
                    onValueChange={(v) => setNewPostCategory(v as PostCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                      <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                      <SelectItem value="PROCESS">Process</SelectItem>
                      <SelectItem value="QUALITY">Quality</SelectItem>
                      <SelectItem value="LOGISTICS">Logistics</SelectItem>
                      <SelectItem value="SAFETY">Safety</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleCreatePost}
                    disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                    className="w-full"
                  >
                    {submitting ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No posts found</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => loadPostDetail(post.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <Pin className="h-4 w-4 text-yellow-500" />
                          )}
                          {post.isLocked && (
                            <Lock className="h-4 w-4 text-gray-500" />
                          )}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[post.category]}`}
                          >
                            {post.category}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {getAvatar(post.author.username)}
                            </span>
                          </div>
                          <span className="hidden sm:inline">{post.author.username}</span>
                          <span className="sm:hidden">{post.author.username.length > 10 ? post.author.username.substring(0, 10) + '...' : post.author.username}</span>
                          <span className="text-xs">({post.author.reputation})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.answerCount}</span>
                        </div>
                        <span className="hidden sm:inline">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="sm:hidden text-xs">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post.id, 1);
                          }}
                          className={post.userVote === 1 ? "text-green-600" : ""}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-[2rem] text-center">
                          {post.voteScore}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post.id, -1);
                          }}
                          className={post.userVote === -1 ? "text-red-600" : ""}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 space-y-6 lg:border-l lg:pl-6 lg:border-gray-200 dark:lg:border-gray-800">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContributors.map((user, idx) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {getAvatar(user.username)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.reputation} reputation
                      </div>
                    </div>
                    {idx < 3 && (
                      <span className="text-yellow-500 font-bold">#{idx + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {selectedPost.isPinned && (
                  <Pin className="h-5 w-5 text-yellow-500" />
                )}
                {selectedPost.isLocked && (
                  <Lock className="h-5 w-5 text-gray-500" />
                )}
                <DialogTitle>{selectedPost.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[selectedPost.category]}`}
                  >
                    {selectedPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {getAvatar(selectedPost.author.username)}
                      </span>
                    </div>
                    <span>{selectedPost.author.username}</span>
                    <span>({selectedPost.author.reputation})</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(selectedPost.id, 1)}
                    className={selectedPost.userVote === 1 ? "text-green-600" : ""}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{selectedPost.voteScore}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(selectedPost.id, -1)}
                    className={selectedPost.userVote === -1 ? "text-red-600" : ""}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">
                  Answers ({selectedPost.answers.length})
                </h3>
                <div className="space-y-4 mb-6">
                  {selectedPost.answers.map((answer) => (
                    <Card
                      key={answer.id}
                      className={
                        selectedPost.acceptedAnswerId === answer.id
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : ""
                      }
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {getAvatar(answer.author.username)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{answer.author.username}</div>
                              <div className="text-xs text-gray-500">
                                {answer.author.reputation} reputation
                              </div>
                            </div>
                          </div>
                          {selectedPost.acceptedAnswerId === answer.id && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="text-sm font-medium">Accepted</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {answer.content}
                        </p>
                        {currentUser?.id === selectedPost.author.id &&
                          !selectedPost.acceptedAnswerId &&
                          answer.id !== selectedPost.acceptedAnswerId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => handleAcceptAnswer(answer.id)}
                            >
                              Accept Answer
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {!selectedPost.isLocked && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your answer..."
                      value={newAnswerContent}
                      onChange={(e) => setNewAnswerContent(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={handleCreateAnswer}
                      disabled={submitting || !newAnswerContent.trim()}
                    >
                      {submitting ? "Posting..." : "Post Answer"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

