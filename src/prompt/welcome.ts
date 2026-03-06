/**
 * 欢迎界面
 */

import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger.js';

/**
 * 显示欢迎信息
 */
export function showWelcome(): void {
  console.clear();
  logger.title('🚀 KINXKit - 智能项目助手');

  console.log(chalk.cyan('  从创意到运行，5分钟搞定你的项目'));
  console.log('');

  logger.info('KINXKit 是一款面向开发新手的智能项目助手');
  logger.info('通过简单的对话交互，帮你快速将创意转化为可运行的项目');

  logger.blank();
  logger.separator('─');
  logger.blank();
}

/**
 * 显示环境检测结果
 */
export async function showEnvironmentInfo(envInfo: any): Promise<void> {
  logger.subtitle('🔍 环境检测结果');

  // 基础环境
  console.log(chalk.cyan('基础环境:'));
  logger.kvWithIcon('✓', '操作系统', `${envInfo.os} (${envInfo.platform})`);
  if (envInfo.isWSL) {
    logger.kvWithIcon('✓', 'WSL2', '已安装');
  }
  logger.blank();

  // 开发工具
  console.log(chalk.cyan('开发工具:'));
  if (envInfo.docker) {
    logger.kvWithIcon('✓', 'Docker', envInfo.docker.version || '已安装');
  } else {
    logger.kvWithIcon('✗', 'Docker', '未安装');
  }

  if (envInfo.git) {
    logger.kvWithIcon('✓', 'Git', envInfo.git.version || '已安装');
    if (envInfo.git.username) {
      console.log(chalk.gray(`    用户: ${envInfo.git.username} <${envInfo.git.email}>`));
    }
  } else {
    logger.kvWithIcon('✗', 'Git', '未安装');
  }

  if (envInfo.python) {
    logger.kvWithIcon('✓', 'Python', envInfo.python);
  } else {
    logger.kvWithIcon('✗', 'Python', '未安装');
  }

  if (envInfo.node) {
    logger.kvWithIcon('✓', 'Node.js', envInfo.node);
  } else {
    logger.kvWithIcon('✗', 'Node.js', '未安装');
  }

  logger.blank();

  // GPU 环境
  if (envInfo.gpu || envInfo.cuda) {
    console.log(chalk.cyan('GPU 加速:'));

    if (envInfo.gpu) {
      logger.kvWithIcon('✓', 'NVIDIA GPU', `${envInfo.gpu.name} (${envInfo.gpu.memory}MB)`);
      if (envInfo.gpu.driverVersion) {
        console.log(chalk.gray(`    驱动: ${envInfo.gpu.driverVersion}`));
      }
    }

    if (envInfo.cuda && envInfo.cuda.available) {
      logger.kvWithIcon('✓', 'CUDA', envInfo.cuda.version || '已安装');
      if (envInfo.cuda.cuDNN) {
        logger.kvWithIcon('✓', 'cuDNN', '已安装', 2);
      }
      if (envInfo.cuda.nvccPath) {
        logger.kv('    nvcc', envInfo.cuda.nvccPath, 2);
      }
    }

    logger.blank();
  }

  // 网络配置
  console.log(chalk.cyan('网络配置:'));
  if (envInfo.proxy && envInfo.proxy.enabled) {
    logger.kvWithIcon('⚠', '代理', `${envInfo.proxy.host}:${envInfo.proxy.port} (${envInfo.proxy.software || 'Unknown'})`);
  } else {
    logger.kvWithIcon('✓', '代理', '未配置');
  }

  if (envInfo.github) {
    if (envInfo.github.authenticated) {
      logger.kvWithIcon('✓', 'GitHub', `已登录 (${envInfo.github.authMethod})`);
    } else {
      logger.kvWithIcon('✗', 'GitHub', '未登录');
    }
  }

  logger.blank();

  // 建议
  const suggestions: string[] = [];

  if (!envInfo.docker) {
    suggestions.push('安装 Docker 以获得容器化支持');
  }

  if (!envInfo.git) {
    suggestions.push('安装 Git 以进行版本控制');
  }

  if (envInfo.gpu && (!envInfo.cuda || !envInfo.cuda.available)) {
    suggestions.push('安装 CUDA Toolkit 以启用 GPU 加速');
  }

  if (envInfo.platform === 'win32' && !envInfo.isWSL) {
    suggestions.push('安装 WSL2 以获得更好的开发体验');
  }

  if (suggestions.length > 0) {
    console.log(chalk.cyan('💡 建议:'));
    suggestions.forEach((suggestion, index) => {
      console.log(chalk.yellow(`  ${index + 1}. ${suggestion}`));
    });
    logger.blank();

    console.log(chalk.gray('查看详细配置指南:'));
    console.log(chalk.gray('  - CUDA: docs/setup/CUDA.md'));
    console.log(chalk.gray('  - WSL: docs/setup/WSL.md'));
    logger.blank();
  }
}

/**
 * 显示项目类型选择
 */
export function showProjectTypeOptions(): void {
  logger.subtitle('你想做什么类型的项目？');

  const options = [
    { value: '1', name: '网站/网页应用', emoji: '🌐' },
    { value: '2', name: 'API/后端服务', emoji: '🔌' },
    { value: '3', name: '数据分析/可视化', emoji: '📊' },
    { value: '4', name: 'AI/聊天机器人', emoji: '🤖' },
    { value: '5', name: '工具/脚本', emoji: '🔧' },
    { value: '0', name: '直接描述我的想法', emoji: '💬' }
  ];

  options.forEach((option) => {
    console.log(`  ${option.emoji} [${option.value}] ${option.name}`);
  });

  console.log('');
}

/**
 * 显示技术栈推荐
 */
export function showTechStackRecommendation(stack: any): void {
  logger.subtitle('💡 推荐技术栈');

  console.log(chalk.cyan('项目类型:'), chalk.yellow(stack.type || '未知'));
  console.log('');

  if (stack.backend) {
    logger.kv('后端框架', stack.backend);
  }

  if (stack.frontend) {
    logger.kv('前端框架', stack.frontend);
  }

  if (stack.database) {
    logger.kv('数据库', stack.database);
  }

  if (stack.ai) {
    logger.kv('AI服务', stack.ai);
  }

  if (stack.container) {
    logger.kv('容器化', stack.container);
  }

  if (stack.gpu) {
    logger.kvWithIcon('⚡', 'GPU加速', '已启用');
  }

  logger.blank();
}

/**
 * 显示配置确认
 */
export function showConfigConfirmation(config: any): void {
  logger.subtitle('📋 项目配置确认');

  console.log(chalk.cyan('项目名称:'), chalk.yellow(config.name));
  console.log('');

  console.log(chalk.cyan('技术栈:'));
  if (config.techStack.backend) {
    logger.kv('后端', config.techStack.backend, 1);
  }
  if (config.techStack.frontend) {
    logger.kv('前端', config.techStack.frontend, 1);
  }
  if (config.techStack.database) {
    logger.kv('数据库', config.techStack.database, 1);
  }
  if (config.techStack.ai) {
    logger.kv('AI服务', config.techStack.ai, 1);
  }
  if (config.techStack.gpu) {
    logger.kv('GPU', '启用', 1);
  }

  console.log('');

  console.log(chalk.cyan('生成位置:'), chalk.yellow(config.path));
  console.log('');

  if (config.createGitHub) {
    console.log(chalk.cyan('GitHub:'), chalk.yellow('创建仓库并推送代码'));
  } else {
    console.log(chalk.cyan('GitHub:'), chalk.gray('不创建'));
  }

  logger.blank();
}

/**
 * 显示进度动画
 */
export async function showProgress(task: string): Promise<any> {
  const spinner = ora(task).start();
  return spinner;
}
