/**
 * 配置预设系统
 */

import { logger } from '../utils/logger.js';

/**
 * 预设类型
 */
export enum PresetType {
  AI_SERVICE = 'ai_service',
  DATABASE = 'database',
  FRAMEWORK = 'framework',
  CACHE = 'cache'
}

/**
 * AI 服务预设
 */
export interface AIServicePreset {
  name: string;
  displayName: string;
  description: string;
  baseUrl: string;
  docsUrl: string;
  pricingUrl?: string;
  envVars: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
    maxTokens?: string;
    temperature?: string;
  };
  validation: {
    apiKeyPattern: RegExp;
    baseUrlRequired: boolean;
  };
  examples: {
    simple: string;
    advanced: string;
  };
}

/**
 * 数据库预设
 */
export interface DatabasePreset {
  name: string;
  displayName: string;
  description: string;
  defaultPort: number;
  dockerImage?: string;
  envVars: {
    host?: string;
    port?: string;
    database?: string;
    username?: string;
    password?: string;
    connectionString?: string;
  };
  features: string[];
  sslSupport: boolean;
  connectionPoolSupport: boolean;
}

/**
 * 配置预设管理器
 */
export class ConfigPresetManager {
  private aiServicePresets: Map<string, AIServicePreset> = new Map();
  private databasePresets: Map<string, DatabasePreset> = new Map();

  constructor() {
    this.initializeAIServicePresets();
    this.initializeDatabasePresets();
  }

  /**
   * 初始化 AI 服务预设
   */
  private initializeAIServicePresets() {
    // OpenAI
    this.aiServicePresets.set('openai', {
      name: 'openai',
      displayName: 'OpenAI',
      description: 'OpenAI GPT API - 最强大的大型语言模型',
      baseUrl: 'https://api.openai.com/v1',
      docsUrl: 'https://platform.openai.com/docs',
      pricingUrl: 'https://openai.com/pricing',
      envVars: {
        apiKey: 'OPENAI_API_KEY',
        baseUrl: 'OPENAI_BASE_URL',
        model: 'OPENAI_MODEL',
        maxTokens: 'OPENAI_MAX_TOKENS',
        temperature: 'OPENAI_TEMPERATURE'
      },
      validation: {
        apiKeyPattern: /^sk-[a-zA-Z0-9]{48}$/,
        baseUrlRequired: false
      },
      examples: {
        simple: 'gpt-3.5-turbo',
        advanced: 'gpt-4-turbo-preview'
      }
    });

    // DeepSeek
    this.aiServicePresets.set('deepseek', {
      name: 'deepseek',
      displayName: 'DeepSeek',
      description: 'DeepSeek AI - 国产高性能大语言模型',
      baseUrl: 'https://api.deepseek.com/v1',
      docsUrl: 'https://platform.deepseek.com/api-docs/',
      pricingUrl: 'https://platform.deepseek.com/pricing',
      envVars: {
        apiKey: 'DEEPSEEK_API_KEY',
        baseUrl: 'DEEPSEEK_BASE_URL',
        model: 'DEEPSEEK_MODEL'
      },
      validation: {
        apiKeyPattern: /^sk-[a-zA-Z0-9]{48}$/,
        baseUrlRequired: false
      },
      examples: {
        simple: 'deepseek-chat',
        advanced: 'deepseek-coder'
      }
    });

    // 智谱 AI
    this.aiServicePresets.set('zhipu', {
      name: 'zhipu',
      displayName: '智谱 AI',
      description: '智谱 AI GLM - 国产领先的大语言模型',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      docsUrl: 'https://open.bigmodel.cn/dev/api',
      pricingUrl: 'https://open.bigmodel.cn/pricing',
      envVars: {
        apiKey: 'ZHIPU_API_KEY',
        baseUrl: 'ZHIPU_BASE_URL',
        model: 'ZHIPU_MODEL'
      },
      validation: {
        apiKeyPattern: /^[a-f0-9]{64}$/,
        baseUrlRequired: false
      },
      examples: {
        simple: 'glm-4-flash',
        advanced: 'glm-4-0520'
      }
    });

    // Anthropic Claude
    this.aiServicePresets.set('anthropic', {
      name: 'anthropic',
      displayName: 'Anthropic',
      description: 'Anthropic Claude - 安全、强大的 AI 助手',
      baseUrl: 'https://api.anthropic.com/v1',
      docsUrl: 'https://docs.anthropic.com',
      pricingUrl: 'https://www.anthropic.com/pricing',
      envVars: {
        apiKey: 'ANTHROPIC_API_KEY',
        baseUrl: 'ANTHROPIC_BASE_URL',
        model: 'ANTHROPIC_MODEL',
        maxTokens: 'ANTHROPIC_MAX_TOKENS'
      },
      validation: {
        apiKeyPattern: /^sk-ant-[a-zA-Z0-9_-]{95}$/,
        baseUrlRequired: false
      },
      examples: {
        simple: 'claude-3-haiku-20240307',
        advanced: 'claude-3-opus-20240229'
      }
    });

    // Azure OpenAI
    this.aiServicePresets.set('azure-openai', {
      name: 'azure-openai',
      displayName: 'Azure OpenAI',
      description: 'Azure OpenAI Service - 企业级 AI 服务',
      baseUrl: 'https://{resource}.openai.azure.com',
      docsUrl: 'https://learn.microsoft.com/azure/cognitive-services/openai/',
      envVars: {
        apiKey: 'AZURE_OPENAI_API_KEY',
        baseUrl: 'AZURE_OPENAI_ENDPOINT',
        model: 'AZURE_OPENAI_DEPLOYMENT_NAME'
      },
      validation: {
        apiKeyPattern: /^[a-f0-9]{32}$/,
        baseUrlRequired: true
      },
      examples: {
        simple: 'gpt-35-turbo',
        advanced: 'gpt-4'
      }
    });

    // 月之暗面 Kimi
    this.aiServicePresets.set('moonshot', {
      name: 'moonshot',
      displayName: 'Moonshot AI',
      description: 'Moonshot AI Kimi - 长文本理解专家',
      baseUrl: 'https://api.moonshot.cn/v1',
      docsUrl: 'https://platform.moonshot.cn/docs',
      envVars: {
        apiKey: 'MOONSHOT_API_KEY',
        baseUrl: 'MOONSHOT_BASE_URL',
        model: 'MOONSHOT_MODEL'
      },
      validation: {
        apiKeyPattern: /^sk-[a-zA-Z0-9]{48}$/,
        baseUrlRequired: false
      },
      examples: {
        simple: 'moonshot-v1-8k',
        advanced: 'moonshot-v1-32k'
      }
    });
  }

  /**
   * 初始化数据库预设
   */
  private initializeDatabasePresets() {
    // PostgreSQL
    this.databasePresets.set('postgresql', {
      name: 'postgresql',
      displayName: 'PostgreSQL',
      description: '强大的开源对象关系数据库',
      defaultPort: 5432,
      dockerImage: 'postgres:16-alpine',
      envVars: {
        host: 'POSTGRES_HOST',
        port: 'POSTGRES_PORT',
        database: 'POSTGRES_DB',
        username: 'POSTGRES_USER',
        password: 'POSTGRES_PASSWORD'
      },
      features: [
        'ACID 事务',
        '复杂查询',
        '全文搜索',
        'JSON 支持',
        '扩展性强'
      ],
      sslSupport: true,
      connectionPoolSupport: true
    });

    // MySQL
    this.databasePresets.set('mysql', {
      name: 'mysql',
      displayName: 'MySQL',
      description: '流行的开源关系数据库',
      defaultPort: 3306,
      dockerImage: 'mysql:8.0',
      envVars: {
        host: 'MYSQL_HOST',
        port: 'MYSQL_PORT',
        database: 'MYSQL_DATABASE',
        username: 'MYSQL_USER',
        password: 'MYSQL_PASSWORD'
      },
      features: [
        '高性能',
        '易用性',
        '广泛支持',
        '复制和集群'
      ],
      sslSupport: true,
      connectionPoolSupport: true
    });

    // MongoDB
    this.databasePresets.set('mongodb', {
      name: 'mongodb',
      displayName: 'MongoDB',
      description: '领先的 NoSQL 文档数据库',
      defaultPort: 27017,
      dockerImage: 'mongo:7',
      envVars: {
        host: 'MONGO_HOST',
        port: 'MONGO_PORT',
        database: 'MONGO_DATABASE',
        username: 'MONGO_USERNAME',
        password: 'MONGO_PASSWORD',
        connectionString: 'MONGO_CONNECTION_STRING'
      },
      features: [
        '灵活的文档模型',
        '高可扩展性',
        '自动分片',
        '丰富查询语言'
      ],
      sslSupport: true,
      connectionPoolSupport: true
    });

    // SQLite
    this.databasePresets.set('sqlite', {
      name: 'sqlite',
      displayName: 'SQLite',
      description: '轻量级嵌入式数据库',
      defaultPort: 0,
      envVars: {
        database: 'SQLITE_DATABASE_PATH'
      },
      features: [
        '零配置',
        '单文件',
        '跨平台',
        '事务支持'
      ],
      sslSupport: false,
      connectionPoolSupport: false
    });

    // Redis
    this.databasePresets.set('redis', {
      name: 'redis',
      displayName: 'Redis',
      description: '高性能键值存储和缓存',
      defaultPort: 6379,
      dockerImage: 'redis:7-alpine',
      envVars: {
        host: 'REDIS_HOST',
        port: 'REDIS_PORT',
        password: 'REDIS_PASSWORD',
        connectionString: 'REDIS_URL'
      },
      features: [
        '极速性能',
        '丰富数据结构',
        '持久化',
        '复制和集群'
      ],
      sslSupport: true,
      connectionPoolSupport: true
    });
  }

  /**
   * 获取所有 AI 服务预设
   */
  getAIServicePresets(): AIServicePreset[] {
    return Array.from(this.aiServicePresets.values());
  }

  /**
   * 获取 AI 服务预设
   */
  getAIServicePreset(name: string): AIServicePreset | undefined {
    return this.aiServicePresets.get(name.toLowerCase());
  }

  /**
   * 获取所有数据库预设
   */
  getDatabasePresets(): DatabasePreset[] {
    return Array.from(this.databasePresets.values());
  }

  /**
   * 获取数据库预设
   */
  getDatabasePreset(name: string): DatabasePreset | undefined {
    return this.databasePresets.get(name.toLowerCase());
  }

  /**
   * 生成 AI 服务配置
   */
  async generateAIServiceConfig(
    presetName: string,
    apiKey: string,
    options?: {
      baseUrl?: string;
      model?: string;
    }
  ): Promise<string> {
    const preset = this.getAIServicePreset(presetName);

    if (!preset) {
      throw new Error(`未找到 AI 服务预设: ${presetName}`);
    }

    // 验证 API 密钥
    if (!preset.validation.apiKeyPattern.test(apiKey)) {
      throw new Error(`API 密钥格式不正确，期望格式: ${preset.validation.apiKeyPattern}`);
    }

    // 生成配置
    const lines: string[] = [];
    lines.push(`# ${preset.displayName} 配置`);
    lines.push(`# 文档: ${preset.docsUrl}`);
    lines.push('');

    // API 密钥
    lines.push(`${preset.envVars.apiKey}=${apiKey}`);
    lines.push('');

    // Base URL（可选）
    if (preset.validation.baseUrlRequired || options?.baseUrl) {
      const url = options?.baseUrl || preset.baseUrl;
      lines.push(`${preset.envVars.baseUrl}=${url}`);
      lines.push('');
    }

    // 模型（可选）
    if (options?.model || preset.examples.simple) {
      const model = options?.model || preset.examples.simple;
      lines.push(`${preset.envVars.model}=${model}`);
      lines.push('');
    }

    // 默认参数
    if (preset.envVars.maxTokens) {
      lines.push(`${preset.envVars.maxTokens}=4096`);
      lines.push('');
    }

    if (preset.envVars.temperature) {
      lines.push(`${preset.envVars.temperature}=0.7`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 生成数据库配置
   */
  async generateDatabaseConfig(
    presetName: string,
    options?: {
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
    }
  ): Promise<{ envFile: string; dockerCompose: string }> {
    const preset = this.getDatabasePreset(presetName);

    if (!preset) {
      throw new Error(`未找到数据库预设: ${presetName}`);
    }

    const envLines: string[] = [];
    const composeLines: string[] = [];

    // 环境变量配置
    envLines.push(`# ${preset.displayName} 配置`);
    envLines.push(`# 描述: ${preset.description}`);
    envLines.push('');

    const host = options?.host || 'localhost';
    const port = options?.port || preset.defaultPort;
    const database = options?.database || 'mydb';
    const username = options?.username || 'user';
    const password = options?.password || 'password';

    // 如果是 SQLite
    if (preset.name === 'sqlite') {
      envLines.push(`${preset.envVars.database}=./data/database.db`);
      return {
        envFile: envLines.join('\n'),
        dockerCompose: ''
      };
    }

    // 其他数据库
    envLines.push(`${preset.envVars.host}=${host}`);
    envLines.push(`${preset.envVars.port}=${port}`);
    envLines.push(`${preset.envVars.database}=${database}`);
    envLines.push(`${preset.envVars.username}=${username}`);
    envLines.push(`${preset.envVars.password}=${password}`);
    envLines.push('');

    // Docker Compose 配置
    if (preset.dockerImage) {
      composeLines.push('services:');
      composeLines.push(`  ${preset.name}:`);
      composeLines.push(`    image: ${preset.dockerImage}`);
      composeLines.push(`    ports:`);
      composeLines.push(`      - "${port}:${preset.defaultPort}"`);
      composeLines.push(`    environment:`);
      if (preset.envVars.username) {
        composeLines.push(`      ${preset.envVars.username.toUpperCase()}: ${username}`);
      }
      if (preset.envVars.password) {
        composeLines.push(`      ${preset.envVars.password.toUpperCase()}: ${password}`);
      }
      if (preset.envVars.database) {
        composeLines.push(`      ${preset.envVars.database.toUpperCase()}: ${database}`);
      }
      composeLines.push(`    volumes:`);
      composeLines.push(`      - ${preset.name}_data:/data`);
      composeLines.push(`    restart: unless-stopped`);
      composeLines.push('');
      composeLines.push('volumes:');
      composeLines.push(`  ${preset.name}_data:`);
    }

    return {
      envFile: envLines.join('\n'),
      dockerCompose: composeLines.join('\n')
    };
  }

  /**
   * 搜索预设
   */
  searchPresets(query: string): { ai: AIServicePreset[]; databases: DatabasePreset[] } {
    const lowerQuery = query.toLowerCase();

    return {
      ai: this.getAIServicePresets().filter(preset =>
        preset.name.includes(lowerQuery) ||
        preset.displayName.includes(lowerQuery) ||
        preset.description.includes(lowerQuery)
      ),
      databases: this.getDatabasePresets().filter(preset =>
        preset.name.includes(lowerQuery) ||
        preset.displayName.includes(lowerQuery) ||
        preset.description.includes(lowerQuery)
      )
    };
  }

  /**
   * 获取推荐预设
   */
  getRecommendedPresets(projectType: string): { ai?: AIServicePreset; database?: DatabasePreset } {
    // 根据 AI/ML 项目推荐
    if (projectType.includes('ai') || projectType.includes('ml')) {
      return {
        ai: this.aiServicePresets.get('openai') || this.aiServicePresets.get('deepseek'),
        database: this.databasePresets.get('postgresql')
      };
    }

    // 根据数据分析项目推荐
    if (projectType.includes('data') || projectType.includes('analysis')) {
      return {
        ai: this.aiServicePresets.get('deepseek'),
        database: this.databasePresets.get('postgresql')
      };
    }

    // 根据 Web 应用推荐
    if (projectType.includes('web') || projectType.includes('api')) {
      return {
        database: this.databasePresets.get('postgresql')
      };
    }

    return {
      ai: this.aiServicePresets.get('openai'),
      database: this.databasePresets.get('postgresql')
    };
  }

  /**
   * 验证配置
   */
  async validatePresetConfig(
    presetType: PresetType,
    presetName: string,
    config: Record<string, string>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (presetType === PresetType.AI_SERVICE) {
      const preset = this.getAIServicePreset(presetName);
      if (!preset) {
        return { valid: false, errors: [`未找到预设: ${presetName}`] };
      }

      // 验证 API 密钥
      const apiKey = config[preset.envVars.apiKey];
      if (!apiKey) {
        errors.push(`缺少 API 密钥: ${preset.envVars.apiKey}`);
      } else if (!preset.validation.apiKeyPattern.test(apiKey)) {
        errors.push(`API 密钥格式不正确`);
      }

      // 验证 Base URL
      if (preset.validation.baseUrlRequired) {
        const baseUrlKey = preset.envVars.baseUrl;
        if (baseUrlKey) {
          const baseUrl = config[baseUrlKey];
          if (!baseUrl) {
            errors.push(`缺少 Base URL: ${baseUrlKey}`);
          }
        }
      }
    } else if (presetType === PresetType.DATABASE) {
      const preset = this.getDatabasePreset(presetName);
      if (!preset) {
        return { valid: false, errors: [`未找到预设: ${presetName}`] };
      }

      // 验证必需的环境变量
      if (preset.name !== 'sqlite') {
        if (preset.envVars.host && !config[preset.envVars.host]) {
          errors.push(`缺少主机地址: ${preset.envVars.host}`);
        }
        if (preset.envVars.username && !config[preset.envVars.username]) {
          errors.push(`缺少用户名: ${preset.envVars.username}`);
        }
        if (preset.envVars.password && !config[preset.envVars.password]) {
          errors.push(`缺少密码: ${preset.envVars.password}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 导出预设为 JSON
   */
  exportPresets(): string {
    return JSON.stringify({
      aiServices: Array.from(this.aiServicePresets.values()),
      databases: Array.from(this.databasePresets.values())
    }, null, 2);
  }

  /**
   * 从 JSON 导入预设
   */
  importPresets(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      // 导入 AI 服务预设
      if (data.aiServices) {
        data.aiServices.forEach((preset: AIServicePreset) => {
          this.aiServicePresets.set(preset.name, preset);
        });
      }

      // 导入数据库预设
      if (data.databases) {
        data.databases.forEach((preset: DatabasePreset) => {
          this.databasePresets.set(preset.name, preset);
        });
      }

      logger.success('预设导入成功');
    } catch (error) {
      logger.error('预设导入失败', { error });
      throw error;
    }
  }
}
