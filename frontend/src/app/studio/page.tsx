"use client";

import { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, Send, Image as ImageIcon } from "lucide-react";

export default function StudioPage() {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("Gen Z và nhân viên văn phòng");
  const [tone, setTone] = useState("Truyền cảm hứng, tích cực");
  const [platform, setPlatform] = useState("Facebook");

  const [loading, setLoading] = useState(false);
  const [createdPost, setCreatedPost] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setCreatedPost(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${apiUrl}/posts/generate`, {
        topic,
        targetAudience,
        tone,
        platform,
      });

      if (res.data.success) {
        setCreatedPost(res.data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Tạo bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI PR Content Studio</h2>
        <p className="text-slate-500 mt-1">
          Tạo bài viết truyền thông chuẩn tone giọng và hình ảnh banner quảng bá tự động bằng AI (Agent 1 & Agent 2).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Thông tin chiến dịch PR</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đề bài viết / Sự kiện *</label>
              <textarea
                rows={3}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Ví dụ: Ra mắt dòng ly tái chế EcoCup bảo vệ môi trường..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Đối tượng mục tiêu (Audience)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tông giọng (Tone)</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Truyền cảm hứng, tích cực">Truyền cảm hứng</option>
                  <option value="Chuyên nghiệp, tin cậy">Chuyên nghiệp</option>
                  <option value="Hài hước, gần gũi">Hài hước, Gen Z</option>
                  <option value="Trang trọng, khẩn cấp">Khẩn cấp, thông cáo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nền tảng</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X">X (Twitter)</option>
                </select>
              </div>
            </div>

            {errorMsg && <p className="text-sm text-rose-500">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI đang soạn thảo & tạo ảnh...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kích hoạt AI tạo nội dung</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-800">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <span>Xem trước bài đăng ({platform})</span>
          </h3>

          {createdPost ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 space-y-3 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  PR
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Brand PR Page</h4>
                  <span className="text-xs text-slate-500">Vừa xong • Trạng thái: {createdPost.status}</span>
                </div>
              </div>

              <div className="text-sm text-slate-800 whitespace-pre-line">
                {createdPost.content || "Nội dung đang được n8n Agent 1 xử lý và lưu vào cơ sở dữ liệu..."}
              </div>

              {createdPost.bannerUrl ? (
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={createdPost.bannerUrl}
                    alt="AI Generated Banner"
                    className="w-full h-56 object-cover"
                  />
                </div>
              ) : (
                <div className="h-44 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-sm">
                  Ảnh banner từ Agent 2 sẽ xuất hiện ở đây khi n8n gửi callback
                </div>
              )}

              <div className="text-xs text-slate-500 italic">
                * Bài viết đã được tạo với mã ID: <span className="font-mono text-slate-700">{createdPost.id}</span>
              </div>
            </div>
          ) : (
            <div className="h-72 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300" />
              <p className="text-sm">Điền thông tin và bấm nút để xem kết quả trực quan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
