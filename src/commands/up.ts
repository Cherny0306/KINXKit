/**
 * 启动服务命令
 */

import { Command } from 'commander';
import ora from 'ora';
import { existsSync } from 'fs';
import { join } from 'path';
import { dockerManager } from '../core/docker.js';
import { logger } from '../utils/logger.js';

/**
 * 启动服务命令
 */
export const upCommand = new Command('up')
  .description('启动项目服务 (使用 Docker)')
  .argument('[path]', '项目路径', '.')
  .option('-d, --detached', '后台运行')
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
        logger.error('Docker 不可用，请先安装 Docker');
        logger.info('访问 https://www.docker.com/products/docker-desktop 下载安装');
        process.exit(1);
      }

      logger.info('启动 Docker 服务...');

      // 启动服务
      const spinner = ora('启动服务中...').start();

      try {
        await dockerManager.up(projectPath, options.detached !== false);
        spinner.succeed('服务启动成功');

        logger.blank();
        logger.info('服务已启动，可以使用以下命令查看状态:');
        logger.kv('kinx status', '查看服务状态');
        logger.kv('kinx logs', '查看服务日志');
        logger.blank();

        // 显示访问信息
        const port = detectProjectPort(projectPath);
        if (port) {
          logger.success(`服务访问地址: http://localhost:${port}`);
        }

      } catch (error) {
        spinner.fail('服务启动失败');
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('错误信息', { error: errorMessage });
        process.exit(1);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('启动服务失败', { error: errorMessage });
      process.exit(1);
    }
  });

/**
 * 检测项目端口
 */
function detectProjectPort(projectPath: string): number | null {
  // 简单的端口检测逻辑
  // 实际应用中可以从配置文件读取

  const packageJsonPath = join(projectPath, 'package.json');
  const requirementsPath = join(projectPath, 'requirements.txt');

  if (existsSync(packageJsonPath)) {
    // Node.js 项目
    return 3000;
  } else if (existsSync(requirementsPath)) {
    // Python 项目
    return 8000;
  }

  return null;
}
