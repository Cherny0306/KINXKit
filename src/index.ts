#!/usr/bin/env node
/**
 * KINXKit - 智能项目助手
 * 从创意到运行，5分钟搞定你的项目
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from './utils/logger.js';
import { createCommand } from './commands/create.js';
import { upCommand } from './commands/up.js';
import { downCommand } from './commands/down.js';
import { statusCommand } from './commands/status.js';
import { logsCommand } from './commands/logs.js';
import { createGitHubCommand } from './commands/github.js';
import { createConfigCommand } from './commands/config.js';
import { createDoctorCommand } from './commands/doctor.js';

/**
 * KINXKit 主程序
 */
class KinxKit {
  private version = '0.1.0';

  /**
   * 启动应用
   */
  async run(): Promise<void> {
    // 显示欢迎信息
    this.showWelcome();

    // 创建 CLI 程序
    const program = new Command();

    program
      .name('kinx')
      .description('智能项目助手 - 从创意到运行，5分钟搞定你的项目')
      .version(this.version)
      .addCommand(createCommand)
      .addCommand(upCommand)
      .addCommand(downCommand)
      .addCommand(statusCommand)
      .addCommand(logsCommand)
      .addCommand(createGitHubCommand())
      .addCommand(createConfigCommand())
      .addCommand(createDoctorCommand())
      .parse(process.argv);
  }

  /**
   * 显示欢迎信息
   */
  private showWelcome(): void {
    console.clear();
    logger.title('🚀 KINXKit - 智能项目助手');

    console.log(chalk.cyan('  从创意到运行，5分钟搞定你的项目'));
    console.log(chalk.gray('  版本: ') + chalk.yellow(this.version));
    console.log('');

    logger.info('正在初始化...');
    logger.blank();
  }
}

// 主入口
const app = new KinxKit();
app.run().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error('启动失败', { error: errorMessage });
  process.exit(1);
});

export { KinxKit };
