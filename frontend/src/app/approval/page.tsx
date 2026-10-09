"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, XCircle, RefreshCw, Edit3, Image as ImageIcon, Send, Clock } from "lucide-react";

interface Post {
  id: string;
  topic: string;
  headline?: string;
  content?: string;
  bannerUrl?: string;
  platform: string;
  status: string;
  createdAt: string;
}

export default function ApprovalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editHeadline, setEditHeadline] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/posts`);
      if (res.data.success) {
        // Lấy các bài viết đang chờ phê duyệt
        const pending = res.data.data.filter(
          (p: Post) => p.status === "PENDING_APPROVAL" || p.status === "DRAFT"
        );
        setPosts(pending);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách duyệt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleStartEdit = (post: Post) => {
    setEditingId(post.id);
    setEditHeadline(post.headline || post.topic || "");
    setEditContent(post.content || "");
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const payload: any = {};
      if (editingId === id) {
        payload.headline = editHeadline;
        payload.content = editContent;
      }

      const res = await axios.patch(`${apiUrl}/posts/${id}/approve`, payload);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setEditingId(null);
      }
    } catch (err: any) {
      alert("Lỗi duyệt bài: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.patch(`${apiUrl}/posts/${id}/reject`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setEditingId(null);
      }
    } catch (err: any) {
      alert("Lỗi từ chối bài: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quy trình Phê duyệt (Human-in-the-loop)</h2>
          <p className="text-slate-500 mt-1">
            Kiểm tra chất lượng bài viết do AI sinh ra, hiệu đính nội dung và phê duyệt trước khi phát hành.
          </p>
        </div>
        <button
          onClick={fetchPendingPosts}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Đang tải danh sách bài chờ duyệt...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">Hàng đợi trống</h3>
          <p className="text-sm text-slate-500">
            Hiện tại không có bài viết nào cần duyệt. Bạn có thể sang <strong>PR Content Studio</strong> để tạo bài mới.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isEditing = editingId === post.id;
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Visual Banner Preview */}
                <div className="lg:w-2/5 bg-slate-100 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {post.status}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {post.platform}
                    </span>
                  </div>

                  <div className="my-4">
                    {post.bannerUrl ? (
                      <div className="rounded-lg overflow-hidden border border-slate-300 shadow-inner">
                        <img
                          src={post.bannerUrl}
                          alt="AI Banner"
                          className="w-full h-52 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-52 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 space-y-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">Chưa có banner từ Pollinations</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-mono truncate">ID: {post.id}</p>
                </div>

                {/* Content Review & Actions */}
                <div className="lg:w-3/5 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editHeadline}
                            onChange={(e) => setEditHeadline(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm font-bold"
                          />
                        ) : (
                          post.headline || post.topic
                        )}
                      </h3>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(post)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 ml-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>
                      )}
                    </div>

                    <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {isEditing ? (
                        <textarea
                          rows={7}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="whitespace-pre-line">
                          {post.content || "Chưa có nội dung văn bản. Đang chờ AI xử lý..."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    {isEditing && (
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100"
                      >
                        Hủy sửa
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={actionLoading === post.id}
                      className="px-4 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50 transition flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={actionLoading === post.id}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading === post.id ? "Đang xử lý..." : "Duyệt & Xuất bản"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
