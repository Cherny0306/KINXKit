/**
 * 配置管理
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  logLevel: string;
  cors: {
    origin: string | string[];
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};
