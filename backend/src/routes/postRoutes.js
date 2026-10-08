import { Router } from 'express';
import { getPosts, getPostById, generatePost } from '../controllers/postController.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/generate', generatePost);

export default router;
