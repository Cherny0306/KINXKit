/**
 * 配置预设管理测试
 */

import { ConfigPresetManager, PresetType } from '../../src/core/preset-manager.js';

describe('ConfigPresetManager', () => {
  let manager: ConfigPresetManager;

  beforeEach(() => {
    manager = new ConfigPresetManager();
  });

  describe('AI 服务预设', () => {
    it('应该返回所有 AI 服务预设', () => {
      const presets = manager.getAIServicePresets();

      expect(presets).toBeDefined();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('应该包含主流 AI 服务', () => {
      const presets = manager.getAIServicePresets();
      const names = presets.map(p => p.name);

      expect(names).toContain('openai');
      expect(names).toContain('deepseek');
      expect(names).toContain('zhipu');
    });

    it('应该验证 OpenAI API 密钥格式', async () => {
      const validKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890AB';
      const invalidKey = 'invalid-key';

      const validResult = await manager.generateAIServiceConfig('openai', { apiKey: validKey });
      const invalidResult = await manager.generateAIServiceConfig('openai', { apiKey: invalidKey });

      expect(validResult).toBeDefined();
    });

    it('应该生成正确的环境变量', () => {
      const preset = manager.getAIServicePreset('openai');

      expect(preset).toBeDefined();
      expect(preset.envVars).toBeDefined();
      expect(preset.envVars.apiKey).toBe('OPENAI_API_KEY');
      expect(preset.envVars.baseUrl).toBeDefined();
    });

    it('应该返回预设的文档链接', () => {
      const openai = manager.getAIServicePreset('openai');

      expect(openai.docsUrl).toBeDefined();
      expect(openai.docsUrl).toContain('http');
    });
  });

  describe('数据库预设', () => {
    it('应该返回所有数据库预设', () => {
      const presets = manager.getDatabasePresets();

      expect(presets).toBeDefined();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('应该包含主流数据库', () => {
      const presets = manager.getDatabasePresets();
      const names = presets.map(p => p.name);

      expect(names).toContain('postgresql');
      expect(names).toContain('mysql');
      expect(names).toContain('mongodb');
      expect(names).toContain('sqlite');
    });

    it('应该生成 PostgreSQL 配置', async () => {
      const config = await manager.generateDatabaseConfig('postgresql', {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      });

      expect(config).toBeDefined();
      expect(config.type).toBe('postgresql');
    });

    it('应该生成 MySQL 配置', async () => {
      const config = await manager.generateDatabaseConfig('mysql', {
        host: 'localhost',
        port: 3306,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      });

      expect(config).toBeDefined();
      expect(config.type).toBe('mysql');
    });

    it('应该生成 MongoDB 配置', async () => {
      const config = await manager.generateDatabaseConfig('mongodb', {
        connectionString: 'mongodb://localhost:27017'
      });

      expect(config).toBeDefined();
      expect(config.type).toBe('mongodb');
    });

    it('应该包含数据库特性信息', () => {
      const postgresql = manager.getDatabasePreset('postgresql');

      expect(postgresql.features).toBeDefined();
      expect(Array.isArray(postgresql.features)).toBe(true);
      expect(postgresql.sslSupport).toBeDefined();
      expect(postgresql.connectionPoolSupport).toBeDefined();
    });
  });

  describe('预设搜索', () => {
    it('应该按名称搜索预设', () => {
      const results = manager.searchPresets('openai');

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('openai');
    });

    it('应该按标签搜索预设', () => {
      const results = manager.searchPresets('ai');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('应该返回相关结果', () => {
      const results = manager.searchPresets('gpt');

      expect(results.ai).toBeDefined();
      expect(Array.isArray(results.ai)).toBe(true);
    });
  });

  describe('配置验证', () => {
    it('应该验证 AI 服务配置', async () => {
      const result = await manager.validatePresetConfig(PresetType.AI_SERVICE, {
        name: 'openai',
        apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890AB'
      });

      expect(result.valid).toBeDefined();
    });

    it('应该验证数据库配置', async () => {
      const result = await manager.validatePresetConfig(PresetType.DATABASE, {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      });

      expect(result.valid).toBeDefined();
    });
  });

  describe('环境变量生成', () => {
    it('应该为 AI 服务生成环境变量', async () => {
      const config = await manager.generateAIServiceConfig('openai', {
        apiKey: 'sk-test123'
      });

      expect(config).toBeDefined();
      expect(config.envVars).toBeDefined();
    });

    it('应该为数据库生成环境变量', async () => {
      const config = await manager.generateDatabaseConfig('postgresql', {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      });

      expect(config).toBeDefined();
      expect(config.envVars).toBeDefined();
    });
  });

  describe('预设信息', () => {
    it('应该返回预设的详细信息', () => {
      const preset = manager.getAIServicePreset('openai');

      expect(preset).toBeDefined();
      expect(preset.name).toBe('openai');
      expect(preset.displayName).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.baseUrl).toBeDefined();
    });

    it('应该包含定价信息链接', () => {
      const openai = manager.getAIServicePreset('openai');

      expect(openai.pricingUrl).toBeDefined();
      expect(openai.pricingUrl).toContain('http');
    });

    it('应该包含示例配置', () => {
      const preset = manager.getAIServicePreset('openai');

      expect(preset.examples).toBeDefined();
      expect(preset.examples.simple).toBeDefined();
      expect(preset.examples.advanced).toBeDefined();
    });
  });

  describe('边界情况', () => {
    it('应该处理未知的服务名称', () => {
      const preset = manager.getAIServicePreset('unknown-service');

      expect(preset).toBeUndefined();
    });

    it('应该处理空的搜索查询', () => {
      const results = manager.searchPresets('');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('应该处理无效的 API 密钥', () => {
      const result = manager.validateApiKey('', 'openai');

      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});
