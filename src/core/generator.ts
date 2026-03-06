/**
 * 代码生成器
 *
 * 负责根据项目类型和技术栈生成项目代码
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import { ProjectType, GenerateOptions } from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * 代码生成器类
 */
export class CodeGenerator {
  private templatesPath: string;

  constructor() {
    this.templatesPath = join(process.cwd(), 'templates');
  }

  /**
   * 生成项目
   */
  async generate(projectType: ProjectType, options: GenerateOptions): Promise<void> {
    logger.info('开始生成项目...', { type: projectType, name: options.name });

    try {
      // 1. 生成项目结构
      const structure = await this.generateStructure(projectType, options);

      // 2. 创建目录结构
      await this.createDirectories(options.path, structure);

      // 3. 渲染并生成文件
      await this.renderFiles(projectType, options, structure);

      // 4. 生成配置文件
      await this.generateConfigFiles(projectType, options);

      logger.success('项目生成完成');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('项目生成失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 生成项目结构
   */
  private async generateStructure(
    projectType: ProjectType,
    options: GenerateOptions
  ): Promise<DirectoryTree> {
    switch (projectType) {
      case ProjectType.AI_CHATBOT:
        return this.getAIChatbotStructure(options);
      case ProjectType.API_SERVICE:
        return this.getAPIServiceStructure(options);
      case ProjectType.WEB_APP:
        return this.getWebAppStructure(options);
      case ProjectType.DATA_ANALYSIS:
        return this.getDataAnalysisStructure(options);
      case ProjectType.CRAWLER:
        return this.getCrawlerStructure(options);
      case ProjectType.UTILITY:
        return this.getUtilityStructure(options);
      default:
        throw new Error(`不支持的项目类型: ${projectType}`);
    }
  }

  /**
   * AI 聊天机器人项目结构
   */
  private getAIChatbotStructure(options: GenerateOptions): DirectoryTree {
    const useGPU = options.techStack?.gpu || false;

    return {
      name: options.name,
      type: 'directory',
      children: [
        {
          name: 'app',
          type: 'directory',
          children: [
            { name: 'main.py', type: 'file', template: 'ai-chatbot/main.py' },
            { name: 'ai.py', type: 'file', template: 'ai-chatbot/ai.py' },
            { name: 'models.py', type: 'file', template: 'ai-chatbot/models.py' },
            { name: 'config.py', type: 'file', template: 'ai-chatbot/config.py' }
          ]
        },
        {
          name: 'tests',
          type: 'directory',
          children: [
            { name: 'test_main.py', type: 'file', template: 'ai-chatbot/test_main.py' }
          ]
        },
        { name: 'requirements.txt', type: 'file', template: 'ai-chatbot/requirements.txt' },
        { name: '.env.example', type: 'file', template: 'ai-chatbot/env.example' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'ai-chatbot/README.md' },
        ...(useGPU
          ? [
              {
                name: 'Dockerfile',
                type: 'file' as const,
                template: 'ai-chatbot/Dockerfile.gpu'
              }
            ]
          : []),
        {
          name: 'docker-compose.yml',
          type: 'file' as const,
          template: 'ai-chatbot/docker-compose.yml'
        }
      ]
    };
  }

  /**
   * API 服务项目结构
   */
  private getAPIServiceStructure(options: GenerateOptions): DirectoryTree {
    return {
      name: options.name,
      type: 'directory',
      children: [
        {
          name: 'app',
          type: 'directory',
          children: [
            { name: 'main.py', type: 'file', template: 'api-service/main.py' },
            { name: 'routes.py', type: 'file', template: 'api-service/routes.py' },
            { name: 'models.py', type: 'file', template: 'api-service/models.py' },
            {
              name: 'database',
              type: 'directory',
              children: [
                { name: 'config.py', type: 'file', template: 'api-service/database.py' }
              ]
            }
          ]
        },
        { name: 'requirements.txt', type: 'file', template: 'api-service/requirements.txt' },
        { name: '.env.example', type: 'file', template: 'api-service/env.example' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'api-service/README.md' },
        { name: 'Dockerfile', type: 'file', template: 'api-service/Dockerfile' },
        { name: 'docker-compose.yml', type: 'file', template: 'api-service/docker-compose.yml' }
      ]
    };
  }

  /**
   * Web 应用项目结构
   */
  private getWebAppStructure(options: GenerateOptions): DirectoryTree {
    return {
      name: options.name,
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'app.ts', type: 'file', template: 'web-app/app.ts' },
            { name: 'routes.ts', type: 'file', template: 'web-app/routes.ts' }
          ]
        },
        {
          name: 'public',
          type: 'directory',
          children: [
            { name: 'index.html', type: 'file', template: 'web-app/index.html' }
          ]
        },
        { name: 'package.json', type: 'file', template: 'web-app/package.json' },
        { name: 'tsconfig.json', type: 'file', template: 'web-app/tsconfig.json' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'web-app/README.md' },
        { name: 'Dockerfile', type: 'file', template: 'web-app/Dockerfile' },
        { name: 'docker-compose.yml', type: 'file', template: 'web-app/docker-compose.yml' }
      ]
    };
  }

  /**
   * 数据分析项目结构
   */
  private getDataAnalysisStructure(options: GenerateOptions): DirectoryTree {
    return {
      name: options.name,
      type: 'directory',
      children: [
        {
          name: 'notebooks',
          type: 'directory',
          children: [
            { name: 'analysis.ipynb', type: 'file', template: 'data-analysis/analysis.ipynb' }
          ]
        },
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'data_loader.py', type: 'file', template: 'data-analysis/data_loader.py' },
            { name: 'visualization.py', type: 'file', template: 'data-analysis/visualization.py' }
          ]
        },
        { name: 'requirements.txt', type: 'file', template: 'data-analysis/requirements.txt' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'data-analysis/README.md' }
      ]
    };
  }

  /**
   * 爬虫项目结构
   */
  private getCrawlerStructure(options: GenerateOptions): DirectoryTree {
    return {
      name: options.name,
      type: 'directory',
      children: [
        {
          name: 'spiders',
          type: 'directory',
          children: [
            { name: '__init__.py', type: 'file', template: 'crawler/init.py' },
            { name: 'example.py', type: 'file', template: 'crawler/spider.py' }
          ]
        },
        {
          name: 'items',
          type: 'directory',
          children: [
            { name: '__init__.py', type: 'file', template: 'crawler/init.py' },
            { name: 'items.py', type: 'file', template: 'crawler/items.py' }
          ]
        },
        { name: 'requirements.txt', type: 'file', template: 'crawler/requirements.txt' },
        { name: '.env.example', type: 'file', template: 'crawler/env.example' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'crawler/README.md' },
        { name: 'Dockerfile', type: 'file', template: 'crawler/Dockerfile' },
        { name: 'docker-compose.yml', type: 'file', template: 'crawler/docker-compose.yml' }
      ]
    };
  }

  /**
   * 工具脚本项目结构
   */
  private getUtilityStructure(options: GenerateOptions): DirectoryTree {
    return {
      name: options.name,
      type: 'directory',
      children: [
        { name: 'main.py', type: 'file', template: 'utility/main.py' },
        { name: 'config.yaml', type: 'file', template: 'utility/config.yaml' },
        { name: 'requirements.txt', type: 'file', template: 'utility/requirements.txt' },
        { name: '.gitignore', type: 'file', template: 'common/gitignore' },
        { name: 'README.md', type: 'file', template: 'utility/README.md' }
      ]
    };
  }

  /**
   * 创建目录结构
   */
  private async createDirectories(basePath: string, structure: DirectoryTree): Promise<void> {
    for (const item of structure.children || []) {
      const itemPath = join(basePath, item.name);

      if (item.type === 'directory') {
        await fs.mkdir(itemPath, { recursive: true });
        logger.debug('创建目录', { path: itemPath });

        if (item.children) {
          await this.createDirectories(itemPath, item);
        }
      }
    }
  }

  /**
   * 渲染并生成文件
   */
  private async renderFiles(
    _projectType: ProjectType,
    options: GenerateOptions,
    structure: DirectoryTree,
    basePath: string = options.path
  ): Promise<void> {
    for (const item of structure.children || []) {
      const itemPath = join(basePath, item.name);

      if (item.type === 'directory') {
        if (item.children) {
          await this.renderFiles(_projectType, options, item, itemPath);
        }
      } else if (item.type === 'file' && item.template) {
        const content = await this.renderTemplate(item.template, options);
        await fs.writeFile(itemPath, content, 'utf-8');
        logger.debug('生成文件', { path: itemPath });
      }
    }
  }

  /**
   * 渲染模板
   */
  private async renderTemplate(templatePath: string, data: any): Promise<string> {
    const fullPath = join(this.templatesPath, templatePath);

    try {
      const templateContent = await fs.readFile(fullPath, 'utf-8');
      const template = Handlebars.compile(templateContent);

      // 准备模板数据
      const templateData = {
        projectName: data.name,
        description: data.description || 'Auto-generated by KINXKit',
        date: new Date().toISOString().split('T')[0],
        useGPU: data.techStack?.gpu || false,
        ...data
      };

      return template(templateData);
    } catch (error) {
      logger.warn(`模板文件不存在: ${templatePath}，将生成默认内容`);
      return this.generateDefaultContent(templatePath, data);
    }
  }

  /**
   * 生成默认内容
   */
  private generateDefaultContent(templatePath: string, data: any): string {
    // 简单的默认内容生成逻辑
    const fileName = templatePath.split('/').pop();

    if (fileName?.endsWith('.py')) {
      return `# Auto-generated file: ${templatePath}\n# Project: ${data.name}\n\n`;
    } else if (fileName?.endsWith('.md')) {
      return `# ${data.name}\n\nAuto-generated project.\n`;
    } else if (fileName?.endsWith('.txt')) {
      return `# Requirements for ${data.name}\n`;
    } else if (fileName?.endsWith('.env.example')) {
      return `# Environment variables for ${data.name}\n`;
    }

    return `# Auto-generated file: ${templatePath}\n`;
  }

  /**
   * 生成配置文件
   */
  private async generateConfigFiles(
    _projectType: ProjectType,
    options: GenerateOptions
  ): Promise<void> {
    // 生成 .gitignore
    const gitignorePath = join(options.path, '.gitignore');
    const gitignoreContent = this.generateGitignore(_projectType);
    await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');

    // 生成 README.md
    const readmePath = join(options.path, 'README.md');
    const readmeContent = this.generateReadme(_projectType, options);
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
  }

  /**
   * 生成 .gitignore 内容
   */
  private generateGitignore(_projectType: ProjectType): string {
    const base = `
# Dependencies
node_modules/
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Virtual environments
venv/
env/
ENV/
.venv

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Environment
.env
.env.local

# Build
dist/
build/
*.egg-info/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;

    return base.trim();
  }

  /**
   * 生成 README.md 内容
   */
  private generateReadme(projectType: ProjectType, options: GenerateOptions): string {
    const { name, techStack } = options;

    const backend = techStack?.backend || 'Unknown';
    const database = techStack?.database || 'Unknown';
    const ai = techStack?.ai || 'Unknown';
    const container = techStack?.container || 'Unknown';

    const content = `# ${name}

> Auto-generated by KINXKit

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
${this.getInstallCommand(projectType)}

# Run the project
${this.getRunCommand(projectType)}
\`\`\`

## 🛠️ Tech Stack

- **Backend**: ${backend}
${database !== 'Unknown' ? `- **Database**: ${database}` : ''}
${ai !== 'Unknown' ? `- **AI**: ${ai}` : ''}
${container !== 'Unknown' ? `- **Container**: ${container}` : ''}

## 📝 Development

\`\`\`bash
# Install dev dependencies
${this.getDevCommand(projectType)}

# Run tests
${this.getTestCommand(projectType)}
\`\`\`

## 📄 License

MIT

---
*Generated by KINXKit - ${new Date().toISOString().split('T')[0]}*
`;

    return content;
  }

  /**
   * 获取安装命令
   */
  private getInstallCommand(projectType: ProjectType): string {
    if ([ProjectType.AI_CHATBOT, ProjectType.API_SERVICE, ProjectType.DATA_ANALYSIS].includes(projectType)) {
      return 'pip install -r requirements.txt';
    } else if ([ProjectType.WEB_APP, ProjectType.UTILITY].includes(projectType)) {
      return 'npm install';
    }

    return 'pip install -r requirements.txt';
  }

  /**
   * 获取运行命令
   */
  private getRunCommand(projectType: ProjectType): string {
    switch (projectType) {
      case ProjectType.AI_CHATBOT:
      case ProjectType.API_SERVICE:
        return 'python app/main.py';
      case ProjectType.WEB_APP:
        return 'npm run dev';
      case ProjectType.DATA_ANALYSIS:
        return 'jupyter notebooks/analysis.ipynb';
      case ProjectType.UTILITY:
        return 'python main.py';
      case ProjectType.CRAWLER:
        return 'scrapy crawl spider';
      default:
        return 'python app/main.py';
    }
  }

  /**
   * 获取开发命令
   */
  private getDevCommand(projectType: ProjectType): string {
    return this.getInstallCommand(projectType);
  }

  /**
   * 获取测试命令
   */
  private getTestCommand(projectType: ProjectType): string {
    if (projectType === ProjectType.WEB_APP) {
      return 'npm test';
    }
    return 'pytest';
  }

  // Unused method, kept for future use
  // private getImageName(path: string): string {
  //   const dirName = path.split('/').pop() || path.split('\\').pop();
  //   return `${dirName}:latest`;
  // }
}

/**
 * 目录树结构
 */
interface DirectoryTree {
  name: string;
  type: 'directory' | 'file';
  template?: string;
  children?: DirectoryTree[];
}

// 导出单例
export const generator = new CodeGenerator();
