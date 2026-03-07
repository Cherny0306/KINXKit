/**
 * GitHub 命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { GitHubManager } from '../core/github.js';
import { logger } from '../utils/logger.js';

export function createGitHubCommand(): Command {
  const command = new Command('github');

  command.description('GitHub 集成管理');

  // 登录命令
  command
    .command('login')
    .description('GitHub 登录认证')
    .action(async () => {
      logger.subtitle('🔑 GitHub 登录');

      const github = new GitHubManager();

      // 检查当前认证状态
      const authStatus = await github.checkAuthStatus();

      if (authStatus.authenticated) {
        logger.info('已登录 GitHub', {
          method: authStatus.method,
          username: authStatus.username
        });

        const { relogin } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'relogin',
            message: '是否要重新登录？',
            default: false
          }
        ]);

        if (!relogin) {
          return;
        }
      }

      // 选择认证方式
      const { method } = await inquirer.prompt([
        {
          type: 'list',
          name: 'method',
          message: '选择认证方式：',
          choices: [
            {
              name: '✅ GitHub CLI (推荐)',
              value: 'cli'
            },
            {
              name: '🔑 Personal Access Token',
              value: 'token'
            }
          ]
        }
      ]);

      if (method === 'cli') {
        await github.authenticateWithCli();
      } else if (method === 'token') {
        const { token } = await inquirer.prompt([
          {
            type: 'password',
            name: 'token',
            message: '请输入 Personal Access Token:',
            mask: '*'
          }
        ]);

        if (token) {
          await github.authenticateWithToken(token);

          // 保存 token 到环境变量
          logger.info('提示：将 token 添加到环境变量');
          logger.info('  Linux/Mac: export GITHUB_TOKEN=your_token');
          logger.info('  Windows: set GITHUB_TOKEN=your_token');
        }
      }

      // 验证登录
      const newAuthStatus = await github.checkAuthStatus();

      if (newAuthStatus.authenticated) {
        logger.success('登录成功！', {
          username: newAuthStatus.username
        });
      } else {
        logger.error('登录失败');
      }
    });

  // 状态命令
  command
    .command('status')
    .description('查看 GitHub 认证状态')
    .action(async () => {
      logger.subtitle('📊 GitHub 认证状态');

      const github = new GitHubManager();
      const authStatus = await github.checkAuthStatus();

      if (authStatus.authenticated) {
        console.log(chalk.green('✓ 已认证'));
        console.log(chalk.cyan('  认证方式:'), chalk.yellow(authStatus.method));

        if (authStatus.username) {
          console.log(chalk.cyan('  用户名:'), chalk.yellow(authStatus.username));
        }
      } else {
        console.log(chalk.red('✗ 未认证'));
        console.log('');
        console.log(chalk.gray('请运行: kinx github login'));
      }
    });

  // 创建仓库命令
  command
    .command('create')
    .description('创建 GitHub 仓库')
    .option('-p, --path <path>', '项目路径')
    .option('-n, --name <name>', '仓库名称')
    .option('-d, --description <description>', '仓库描述')
    .option('--private', '私有仓库')
    .action(async (options) => {
      logger.subtitle('🌟 创建 GitHub 仓库');

      const github = new GitHubManager();

      // 检查认证状态
      const authStatus = await github.checkAuthStatus();

      if (!authStatus.authenticated) {
        logger.error('未进行 GitHub 认证，请先运行: kinx github login');
        return;
      }

      logger.success('已认证', {
        username: authStatus.username
      });

      // 获取项目路径
      let projectPath = options.path;

      if (!projectPath) {
        const { path } = await inquirer.prompt([
          {
            type: 'input',
            name: 'path',
            message: '项目路径:',
            default: process.cwd()
          }
        ]);

        projectPath = path;
      }

      // 获取仓库名称
      let repoName = options.name;

      if (!repoName) {
        const { name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: '仓库名称:',
            default: path.basename(projectPath)
          }
        ]);

        repoName = name;
      }

      // 获取仓库描述
      let description = options.description;

      if (!description) {
        const { desc } = await inquirer.prompt([
          {
            type: 'input',
            name: 'desc',
            message: '仓库描述 (可选):'
          }
        ]);

        description = desc;
      }

      // 确认创建
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: '确认创建仓库？',
          default: true
        }
      ]);

      if (!confirmed) {
        logger.info('已取消');
        return;
      }

      // 创建并推送
      const success = await github.createAndPush(projectPath, {
        name: repoName,
        description,
        private: options.private || false
      });

      if (success) {
        logger.success('仓库创建成功！');
      } else {
        logger.error('仓库创建失败');
      }
    });

  return command;
}
