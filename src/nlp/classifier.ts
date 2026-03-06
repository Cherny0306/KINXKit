/**
 * 意图分类器
 *
 * 负责理解用户描述，推荐合适的技术栈
 */

import { ProjectType, TechStack } from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * 关键词到项目类型的映射
 */
const KEYWORD_MAP: Record<string, ProjectType> = {
  // AI/机器学习类
  '聊天机器人': ProjectType.AI_CHATBOT,
  'chatgpt': ProjectType.AI_CHATBOT,
  '对话': ProjectType.AI_CHATBOT,
  '客服': ProjectType.AI_CHATBOT,
  'ai': ProjectType.AI_CHATBOT,
  '人工智能': ProjectType.AI_CHATBOT,
  '机器学习': ProjectType.ML_TRAINING,
  '深度学习': ProjectType.ML_TRAINING,
  '训练': ProjectType.ML_TRAINING,
  '模型': ProjectType.ML_TRAINING,
  '神经网络': ProjectType.ML_TRAINING,
  '推荐': ProjectType.RECOMMENDATION,
  '推荐系统': ProjectType.RECOMMENDATION,

  // Web应用类
  '博客': ProjectType.WEB_APP,
  'blog': ProjectType.WEB_APP,
  'cms': ProjectType.WEB_APP,
  '内容管理': ProjectType.WEB_APP,
  '电商': ProjectType.WEB_APP,
  '商城': ProjectType.WEB_APP,
  'shop': ProjectType.WEB_APP,
  '网站': ProjectType.WEB_APP,
  '仪表盘': ProjectType.WEB_APP,
  'dashboard': ProjectType.WEB_APP,
  '大屏': ProjectType.WEB_APP,
  '可视化': ProjectType.WEB_APP,

  // API/服务类
  'api': ProjectType.API_SERVICE,
  '接口': ProjectType.API_SERVICE,
  '后端': ProjectType.API_SERVICE,
  '服务': ProjectType.API_SERVICE,
  'rest': ProjectType.API_SERVICE,
  'graphql': ProjectType.API_SERVICE,

  // 数据分析类
  '数据分析': ProjectType.DATA_ANALYSIS,
  '数据挖掘': ProjectType.DATA_ANALYSIS,
  '报表': ProjectType.DATA_ANALYSIS,
  '数据可视化': ProjectType.DATA_ANALYSIS,

  // 爬虫类
  '爬虫': ProjectType.CRAWLER,
  'spider': ProjectType.CRAWLER,
  '数据采集': ProjectType.CRAWLER,

  // 工具类
  '脚本': ProjectType.UTILITY,
  '工具': ProjectType.UTILITY,
  '批处理': ProjectType.UTILITY,
  '自动化': ProjectType.UTILITY
};

/**
 * 项目类型到技术栈的映射
 */
const TYPE_STACK_MAP: Record<ProjectType, TechStack> = {
  [ProjectType.AI_CHATBOT]: {
    backend: 'FastAPI (Python)',
    frontend: 'Vue 3 + Element Plus',
    database: 'PostgreSQL',
    ai: 'OpenAI GPT-4o',
    container: 'Docker + Docker Compose',
    gpu: true
  },
  [ProjectType.API_SERVICE]: {
    backend: 'FastAPI (Python)',
    database: 'PostgreSQL',
    cache: 'Redis',
    docs: 'Swagger / OpenAPI',
    container: 'Docker + Docker Compose'
  },
  [ProjectType.WEB_APP]: {
    backend: 'Next.js',
    database: 'PostgreSQL / MongoDB',
    auth: 'NextAuth.js',
    container: 'Docker + Docker Compose'
  },
  [ProjectType.DATA_ANALYSIS]: {
    backend: 'Python',
    libs: 'Pandas + NumPy + Matplotlib',
    notebook: 'Jupyter',
    ui: 'Streamlit / Gradio',
    gpu: false,
    container: 'None'
  },
  [ProjectType.CRAWLER]: {
    backend: 'Python + Scrapy',
    queue: 'Redis + Celery',
    database: 'MongoDB / PostgreSQL',
    proxy: true,
    container: 'Docker + Docker Compose'
  },
  [ProjectType.UTILITY]: {
    backend: 'Python / Node.js',
    container: 'None',
    runtime: 'Python / Node.js',
    cli: 'Click / Commander.js',
    config: 'YAML / JSON'
  },
  [ProjectType.ML_TRAINING]: {
    backend: 'Python',
    ml: 'PyTorch / TensorFlow',
    gpu: true,
    notebook: 'Jupyter',
    container: 'Docker + GPU'
  },
  [ProjectType.RECOMMENDATION]: {
    backend: 'Python + FastAPI',
    ml: 'scikit-learn',
    database: 'PostgreSQL + Redis',
    gpu: false,
    container: 'Docker + Docker Compose'
  },
  [ProjectType.UNKNOWN]: {
    backend: 'Unknown',
    container: 'None'
  }
};

/**
 * 意图分类器类
 */
export class IntentClassifier {
  /**
   * 分类用户输入
   */
  classify(input: string): ProjectType {
    logger.debug('分类用户输入', { input });

    const lowerInput = input.toLowerCase();

    // 遍历关键词映射
    for (const [keyword, type] of Object.entries(KEYWORD_MAP)) {
      if (lowerInput.includes(keyword)) {
        logger.debug(`匹配到关键词: ${keyword} → ${type}`);
        return type;
      }
    }

    logger.debug('未匹配到关键词，返回 UNKNOWN');
    return ProjectType.UNKNOWN;
  }

  /**
   * 推荐技术栈
   */
  recommend(type: ProjectType, hasGPU: boolean = false): TechStack {
    logger.debug('推荐技术栈', { type, hasGPU });

    let stack = TYPE_STACK_MAP[type];

    // 如果没有 GPU，移除 GPU 相关配置
    if (!hasGPU && stack?.gpu) {
      delete stack.gpu;
    }

    // 如果没有 GPU 且是 AI 项目，给出警告
    if (!hasGPU && (type === ProjectType.AI_CHATBOT || type === ProjectType.ML_TRAINING)) {
      logger.warn('检测到无 GPU，AI/ML 项目性能可能受限');
    }

    return stack;
  }

  /**
   * 分析并推荐完整技术栈
   */
  async analyze(input: string, envInfo?: any): Promise<{ type: ProjectType; stack: TechStack }> {
    logger.info('分析项目需求...');

    // 1. 分类项目类型
    const type = this.classify(input);

    // 2. 检测是否有 GPU
    const hasGPU = envInfo?.cuda?.available || envInfo?.gpu !== undefined;

    // 3. 推荐技术栈
    const stack = this.recommend(type, hasGPU);

    logger.info('项目分析完成', { type, stack });
    return { type, stack };
  }

  /**
   * 获取项目类型的中文名称
   */
  getTypeName(type: ProjectType): string {
    const names: Record<ProjectType, string> = {
      [ProjectType.AI_CHATBOT]: 'AI聊天机器人',
      [ProjectType.API_SERVICE]: 'API服务',
      [ProjectType.WEB_APP]: 'Web应用',
      [ProjectType.DATA_ANALYSIS]: '数据分析',
      [ProjectType.CRAWLER]: '网络爬虫',
      [ProjectType.UTILITY]: '工具/脚本',
      [ProjectType.ML_TRAINING]: '机器学习训练',
      [ProjectType.RECOMMENDATION]: '推荐系统',
      [ProjectType.UNKNOWN]: '未知类型'
    };
    return names[type] || '未知类型';
  }

  /**
   * 获取项目类型描述
   */
  getTypeDescription(type: ProjectType): string {
    const descriptions: Record<ProjectType, string> = {
      [ProjectType.AI_CHATBOT]: '基于 AI 的对话式机器人，支持 GPT、DeepSeek 等多种模型',
      [ProjectType.API_SERVICE]: 'RESTful API 服务，适用于后端接口、微服务等场景',
      [ProjectType.WEB_APP]: '完整的 Web 应用，包含前端和后端，支持响应式设计',
      [ProjectType.DATA_ANALYSIS]: '数据分析和可视化项目，支持 Pandas、NumPy 等工具',
      [ProjectType.CRAWLER]: '网络爬虫和数据采集项目，支持代理池和分布式爬取',
      [ProjectType.UTILITY]: '工具脚本或命令行工具，自动化日常任务',
      [ProjectType.ML_TRAINING]: '机器学习模型训练项目，支持 PyTorch、TensorFlow 等',
      [ProjectType.RECOMMENDATION]: '推荐系统项目，支持协同过滤、内容推荐等算法',
      [ProjectType.UNKNOWN]: '未知项目类型'
    };
    return descriptions[type] || '暂无描述';
  }
}

// 导出单例
export const classifier = new IntentClassifier();
