/**
 * API 路由
 */

import { Router } from 'express';
import apiRouter from './api/index.js';

const router = Router();

// 挂载所有 API 路由
router.use('/', apiRouter);

export default router;
