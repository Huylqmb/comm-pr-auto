"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ThumbsUp, MessageSquare, Share2, Globe, Send, AlertTriangle, ShieldCheck } from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  sentiment: string;
  replyText?: string;
}

interface Post {
  id: string;
  topic: string;
  headline?: string;
  content?: string;
  bannerUrl?: string;
  platform: string;
  status: string;
  createdAt: string;
  comments?: CommentItem[];
}

export default function SimulatorPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const fetchPublishedPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/posts`);
      if (res.data.success) {
        // Lọc bài viết đã được phê duyệt hoặc cảnh báo khủng hoảng
        const published = res.data.data.filter(
          (p: Post) => p.status === "APPROVED" || p.status === "PUBLISHED" || p.status === "CRISIS_ALERT"
        );
        setPosts(published);
      }
    } catch (err) {
      console.error("Lỗi khi tải feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment: CommentItem = {
            id: Date.now().toString(),
            author: "Người dùng mạng xã hội",
            text,
            sentiment: "NEUTRAL",
          };
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social Media Feed Simulator</h2>
        <p className="text-slate-500 mt-1">
          Bảng tin mô phỏng các bài viết PR đã được duyệt và tương tác bình luận của cộng đồng.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Đang tải bảng tin mô phỏng...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Chưa có bài viết nào được xuất bản. Hãy sang trang <strong>Phê duyệt</strong> để duyệt các bài chờ.
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  PR
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">Brand Official Page</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                      {post.platform}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                    <span>•</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {post.status === "CRISIS_ALERT" ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Cảnh báo khủng hoảng
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Đã xuất bản
                </span>
              )}
            </div>

            {/* Post Body */}
            <div className="p-4 space-y-3">
              {post.headline && <h4 className="font-bold text-base text-slate-900">{post.headline}</h4>}
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{post.content}</p>
            </div>

            {/* Post Banner */}
            {post.bannerUrl && (
              <div className="border-t border-b border-slate-100 bg-slate-950 flex items-center justify-center">
                <img
                  src={post.bannerUrl}
                  alt="Campaign Visual"
                  className="w-full max-h-[420px] object-cover"
                />
              </div>
            )}

            {/* Social Engagement Buttons */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-around text-slate-600 text-xs font-semibold">
              <button className="flex items-center space-x-1.5 py-1 px-3 hover:bg-slate-100 rounded-md transition">
                <ThumbsUp className="w-4 h-4" /> <span>Thích</span>
              </button>
              <button className="flex items-center space-x-1.5 py-1 px-3 hover:bg-slate-100 rounded-md transition">
                <MessageSquare className="w-4 h-4" /> <span>Bình luận</span>
              </button>
              <button className="flex items-center space-x-1.5 py-1 px-3 hover:bg-slate-100 rounded-md transition">
                <Share2 className="w-4 h-4" /> <span>Chia sẻ</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 bg-slate-50 space-y-3">
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2">
                  {post.comments.map((cmt) => (
                    <div key={cmt.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{cmt.author}</span>
                        {cmt.sentiment === "CRISIS" && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                            Tiêu cực cao
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700">{cmt.text}</p>
                      {cmt.replyText && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-400 text-slate-600 italic">
                          <strong>Admin:</strong> {cmt.replyText}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Viết bình luận giả lập..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment(post.id, commentInputs[post.id] || "");
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAddComment(post.id, commentInputs[post.id] || "")}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
