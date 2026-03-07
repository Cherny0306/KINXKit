/**
 * Express 应用配置
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { errorHandler } from './middleware/error.js';
import { loggerMiddleware } from './middleware/logger.js';
import healthRouter from './routes/health.js';
import apiRouter from './routes/index.js';

export function createApp(): Application {
  const app = express();

  // 安全中间件
  app.use(helmet());

  // CORS 配置
  app.use(cors({
    origin: config.cors.origin,
    credentials: true
  }));

  // 日志中间件
  app.use(morgan('combined'));
  app.use(loggerMiddleware);

  // Body 解析
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 路由
  app.use('/health', healthRouter);
  app.use('/api', apiRouter);

  // 错误处理
  app.use(errorHandler);

  return app;
}
