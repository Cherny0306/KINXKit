/**
 * 配置管理模块
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * API 配置
 */
export interface ApiConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  description?: string;
}

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
}

/**
 * 环境变量配置
 */
export interface EnvConfig {
  apis: ApiConfig[];
  database?: DatabaseConfig;
  customVars?: Record<string, string>;
}

/**
 * 常用 API 服务预设
 */
const API_PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI GPT API'
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    description: 'DeepSeek AI API'
  },
  {
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱 AI GLM API'
  },
  {
    name: 'Azure OpenAI',
    baseUrl: 'https://{resource}.openai.azure.com',
    description: 'Azure OpenAI Service'
  },
  {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic Claude API'
  }
];

/**
 * 配置管理器
 */
export class ConfigManager {
  /**
   * 生成 .env 文件
   */
  async generateEnvFile(projectPath: string, config: EnvConfig): Promise<boolean> {
    try {
      logger.info('正在生成 .env 文件...');

      const envContent = this.buildEnvContent(config);
      const envPath = path.join(projectPath, '.env');

      await fs.writeFile(envPath, envContent, 'utf-8');

      logger.success('.env 文件生成成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('.env 文件生成失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 生成 .env.example 文件
   */
  async generateEnvExample(projectPath: string, config: EnvConfig): Promise<boolean> {
    try {
      logger.info('正在生成 .env.example 文件...');

      const envContent = this.buildEnvContent(config, true);
      const envExamplePath = path.join(projectPath, '.env.example');

      await fs.writeFile(envExamplePath, envContent, 'utf-8');

      logger.success('.env.example 文件生成成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('.env.example 文件生成失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 构建环境变量内容
   */
  private buildEnvContent(config: EnvConfig, mask: boolean = false): string {
    const lines: string[] = [];

    lines.push('# 环境变量配置文件');
    lines.push(`# 生成时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push('');

    // API 配置
    if (config.apis && config.apis.length > 0) {
      lines.push('# ========== API 服务配置 ==========');
      lines.push('');

      config.apis.forEach((api) => {
        const varName = this.toEnvVarName(api.name);

        if (api.description) {
          lines.push(`# ${api.description}`);
        }

        if (api.baseUrl) {
          lines.push(`${varName}_BASE_URL=${api.baseUrl}`);
        }

        lines.push(`${varName}_API_KEY=${mask ? 'your_api_key_here' : api.apiKey}`);
        lines.push('');
      });
    }

    // 数据库配置
    if (config.database) {
      lines.push('# ========== 数据库配置 ==========');
      lines.push('');

      const db = config.database;

      if (db.type === 'sqlite') {
        lines.push(`DATABASE_TYPE=sqlite`);
        lines.push(`DATABASE_PATH=./data/database.db`);
      } else {
        lines.push(`DATABASE_TYPE=${db.type}`);
        lines.push(`DATABASE_HOST=${db.host || 'localhost'}`);
        lines.push(`DATABASE_PORT=${db.port || this.getDefaultPort(db.type)}`);
        lines.push(`DATABASE_NAME=${db.database || 'mydb'}`);
        lines.push(`DATABASE_USER=${mask ? 'your_username' : (db.username || 'user')}`);
        lines.push(`DATABASE_PASSWORD=${mask ? 'your_password' : (db.password || 'password')}`);

        if (db.connectionString) {
          lines.push(`DATABASE_CONNECTION_STRING=${mask ? 'your_connection_string' : db.connectionString}`);
        }
      }

      lines.push('');
    }

    // 自定义变量
    if (config.customVars && Object.keys(config.customVars).length > 0) {
      lines.push('# ========== 自定义环境变量 ==========');
      lines.push('');

      Object.entries(config.customVars).forEach(([key, value]) => {
        lines.push(`${key}=${value}`);
      });

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 将名称转换为环境变量格式
   */
  private toEnvVarName(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .trim();
  }

  /**
   * 获取数据库默认端口
   */
  private getDefaultPort(dbType: string): number {
    const ports: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017
    };

    return ports[dbType] || 5432;
  }

  /**
   * 生成配置文件模板
   */
  async generateConfigTemplate(projectPath: string): Promise<boolean> {
    try {
      logger.info('正在生成配置文件模板...');

      const configTemplate = `/**
 * 应用配置文件
 */

export const config = {
  // API 配置
  apis: {
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY || '',
    },
  },

  // 数据库配置
  database: {
    type: process.env.DATABASE_TYPE || 'postgresql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'mydb',
    username: process.env.DATABASE_USER || 'user',
    password: process.env.DATABASE_PASSWORD || 'password',
  },

  // 应用配置
  app: {
    port: parseInt(process.env.APP_PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development',
  },

  // 其他配置
  // ...
};

export default config;
`;

      const configPath = path.join(projectPath, 'src', 'config');

      // 确保目录存在
      await fs.mkdir(configPath, { recursive: true });

      // 写入配置文件
      await fs.writeFile(path.join(configPath, 'index.ts'), configTemplate, 'utf-8');

      logger.success('配置文件模板生成成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('配置文件模板生成失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 验证 API 密钥格式
   */
  validateApiKey(apiKey: string, provider: string): { valid: boolean; message?: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, message: 'API 密钥不能为空' };
    }

    // 基本格式验证
    const patterns: Record<string, RegExp> = {
      OpenAI: /^sk-[a-zA-Z0-9]{48}$/,
      DeepSeek: /^sk-[a-zA-Z0-9]{48}$/,
      智谱: /^[a-f0-9]{64}$/,
      Azure: /^[a-f0-9]{32}$/,
      Anthropic: /^sk-ant-[a-zA-Z0-9_-]{95}$/
    };

    const pattern = patterns[provider];

    if (pattern && !pattern.test(apiKey)) {
      return {
        valid: false,
        message: `${provider} API 密钥格式不正确`
      };
    }

    return { valid: true };
  }

  /**
   * 获取 API 预设列表
   */
  getApiPresets(): typeof API_PRESETS {
    return API_PRESETS;
  }

  /**
   * 检查 .env 文件是否存在
   */
  async checkEnvFile(projectPath: string): Promise<boolean> {
    try {
      const envPath = path.join(projectPath, '.env');
      await fs.access(envPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 读取现有 .env 文件
   */
  async readEnvFile(projectPath: string): Promise<Record<string, string> | null> {
    try {
      const envPath = path.join(projectPath, '.env');
      const content = await fs.readFile(envPath, 'utf-8');

      const envVars: Record<string, string> = {};

      content.split('\n').forEach((line) => {
        // 跳过注释和空行
        if (line.trim().startsWith('#') || line.trim() === '') {
          return;
        }

        // 解析 KEY=VALUE
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && match[1] && match[2]) {
          envVars[match[1]] = match[2];
        }
      });

      return envVars;
    } catch (error) {
      return null;
    }
  }

  /**
   * 更新 .env 文件
   */
  async updateEnvFile(
    projectPath: string,
    updates: Record<string, string>
  ): Promise<boolean> {
    try {
      const envPath = path.join(projectPath, '.env');
      let content = '';

      try {
        content = await fs.readFile(envPath, 'utf-8');
      } catch {
        // 文件不存在，创建新的
      }

      // 更新或添加变量
      Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newValue = `${key}=${value}`;

        if (regex.test(content)) {
          content = content.replace(regex, newValue);
        } else {
          content += `${newValue}\n`;
        }
      });

      await fs.writeFile(envPath, content, 'utf-8');

      logger.success('.env 文件更新成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('.env 文件更新失败', { error: errorMessage });
      return false;
    }
  }
}
