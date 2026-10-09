import { Router } from 'express';
import { handleN8nCallback, approvePost, rejectPost } from '../controllers/approvalController.js';

const router = Router();

// Callback nhận kết quả từ n8n
router.post('/webhooks/n8n-callback', handleN8nCallback);

// API duyệt / từ chối bài viết
router.patch('/posts/:id/approve', approvePost);
router.patch('/posts/:id/reject', rejectPost);

export default router;
