/**
 * API 路由
 */

import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/hello
 * @desc    示例 API 端点
 * @access  Public
 */
router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from Express + TypeScript!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/echo
 * @desc    回显请求体
 * @access  Public
 */
router.post('/echo', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

export default router;
