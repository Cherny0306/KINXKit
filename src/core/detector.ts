/**
 * 环境检测器
 *
 * 负责检测系统环境、软件安装状态、GPU/CUDA 信息等
 */

import { execaCommand } from 'execa';
import { existsSync } from 'fs';
import os from 'os';
import {
  EnvironmentInfo,
  DockerInfo,
  GitInfo,
  ProxyInfo,
  GitHubInfo,
  CUDAInfo,
  GPUInfo
} from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * 环境检测器类
 */
export class EnvironmentDetector {
  /**
   * 执行完整的环境检测
   */
  async detect(): Promise<EnvironmentInfo> {
    logger.debug('开始环境检测...');

    const info: EnvironmentInfo = {
      os: this.detectOS(),
      platform: this.detectPlatform(),
      isWSL: this.detectWSL(),
      docker: await this.detectDocker(),
      git: await this.detectGit(),
      python: await this.detectPython(),
      node: await this.detectNode(),
      proxy: this.detectProxy(),
      github: await this.detectGitHub(),
      cuda: await this.detectCUDA(),
      gpu: await this.detectGPU()
    };

    logger.debug('环境检测完成', info);
    return info;
  }

  /**
   * 检测操作系统
   */
  private detectOS(): string {
    const platform = os.platform();
    switch (platform) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return 'Unknown';
    }
  }

  /**
   * 检测平台
   */
  private detectPlatform(): 'win32' | 'darwin' | 'linux' {
    return os.platform() as 'win32' | 'darwin' | 'linux';
  }

  /**
   * 检测 WSL2
   */
  private detectWSL(): boolean {
    try {
      // 方法1: 检查 /proc/version
      const version = '/proc/version';
      if (existsSync(version)) {
        const content = require('fs').readFileSync(version, 'utf8');
        if (content.includes('Microsoft') || content.includes('WSL')) {
          return true;
        }
      }

      // 方法2: 检查环境变量
      if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * 检测 Docker
   */
  private async detectDocker(): Promise<DockerInfo | undefined> {
    try {
      const { stdout } = await execaCommand('docker --version');
      const versionMatch = stdout.match(/Docker version ([\d.]+)/);

      const info: DockerInfo = {
        installed: true,
        version: versionMatch ? versionMatch[1] : undefined
      };

      // 检测 Docker Compose
      try {
        const { stdout: composeStdout } = await execaCommand('docker-compose --version');
        const composeVersionMatch = composeStdout.match(/docker-compose version ([\d.]+)/);
        info.composeVersion = composeVersionMatch ? composeVersionMatch[1] : undefined;
      } catch {
        // docker-compose 可能不存在或使用了新版本的 docker compose
        try {
          await execaCommand('docker compose version');
          info.composeVersion = 'v2';
        } catch {
          // Docker Compose 不可用
        }
      }

      return info;
    } catch {
      return undefined;
    }
  }

  /**
   * 检测 Git
   */
  private async detectGit(): Promise<GitInfo | undefined> {
    try {
      const { stdout } = await execaCommand('git --version');
      const versionMatch = stdout.match(/git version ([\d.]+)/);

      // 获取用户配置
      let username: string | undefined;
      let email: string | undefined;
      try {
        const { stdout: nameOutput } = await execaCommand('git config user.name');
        username = nameOutput.trim();
      } catch {
        // 未配置用户名
      }
      try {
        const { stdout: emailOutput } = await execaCommand('git config user.email');
        email = emailOutput.trim();
      } catch {
        // 未配置邮箱
      }

      const info: GitInfo = {
        installed: true,
        version: versionMatch ? versionMatch[1] : undefined,
        username,
        email
      };

      return info;
    } catch {
      return undefined;
    }
  }

  /**
   * 检测 Python
   */
  private async detectPython(): Promise<string | undefined> {
    try {
      const { stdout } = await execaCommand('python3 --version');
      const versionMatch = stdout.match(/Python ([\d.]+)/);
      return versionMatch ? versionMatch[1] : undefined;
    } catch {
      try {
        const { stdout } = await execaCommand('python --version');
        const versionMatch = stdout.match(/Python ([\d.]+)/);
        return versionMatch ? versionMatch[1] : undefined;
      } catch {
        return undefined;
      }
    }
  }

  /**
   * 检测 Node.js
   */
  private async detectNode(): Promise<string | undefined> {
    try {
      const { stdout } = await execaCommand('node --version');
      return stdout.trim();
    } catch {
      return undefined;
    }
  }

  /**
   * 检测代理配置
   */
  private detectProxy(): ProxyInfo | undefined {
    // 检查环境变量
    const httpProxy =
      process.env.HTTP_PROXY ||
      process.env.http_proxy ||
      process.env.ALL_PROXY ||
      process.env.all_proxy;

    if (httpProxy) {
      try {
        const url = new URL(httpProxy);
        return {
          enabled: true,
          type: url.protocol === 'http:' ? 'http' : 'socks5',
          host: url.hostname,
          port: parseInt(url.port) || 8080,
          source: 'env'
        };
      } catch {
        // URL 解析失败
        return undefined;
      }
    }

    // 检查常见代理软件端口
    const commonPorts = [
      { port: 7890, software: 'Clash', type: 'http' as const },
      { port: 7891, software: 'Clash', type: 'socks5' as const },
      { port: 10808, software: 'V2Ray', type: 'http' as const },
      { port: 10809, software: 'V2Ray', type: 'socks5' as const },
      { port: 1080, software: 'Shadowsocks', type: 'socks5' as const },
      { port: 6152, software: 'Surge', type: 'http' as const }
    ];

    for (const { port, software, type } of commonPorts) {
      if (this.isPortOpen('127.0.0.1', port)) {
        return {
          enabled: true,
          type,
          host: '127.0.0.1',
          port,
          source: 'software',
          software
        };
      }
    }

    return undefined;
  }

  /**
   * 检测端口是否开放（简单检测）
   */
  private isPortOpen(_host: string, _port: number): boolean {
    // 这里只是一个占位实现
    // 实际检测需要更复杂的方法
    return false;
  }

  /**
   * 检测 GitHub 认证状态
   */
  private async detectGitHub(): Promise<GitHubInfo | undefined> {
    try {
      // 尝试使用 GitHub CLI
      await execaCommand('gh auth status');
      return {
        authenticated: true,
        authMethod: 'cli'
      };
    } catch {
      // 检查是否有 GitHub Token
      if (process.env.GITHUB_TOKEN) {
        return {
          authenticated: true,
          authMethod: 'token'
        };
      }

      return {
        authenticated: false
      };
    }
  }

  /**
   * 检测 CUDA
   */
  private async detectCUDA(): Promise<CUDAInfo | undefined> {
    try {
      // 执行 nvidia-smi 检查 GPU 和驱动
      const { stdout } = await execaCommand('nvidia-smi --query-gpu=driver_version,name --format=csv,noheader');

      if (!stdout.trim()) {
        return undefined;
      }

      const [driverVersion] = stdout.split(',').map((s) => s.trim());

      // 检测 nvcc
      let nvccPath: string | undefined;
      try {
        const { stdout: nvccPathOutput } = await execaCommand('which nvcc');
        nvccPath = nvccPathOutput.trim();
      } catch {
        // nvcc 不在 PATH 中
      }

      // 检测 CUDA 版本
      let cudaVersion: string | undefined;
      if (nvccPath) {
        try {
          const { stdout: nvccVersionOutput } = await execaCommand('nvcc --version');
          const versionMatch = nvccVersionOutput.match(/release ([\d.]+)/);
          cudaVersion = versionMatch ? versionMatch[1] : undefined;
        } catch {
          // 无法获取 CUDA 版本
        }
      }

      // 检测 cuDNN
      try {
        // 尝试导入 cuDNN 库（这个需要在 Python 环境中）
        await execaCommand('python3 -c "import torch; print(torch.backends.cudnn.version())"');
      } catch {
        // cuDNN 不可用或未安装
      }

      const info: CUDAInfo = {
        available: true,
        driverVersion,
        version: cudaVersion,
        nvccPath
      };

      return info;
    } catch {
      return undefined;
    }
  }

  /**
   * 检测 GPU
   */
  private async detectGPU(): Promise<GPUInfo | undefined> {
    try {
      const { stdout } = await execaCommand('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits');
      const parts = stdout.split(',').map((s: string) => s.trim());
      const name = parts[0];
      const memoryStr = parts[1];

      if (!name || !memoryStr) {
        return undefined;
      }

      const memory = parseInt(memoryStr);
      if (isNaN(memory)) {
        return undefined;
      }

      return {
        name,
        memory,
        driverVersion: await this.getDriverVersion()
      };
    } catch {
      return undefined;
    }
  }

  /**
   * 获取驱动版本
   */
  private async getDriverVersion(): Promise<string | undefined> {
    try {
      const { stdout } = await execaCommand('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
      return stdout.trim();
    } catch {
      return undefined;
    }
  }
}

// 导出单例
export const detector = new EnvironmentDetector();
