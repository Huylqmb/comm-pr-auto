import axios from 'axios';
import prisma from '../prisma.js';

// GET /api/posts - Lấy danh sách bài viết
export const getPosts = async (req, res) => {
  try {
    const { status, campaignId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (campaignId) where.campaignId = campaignId;

    const posts = await prisma.post.findMany({
      where,
      include: { campaign: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/posts/:id - Lấy chi tiết bài viết
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { campaign: true, comments: true }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/posts/generate - Tạo bài viết nháp và kích hoạt webhook n8n
export const generatePost = async (req, res) => {
  try {
    const { topic, targetAudience, tone, platform, campaignId } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    // 1. Tạo bản ghi bài viết nháp trong PostgreSQL
    const newPost = await prisma.post.create({
      data: {
        topic,
        targetAudience: targetAudience || 'General Audience',
        tone: tone || 'Professional',
        platform: platform || 'Facebook',
        campaignId: campaignId || null,
        status: 'DRAFT'
      }
    });

    // 2. Kích hoạt Webhook n8n (Agent 1 & Agent 2)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/generate-post';

    axios.post(n8nWebhookUrl, {
      postId: newPost.id,
      topic: newPost.topic,
      target_audience: newPost.targetAudience,
      tone: newPost.tone,
      platform: newPost.platform
    }).catch((err) => {
      console.warn('[Warning] Webhook call to n8n failed or pending:', err.message);
    });

    // 3. Trả kết quả ngay cho phía gọi
    res.status(201).json({
      success: true,
      message: 'Post generation triggered successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
