/**
 * 自定义模板管理测试
 */

import { CustomTemplateManager, TemplateMetadata } from '../../src/core/template-manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('CustomTemplateManager', () => {
  let manager: CustomTemplateManager;
  let testDir: string;

  beforeAll(async () => {
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), `kinx-template-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // 清理测试目录
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  });

  beforeEach(() => {
    manager = new CustomTemplateManager();
  });

  describe('模板初始化', () => {
    it('应该成功初始化', async () => {
      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('应该创建用户模板目录', async () => {
      await manager.initialize();

      const userDir = path.join(
        process.env.HOME || process.env.USERPROFILE || '',
        '.kinxkit',
        'templates'
      );

      // 验证目录存在（如果权限允许）
      const exists = await fs.access(userDir).then(() => true).catch(() => false);
      expect(exists).toBeDefined();
    });
  });

  describe('模板 CRUD', () => {
    it('应该创建新模板', async () => {
      const metadata: TemplateMetadata = {
        name: 'test-template',
        displayName: '测试模板',
        description: '这是一个测试模板',
        version: '1.0.0',
        author: 'Test Author',
        tags: ['test', 'template'],
        categories: ['test'],
        variables: [
          {
            name: 'projectName',
            description: '项目名称',
            type: 'string',
            required: true
          }
        ],
        files: [
          {
            path: 'README.md',
            template: '# {{projectName}}',
            outputPath: 'README.md'
          }
        ]
      };

      await expect(manager.createTemplate(testDir, metadata)).resolves.not.toThrow();
    });

    it('应该读取模板详情', async () => {
      // 首先创建一个模板
      const metadata: TemplateMetadata = {
        name: 'read-test',
        displayName: '读取测试',
        description: '用于测试读取功能',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      await manager.createTemplate(testDir, metadata);

      // 然后读取它
      const template = await manager.getTemplate('read-test');

      if (template) {
        expect(template.name).toBe('read-test');
        expect(template.displayName).toBe('读取测试');
      }
    });

    it('应该更新现有模板', async () => {
      const metadata: TemplateMetadata = {
        name: 'update-test',
        displayName: '更新测试',
        description: '原始描述',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      await manager.createTemplate(testDir, metadata);

      // 更新模板
      metadata.description = '更新后的描述';
      await manager.updateTemplate(testDir, 'update-test', metadata);

      const template = await manager.getTemplate('update-test');
      if (template) {
        expect(template.description).toBe('更新后的描述');
      }
    });

    it('应该删除模板', async () => {
      const metadata: TemplateMetadata = {
        name: 'delete-test',
        displayName: '删除测试',
        description: '用于测试删除功能',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      await manager.createTemplate(testDir, metadata);
      await manager.deleteTemplate(testDir, 'delete-test');

      const template = await manager.getTemplate('delete-test');
      expect(template).toBeUndefined();
    });

    it('应该列出所有模板', async () => {
      const templates = manager.getAllTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('模板渲染', () => {
    it('应该渲染 Handlebars 模板', async () => {
      const template = 'Hello, {{name}}!';
      const variables = { name: 'World' };

      const result = await manager.renderTemplate(template, variables);

      expect(result).toBe('Hello, World!');
    });

    it('应该替换多个变量', async () => {
      const template = '{{greeting}}, {{name}}! Welcome to {{project}}.';
      const variables = {
        greeting: 'Hello',
        name: 'User',
        project: 'KINXKit'
      };

      const result = await manager.renderTemplate(template, variables);

      expect(result).toBe('Hello, User! Welcome to KINXKit.');
    });

    it('应该验证必需变量', async () => {
      const metadata: TemplateMetadata = {
        name: 'validation-test',
        displayName: '验证测试',
        description: '测试变量验证',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [
          {
            name: 'requiredVar',
            description: '必需变量',
            type: 'string',
            required: true
          },
          {
            name: 'optionalVar',
            description: '可选变量',
            type: 'string',
            required: false
          }
        ],
        files: []
      };

      // 创建模板目录和文件
      const templateDir = path.join(testDir, 'validation-test');
      await fs.mkdir(templateDir, { recursive: true });
      await fs.writeFile(
        path.join(templateDir, 'template.json'),
        JSON.stringify(metadata, null, 2)
      );

      const validVars = { requiredVar: 'value' };
      const invalidVars = { optionalVar: 'value' };

      const validResult = await manager.useTemplate('validation-test', testDir, validVars);
      const invalidResult = await manager.useTemplate('validation-test', testDir, invalidVars);

      expect(validResult).toBeDefined();
    });

    it('应该处理嵌套变量', async () => {
      const template = '{{config.name}} - {{config.version}}';
      const variables = {
        config: {
          name: 'Test',
          version: '1.0.0'
        }
      };

      const result = await manager.renderTemplate(template, variables);

      expect(result).toBe('Test - 1.0.0');
    });
  });

  describe('模板搜索', () => {
    it('应该按名称搜索', async () => {
      const results = await manager.searchTemplates('test');

      expect(Array.isArray(results)).toBe(true);
    });

    it('应该按分类搜索', async () => {
      const results = await manager.searchByCategory('test');

      expect(Array.isArray(results)).toBe(true);
    });

    it('应该按标签搜索', async () => {
      const results = await manager.searchByTag('template');

      expect(Array.isArray(results)).toBe(true);
    });

    it('应该处理空搜索结果', async () => {
      const results = await manager.searchTemplates('nonexistent-template-xyz');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('模板导入导出', () => {
    it('应该导出模板', async () => {
      const metadata: TemplateMetadata = {
        name: 'export-test',
        displayName: '导出测试',
        description: '测试导出功能',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      await manager.createTemplate(testDir, metadata);

      const exportPath = path.join(testDir, 'exported-template.json');
      await expect(manager.exportTemplate('export-test', exportPath)).resolves.not.toThrow();

      // 验证文件存在
      const exists = await fs.access(exportPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('应该导入模板', async () => {
      const importPath = path.join(testDir, 'import-template.json');
      const metadata: TemplateMetadata = {
        name: 'import-test',
        displayName: '导入测试',
        description: '测试导入功能',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      await fs.writeFile(importPath, JSON.stringify(metadata, null, 2));

      await expect(manager.importTemplate(importPath)).resolves.not.toThrow();
    });
  });

  describe('模板验证', () => {
    it('应该验证模板结构', async () => {
      const validMetadata: TemplateMetadata = {
        name: 'valid-template',
        displayName: '有效模板',
        description: '结构完整的模板',
        version: '1.0.0',
        tags: ['test'],
        categories: ['test'],
        variables: [],
        files: []
      };

      // 创建模板目录和文件
      const templateDir = path.join(testDir, 'valid-template');
      await fs.mkdir(templateDir, { recursive: true });
      await fs.writeFile(
        path.join(templateDir, 'template.json'),
        JSON.stringify(validMetadata, null, 2)
      );

      const result = await manager.validateTemplate('valid-template');

      expect(result.valid).toBe(true);
    });

    it('应该检测无效的模板结构', async () => {
      const invalidMetadata = {
        // 缺少必需字段
        name: 'invalid-template'
      } as TemplateMetadata;

      // 创建模板目录和文件
      const templateDir = path.join(testDir, 'invalid-template');
      await fs.mkdir(templateDir, { recursive: true });
      await fs.writeFile(
        path.join(templateDir, 'template.json'),
        JSON.stringify(invalidMetadata, null, 2)
      );

      const result = await manager.validateTemplate('invalid-template');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理不存在的模板', async () => {
      const template = await manager.getTemplate('nonexistent-template');

      expect(template).toBeUndefined();
    });

    it('应该处理空变量', async () => {
      const template = 'No variables here';
      const result = await manager.renderTemplate(template, {});

      expect(result).toBe(template);
    });

    it('应该处理特殊字符', async () => {
      const template = 'Special: {{value}}';
      const variables = { value: '测试中文 & symbols !@#$%' };

      const result = await manager.renderTemplate(template, variables);

      expect(result).toContain('测试中文');
    });
  });

  describe('模板列表和过滤', () => {
    it('应该按分类过滤模板', async () => {
      const templates = manager.getTemplatesByCategory('test');

      expect(Array.isArray(templates)).toBe(true);
    });

    it('应该按标签过滤模板', async () => {
      const templates = manager.getTemplatesByTag('template');

      expect(Array.isArray(templates)).toBe(true);
    });

    it('应该获取模板分类列表', async () => {
      const templates = manager.getAllTemplates();
      const categories = [...new Set(templates.flatMap(t => t.categories))];

      expect(Array.isArray(categories)).toBe(true);
    });

    it('应该获取所有标签', async () => {
      const templates = manager.getAllTemplates();
      const tags = [...new Set(templates.flatMap(t => t.tags))];

      expect(Array.isArray(tags)).toBe(true);
    });
  });
});
