/**
 * Doctor 命令 - 环境诊断
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { EnvironmentDetector } from '../core/detector.js';
import { GitHubManager } from '../core/github.js';
import { logger } from '../utils/logger.js';

/**
 * 诊断结果
 */
interface DiagnosticResult {
  category: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  suggestions?: string[];
}

/**
 * 诊断报告
 */
interface DiagnosticReport {
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  results: DiagnosticResult[];
}

export function createDoctorCommand(): Command {
  const command = new Command('doctor');

  command
    .description('诊断开发环境')
    .option('-v, --verbose', '显示详细信息')
    .action(async (options) => {
      logger.subtitle('🏥 KINXKit 环境诊断');

      const detector = new EnvironmentDetector();
      const results: DiagnosticResult[] = [];

      // 1. 基础环境检查
      logger.info('正在检查基础环境...');

      try {
        const envInfo = await detector.detect();

        // 操作系统
        results.push({
          category: '操作系统',
          status: 'pass',
          message: `✓ ${envInfo.os} (${envInfo.platform})`
        });

        // WSL2 (Windows)
        if (envInfo.platform === 'win32') {
          if (envInfo.isWSL) {
            results.push({
              category: 'WSL2',
              status: 'pass',
              message: '✓ WSL2 已安装'
            });
          } else {
            results.push({
              category: 'WSL2',
              status: 'warn',
              message: '⚠ WSL2 未安装',
              suggestions: [
                '推荐安装 WSL2 以获得更好的开发体验',
                '运行: wsl --install',
                '查看: docs/setup/WSL.md'
              ]
            });
          }
        }

        // Docker
        if (envInfo.docker) {
          results.push({
            category: 'Docker',
            status: 'pass',
            message: `✓ Docker 已安装 (${envInfo.docker.version || '未知版本'})`
          });
        } else {
          results.push({
            category: 'Docker',
            status: 'fail',
            message: '✗ Docker 未安装',
            suggestions: [
              '安装 Docker Desktop: https://www.docker.com/products/docker-desktop',
              'Docker 是运行项目的必需工具'
            ]
          });
        }

        // Git
        if (envInfo.git) {
          let gitMessage = `✓ Git 已安装 (${envInfo.git.version || '未知版本'})`;

          if (envInfo.git.username) {
            gitMessage += `\n  用户: ${envInfo.git.username} <${envInfo.git.email}>`;
          }

          results.push({
            category: 'Git',
            status: 'pass',
            message: gitMessage
          });
        } else {
          results.push({
            category: 'Git',
            status: 'fail',
            message: '✗ Git 未安装',
            suggestions: [
              '安装 Git: https://git-scm.com/downloads',
              'Git 是版本控制必需工具'
            ]
          });
        }

        // Python
        if (envInfo.python) {
          results.push({
            category: 'Python',
            status: 'pass',
            message: `✓ Python 已安装 (${envInfo.python})`
          });
        } else {
          results.push({
            category: 'Python',
            status: 'warn',
            message: '⚠ Python 未安装',
            suggestions: [
              '安装 Python: https://www.python.org/downloads/',
              '某些项目模板需要 Python'
            ]
          });
        }

        // Node.js
        if (envInfo.node) {
          results.push({
            category: 'Node.js',
            status: 'pass',
            message: `✓ Node.js 已安装 (${envInfo.node})`
          });
        } else {
          results.push({
            category: 'Node.js',
            status: 'warn',
            message: '⚠ Node.js 未安装',
            suggestions: [
              '安装 Node.js: https://nodejs.org/',
              '某些项目模板需要 Node.js'
            ]
          });
        }

        // GPU/CUDA (AI/ML 项目)
        if (envInfo.gpu || envInfo.cuda) {
          let gpuMessage = '';

          if (envInfo.gpu) {
            const memoryGB = (envInfo.gpu.memory / 1024).toFixed(1);
            gpuMessage = `✓ GPU: ${envInfo.gpu.name} (${memoryGB}GB)`;
          }

          if (envInfo.cuda && envInfo.cuda.available) {
            gpuMessage += `\n  ✓ CUDA: ${envInfo.cuda.version || '已安装'}`;

            if (envInfo.cuda.cuDNN) {
              gpuMessage += '\n  ✓ cuDNN: 已安装';
            } else {
              gpuMessage += '\n  ⚠ cuDNN: 未安装 (建议安装以提升性能)';
            }
          }

          results.push({
            category: 'GPU 加速',
            status: 'pass',
            message: gpuMessage
          });
        }

        // 代理配置
        if (envInfo.proxy && envInfo.proxy.enabled) {
          results.push({
            category: '网络代理',
            status: 'pass',
            message: `✓ 代理已配置 (${envInfo.proxy.host}:${envInfo.proxy.port})`
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          category: '环境检测',
          status: 'fail',
          message: `✗ 环境检测失败: ${errorMessage}`
        });
      }

      // 2. GitHub 认证检查
      logger.info('正在检查 GitHub 认证...');

      try {
        const github = new GitHubManager();
        const authStatus = await github.checkAuthStatus();

        if (authStatus.authenticated) {
          results.push({
            category: 'GitHub',
            status: 'pass',
            message: `✓ GitHub 已认证 (${authStatus.method})`,
            suggestions: authStatus.username
              ? [`用户: ${authStatus.username}`]
              : undefined
          });
        } else {
          results.push({
            category: 'GitHub',
            status: 'warn',
            message: '⚠ GitHub 未认证',
            suggestions: [
              '运行: kinx github login',
              'GitHub 认证用于创建仓库和推送代码'
            ]
          });
        }
      } catch (error) {
        results.push({
          category: 'GitHub',
          status: 'warn',
          message: '⚠ GitHub 检查失败',
          suggestions: ['请检查网络连接或 GitHub 配置']
        });
      }

      // 3. KINXKit 配置检查
      logger.info('正在检查 KINXKit 配置...');

      // 检查配置文件
      const fs = await import('fs/promises');
      const path = await import('path');

      const configPath = path.join(process.cwd(), '.env');
      try {
        await fs.access(configPath);
        results.push({
          category: '项目配置',
          status: 'pass',
          message: '✓ .env 文件存在'
        });
      } catch {
        results.push({
          category: '项目配置',
          status: 'warn',
          message: '⚠ .env 文件不存在',
          suggestions: [
            '运行: kinx config api 配置 API 密钥',
            '运行: kinx config database 配置数据库'
          ]
        });
      }

      // 4. 生成诊断报告
      logger.blank();
      logger.subtitle('📋 诊断报告');

      const report: DiagnosticReport = {
        totalChecks: results.length,
        passed: results.filter((r) => r.status === 'pass').length,
        warnings: results.filter((r) => r.status === 'warn').length,
        failed: results.filter((r) => r.status === 'fail').length,
        results
      };

      // 显示结果
      results.forEach((result) => {
        console.log('');
        console.log(chalk.cyan(result.category + ':'));

        if (result.status === 'pass') {
          console.log(chalk.green(result.message));
        } else if (result.status === 'warn') {
          console.log(chalk.yellow(result.message));

          if (result.suggestions && options.verbose) {
            result.suggestions.forEach((suggestion) => {
              console.log(chalk.gray(`  💡 ${suggestion}`));
            });
          }
        } else if (result.status === 'fail') {
          console.log(chalk.red(result.message));

          if (result.suggestions) {
            result.suggestions.forEach((suggestion) => {
              console.log(chalk.gray(`  💡 ${suggestion}`));
            });
          }
        }
      });

      // 总结
      console.log('');
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log('');
      console.log(
        chalk.cyan('总计: '),
        chalk.yellow(`${report.totalChecks} 项检查`)
      );
      console.log(
        chalk.green('✓ 通过: '),
        chalk.yellow(`${report.passed} 项`)
      );
      console.log(
        chalk.yellow('⚠ 警告: '),
        chalk.yellow(`${report.warnings} 项`)
      );
      console.log(
        chalk.red('✗ 失败: '),
        chalk.yellow(`${report.failed} 项`)
      );
      console.log('');

      // 整体状态
      if (report.failed === 0 && report.warnings === 0) {
        logger.success('🎉 所有检查通过！环境配置完美！');
      } else if (report.failed === 0) {
        logger.warn('⚠️  存在一些警告，建议修复以获得更好体验');
      } else {
        logger.error('❌ 发现一些问题，请修复后再继续');
      }

      // 建议
      if (report.warnings > 0 || report.failed > 0) {
        console.log(chalk.cyan('💡 建议:'));

        if (!options.verbose) {
          console.log(chalk.gray('  运行: kinx doctor --verbose 查看详细建议'));
        }

        console.log('');
      }
    });

  return command;
}
