/**
 * KINXKit 核心类型定义
 */

// ========== 环境检测相关 ==========

/**
 * 环境检测结果
 */
export interface EnvironmentInfo {
  /** 操作系统类型 */
  os: string;
  /** 操作系统平台 */
  platform: 'win32' | 'darwin' | 'linux';
  /** 是否在 WSL2 环境中 */
  isWSL?: boolean;
  /** Docker 信息 */
  docker?: DockerInfo;
  /** Git 信息 */
  git?: GitInfo;
  /** Python 版本 */
  python?: string;
  /** Node.js 版本 */
  node?: string;
  /** 代理信息 */
  proxy?: ProxyInfo;
  /** GitHub 认证状态 */
  github?: GitHubInfo;
  /** CUDA 信息 */
  cuda?: CUDAInfo;
  /** GPU 信息 */
  gpu?: GPUInfo;
}

/**
 * Docker 信息
 */
export interface DockerInfo {
  /** 是否安装 */
  installed: boolean;
  /** Docker 版本 */
  version?: string;
  /** Docker Compose 版本 */
  composeVersion?: string;
}

/**
 * Git 信息
 */
export interface GitInfo {
  /** 是否安装 */
  installed: boolean;
  /** Git 版本 */
  version?: string;
  /** 用户名 */
  username?: string;
  /** 用户邮箱 */
  email?: string;
}

/**
 * 代理信息
 */
export interface ProxyInfo {
  /** 是否启用 */
  enabled: boolean;
  /** 代理类型 */
  type: 'http' | 'socks5';
  /** 代理主机 */
  host: string;
  /** 代理端口 */
  port: number;
  /** 代理来源 */
  source: 'env' | 'software' | 'manual';
  /** 代理软件名称（如果检测到） */
  software?: string;
}

/**
 * GitHub 信息
 */
export interface GitHubInfo {
  /** 是否已认证 */
  authenticated: boolean;
  /** 用户名 */
  username?: string;
  /** 认证方式 */
  authMethod?: 'cli' | 'token' | 'ssh';
}

/**
 * CUDA 信息
 */
export interface CUDAInfo {
  /** CUDA 是否可用 */
  available: boolean;
  /** CUDA 版本 */
  version?: string;
  /** 驱动版本 */
  driverVersion?: string;
  /** CUDA Toolkit 路径 */
  toolkitPath?: string;
  /** cuDNN 是否安装 */
  cuDNN?: boolean;
  /** nvcc 编译器路径 */
  nvccPath?: string;
}

/**
 * GPU 信息
 */
export interface GPUInfo {
  /** GPU 型号 */
  name: string;
  /** 显存大小 (MB) */
  memory: number;
  /** 驱动版本 */
  driverVersion?: string;
  /** 计算能力 */
  computeCapability?: string;
}

// ========== 项目类型相关 ==========

/**
 * 项目类型枚举
 */
export enum ProjectType {
  AI_CHATBOT = 'ai_chatbot',
  API_SERVICE = 'api_service',
  WEB_APP = 'web_app',
  DATA_ANALYSIS = 'data_analysis',
  CRAWLER = 'crawler',
  UTILITY = 'utility',
  ML_TRAINING = 'ml_training',
  RECOMMENDATION = 'recommendation',
  UNKNOWN = 'unknown'
}

/**
 * 技术栈配置
 */
export interface TechStack {
  /** 后端框架 */
  backend: string;
  /** 前端框架 */
  frontend?: string;
  /** 数据库 */
  database?: string;
  /** AI 服务 */
  ai?: string;
  /** 容器方案 */
  container: string;
  /** 是否使用 GPU */
  gpu?: boolean;
  /** Python 版本 */
  pythonVersion?: string;
  /** Node 版本 */
  nodeVersion?: string;
  /** 缓存 */
  cache?: string;
  /** 认证 */
  auth?: string;
  /** 库 */
  libs?: string;
  /** 队列 */
  queue?: string;
  /** 代理 */
  proxy?: boolean;
  /** 笔记本 */
  notebook?: string;
  /** UI 框架 */
  ui?: string;
  /** ML 框架 */
  ml?: string;
  /** CLI 框架 */
  cli?: string;
  /** 配置格式 */
  config?: string;
  /** 运行时 */
  runtime?: string;
  /** API 文档 */
  docs?: string;
}

/**
 * 项目配置
 */
export interface ProjectConfig {
  /** 项目名称 */
  name: string;
  /** 项目类型 */
  type: ProjectType;
  /** 项目描述 */
  description?: string;
  /** 项目路径 */
  path: string;
  /** 技术栈 */
  techStack: TechStack;
  /** API 密钥 */
  apiKeys?: Record<string, string>;
  /** 是否创建 GitHub 仓库 */
  createGitHub?: boolean;
  /** 是否初始化 Git */
  initGit?: boolean;
  /** 是否使用 Docker */
  useDocker?: boolean;
}

/**
 * 生成选项
 */
export interface GenerateOptions {
  /** 项目名称 */
  name: string;
  /** 项目路径 */
  path: string;
  /** 项目描述 */
  description?: string;
  /** 技术栈 */
  techStack?: TechStack;
  /** 是否覆盖已存在的文件 */
  overwrite?: boolean;
  /** API 密钥 */
  apiKeys?: Record<string, string>;
}

// ========== 错误处理相关 ==========

/**
 * KINXKit 基础错误类
 */
export class KinxError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'KinxError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 检测错误
 */
export class DetectionError extends KinxError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'DETECTION_ERROR', suggestions);
    this.name = 'DetectionError';
  }
}

/**
 * 生成错误
 */
export class GenerationError extends KinxError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'GENERATION_ERROR', suggestions);
    this.name = 'GenerationError';
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends KinxError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'CONFIG_ERROR', suggestions);
    this.name = 'ConfigurationError';
  }
}

// ========== 交互相关 ==========

/**
 * 选项定义
 */
export interface Option {
  /** 选项值 */
  value: string;
  /** 选项显示名称 */
  name: string;
  /** 选项描述 */
  description?: string;
}

/**
 * 选择配置
 */
export interface SelectConfig {
  /** 消息 */
  message: string;
  /** 选项列表 */
  choices: string[];
  /** 默认值 */
  default?: string;
}

/**
 * 输入配置
 */
export interface InputConfig {
  /** 消息 */
  message: string;
  /** 默认值 */
  default?: string;
  /** 验证函数 */
  validate?: (input: string) => boolean | string;
}

/**
 * 确认配置
 */
export interface ConfirmConfig {
  /** 消息 */
  message: string;
  /** 默认值 */
  default?: boolean;
}

// ========== 日志相关 ==========

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * 日志选项
 */
export interface LogOptions {
  /** 消息 */
  message: string;
  /** 数据 */
  data?: Record<string, any>;
  /** 换行 */
  newline?: boolean;
}

// ========== Docker 相关 ==========

/**
 * Docker 配置
 */
export interface DockerConfig {
  /** Dockerfile 内容 */
  dockerfile: string;
  /** docker-compose.yml 内容 */
  compose: string;
  /** 是否使用 GPU */
  useGPU?: boolean;
  /** 暴露端口 */
  ports?: number[];
  /** 环境变量 */
  environment?: Record<string, string>;
  /** 卷挂载 */
  volumes?: string[];
}

// ========== GitHub 相关 ==========

/**
 * GitHub 仓库选项
 */
export interface GitHubRepoOptions {
  /** 仓库名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 是否私有 */
  private?: boolean;
  /** 是否自动初始化 */
  autoInit?: boolean;
  /** Git 忽略模板 */
  gitignoreTemplate?: string;
  /** 许可证 */
  license?: string;
}
