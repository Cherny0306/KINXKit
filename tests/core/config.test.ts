/**
 * 配置管理器测试
 */

import { ConfigManager, EnvConfig } from '../../src/core/config.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('ConfigManager', () => {
  let manager: ConfigManager;
  let testDir: string;

  beforeEach(async () => {
    manager = new ConfigManager();
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), `kinx-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // 清理测试目录
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  });

  describe('API 密钥验证', () => {
    it('应该验证有效的 OpenAI API 密钥', () => {
      const result = manager.validateApiKey(
        'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890AB',
        'OpenAI'
      );

      expect(result.valid).toBe(true);
    });

    it('应该拒绝无效的 API 密钥格式', () => {
      const result = manager.validateApiKey('invalid-key', 'OpenAI');

      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('应该拒绝空的 API 密钥', () => {
      const result = manager.validateApiKey('', 'OpenAI');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('不能为空');
    });

    it('应该验证 DeepSeek API 密钥', () => {
      const result = manager.validateApiKey(
        'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890AB',
        'DeepSeek'
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('API 预设', () => {
    it('应该返回 API 预设列表', () => {
      const presets = manager.getApiPresets();

      expect(presets).toBeDefined();
      expect(presets.length).toBeGreaterThan(0);

      // 验证必需的预设
      const openai = presets.find(p => p.name === 'OpenAI');
      expect(openai).toBeDefined();
      expect(openai?.baseUrl).toBe('https://api.openai.com/v1');
    });

    it('应该包含所有主流 API 服务', () => {
      const presets = manager.getApiPresets();
      const names = presets.map(p => p.name);

      expect(names).toContain('OpenAI');
      expect(names).toContain('DeepSeek');
      expect(names).toContain('智谱 AI');
      expect(names).toContain('Azure OpenAI');
      expect(names).toContain('Anthropic');
    });
  });

  describe('.env 文件生成', () => {
    it('应该生成 .env 文件', async () => {
      const config: EnvConfig = {
        apis: [
          {
            name: 'OpenAI',
            apiKey: 'sk-test123',
            baseUrl: 'https://api.openai.com/v1'
          }
        ]
      };

      const success = await manager.generateEnvFile(testDir, config);

      expect(success).toBe(true);

      // 验证文件存在
      const envPath = path.join(testDir, '.env');
      const exists = await fs.access(envPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('应该包含正确的环境变量', async () => {
      const config: EnvConfig = {
        apis: [
          {
            name: 'OpenAI',
            apiKey: 'sk-test123',
            baseUrl: 'https://api.openai.com/v1'
          }
        ]
      };

      await manager.generateEnvFile(testDir, config);

      const envPath = path.join(testDir, '.env');
      const content = await fs.readFile(envPath, 'utf-8');

      expect(content).toContain('OPENAI_BASE_URL=https://api.openai.com/v1');
      expect(content).toContain('OPENAI_API_KEY=sk-test123');
    });

    it('应该支持数据库配置', async () => {
      const config: EnvConfig = {
        apis: [],
        database: {
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      };

      await manager.generateEnvFile(testDir, config);

      const envPath = path.join(testDir, '.env');
      const content = await fs.readFile(envPath, 'utf-8');

      expect(content).toContain('DATABASE_TYPE=postgresql');
      expect(content).toContain('DATABASE_HOST=localhost');
      expect(content).toContain('DATABASE_PORT=5432');
    });
  });

  describe('.env.example 文件生成', () => {
    it('应该生成 .env.example 文件', async () => {
      const config: EnvConfig = {
        apis: [
          {
            name: 'OpenAI',
            apiKey: 'sk-real-key',
            baseUrl: 'https://api.openai.com/v1'
          }
        ]
      };

      const success = await manager.generateEnvExample(testDir, config);

      expect(success).toBe(true);

      const examplePath = path.join(testDir, '.env.example');
      const exists = await fs.access(examplePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('应该隐藏真实 API 密钥', async () => {
      const config: EnvConfig = {
        apis: [
          {
            name: 'OpenAI',
            apiKey: 'sk-real-key',
            baseUrl: 'https://api.openai.com/v1'
          }
        ]
      };

      await manager.generateEnvExample(testDir, config);

      const examplePath = path.join(testDir, '.env.example');
      const content = await fs.readFile(examplePath, 'utf-8');

      expect(content).toContain('OPENAI_API_KEY=your_api_key_here');
      expect(content).not.toContain('sk-real-key');
    });
  });

  describe('配置模板生成', () => {
    it('应该生成配置文件模板', async () => {
      const success = await manager.generateConfigTemplate(testDir);

      expect(success).toBe(true);

      const configPath = path.join(testDir, 'src', 'config', 'index.ts');
      const exists = await fs.access(configPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('应该包含完整的配置结构', async () => {
      await manager.generateConfigTemplate(testDir);

      const configPath = path.join(testDir, 'src', 'config', 'index.ts');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('export const config');
      expect(content).toContain('apis:');
      expect(content).toContain('database:');
      expect(content).toContain('app:');
    });
  });

  describe('.env 文件检查', () => {
    it('应该检测 .env 文件是否存在', async () => {
      // 文件不存在
      let exists = await manager.checkEnvFile(testDir);
      expect(exists).toBe(false);

      // 创建文件
      const envPath = path.join(testDir, '.env');
      await fs.writeFile(envPath, '# test\n');

      // 文件存在
      exists = await manager.checkEnvFile(testDir);
      expect(exists).toBe(true);
    });
  });

  describe('.env 文件读取', () => {
    it('应该读取并解析 .env 文件', async () => {
      const envPath = path.join(testDir, '.env');
      await fs.writeFile(envPath, `
# Test env file
TEST_VAR=value
ANOTHER_VAR=another value

# Comment
EMPTY_VAR=
`, 'utf-8');

      const envVars = await manager.readEnvFile(testDir);

      expect(envVars).toBeDefined();
      expect(envVars!['TEST_VAR']).toBe('value');
      expect(envVars!['ANOTHER_VAR']).toBe('another value');
    });

    it('应该忽略注释和空行', async () => {
      const envPath = path.join(testDir, '.env');
      await fs.writeFile(envPath, `
# This is a comment

VAR1=value1
# Another comment
VAR2=value2

`, 'utf-8');

      const envVars = await manager.readEnvFile(testDir);

      expect(Object.keys(envVars!)).toHaveLength(2);
      expect(envVars!['VAR1']).toBe('value1');
      expect(envVars!['VAR2']).toBe('value2');
    });

    it('应该处理文件不存在的情况', async () => {
      const envVars = await manager.readEnvFile(testDir);

      expect(envVars).toBeNull();
    });
  });

  describe('.env 文件更新', () => {
    it('应该更新现有的环境变量', async () => {
      const envPath = path.join(testDir, '.env');
      await fs.writeFile(envPath, 'EXISTING_VAR=old_value\n', 'utf-8');

      const success = await manager.updateEnvFile(testDir, {
        EXISTING_VAR: 'new_value',
        NEW_VAR: 'new_value'
      });

      expect(success).toBe(true);

      const content = await fs.readFile(envPath, 'utf-8');
      expect(content).toContain('EXISTING_VAR=new_value');
      expect(content).toContain('NEW_VAR=new_value');
    });

    it('应该创建不存在的文件', async () => {
      const success = await manager.updateEnvFile(testDir, {
        NEW_VAR: 'value'
      });

      expect(success).toBe(true);

      const envPath = path.join(testDir, '.env');
      const exists = await fs.access(envPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });
});
