/**
 * 停止服务命令
 */

import { Command } from 'commander';
import ora from 'ora';
import { existsSync } from 'fs';
import { join } from 'path';
import { dockerManager } from '../core/docker.js';
import { logger } from '../utils/logger.js';

/**
 * 停止服务命令
 */
export const downCommand = new Command('down')
  .description('停止项目服务')
  .argument('[path]', '项目路径', '.')
  .option('-v, --volumes', '同时删除数据卷')
  .action(async (path, options) => {
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

      logger.info('停止 Docker 服务...');

      const spinner = ora('停止服务中...').start();

      try {
        await dockerManager.down(projectPath, options.volumes);
        spinner.succeed('服务已停止');

        if (options.volumes) {
          logger.warn('数据卷已删除');
        }

        logger.blank();

      } catch (error) {
        spinner.fail('停止服务失败');
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('错误信息', { error: errorMessage });
        process.exit(1);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('停止服务失败', { error: errorMessage });
      process.exit(1);
    }
  });
