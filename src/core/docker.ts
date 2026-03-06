/**
 * Docker 管理器
 *
 * 负责管理 Docker 容器和镜像
 */

import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DockerConfig } from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * Docker 管理器类
 */
export class DockerManager {
  private dockerAvailable: boolean = false;

  constructor() {
    this.checkDockerAvailability();
  }

  /**
   * 检查 Docker 是否可用
   */
  private async checkDockerAvailability(): Promise<void> {
    try {
      await execaCommand('docker --version');
      this.dockerAvailable = true;
    } catch {
      this.dockerAvailable = false;
      logger.warn('Docker 不可用');
    }
  }

  /**
   * 检查 Docker 是否可用
   */
  isAvailable(): boolean {
    return this.dockerAvailable;
  }

  /**
   * 构建 Docker 镜像
   */
  async build(path: string, dockerfileName: string = 'Dockerfile'): Promise<boolean> {
    if (!this.dockerAvailable) {
      throw new Error('Docker 不可用，请先安装 Docker');
    }

    try {
      logger.info('构建 Docker 镜像...', { path });

      const dockerfilePath = join(path, dockerfileName);

      // 检查 Dockerfile 是否存在
      await fs.access(dockerfilePath);

      // 执行 docker build
      await execaCommand(`docker build -t ${this.getImageName(path)} -f ${dockerfilePath} ${path}`);

      logger.success('Docker 镜像构建成功');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Docker 镜像构建失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 启动 Docker Compose 服务
   */
  async up(composePath: string, detached: boolean = true): Promise<boolean> {
    if (!this.dockerAvailable) {
      throw new Error('Docker 不可用，请先安装 Docker');
    }

    try {
      logger.info('启动 Docker 服务...');

      const composeFile = join(composePath, 'docker-compose.yml');

      // 检查 docker-compose.yml 是否存在
      await fs.access(composeFile);

      const args = ['compose', '-f', composeFile, 'up'];
      if (detached) {
        args.push('-d');
      }

      // 执行 docker compose up
      await execaCommand(`docker compose -f ${composeFile} up ${detached ? '-d' : ''}`);

      logger.success('Docker 服务启动成功');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Docker 服务启动失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 停止 Docker Compose 服务
   */
  async down(composePath: string, removeVolumes: boolean = false): Promise<boolean> {
    if (!this.dockerAvailable) {
      throw new Error('Docker 不可用，请先安装 Docker');
    }

    try {
      logger.info('停止 Docker 服务...');

      const composeFile = join(composePath, 'docker-compose.yml');

      // 检查 docker-compose.yml 是否存在
      await fs.access(composeFile);

      const args = ['compose', '-f', composeFile, 'down'];
      if (removeVolumes) {
        args.push('-v');
      }

      // 执行 docker compose down
      await execaCommand(`docker compose -f ${composeFile} down ${removeVolumes ? '-v' : ''}`);

      logger.success('Docker 服务已停止');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Docker 服务停止失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 查看服务日志
   */
  async logs(composePath: string, service?: string, follow: boolean = true): Promise<string> {
    if (!this.dockerAvailable) {
      throw new Error('Docker 不可用，请先安装 Docker');
    }

    try {
      const composeFile = join(composePath, 'docker-compose.yml');
      const cmd = `docker compose -f ${composeFile} logs ${follow ? '-f' : ''} ${service || ''}`;

      const { stdout } = await execaCommand(cmd);
      return stdout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('获取日志失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 查看服务状态
   */
  async status(composePath: string): Promise<ServiceStatus[]> {
    if (!this.dockerAvailable) {
      throw new Error('Docker 不可用，请先安装 Docker');
    }

    try {
      const composeFile = join(composePath, 'docker-compose.yml');
      const { stdout } = await execaCommand(`docker compose -f ${composeFile} ps --format json`);

      const services: ServiceStatus[] = JSON.parse(stdout);
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // 如果没有运行的服务，返回空数组
      if (errorMessage.includes('exit code')) {
        return [];
      }
      logger.error('获取服务状态失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 生成 Docker 配置
   */
  async generateConfig(projectName: string, projectType: string, useGPU: boolean = false): Promise<DockerConfig> {
    logger.info('生成 Docker 配置...', { projectName, projectType, useGPU });

    const dockerfile = this.generateDockerfile(projectType, useGPU);
    const compose = this.generateDockerCompose(projectName, projectType, useGPU);

    const config: DockerConfig = {
      dockerfile,
      compose,
      useGPU,
      ports: this.getPortsForProject(projectType),
      environment: this.getEnvironmentForProject(projectType),
      volumes: this.getVolumesForProject(projectType)
    };

    logger.success('Docker 配置生成完成');
    return config;
  }

  /**
   * 生成 Dockerfile
   */
  private generateDockerfile(projectType: string, useGPU: boolean): string {
    const baseImages: Record<string, string> = {
      ai_chatbot: 'python:3.11-slim',
      api_service: 'python:3.11-slim',
      web_app: 'node:20-alpine',
      data_analysis: 'python:3.11-slim',
      crawler: 'python:3.11-slim',
      utility: 'python:3.11-slim'
    };

    const baseImage = baseImages[projectType] || 'python:3.11-slim';

    let dockerfile = `FROM ${baseImage}\n\n`;
    dockerfile += `WORKDIR /app\n\n`;

    // AI 项目需要 GPU 支持
    if (useGPU) {
      if (projectType === 'ai_chatbot' || projectType === 'data_analysis') {
        dockerfile += `# Install system dependencies for GPU support\n`;
        dockerfile += `RUN apt-get update && apt-get install -y \\\n`;
        dockerfile += `    build-essential \\\n`;
        dockerfile += `    curl \\\n`;
        dockerfile += `    && rm -rf /var/lib/apt/lists/*\n\n`;
      }
    }

    // Python 项目
    if (['ai_chatbot', 'api_service', 'data_analysis', 'crawler', 'utility'].includes(projectType)) {
      dockerfile += `# Copy requirements file\n`;
      dockerfile += `COPY requirements.txt .\n\n`;
      dockerfile += `# Install Python dependencies\n`;
      dockerfile += `RUN pip install --no-cache-dir -r requirements.txt\n\n`;
      dockerfile += `# Copy application code\n`;
      dockerfile += `COPY app/ ./app/\n\n`;
    }

    // Node.js 项目
    if (projectType === 'web_app') {
      dockerfile += `# Copy package files\n`;
      dockerfile += `COPY package*.json ./\n\n`;
      dockerfile += `# Install dependencies\n`;
      dockerfile += `RUN npm install\n\n`;
      dockerfile += `# Copy application code\n`;
      dockerfile += `COPY src/ ./src/\n`;
      dockerfile += `COPY public/ ./public/\n\n`;
      dockerfile += `# Build application\n`;
      dockerfile += `RUN npm run build\n\n`;
    }

    // Expose port
    const port = this.getPortsForProject(projectType)[0];
    if (port) {
      dockerfile += `# Expose port\n`;
      dockerfile += `EXPOSE ${port}\n\n`;
    }

    // Health check
    dockerfile += `# Health check\n`;
    if (['ai_chatbot', 'api_service'].includes(projectType)) {
      dockerfile += `HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\\n`;
      dockerfile += `  CMD curl -f http://localhost:${port}/health || exit 1\n\n`;
    }

    // Start command
    dockerfile += `# Run the application\n`;
    if (projectType === 'web_app') {
      dockerfile += `CMD ["npm", "run", "start"]\n`;
    } else if (projectType === 'ai_chatbot' || projectType === 'api_service') {
      dockerfile += `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${port}"]\n`;
    } else {
      dockerfile += `CMD ["python", "app/main.py"]\n`;
    }

    return dockerfile;
  }

  /**
   * 生成 docker-compose.yml
   */
  private generateDockerCompose(projectName: string, projectType: string, useGPU: boolean): string {
    let compose = `version: '3.8'\n\n`;
    compose += `services:\n`;
    compose += `  app:\n`;
    compose += `    build: .\n`;
    compose += `    container_name: ${projectName}\n`;

    // Ports
    const ports = this.getPortsForProject(projectType);
    if (ports.length > 0) {
      compose += `    ports:\n`;
      ports.forEach(port => {
        compose += `      - "${port}:${port}"\n`;
      });
    }

    // Environment
    compose += `    environment:\n`;
    compose += `      - NODE_ENV=production\n`;

    // GPU support
    if (useGPU) {
      compose += `    deploy:\n`;
      compose += `      resources:\n`;
      compose += `        reservations:\n`;
      compose += `          devices:\n`;
      compose += `            - driver: nvidia\n`;
      compose += `              count: 1\n`;
      compose += `              capabilities: [gpu]\n`;
    }

    // Volumes
    compose += `    volumes:\n`;
    compose += `      - ./app:/app/app\n`;
    compose += `    restart: unless-stopped\n`;

    // Database service for some project types
    if (['ai_chatbot', 'api_service'].includes(projectType)) {
      compose += `    depends_on:\n`;
      compose += `      - db\n\n`;

      compose += `  db:\n`;
      compose += `    image: postgres:15-alpine\n`;
      compose += `    container_name: ${projectName}-db\n`;
      compose += `    environment:\n`;
      compose += `      - POSTGRES_USER=postgres\n`;
      compose += `      - POSTGRES_PASSWORD=postgres\n`;
      compose += `      - POSTGRES_DB=${projectName}\n`;
      compose += `    ports:\n`;
      compose += `      - "5432:5432"\n`;
      compose += `    volumes:\n`;
      compose += `      - postgres_data:/var/lib/postgresql/data\n`;
      compose += `    restart: unless-stopped\n\n`;

      compose += `volumes:\n`;
      compose += `  postgres_data:\n`;
    }

    return compose;
  }

  /**
   * 获取项目端口
   */
  private getPortsForProject(projectType: string): number[] {
    const ports: Record<string, number[]> = {
      ai_chatbot: [8000],
      api_service: [8000],
      web_app: [3000],
      data_analysis: [8888],
      crawler: [8080],
      utility: [8080]
    };

    return ports[projectType] || [];
  }

  /**
   * 获取项目环境变量
   */
  private getEnvironmentForProject(projectType: string): Record<string, string> {
    const env: Record<string, Record<string, string>> = {
      ai_chatbot: {
        OPENAI_API_KEY: '${OPENAI_API_KEY}',
        DATABASE_URL: 'postgresql+asyncpg://postgres:postgres@db:5432/${projectName}'
      },
      api_service: {
        DATABASE_URL: 'postgresql+asyncpg://postgres:postgres@db:5432/${projectName}'
      },
      web_app: {
        NODE_ENV: 'production'
      }
    };

    return env[projectType] || {};
  }

  /**
   * 获取项目卷挂载
   */
  private getVolumesForProject(projectType: string): string[] {
    const volumes: Record<string, string[]> = {
      ai_chatbot: ['./app:/app/app'],
      api_service: ['./app:/app/app'],
      web_app: ['./src:/app/src', './public:/app/public']
    };

    return volumes[projectType] || [];
  }

  /**
   * 获取镜像名称
   */
  private getImageName(path: string): string {
    const dirName = path.split('/').pop() || path.split('\\').pop();
    return `${dirName}:latest`;
  }
}

/**
 * 服务状态
 */
export interface ServiceStatus {
  name: string;
  state: string;
  health: string;
  exitcode: number;
}

// 导出单例
export const dockerManager = new DockerManager();
