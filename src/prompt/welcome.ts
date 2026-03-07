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
    console.log(chalk.cyan('GPU 加速 (AI/ML 项目):'));

    if (envInfo.gpu) {
      // 计算 GPU 性能评分
      const memoryGB = ((envInfo.gpu.memory || 0) / 1024).toFixed(1);
      const gpuName = envInfo.gpu.name || 'Unknown GPU';
      const performanceScore = calculateGPUPerformance(gpuName, envInfo.gpu.memory || 0);
      const performanceLabel = getPerformanceLabel(performanceScore);

      logger.kvWithIcon('✓', 'NVIDIA GPU', `${envInfo.gpu.name} (${memoryGB}GB)`);
      logger.kvWithIcon('⚡', '性能评分', `${performanceScore}/100 (${performanceLabel})`, 2);

      if (envInfo.gpu.driverVersion) {
        console.log(chalk.gray(`    驱动版本: ${envInfo.gpu.driverVersion}`));
      }

      // 显存使用建议
      if (envInfo.gpu.memory < 4096) {
        console.log(chalk.yellow(`    ⚠ 显存较小，建议使用云 GPU 或轻量级模型`));
      } else if (envInfo.gpu.memory >= 8192) {
        console.log(chalk.green(`    ✓ 显存充足，可运行大型 AI 模型`));
      }
    }

    if (envInfo.cuda && envInfo.cuda.available) {
      logger.kvWithIcon('✓', 'CUDA Toolkit', envInfo.cuda.version || '已安装');

      // CUDA 版本兼容性提示
      const cudaVersion = envInfo.cuda.version ? parseVersion(envInfo.cuda.version) : { major: 0, minor: 0 };
      if (cudaVersion.major >= 12) {
        console.log(chalk.green(`    ✓ CUDA 版本较新，支持最新 AI 框架`));
      } else if (cudaVersion.major > 0) {
        console.log(chalk.yellow(`    ⚠ 建议升级到 CUDA 12.x 以获得更好性能`));
      }

      if (envInfo.cuda.cuDNN) {
        logger.kvWithIcon('✓', 'cuDNN', '已安装 (性能加速库)', 2);
      } else {
        console.log(chalk.yellow(`    ⚠ cuDNN 未安装 (建议安装以提升训练速度)`));
      }

      if (envInfo.cuda.nvccPath) {
        logger.kv('    nvcc 路径', envInfo.cuda.nvccPath, 2);
      }
    } else if (envInfo.gpu) {
      console.log(chalk.yellow(`    ⚠ CUDA 未安装，GPU 无法用于 AI 加速`));
      console.log(chalk.gray(`    访问 https://developer.nvidia.com/cuda-downloads`));
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

  // WSL2 建议（Windows 用户）
  if (envInfo.platform === 'win32' && !envInfo.isWSL) {
    console.log(chalk.cyan('💡 Windows 开发环境建议:'));
    console.log('');
    console.log(chalk.yellow('  推荐安装 WSL2 (Windows Subsystem for Linux)'));
    console.log('');
    console.log(chalk.gray('  优势:'));
    console.log(chalk.gray('  • 原生 Linux 性能，比虚拟机更快'));
    console.log(chalk.gray('  • 完整的 Docker 支持，无需配置'));
    console.log(chalk.gray('  • GPU 加速支持（CUDA）'));
    console.log(chalk.gray('  • 与 Windows 无缝集成，文件共享'));
    console.log('');
    console.log(chalk.gray('  快速安装:'));
    console.log(chalk.gray('  1. 打开 PowerShell (管理员)'));
    console.log(chalk.gray('  2. 运行: wsl --install'));
    console.log(chalk.gray('  3. 重启电脑并完成 Ubuntu 设置'));
    console.log('');
    console.log(chalk.gray('  详细指南: docs/setup/WSL.md'));
    console.log('');
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

/**
 * 显示带步骤的进度动画
 */
export async function showProgressWithSteps(
  task: string,
  currentStep: number,
  totalSteps: number,
  stepName?: string
): Promise<any> {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const progressText = stepName
    ? `[${currentStep}/${totalSteps}] ${task} - ${stepName} (${percentage}%)`
    : `[${currentStep}/${totalSteps}] ${task} (${percentage}%)`;

  const spinner = ora(progressText).start();
  return spinner;
}

/**
 * GPU 性能评分计算
 */
function calculateGPUPerformance(gpuName: string, memoryMB: number): number {
  let score = 50; // 基础分

  // 根据 GPU 型号调整
  const name = gpuName.toLowerCase();

  if (name.includes('rtx 4090')) score += 40;
  else if (name.includes('rtx 4080')) score += 35;
  else if (name.includes('rtx 4070')) score += 30;
  else if (name.includes('rtx 4060')) score += 25;
  else if (name.includes('rtx 3090')) score += 35;
  else if (name.includes('rtx 3080')) score += 30;
  else if (name.includes('rtx 3070')) score += 25;
  else if (name.includes('rtx 3060')) score += 20;
  else if (name.includes('gtx 1660')) score += 15;
  else if (name.includes('gtx 1650')) score += 10;

  // 根据显存调整
  if (memoryMB >= 24576) score += 10; // 24GB+
  else if (memoryMB >= 16384) score += 8; // 16GB+
  else if (memoryMB >= 12288) score += 6; // 12GB+
  else if (memoryMB >= 8192) score += 4; // 8GB+
  else if (memoryMB >= 6144) score += 2; // 6GB+
  else if (memoryMB >= 4096) score += 0; // 4GB (基础)
  else score -= 10; // <4GB

  return Math.min(100, Math.max(0, score));
}

/**
 * 获取性能等级标签
 */
function getPerformanceLabel(score: number): string {
  if (score >= 90) return '旗舰级';
  if (score >= 75) return '高端';
  if (score >= 60) return '中高端';
  if (score >= 45) return '中端';
  if (score >= 30) return '入门级';
  return '基础';
}

/**
 * 解析 CUDA 版本号
 */
function parseVersion(version: string): { major: number; minor: number } {
  const match = version.match(/(\d+)\.(\d+)/);
  if (match && match[1] && match[2]) {
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10)
    };
  }
  return { major: 0, minor: 0 };
}
