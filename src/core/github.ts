/**
 * GitHub 集成模块
 */

import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * GitHub 认证信息
 */
export interface GitHubAuth {
  authenticated: boolean;
  method: 'cli' | 'token' | 'ssh';
  username?: string;
  token?: string;
}

/**
 * 仓库配置
 */
export interface RepoOptions {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

/**
 * 仓库信息
 */
export interface RepoInfo {
  url: string;
  sshUrl: string;
  name: string;
  owner: string;
}

/**
 * 敏感文件模式
 */
const SENSITIVE_PATTERNS = [
  '.env',
  '.env.local',
  '*.pem',
  '*.key',
  'id_rsa',
  'credentials.json',
  'secrets.yml',
  '.aws/credentials',
  '*.p12',
  '*.pfx'
];

/**
 * GitHub 管理器
 */
export class GitHubManager {
  private authenticated: boolean = false;
  private authMethod: 'cli' | 'token' | 'ssh' | null = null;
  private username: string | undefined;

  /**
   * 检查认证状态
   */
  async checkAuthStatus(): Promise<GitHubAuth> {
    try {
      // 检查 GitHub CLI 认证
      const { stdout: cliStatus } = await execaCommand('gh auth status');

      if (cliStatus.includes('Logged in')) {
        const match = cliStatus.match(/Logged in to ([\w.-]+) account ([\w-]+)/);
        if (match) {
          this.authenticated = true;
          this.authMethod = 'cli';
          this.username = match[2];

          return {
            authenticated: true,
            method: 'cli',
            username: this.username
          };
        }
      }
    } catch {
      // GitHub CLI 未认证
    }

    // 检查环境变量中的 token
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
      try {
        const { stdout } = await execaCommand(
          `curl -s -H "Authorization: token ${token}" https://api.github.com/user`
        );
        const user = JSON.parse(stdout);

        this.authenticated = true;
        this.authMethod = 'token';
        this.username = user.login;

        return {
          authenticated: true,
          method: 'token',
          username: user.login,
          token
        };
      } catch {
        // Token 无效
      }
    }

    // 检查 SSH 配置
    try {
      const { stdout } = await execaCommand('ssh -T git@github.com 2>&1', {
        shell: true
      });

      if (stdout.includes('successfully authenticated')) {
        this.authenticated = true;
        this.authMethod = 'ssh';

        return {
          authenticated: true,
          method: 'ssh'
        };
      }
    } catch {
      // SSH 未配置
    }

    return {
      authenticated: false,
      method: 'cli'
    };
  }

  /**
   * GitHub CLI 认证
   */
  async authenticateWithCli(): Promise<boolean> {
    try {
      logger.info('正在启动 GitHub CLI 认证...');

      await execaCommand('gh auth login', {
        stdio: 'inherit'
      });

      const authStatus = await this.checkAuthStatus();

      if (authStatus.authenticated) {
        this.authenticated = true;
        this.authMethod = 'cli';
        this.username = authStatus.username;

        logger.success('GitHub CLI 认证成功', {
          username: this.username
        });

        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('GitHub CLI 认证失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * Personal Access Token 认证
   */
  async authenticateWithToken(token: string): Promise<boolean> {
    try {
      logger.info('正在验证 Personal Access Token...');

      const { stdout } = await execaCommand(
        `curl -s -H "Authorization: token ${token}" https://api.github.com/user`
      );
      const user = JSON.parse(stdout);

      if (user.login) {
        this.authenticated = true;
        this.authMethod = 'token';
        this.username = user.login;

        logger.success('Token 认证成功', {
          username: user.login
        });

        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Token 认证失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 创建远程仓库
   */
  async createRepo(options: RepoOptions): Promise<RepoInfo> {
    if (!this.authenticated) {
      throw new Error('未进行 GitHub 认证');
    }

    try {
      logger.info('正在创建 GitHub 仓库...', {
        name: options.name,
        private: options.private || false
      });

      let repoUrl: string;
      let sshUrl: string;
      let owner: string;

      if (this.authMethod === 'cli') {
        // 使用 GitHub CLI 创建仓库
        const visibility = options.private ? 'private' : 'public';
        const args = [
          'repo',
          'create',
          options.name,
          `--${visibility}`,
          '--source=.'
        ];

        if (options.description) {
          args.push('--description', options.description);
        }

        await execaCommand(args.join(' '));

        // 获取仓库信息
        if (!this.username) {
          throw new Error('无法获取 GitHub 用户名');
        }

        owner = this.username;
        repoUrl = `https://github.com/${owner}/${options.name}.git`;
        sshUrl = `git@github.com:${owner}/${options.name}.git`;

      } else if (this.authMethod === 'token' && this.username) {
        // 使用 API 创建仓库
        const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

        if (!token) {
          throw new Error('GitHub Token 未设置');
        }

        const data = {
          name: options.name,
          description: options.description || '',
          private: options.private || false,
          auto_init: options.autoInit || false
        };

        const { stdout: apiOutput } = await execaCommand(
          `curl -s -X POST \\
            -H "Authorization: token ${token}" \\
            -H "Accept: application/vnd.github.v3+json" \\
            https://api.github.com/user/repos \\
            -d '${JSON.stringify(data)}'`
        );

        const repo = JSON.parse(apiOutput);

        owner = repo.owner.login;
        repoUrl = repo.clone_url;
        sshUrl = repo.ssh_url;

      } else {
        throw new Error('不支持的认证方式');
      }

      logger.success('仓库创建成功', {
        name: options.name,
        url: repoUrl
      });

      return {
        url: repoUrl,
        sshUrl,
        name: options.name,
        owner
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('仓库创建失败', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 检测敏感文件
   */
  async detectSensitiveFiles(projectPath: string): Promise<string[]> {
    try {
      logger.info('正在检测敏感文件...');

      const sensitiveFiles: string[] = [];

      // 递归搜索项目目录
      const searchDirectory = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // 跳过 node_modules 和 .git
          if (entry.name === 'node_modules' || entry.name === '.git') {
            continue;
          }

          if (entry.isDirectory()) {
            await searchDirectory(fullPath);
          } else if (entry.isFile()) {
            // 检查是否匹配敏感文件模式
            const relativePath = path.relative(projectPath, fullPath);

            for (const pattern of SENSITIVE_PATTERNS) {
              const regex = new RegExp(
                '^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$'
              );

              if (regex.test(entry.name) || regex.test(relativePath)) {
                sensitiveFiles.push(relativePath);
                break;
              }
            }
          }
        }
      };

      await searchDirectory(projectPath);

      if (sensitiveFiles.length > 0) {
        logger.warn('发现敏感文件', {
          files: sensitiveFiles
        });
      } else {
        logger.success('未发现敏感文件');
      }

      return sensitiveFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('敏感文件检测失败', { error: errorMessage });
      return [];
    }
  }

  /**
   * 初始化 Git 仓库
   */
  async initializeGit(projectPath: string): Promise<boolean> {
    try {
      logger.info('正在初始化 Git 仓库...');

      // 检查是否已经是 Git 仓库
      const gitDir = path.join(projectPath, '.git');

      try {
        await fs.access(gitDir);
        logger.info('Git 仓库已存在');
        return true;
      } catch {
        // 不是 Git 仓库，继续初始化
      }

      // 初始化 Git 仓库
      await execaCommand('git init', { cwd: projectPath });

      logger.success('Git 仓库初始化成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Git 初始化失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 推送代码到远程仓库
   */
  async pushToRemote(
    projectPath: string,
    repoUrl: string,
    branch: string = 'main'
  ): Promise<boolean> {
    try {
      logger.info('正在推送代码到 GitHub...', {
        url: repoUrl,
        branch
      });

      // 添加远程仓库
      try {
        await execaCommand(`git remote add origin ${repoUrl}`, {
          cwd: projectPath
        });
      } catch {
        // 远程仓库可能已存在，先删除再添加
        await execaCommand('git remote remove origin', { cwd: projectPath });
        await execaCommand(`git remote add origin ${repoUrl}`, {
          cwd: projectPath
        });
      }

      // 添加所有文件
      await execaCommand('git add .', { cwd: projectPath });

      // 提交
      await execaCommand(
        'git commit -m "Initial commit from KINXKit"',
        { cwd: projectPath }
      );

      // 推送到远程
      await execaCommand(`git push -u origin ${branch}`, {
        cwd: projectPath,
        stdio: 'inherit'
      });

      logger.success('代码推送成功');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('代码推送失败', { error: errorMessage });
      return false;
    }
  }

  /**
   * 完整的 GitHub 工作流
   */
  async createAndPush(
    projectPath: string,
    repoOptions: RepoOptions
  ): Promise<boolean> {
    try {
      // 1. 检查认证状态
      const authStatus = await this.checkAuthStatus();

      if (!authStatus.authenticated) {
        logger.error('未进行 GitHub 认证，请先运行: kinx github login');
        return false;
      }

      // 2. 检测敏感文件
      const sensitiveFiles = await this.detectSensitiveFiles(projectPath);

      if (sensitiveFiles.length > 0) {
        logger.warn('⚠️  发现敏感文件，建议在提交前添加到 .gitignore：');
        sensitiveFiles.forEach((file) => {
          console.log(`   - ${file}`);
        });

        // TODO: 添加交互式确认
      }

      // 3. 初始化 Git 仓库
      const initialized = await this.initializeGit(projectPath);

      if (!initialized) {
        return false;
      }

      // 4. 创建远程仓库
      const repoInfo = await this.createRepo(repoOptions);

      // 5. 推送代码
      const pushed = await this.pushToRemote(
        projectPath,
        repoInfo.url
      );

      if (pushed) {
        logger.success('GitHub 仓库创建并推送成功！', {
          url: repoInfo.url
        });
      }

      return pushed;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('GitHub 工作流失败', { error: errorMessage });
      return false;
    }
  }
}
