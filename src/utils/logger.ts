/**
 * 日志工具
 */

import chalk from 'chalk';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * 日志工具类
 */
export class Logger {
  private debugMode: boolean = false;

  /**
   * 设置调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: Record<string, any>): void {
    if (this.debugMode) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 错误日志
   */
  error(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 成功日志
   */
  success(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.SUCCESS, message, data);
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = chalk.gray(`[${timestamp}]`);

    let output = '';

    switch (level) {
      case LogLevel.DEBUG:
        output = `${prefix} ${chalk.gray('DEBUG')} ${message}`;
        break;
      case LogLevel.INFO:
        output = `${prefix} ${chalk.blue('INFO')} ${message}`;
        break;
      case LogLevel.WARN:
        output = `${prefix} ${chalk.yellow('WARN')} ${message}`;
        break;
      case LogLevel.ERROR:
        output = `${prefix} ${chalk.red('ERROR')} ${message}`;
        break;
      case LogLevel.SUCCESS:
        output = `${prefix} ${chalk.green('SUCCESS')} ${message}`;
        break;
    }

    // 输出消息
    console.log(output);

    // 输出数据
    if (data && Object.keys(data).length > 0) {
      const formattedData = JSON.stringify(data, null, 2);
      console.log(chalk.gray(formattedData));
    }
  }

  /**
   * 分隔线
   */
  separator(char: string = '=', length: number = 50): void {
    console.log(char.repeat(length));
  }

  /**
   * 空行
   */
  blank(): void {
    console.log('');
  }

  /**
   * 标题
   */
  title(text: string): void {
    this.blank();
    this.separator();
    console.log(chalk.bold.white(text));
    this.separator();
    this.blank();
  }

  /**
   * 子标题
   */
  subtitle(text: string): void {
    this.blank();
    console.log(chalk.bold.cyan(text));
    this.blank();
  }

  /**
   * 列表
   */
  list(items: string[], indent: number = 0): void {
    const prefix = '  '.repeat(indent);
    items.forEach(item => {
      console.log(`${prefix}${chalk.gray('•')} ${item}`);
    });
  }

  /**
   * 键值对
   */
  kv(key: string, value: string, indent: number = 0): void {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}${chalk.cyan(key)}: ${value}`);
  }

  /**
   * 带图标的键值对
   */
  kvWithIcon(
    icon: string,
    key: string,
    value: string,
    indent: number = 0
  ): void {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}${icon} ${chalk.cyan(key)}: ${value}`);
  }
}

// 导出单例
export const logger = new Logger();
