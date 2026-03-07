/**
 * 问题诊断系统
 */

import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * 问题类型
 */
export enum IssueType {
  DOCKER = 'docker',
  NETWORK = 'network',
  DEPENDENCY = 'dependency',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  ENVIRONMENT = 'environment'
}

/**
 * 问题严重程度
 */
export enum IssueSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

/**
 * 问题定义
 */
export interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedComponent: string;
  suggestions: string[];
  autoFixAvailable: boolean;
  fixCommands?: string[];
}

/**
 * 诊断结果
 */
export interface DiagnosticResult {
  issues: Issue[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

/**
 * 问题诊断器
 */
export class IssueDetector {
  /**
   * 运行完整诊断
   */
  async runFullDiagnostic(): Promise<DiagnosticResult> {
    logger.info('🔍 开始系统诊断...');

    const issues: Issue[] = [];

    // 1. Docker 诊断
    issues.push(...await this.diagnoseDocker());

    // 2. 网络诊断
    issues.push(...await this.diagnoseNetwork());

    // 3. 依赖诊断
    issues.push(...await this.diagnoseDependencies());

    // 4. 权限诊断
    issues.push(...await this.diagnosePermissions());

    // 5. 配置诊断
    issues.push(...await this.diagnoseConfiguration());

    // 生成摘要
    const summary = this.generateSummary(issues);
    const overallHealth = this.determineOverallHealth(summary);

    return {
      issues,
      overallHealth,
      summary
    };
  }

  /**
   * Docker 诊断
   */
  async diagnoseDocker(): Promise<Issue[]> {
    const issues: Issue[] = [];

    try {
      // 检查 Docker 是否安装
      try {
        await execaCommand('docker --version');
      } catch {
        issues.push({
          type: IssueType.DOCKER,
          severity: IssueSeverity.CRITICAL,
          title: 'Docker 未安装',
          description: 'Docker 未安装或不在 PATH 中',
          affectedComponent: 'Docker',
          suggestions: [
            '安装 Docker Desktop: https://www.docker.com/products/docker-desktop',
            'Linux: sudo apt install docker.io',
            '验证安装: docker --version'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'Windows: winget install Docker.DockerDesktop',
            'macOS: brew install --cask docker',
            'Linux: sudo apt install docker.io'
          ]
        });
        return issues;
      }

      // 检查 Docker 是否运行
      try {
        await execaCommand('docker ps', { timeout: 5000 });
      } catch {
        issues.push({
          type: IssueType.DOCKER,
          severity: IssueSeverity.CRITICAL,
          title: 'Docker 守护进程未运行',
          description: 'Docker 已安装但守护进程未启动',
          affectedComponent: 'Docker Daemon',
          suggestions: [
            '启动 Docker Desktop',
            'Linux: sudo systemctl start docker',
            '检查 Docker 状态: docker info'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'Windows/Mac: 启动 Docker Desktop 应用',
            'Linux: sudo systemctl start docker',
            'Linux: sudo service docker start'
          ]
        });
      }

      // 检查 Docker 权限
      try {
        const { stdout } = await execaCommand('docker info');
        if (stdout.includes('permission denied')) {
          issues.push({
            type: IssueType.PERMISSION,
            severity: IssueSeverity.HIGH,
            title: 'Docker 权限不足',
            description: '当前用户没有 Docker 访问权限',
            affectedComponent: 'Docker',
            suggestions: [
              '将用户添加到 docker 组',
              'Linux: sudo usermod -aG docker $USER',
              '重新登录或重启以使更改生效'
            ],
            autoFixAvailable: true,
            fixCommands: [
              'Linux: sudo usermod -aG docker $USER',
              '重新登录系统'
            ]
          });
        }
      } catch {
        // 忽略错误，可能在前面已经捕获
      }

      // 检查磁盘空间
      try {
        await execaCommand('docker system df');
        // 解析输出检查空间使用情况
      } catch {
        // 忽略错误
      }

    } catch (error) {
      logger.error('Docker 诊断失败', { error });
    }

    return issues;
  }

  /**
   * 网络诊断
   */
  async diagnoseNetwork(): Promise<Issue[]> {
    const issues: Issue[] = [];

    try {
      // 检查互联网连接
      try {
        await execaCommand('ping -c 1 8.8.8.8', { timeout: 5000 });
      } catch {
        issues.push({
          type: IssueType.NETWORK,
          severity: IssueSeverity.CRITICAL,
          title: '无互联网连接',
          description: '无法连接到互联网',
          affectedComponent: 'Network',
          suggestions: [
            '检查网络连接',
            '检查代理设置',
            '尝试 ping 其他地址',
            '检查防火墙设置'
          ],
          autoFixAvailable: false
        });
      }

      // 检查 DNS 解析
      try {
        await execaCommand('nslookup google.com', { timeout: 5000 });
      } catch {
        issues.push({
          type: IssueType.NETWORK,
          severity: IssueSeverity.HIGH,
          title: 'DNS 解析失败',
          description: '无法解析域名',
          affectedComponent: 'DNS',
          suggestions: [
            '检查 DNS 设置',
            '尝试使用公共 DNS (8.8.8.8, 1.1.1.1)',
            '重启网络服务',
            '清除 DNS 缓存'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'Windows: ipconfig /flushdns',
            'Linux: sudo systemd-resolve --flush-caches',
            'Mac: sudo dscacheutil -flushcache'
          ]
        });
      }

      // 检查代理配置
      const proxyEnv = [
        process.env.HTTP_PROXY,
        process.env.HTTPS_PROXY,
        process.env.ALL_PROXY
      ].filter(Boolean);

      if (proxyEnv.length > 0) {
        // 测试代理连接
        for (const proxy of proxyEnv) {
          try {
            const url = new URL(proxy);
            await execaCommand(`ping -c 1 ${url.hostname}`, { timeout: 3000 });
          } catch {
            issues.push({
              type: IssueType.NETWORK,
              severity: IssueSeverity.MEDIUM,
              title: '代理服务器不可达',
              description: `配置的代理服务器 ${proxy} 无法访问`,
              affectedComponent: 'Proxy',
              suggestions: [
                '检查代理服务器是否运行',
                '验证代理地址和端口',
                '检查代理认证信息',
                '尝试直接连接（不使用代理）'
              ],
              autoFixAvailable: false
            });
          }
        }
      }

      // 检查 GitHub 连接
      try {
        await execaCommand('git ls-remote https://github.com/Cherny0306/KINXKit.git', { timeout: 10000 });
      } catch {
        issues.push({
          type: IssueType.NETWORK,
          severity: IssueSeverity.HIGH,
          title: '无法连接到 GitHub',
          description: 'GitHub 访问受限',
          affectedComponent: 'GitHub',
          suggestions: [
            '检查网络连接',
            '配置代理',
            '检查防火墙设置',
            '使用 SSH 而非 HTTPS'
          ],
          autoFixAvailable: false
        });
      }

    } catch (error) {
      logger.error('网络诊断失败', { error });
    }

    return issues;
  }

  /**
   * 依赖诊断
   */
  async diagnoseDependencies(): Promise<Issue[]> {
    const issues: Issue[] = [];

    try {
      // 检查 Node.js 依赖
      try {
        await fs.access(path.join(process.cwd(), 'package.json'));
      } catch {
        issues.push({
          type: IssueType.DEPENDENCY,
          severity: IssueSeverity.INFO,
          title: '不是 Node.js 项目',
          description: '当前目录没有 package.json',
          affectedComponent: 'Node.js',
          suggestions: [
            '在正确的项目目录中运行',
            '或创建新的 Node.js 项目'
          ],
          autoFixAvailable: false
        });
        return issues;
      }

      // 检查 node_modules
      try {
        await fs.access(path.join(process.cwd(), 'node_modules'));
      } catch {
        issues.push({
          type: IssueType.DEPENDENCY,
          severity: IssueSeverity.HIGH,
          title: '依赖未安装',
          description: 'node_modules 目录不存在',
          affectedComponent: 'Node.js Dependencies',
          suggestions: [
            '运行: npm install',
            '或: yarn install',
            '或: pnpm install'
          ],
          autoFixAvailable: true,
          fixCommands: ['npm install']
        });
      }

      // 检查依赖冲突
      try {
        const { stdout } = await execaCommand('npm ls', { reject: false });
        if (stdout.includes('UNMET PEER DEPENDENCY')) {
          issues.push({
            type: IssueType.DEPENDENCY,
            severity: IssueSeverity.MEDIUM,
            title: '存在未满足的依赖关系',
            description: '某些 peer dependencies 未满足',
            affectedComponent: 'NPM',
            suggestions: [
              '运行: npm install --legacy-peer-deps',
              '检查并手动安装缺失的依赖',
              '更新 package.json 解决版本冲突'
            ],
            autoFixAvailable: true,
            fixCommands: [
              'npm install --legacy-peer-deps',
              'npm audit fix'
            ]
          });
        }
      } catch {
        // 忽略
      }

      // 检查安全漏洞
      try {
        const { stdout } = await execaCommand('npm audit --json', { reject: false });
        const auditResult = JSON.parse(stdout);

        if (auditResult.vulnerabilities) {
          const vulnCount = Object.keys(auditResult.vulnerabilities).length;

          if (vulnCount > 0) {
            const criticalVulns = Object.values(auditResult.vulnerabilities)
              .filter((v: any) => v.severity === 'critical').length;

            issues.push({
              type: IssueType.DEPENDENCY,
              severity: criticalVulns > 0 ? IssueSeverity.CRITICAL : IssueSeverity.HIGH,
              title: `发现 ${vulnCount} 个安全漏洞`,
              description: `依赖包中存在 ${criticalVulns} 个严重漏洞`,
              affectedComponent: 'NPM Dependencies',
              suggestions: [
                '运行: npm audit fix',
                '手动更新有漏洞的包',
                '查看详细报告: npm audit'
              ],
              autoFixAvailable: true,
              fixCommands: [
                'npm audit fix',
                'npm audit fix --force'
              ]
            });
          }
        }
      } catch {
        // 忽略
      }

    } catch (error) {
      logger.error('依赖诊断失败', { error });
    }

    return issues;
  }

  /**
   * 权限诊断
   */
  private async diagnosePermissions(): Promise<Issue[]> {
    const issues: Issue[] = [];

    try {
      // 检查当前目录写权限
      try {
        await fs.access(process.cwd(), fs.constants.W_OK);
      } catch {
        issues.push({
          type: IssueType.PERMISSION,
          severity: IssueSeverity.HIGH,
          title: '目录写权限不足',
          description: '当前目录没有写入权限',
          affectedComponent: 'File System',
          suggestions: [
            '检查目录权限',
            '使用 sudo 运行（Linux/Mac）',
            '更改目录所有者',
            '在用户主目录中操作'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'Linux/Mac: chmod +w .',
            'Linux: sudo chown -R $USER:$USER .'
          ]
        });
      }

      // 检查 Git 仓库权限
      try {
        const { stdout } = await execaCommand('git status --porcelain', { reject: false });
        // 如果 git status 成功，权限应该没问题
      } catch {
        // 检查是否是权限问题
        try {
          await fs.access(path.join(process.cwd(), '.git'));
        } catch {
          // 不是 Git 仓库，跳过
        }
      }

    } catch (error) {
      logger.error('权限诊断失败', { error });
    }

    return issues;
  }

  /**
   * 配置诊断
   */
  private async diagnoseConfiguration(): Promise<Issue[]> {
    const issues: Issue[] = [];

    try {
      // 检查 .env 文件
      try {
        await fs.access(path.join(process.cwd(), '.env'));
      } catch {
        issues.push({
          type: IssueType.CONFIGURATION,
          severity: IssueSeverity.INFO,
          title: '.env 文件不存在',
          description: '项目缺少环境变量配置文件',
          affectedComponent: 'Environment',
          suggestions: [
            '创建 .env 文件',
            '复制 .env.example 到 .env',
            '运行: kinx config api'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'cp .env.example .env',
            'kinx config api'
          ]
        });
      }

      // 检查 .gitignore
      try {
        await fs.access(path.join(process.cwd(), '.gitignore'));
        const content = await fs.readFile(path.join(process.cwd(), '.gitignore'), 'utf-8');

        if (!content.includes('.env')) {
          issues.push({
            type: IssueType.CONFIGURATION,
            severity: IssueSeverity.MEDIUM,
            title: '.gitignore 未包含 .env',
            description: '.env 文件可能被意外提交到 Git',
            affectedComponent: 'Git',
            suggestions: [
              '将 .env 添加到 .gitignore',
              '检查是否有敏感文件已提交',
              '使用 git rm --cached 移除已提交的敏感文件'
            ],
            autoFixAvailable: true,
            fixCommands: [
              'echo ".env" >> .gitignore',
              'git rm --cached .env 2>/dev/null || true'
            ]
          });
        }
      } catch {
        issues.push({
          type: IssueType.CONFIGURATION,
          severity: IssueSeverity.INFO,
          title: '.gitignore 文件不存在',
          description: '项目缺少 .gitignore 文件',
          affectedComponent: 'Git',
          suggestions: [
            '创建 .gitignore 文件',
            '添加常见忽略模式'
          ],
          autoFixAvailable: true,
          fixCommands: [
            'echo "node_modules/" > .gitignore',
            'echo ".env" >> .gitignore',
            'echo "dist/" >> .gitignore'
          ]
        });
      }

    } catch (error) {
      logger.error('配置诊断失败', { error });
    }

    return issues;
  }

  /**
   * 生成摘要
   */
  private generateSummary(issues: Issue[]): DiagnosticResult['summary'] {
    return {
      critical: issues.filter(i => i.severity === IssueSeverity.CRITICAL).length,
      high: issues.filter(i => i.severity === IssueSeverity.HIGH).length,
      medium: issues.filter(i => i.severity === IssueSeverity.MEDIUM).length,
      low: issues.filter(i => i.severity === IssueSeverity.LOW).length,
      info: issues.filter(i => i.severity === IssueSeverity.INFO).length
    };
  }

  /**
   * 确定整体健康状况
   */
  private determineOverallHealth(summary: DiagnosticResult['summary']): 'healthy' | 'warning' | 'critical' {
    if (summary.critical > 0) {
      return 'critical';
    }
    if (summary.high > 0) {
      return 'warning';
    }
    if (summary.medium > 2) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * 自动修复问题
   */
  async autoFix(issue: Issue): Promise<boolean> {
    if (!issue.autoFixAvailable || !issue.fixCommands) {
      return false;
    }

    logger.info(`🔧 正在自动修复: ${issue.title}`);

    try {
      for (const command of issue.fixCommands) {
        logger.info(`执行: ${command}`);

    const { stdout } = await execaCommand(command, {
      shell: true
    });
    if (stdout) logger.info(stdout);
    if (stderr) logger.warn(stderr);
      }

      logger.success(`✓ 修复完成: ${issue.title}`);
      return true;

    } catch (error) {
      logger.error(`✗ 修复失败: ${issue.title}`, { error });
      return false;
    }
  }

  /**
   * 批量自动修复
   */
  async autoFixAll(issues: Issue[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const fixableIssues = issues.filter(i => i.autoFixAvailable);

    for (const issue of fixableIssues) {
      const result = await this.autoFix(issue);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}
