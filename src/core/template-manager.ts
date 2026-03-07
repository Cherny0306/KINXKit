/**
 * 自定义模板管理器
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import Handlebars from 'handlebars';

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author?: string;
  tags: string[];
  categories: string[];
  variables: TemplateVariable[];
  files: TemplateFile[];
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
}

/**
 * 模板变量
 */
export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'choice';
  default?: any;
  required: boolean;
  choices?: string[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
}

/**
 * 模板文件
 */
export interface TemplateFile {
  path: string;
  template: string;
  outputPath: string;
}

/**
 * 自定义模板管理器
 */
export class CustomTemplateManager {
  private templatesDir: string;
  private userTemplatesDir: string;
  private templates: Map<string, TemplateMetadata> = new Map();

  constructor() {
    this.templatesDir = path.join(process.cwd(), 'templates');
    this.userTemplatesDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.kinxkit', 'templates');
  }

  /**
   * 初始化模板管理器
   */
  async initialize(): Promise<void> {
    // 确保用户模板目录存在
    await fs.mkdir(this.userTemplatesDir, { recursive: true });

    // 加载所有模板
    await this.loadAllTemplates();
  }

  /**
   * 加载所有模板
   */
  private async loadAllTemplates(): Promise<void> {
    // 加载内置模板
    await this.loadTemplatesFromDir(this.templatesDir);

    // 加载用户模板
    await this.loadTemplatesFromDir(this.userTemplatesDir);

    logger.info(`已加载 ${this.templates.size} 个模板`);
  }

  /**
   * 从目录加载模板
   */
  private async loadTemplatesFromDir(dir: string): Promise<void> {
    try {
      const categories = await fs.readdir(dir, { withFileTypes: true });

      for (const category of categories) {
        if (!category.isDirectory()) continue;

        const categoryPath = path.join(dir, category.name);
        const templates = await fs.readdir(categoryPath, { withFileTypes: true });

        for (const template of templates) {
          if (!template.isDirectory()) continue;

          const templatePath = path.join(categoryPath, template.name);
          const metadataPath = path.join(templatePath, 'template.json');

          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
            this.templates.set(metadata.name, metadata);
          } catch {
            // 跳过无效模板
          }
        }
      }
    } catch {
      // 目录不存在，跳过
    }
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取模板
   */
  getTemplate(name: string): TemplateMetadata | undefined {
    return this.templates.get(name);
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): TemplateMetadata[] {
    const lowerQuery = query.toLowerCase();

    return this.getAllTemplates().filter(template =>
      template.name.includes(lowerQuery) ||
      template.displayName.includes(lowerQuery) ||
      template.description.includes(lowerQuery) ||
      template.tags.some(tag => tag.includes(lowerQuery)) ||
      template.categories.some(cat => cat.includes(lowerQuery))
    );
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(template =>
      template.categories.includes(category)
    );
  }

  /**
   * 按标签获取模板
   */
  getTemplatesByTag(tag: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(template =>
      template.tags.includes(tag)
    );
  }

  /**
   * 创建新模板
   */
  async createTemplate(
    name: string,
    options: {
      displayName: string;
      description: string;
      category: string;
      tags?: string[];
      author?: string;
    }
  ): Promise<string> {
    const templatePath = path.join(this.userTemplatesDir, options.category, name);

    // 创建模板目录
    await fs.mkdir(templatePath, { recursive: true });

    // 创建子目录
    await fs.mkdir(path.join(templatePath, 'files'), { recursive: true });

    // 创建模板元数据
    const metadata: TemplateMetadata = {
      name,
      displayName: options.displayName,
      description: options.description,
      version: '1.0.0',
      author: options.author,
      tags: options.tags || [],
      categories: [options.category],
      variables: [],
      files: []
    };

    await fs.writeFile(
      path.join(templatePath, 'template.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // 创建 README
    const readme = this.generateTemplateReadme(metadata);
    await fs.writeFile(
      path.join(templatePath, 'README.md'),
      readme,
      'utf-8'
    );

    // 创建示例文件
    const exampleConfig = this.generateExampleConfig(metadata);
    await fs.writeFile(
      path.join(templatePath, 'files', 'config.example'),
      exampleConfig,
      'utf-8'
    );

    logger.success(`模板已创建: ${name}`);
    logger.info(`模板路径: ${templatePath}`);

    return templatePath;
  }

  /**
   * 生成模板 README
   */
  private generateTemplateReadme(metadata: TemplateMetadata): string {
    const lines: string[] = [];

    lines.push(`# ${metadata.displayName}`);
    lines.push('');
    lines.push(`**描述**: ${metadata.description}`);
    lines.push(`**版本**: ${metadata.version}`);
    lines.push(`**作者**: ${metadata.author || '未知'}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 变量说明');
    lines.push('');
    lines.push('| 变量名 | 描述 | 类型 | 必填 |');
    lines.push('|--------|------|------|------|');

    metadata.variables.forEach(v => {
      lines.push(`| \`${v.name}\` | ${v.description} | ${v.type} | ${v.required ? '✅' : '❌'} |`);
    });

    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 文件结构');
    lines.push('');
    lines.push('```');
    metadata.files.forEach(f => lines.push(f.path));
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 使用方法');
    lines.push('');
    lines.push('1. 安装 KINXKit');
    lines.push(`2. 运行: \`kinx create my-project --template ${metadata.name}\``);
    lines.push('3. 按提示填写变量值');
    lines.push('4. 项目已创建！');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 标签');
    lines.push('');
    metadata.tags.forEach(tag => lines.push(`\`${tag}\``));
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 分类');
    lines.push('');
    metadata.categories.forEach(cat => lines.push(`\`${cat}\``));

    return lines.join('\n');
  }

  /**
   * 生成示例配置
   */
  private generateExampleConfig(metadata: TemplateMetadata): string {
    const lines: string[] = [];

    lines.push('# 配置文件示例');
    lines.push('');

    metadata.variables.forEach(v => {
      const comment = v.description || v.name;
      const defaultValue = v.default !== undefined ? v.default : '';

      if (v.type === 'choice' && v.choices) {
        lines.push(`# ${comment}`);
        lines.push(`# 可选值: ${v.choices.join(', ')}`);
        lines.push(`${v.name}=${defaultValue}`);
      } else {
        lines.push(`# ${comment}`);
        lines.push(`${v.name}=${defaultValue}`);
      }
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * 使用模板生成项目
   */
  async useTemplate(
    templateName: string,
    projectName: string,
    variables: Record<string, any>,
    outputPath: string
  ): Promise<void> {
    const template = this.getTemplate(templateName);

    if (!template) {
      throw new Error(`未找到模板: ${templateName}`);
    }

    logger.info(`使用模板: ${template.displayName}`);

    // 验证变量
    const validation = this.validateVariables(template, variables);
    if (!validation.valid) {
      throw new Error(`变量验证失败:\n${validation.errors.join('\n')}`);
    }

    // 创建项目目录
    const projectPath = path.join(outputPath, projectName);
    await fs.mkdir(projectPath, { recursive: true });

    // 编译并复制文件
    const templatePath = path.join(
      template.name.startsWith('user:') ? this.userTemplatesDir : this.templatesDir,
      template.categories[0],
      template.name,
      'files'
    );

    try {
      const files = await fs.readdir(templatePath, { recursive: true });

      for (const file of files) {
        const filePath = path.join(templatePath, file);

        try {
          const stat = await fs.stat(filePath);

          if (stat.isFile()) {
            // 读取模板文件
            const content = await fs.readFile(filePath, 'utf-8');

            // 编译模板
            const compiled = Handlebars.compile(content);
            const rendered = compiled(variables);

            // 确定输出路径
            const relativePath = file.replace(/\.hbs$/, '');
            const outputPathFinal = path.join(projectPath, relativePath);

            // 创建输出目录
            await fs.mkdir(path.dirname(outputPathFinal), { recursive: true });

            // 写入文件
            await fs.writeFile(outputPathFinal, rendered, 'utf-8');

            logger.info(`✓ ${relativePath}`);
          }
        } catch {
          // 跳过无效文件
        }
      }
    } catch {
      // 模板文件目录不存在
    }

    // 创建 package.json（如果有依赖）
    if (template.dependencies || template.devDependencies || template.scripts) {
      const packageJson: any = {
        name: projectName,
        version: '1.0.0',
        description: `${template.displayName} 项目`
      };

      if (template.dependencies) {
        packageJson.dependencies = {};
        template.dependencies.forEach(dep => {
          const [name, version] = dep.split('@');
          packageJson.dependencies[name] = version || '*';
        });
      }

      if (template.devDependencies) {
        packageJson.devDependencies = {};
        template.devDependencies.forEach(dep => {
          const [name, version] = dep.split('@');
          packageJson.devDependencies[name] = version || '*';
        });
      }

      if (template.scripts) {
        packageJson.scripts = template.scripts;
      }

      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf-8'
      );
    }

    logger.success(`✓ 项目已创建: ${projectPath}`);
  }

  /**
   * 验证变量
   */
  private validateVariables(
    template: TemplateMetadata,
    variables: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const v of template.variables) {
      const value = variables[v.name];

      // 检查必需字段
      if (v.required && (value === undefined || value === '')) {
        errors.push(`${v.name} 是必需的`);
        continue;
      }

      // 类型验证
      if (value !== undefined) {
        if (v.type === 'number' && isNaN(value)) {
          errors.push(`${v.name} 必须是数字`);
        }

        if (v.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${v.name} 必须是布尔值`);
        }

        if (v.type === 'choice' && v.choices) {
          if (!v.choices.includes(value)) {
            errors.push(`${v.name} 必须是以下值之一: ${v.choices.join(', ')}`);
          }
        }

        // 正则验证
        if (v.validation?.pattern && !v.validation.pattern.test(value)) {
          errors.push(`${v.name} 格式不正确`);
        }

        // 范围验证
        if (v.validation?.min !== undefined && value < v.validation.min) {
          errors.push(`${v.name} 不能小于 ${v.validation.min}`);
        }

        if (v.validation?.max !== undefined && value > v.validation.max) {
          errors.push(`${v.name} 不能大于 ${v.validation.max}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    name: string,
    metadata: Partial<TemplateMetadata>
  ): Promise<void> {
    const template = this.getTemplate(name);

    if (!template) {
      throw new Error(`未找到模板: ${name}`);
    }

    // 合并元数据
    const updatedMetadata = { ...template, ...metadata };

    // 确定模板路径
    const templatePath = path.join(
      this.userTemplatesDir,
      template.categories[0],
      name
    );

    // 更新 template.json
    await fs.writeFile(
      path.join(templatePath, 'template.json'),
      JSON.stringify(updatedMetadata, null, 2),
      'utf-8'
    );

    // 更新 README
    const readme = this.generateTemplateReadme(updatedMetadata);
    await fs.writeFile(
      path.join(templatePath, 'README.md'),
      readme,
      'utf-8'
    );

    logger.success(`✓ 模板已更新: ${name}`);
  }

  /**
   * 删除模板
   */
  async deleteTemplate(name: string): Promise<void> {
    const template = this.getTemplate(name);

    if (!template) {
      throw new Error(`未找到模板: ${name}`);
    }

    // 只能删除用户模板
    const templatePath = path.join(
      this.userTemplatesDir,
      template.categories[0],
      name
    );

    await fs.rm(templatePath, { recursive: true, force: true });

    this.templates.delete(name);

    logger.success(`✓ 模板已删除: ${name}`);
  }

  /**
   * 导出模板
   */
  async exportTemplate(name: string, outputPath: string): Promise<void> {
    const template = this.getTemplate(name);

    if (!template) {
      throw new Error(`未找到模板: ${name}`);
    }

    const templatePath = path.join(
      this.userTemplatesDir,
      template.categories[0],
      name
    );

    // 创建导出目录
    await fs.mkdir(outputPath, { recursive: true });

    // 复制模板文件
    const files = await fs.readdir(templatePath);
    for (const file of files) {
      const srcPath = path.join(templatePath, file);
      const destPath = path.join(outputPath, file);

      const stat = await fs.stat(srcPath);
      if (stat.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        // 递归复制目录
        await this.exportTemplate(name, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }

    logger.success(`✓ 模板已导出到: ${outputPath}`);
  }

  /**
   * 导入模板
   */
  async importTemplate(importPath: string): Promise<void> {
    const metadataPath = path.join(importPath, 'template.json');

    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

      // 确定目标路径
      const targetPath = path.join(
        this.userTemplatesDir,
        metadata.categories[0],
        metadata.name
      );

      // 创建目标目录
      await fs.mkdir(targetPath, { recursive: true });

      // 复制所有文件
      const files = await fs.readdir(importPath);
      for (const file of files) {
        const srcPath = path.join(importPath, file);
        const destPath = path.join(targetPath, file);

        const stat = await fs.stat(srcPath);
        if (stat.isDirectory()) {
          await fs.mkdir(destPath, { recursive: true });
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }

      // 重新加载模板
      await this.loadAllTemplates();

      logger.success(`✓ 模板已导入: ${metadata.name}`);
    } catch (error) {
      throw new Error(`导入失败: ${error}`);
    }
  }

  /**
   * 验证模板
   */
  async validateTemplate(name: string): Promise<{ valid: boolean; errors: string[] }> {
    const template = this.getTemplate(name);

    if (!template) {
      return {
        valid: false,
        errors: [`未找到模板: ${name}`]
      };
    }

    const errors: string[] = [];

    // 验证必需字段
    if (!template.name) errors.push('缺少模板名称');
    if (!template.displayName) errors.push('缺少显示名称');
    if (!template.description) errors.push('缺少描述');
    if (!template.version) errors.push('缺少版本');
    if (!template.categories || template.categories.length === 0) {
      errors.push('至少需要一个分类');
    }

    // 验证变量
    for (const v of template.variables) {
      if (!v.name) errors.push('变量缺少名称');
      if (!v.description) errors.push(`变量 ${v.name} 缺少描述`);
      if (!v.type) errors.push(`变量 ${v.name} 缺少类型`);
      if (v.type === 'choice' && !v.choices) {
        errors.push(`变量 ${v.name} 类型为 choice 但缺少选项`);
      }
    }

    // 验证文件
    for (const f of template.files) {
      if (!f.path) errors.push('文件缺少路径');
      if (!f.template) errors.push(`文件 ${f.path} 缺少模板`);
      if (!f.outputPath) errors.push(`文件 ${f.path} 缺少输出路径`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
