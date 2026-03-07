/**
 * 配置管理命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { ConfigManager, ApiConfig, DatabaseConfig, EnvConfig } from '../core/config.js';
import { logger } from '../utils/logger.js';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command.description('配置管理');

  // API 配置命令
  command
    .command('api')
    .description('配置 API 密钥')
    .option('-p, --path <path>', '项目路径')
    .action(async (options) => {
      logger.subtitle('🔑 API 密钥配置');

      const configManager = new ConfigManager();

      // 获取项目路径
      let projectPath = options.path || process.cwd();

      // 检查现有 .env 文件
      const envExists = await configManager.checkEnvFile(projectPath);

      if (envExists) {
        logger.info('检测到现有 .env 文件');

        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: '是否要更新现有配置？',
            default: true
          }
        ]);

        if (!overwrite) {
          logger.info('已取消');
          return;
        }
      }

      // 选择 API 服务
      const apiPresets = configManager.getApiPresets();

      const { provider } = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: '选择 API 服务提供商：',
          choices: [
            ...apiPresets.map((p) => ({
              name: `${p.name} - ${p.description}`,
              value: p.name
            })),
            { name: '其他 (自定义)', value: 'custom' }
          ]
        }
      ]);

      let apiName = provider;
      let baseUrl = '';
      let description = '';

      if (provider === 'custom') {
        const customAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'API 服务名称:'
          },
          {
            type: 'input',
            name: 'url',
            message: 'API Base URL (可选):'
          },
          {
            type: 'input',
            name: 'desc',
            message: '描述 (可选):'
          }
        ]);

        apiName = customAnswers.name;
        baseUrl = customAnswers.url;
        description = customAnswers.desc;
      } else {
        const preset = apiPresets.find((p) => p.name === provider);
        if (preset) {
          baseUrl = preset.baseUrl;
          description = preset.description;
        }
      }

      // 输入 API 密钥
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: `请输入 ${apiName} API 密钥:`,
          mask: '*',
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'API 密钥不能为空';
            }

            const validation = configManager.validateApiKey(input, apiName);

            if (!validation.valid) {
              return validation.message || 'API 密钥格式不正确';
            }

            return true;
          }
        }
      ]);

      // 构建配置
      const apiConfig: ApiConfig = {
        name: apiName,
        apiKey,
        baseUrl,
        description
      };

      const envConfig: EnvConfig = {
        apis: [apiConfig]
      };

      // 生成 .env 和 .env.example 文件
      const envSuccess = await configManager.generateEnvFile(projectPath, envConfig);
      const exampleSuccess = await configManager.generateEnvExample(
        projectPath,
        envConfig
      );

      if (envSuccess && exampleSuccess) {
        logger.success('API 配置完成！', {
          provider: apiName
        });

        logger.info('配置文件：');
        console.log(`  ${chalk.cyan('.env')}        - 实际配置 (包含密钥)`);
        console.log(`  ${chalk.cyan('.env.example')} - 示例配置 (不含密钥)`);
      } else {
        logger.error('配置生成失败');
      }
    });

  // 数据库配置命令
  command
    .command('database')
    .description('配置数据库连接')
    .option('-p, --path <path>', '项目路径')
    .action(async (options) => {
      logger.subtitle('🗄️  数据库配置');

      const configManager = new ConfigManager();

      // 获取项目路径
      let projectPath = options.path || process.cwd();

      // 选择数据库类型
      const { dbType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'dbType',
          message: '选择数据库类型：',
          choices: [
            { name: 'PostgreSQL', value: 'postgresql' },
            { name: 'MySQL', value: 'mysql' },
            { name: 'MongoDB', value: 'mongodb' },
            { name: 'SQLite', value: 'sqlite' }
          ]
        }
      ]);

      let dbConfig: DatabaseConfig;

      if (dbType === 'sqlite') {
        // SQLite 只需要文件路径
        await inquirer.prompt([
          {
            type: 'input',
            name: 'dbPath',
            message: '数据库文件路径:',
            default: './data/database.db'
          }
        ]);

        dbConfig = {
          type: 'sqlite'
        };
      } else {
        // 其他数据库需要完整连接信息
        const dbAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'host',
            message: '数据库主机:',
            default: 'localhost'
          },
          {
            type: 'number',
            name: 'port',
            message: '端口:',
            default: dbType === 'postgresql' ? 5432 : dbType === 'mysql' ? 3306 : 27017
          },
          {
            type: 'input',
            name: 'database',
            message: '数据库名称:',
            default: 'mydb'
          },
          {
            type: 'input',
            name: 'username',
            message: '用户名:',
            default: 'user'
          },
          {
            type: 'password',
            name: 'password',
            message: '密码:',
            mask: '*'
          }
        ]);

        dbConfig = {
          type: dbType,
          host: dbAnswers.host,
          port: dbAnswers.port,
          database: dbAnswers.database,
          username: dbAnswers.username,
          password: dbAnswers.password
        };
      }

      // 读取现有配置（如果存在）
      const existingVars = await configManager.readEnvFile(projectPath);
      const existingApis: ApiConfig[] = [];

      if (existingVars) {
        // 解析现有 API 配置
        // 简化处理，实际应该更复杂
      }

      const envConfig: EnvConfig = {
        apis: existingApis,
        database: dbConfig
      };

      // 生成配置文件
      const envSuccess = await configManager.generateEnvFile(projectPath, envConfig);
      const exampleSuccess = await configManager.generateEnvExample(
        projectPath,
        envConfig
      );

      if (envSuccess && exampleSuccess) {
        logger.success('数据库配置完成！', {
          type: dbType
        });
      } else {
        logger.error('配置生成失败');
      }
    });

  // 生成配置模板命令
  command
    .command('init')
    .description('生成配置文件模板')
    .option('-p, --path <path>', '项目路径')
    .action(async (options) => {
      logger.subtitle('📄 生成配置文件模板');

      const configManager = new ConfigManager();

      // 获取项目路径
      let projectPath = options.path || process.cwd();

      // 生成配置文件模板
      const success = await configManager.generateConfigTemplate(projectPath);

      if (success) {
        logger.success('配置文件模板生成成功！', {
          path: path.join(projectPath, 'src', 'config', 'index.ts')
        });
      } else {
        logger.error('配置文件模板生成失败');
      }
    });

  return command;
}
