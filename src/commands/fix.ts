/**
 * 诊断命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { IssueDetector, IssueSeverity } from '../core/detector-issues.js';
import { logger } from '../utils/logger.js';

const inquirer = await import('inquirer');

export function createFixCommand(): Command {
  const command = new Command('fix');

  command.description('问题诊断和自动修复');

  // 完整诊断
  command
    .command('diagnose')
    .description('运行完整系统诊断')
    .option('-j, --json', 'JSON 格式输出')
    .action(async (options) => {
      logger.subtitle('🔍 系统诊断');

      const detector = new IssueDetector();
      const result = await detector.runFullDiagnostic();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // 显示结果
      displayDiagnosticResults(result);

      // 询问是否自动修复
      const fixableIssues = result.issues.filter(i => i.autoFixAvailable);
      if (fixableIssues.length > 0) {
        console.log('');
        console.log(chalk.cyan(`发现 ${fixableIssues.length} 个可自动修复的问题`));

        const { autoFix } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'autoFix',
            message: '是否自动修复这些问题？',
            default: true
          }
        ]);

        if (autoFix) {
          const fixResult = await detector.autoFixAll(fixableIssues);
          logger.success(`修复完成: ${fixResult.success} 个成功, ${fixResult.failed} 个失败`);
        }
      }
    });

  // Docker 诊断
  command
    .command('docker')
    .description('诊断 Docker 问题')
    .action(async () => {
      logger.subtitle('🐳 Docker 诊断');

      const detector = new IssueDetector();
      const issues = await detector.diagnoseDocker();

      displayIssues(issues);
    });

  // 网络诊断
  command
    .command('network')
    .description('诊断网络问题')
    .action(async () => {
      logger.subtitle('🌐 网络诊断');

      const detector = new IssueDetector();
      const issues = await detector.diagnoseNetwork();

      displayIssues(issues);
    });

  // 依赖诊断
  command
    .command('deps')
    .description('诊断依赖问题')
    .action(async () => {
      logger.subtitle('📦 依赖诊断');

      const detector = new IssueDetector();
      const issues = await detector.diagnoseDependencies();

      displayIssues(issues);
    });

  return command;
}

/**
 * 显示诊断结果
 */
function displayDiagnosticResults(result: any): void {
  console.log('');
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  // 健康状况
  const healthColor = result.overallHealth === 'healthy' ? 'green' :
                      result.overallHealth === 'warning' ? 'yellow' : 'red';
  console.log(chalk[healthColor](`总体健康状况: ${result.overallHealth.toUpperCase()}`));
  console.log('');

  // 问题摘要
  const summary = result.summary;
  console.log(chalk.cyan('问题摘要:'));
  console.log(chalk.red(`  🔴 严重: ${summary.critical}`));
  console.log(chalk.yellow(`  🟠 高: ${summary.high}`));
  console.log(chalk.yellow(`  🟡 中: ${summary.medium}`));
  console.log(chalk.blue(`  🔵 低: ${summary.low}`));
  console.log(chalk.gray(`  ⚪ 信息: ${summary.info}`));
  console.log('');

  // 详细问题列表
  if (result.issues.length > 0) {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log('');
    console.log(chalk.cyan('发现的问题:'));
    console.log('');

    result.issues.forEach((issue: any, index: number) => {
      displayIssue(issue, index + 1);
    });
  } else {
    console.log(chalk.green('✓ 未发现问题！'));
  }

  console.log('');
}

/**
 * 显示问题列表
 */
function displayIssues(issues: any[]): void {
  if (issues.length === 0) {
    logger.success('✓ 未发现问题！');
    return;
  }

  issues.forEach((issue, index) => {
    displayIssue(issue, index + 1);
  });

  console.log('');
}

/**
 * 显示单个问题
 */
function displayIssue(issue: any, index: number): void {
  const severityColor = issue.severity === IssueSeverity.CRITICAL ? 'red' :
                      issue.severity === IssueSeverity.HIGH ? 'yellow' :
                      issue.severity === IssueSeverity.MEDIUM ? 'yellow' : 'blue';

  console.log(chalk.cyan(`${index}. ${issue.title}`));
  console.log(chalk[severityColor](`   严重程度: ${issue.severity}`));
  console.log(chalk.gray(`   描述: ${issue.description}`));
  console.log(chalk.gray(`   组件: ${issue.affectedComponent}`));

  if (issue.suggestions && issue.suggestions.length > 0) {
    console.log(chalk.cyan('   建议:'));
    issue.suggestions.forEach((suggestion: string) => {
      console.log(chalk.gray(`     • ${suggestion}`));
    });
  }

  if (issue.autoFixAvailable) {
    console.log(chalk.green('   ✓ 可自动修复'));
  }

  if (issue.fixCommands && issue.fixCommands.length > 0) {
    console.log(chalk.cyan('   修复命令:'));
    issue.fixCommands.forEach((cmd: string) => {
      console.log(chalk.gray(`     $ ${cmd}`));
    });
  }

  console.log('');
}
