/**
 * 状态查看命令
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { join } from 'path';
import { dockerManager } from '../core/docker.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

/**
 * 状态查看命令
 */
export const statusCommand = new Command('status')
  .description('查看项目服务状态')
  .argument('[path]', '项目路径', '.')
  .action(async (path) => {
    try {
      const projectPath = join(process.cwd(), path);

      // 检查项目路径是否存在
      if (!existsSync(projectPath)) {
        logger.error('项目路径不存在', { path: projectPath });
        process.exit(1);
      }

      // 检查 docker-compose.yml 是否存在
      const composeFile = join(projectPath, 'docker-compose.yml');
      if (!existsSync(composeFile)) {
        logger.error('未找到 docker-compose.yml 文件', { path: composeFile });
        logger.info('请确保这是一个 KINXKit 生成的项目');
        process.exit(1);
      }

      // 检查 Docker 是否可用
      if (!dockerManager.isAvailable()) {
        logger.error('Docker 不可用');
        process.exit(1);
      }

      logger.info('检查服务状态...');
      logger.blank();

      try {
        const services = await dockerManager.status(projectPath);

        if (services.length === 0) {
          logger.info('当前没有运行的服务');
          logger.blank();
          logger.info('使用 kinx up 启动服务');
        } else {
          logger.subtitle('服务状态');

          services.forEach(service => {
            const statusIcon = service.state === 'running' ? '✓' : '✗';
            const statusColor = service.state === 'running' ? chalk.green : chalk.red;

            console.log(`  ${statusIcon} ${chalk.cyan(service.name)}: ${statusColor(service.state)}`);

            if (service.health && service.health !== 'healthy') {
              console.log(`    健康状态: ${chalk.yellow(service.health)}`);
            }
          });

          logger.blank();
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('获取服务状态失败', { error: errorMessage });
        process.exit(1);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('查看状态失败', { error: errorMessage });
      process.exit(1);
    }
  });
