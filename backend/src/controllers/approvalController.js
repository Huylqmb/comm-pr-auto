import prisma from '../prisma.js';

// 1. POST /api/webhooks/n8n-callback - Tiếp nhận kết quả từ n8n
export const handleN8nCallback = async (req, res) => {
  try {
    const { postId, content, bannerUrl, headline } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: 'postId is required' });
    }

    // Cập nhật nội dung AI và chuyển trạng thái sang PENDING_APPROVAL
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content || null,
        bannerUrl: bannerUrl || null,
        headline: headline || null,
        status: 'PENDING_APPROVAL'
      }
    });

    console.log(`[Webhook] Post ${postId} đã cập nhật nội dung từ n8n -> PENDING_APPROVAL`);

    res.json({
      success: true,
      message: 'Post updated successfully from n8n',
      data: updatedPost
    });
  } catch (error) {
    console.error('[Webhook Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. PATCH /api/posts/:id/approve - Phê duyệt xuất bản bài viết
export const approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, headline, bannerUrl } = req.body;

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'APPROVED',
        ...(content && { content }),
        ...(headline && { headline }),
        ...(bannerUrl && { bannerUrl })
      }
    });

    res.json({
      success: true,
      message: 'Bài viết đã được phê duyệt thành công!',
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. PATCH /api/posts/:id/reject - Từ chối bài viết
export const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    res.json({
      success: true,
      message: 'Bài viết đã bị từ chối',
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
