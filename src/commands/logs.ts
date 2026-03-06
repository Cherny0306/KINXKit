/**
 * 日志查看命令
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { join } from 'path';
import { dockerManager } from '../core/docker.js';
import { logger } from '../utils/logger.js';

/**
 * 日志查看命令
 */
export const logsCommand = new Command('logs')
  .description('查看服务日志')
  .argument('[service]', '服务名称')
  .option('-f, --follow', '持续跟踪日志', true)
  .option('-n, --no-follow', '不持续跟踪日志')
  .action(async (service, options) => {
    try {
      const projectPath = process.cwd();

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

      logger.info('查看服务日志...');
      logger.blank();

      try {
        const logs = await dockerManager.logs(projectPath, service, options.follow);

        if (logs.trim().length === 0) {
          logger.info('暂无日志输出');
          logger.blank();
          logger.info('提示: 使用 kinx up 启动服务以查看日志');
        } else {
          console.log(logs);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('获取日志失败', { error: errorMessage });
        process.exit(1);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('查看日志失败', { error: errorMessage });
      process.exit(1);
    }
  });
