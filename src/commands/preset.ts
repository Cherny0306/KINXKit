/**
 * 预设命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigPresetManager } from '../core/preset-manager.js';
import { logger } from '../utils/logger.js';

export function createPresetCommand(): Command {
  const command = new Command('preset');

  command.description('配置预设管理');

  // 列出所有预设
  command
    .command('list')
    .description('列出所有可用预设')
    .option('-t, --type <type>', '预设类型 (ai/database)')
    .action(async (options) => {
      const manager = new ConfigPresetManager();

      if (options.type === 'ai') {
        listAIServicePresets(manager);
      } else if (options.type === 'database') {
        listDatabasePresets(manager);
      } else {
        listAIServicePresets(manager);
        listDatabasePresets(manager);
      }
    });

  // 搜索预设
  command
    .command('search <query>')
    .description('搜索预设')
    .action(async (query) => {
      const manager = new ConfigPresetManager();
      const results = manager.searchPresets(query);

      console.log('');
      console.log(chalk.cyan(`搜索结果: "${query}"`));
      console.log('');

      if (results.ai.length > 0) {
        console.log(chalk.yellow('AI 服务:'));
        results.ai.forEach(preset => {
          console.log(`  • ${chalk.green(preset.displayName)} (${preset.name})`);
          console.log(`    ${preset.description}`);
          console.log('');
        });
      }

      if (results.databases.length > 0) {
        console.log(chalk.yellow('数据库:'));
        results.databases.forEach(preset => {
          console.log(`  • ${chalk.green(preset.displayName)} (${preset.name})`);
          console.log(`    ${preset.description}`);
          console.log('');
        });
      }

      if (results.ai.length === 0 && results.databases.length === 0) {
        console.log(chalk.gray('未找到匹配的预设'));
      }
    });

  // 应用 AI 服务预设
  command
    .command('ai <service>')
    .description('应用 AI 服务配置预设')
    .option('-k, --key <apiKey>', 'API 密钥')
    .option('-m, --model <model>', '模型名称')
    .action(async (service, options) => {
      const manager = new ConfigPresetManager();

      logger.info(`正在生成 ${service} 配置...`);

      try {
        // 获取 API 密钥
        let apiKey = options.key;
        if (!apiKey) {
          const answers = await inquirer.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: `请输入 ${service} API 密钥:`,
              mask: '*'
            }
          ]);
          apiKey = answers.apiKey;
        }

        // 生成配置
        const config = await manager.generateAIServiceConfig(service, apiKey, {
          model: options.model
        });

        console.log('');
        console.log(chalk.cyan('生成的配置:'));
        console.log('');
        console.log(config);

        // 询问是否保存
        const { save } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'save',
            message: '是否保存到 .env 文件？',
            default: true
          }
        ]);

        if (save) {
          const fs = await import('fs/promises');
          await fs.writeFile('.env', config, 'utf-8');
          logger.success('✓ 配置已保存到 .env');
        }

      } catch (error: any) {
        logger.error('配置生成失败', { error: error.message });
      }
    });

  // 应用数据库预设
  command
    .command('database <db>')
    .description('应用数据库配置预设')
    .option('-H, --host <host>', '主机地址')
    .option('-p, --port <port>', '端口')
    .option('-d, --database <name>', '数据库名称')
    .option('-u, --user <username>', '用户名')
    .option('-P, --password <password>', '密码')
    .action(async (db, options) => {
      const manager = new ConfigPresetManager();

      logger.info(`正在生成 ${db} 配置...`);

      try {
        const config = await manager.generateDatabaseConfig(db, {
          host: options.host,
          port: options.port ? parseInt(options.port) : undefined,
          database: options.database,
          username: options.user,
          password: options.password
        });

        console.log('');
        console.log(chalk.cyan('环境变量配置:'));
        console.log('');
        console.log(config.envFile);
        console.log('');

        if (config.dockerCompose) {
          console.log(chalk.cyan('Docker Compose 配置:'));
          console.log('');
          console.log(config.dockerCompose);
          console.log('');
        }

        // 询问是否保存
        const { save } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'save',
            message: '是否保存配置文件？',
            default: true
          }
        ]);

        if (save) {
          const fs = await import('fs/promises');

          // 保存 .env
          await fs.writeFile('.env', config.envFile, 'utf-8');
          logger.success('✓ .env 已保存');

          // 保存 docker-compose.yml
          if (config.dockerCompose) {
            await fs.writeFile('docker-compose.yml', config.dockerCompose, 'utf-8');
            logger.success('✓ docker-compose.yml 已保存');
          }
        }

      } catch (error: any) {
        logger.error('配置生成失败', { error: error.message });
      }
    });

  // 获取推荐
  command
    .command('recommend <projectType>')
    .description('获取项目类型推荐')
    .action(async (projectType) => {
      const manager = new ConfigPresetManager();
      const recommended = manager.getRecommendedPresets(projectType);

      console.log('');
      console.log(chalk.cyan(`推荐配置: ${projectType}`));
      console.log('');

      if (recommended.ai) {
        console.log(chalk.yellow('AI 服务:'));
        console.log(`  • ${chalk.green(recommended.ai.displayName)}`);
        console.log(`    ${recommended.ai.description}`);
        console.log(`    文档: ${recommended.ai.docsUrl}`);
        console.log('');
      }

      if (recommended.database) {
        console.log(chalk.yellow('数据库:'));
        console.log(`  • ${chalk.green(recommended.database.displayName)}`);
        console.log(`    ${recommended.database.description}`);
        console.log(`    特性: ${recommended.database.features.join(', ')}`);
        console.log('');
      }
    });

  return command;
}

/**
 * 列出 AI 服务预设
 */
function listAIServicePresets(manager: ConfigPresetManager): void {
  const presets = manager.getAIServicePresets();

  console.log('');
  console.log(chalk.cyan('AI 服务预设:'));
  console.log('');

  presets.forEach(preset => {
    console.log(`${chalk.green('•')} ${chalk.yellow(preset.displayName)} (${preset.name})`);
    console.log(`  ${preset.description}`);
    console.log(`  文档: ${preset.docsUrl}`);
    if (preset.pricingUrl) {
      console.log(`  价格: ${preset.pricingUrl}`);
    }
    console.log(`  环境变量: ${Object.values(preset.envVars).join(', ')}`);
    console.log('');
  });
}

/**
 * 列出数据库预设
 */
function listDatabasePresets(manager: ConfigPresetManager): void {
  const presets = manager.getDatabasePresets();

  console.log('');
  console.log(chalk.cyan('数据库预设:'));
  console.log('');

  presets.forEach(preset => {
    console.log(`${chalk.green('•')} ${chalk.yellow(preset.displayName)} (${preset.name})`);
    console.log(`  ${preset.description}`);
    console.log(`  默认端口: ${preset.defaultPort}`);
    console.log(`  特性: ${preset.features.join(', ')}`);
    console.log(`  SSL: ${preset.sslSupport ? '✅' : '❌'}`);
    console.log(`  连接池: ${preset.connectionPoolSupport ? '✅' : '❌'}`);
    console.log('');
  });
}
