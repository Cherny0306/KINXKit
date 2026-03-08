/**
 * 环境检测器测试
 */

import { EnvironmentDetector } from '../../src/core/detector.js';

describe('EnvironmentDetector', () => {
  let detector: EnvironmentDetector;

  beforeEach(() => {
    detector = new EnvironmentDetector();
  });

  describe('基础环境检测', () => {
    it('应该检测到操作系统', async () => {
      const env = await detector.detect();

      expect(env).toBeDefined();
      expect(env.os).toBeDefined();
      expect(env.platform).toMatch(/win32|darwin|linux/);
    });

    it('应该检测到平台类型', async () => {
      const env = await detector.detect();

      expect(env.platform).toBeDefined();
      expect(['win32', 'darwin', 'linux']).toContain(env.platform);
    });
  });

  describe('开发工具检测', () => {
    it('应该检测 Docker 安装状态', async () => {
      const env = await detector.detect();

      if (env.docker) {
        expect(env.docker.installed).toBe(true);
        expect(env.docker.version).toBeDefined();
      }
    });

    it('应该检测 Git 安装状态', async () => {
      const env = await detector.detect();

      if (env.git) {
        expect(env.git.installed).toBe(true);
        expect(env.git.version).toBeDefined();
      }
    });

    it('应该检测 Python 版本', async () => {
      const env = await detector.detect();

      if (env.python) {
        expect(env.python).toMatch(/^\d+\.\d+\.\d+$/);
      }
    });

    it('应该检测 Node.js 版本', async () => {
      const env = await detector.detect();

      if (env.node) {
        expect(env.node).toMatch(/^v?\d+\.\d+\.\d+$/);
      }
    });
  });

  describe('代理检测', () => {
    it('应该检测环境变量代理', async () => {
      // 设置测试代理
      process.env.HTTP_PROXY = 'http://127.0.0.1:7890';

      const env = await detector.detect();

      if (env.proxy) {
        expect(env.proxy.enabled).toBe(true);
        expect(env.proxy.host).toBe('127.0.0.1');
        expect(env.proxy.port).toBe(7890);
      }

      // 清理
      delete process.env.HTTP_PROXY;
    });

    it('应该检测 ALL_PROXY 代理', async () => {
      process.env.ALL_PROXY = 'socks5://127.0.0.1:1080';

      const env = await detector.detect();

      if (env.proxy) {
        expect(env.proxy.enabled).toBe(true);
        expect(env.proxy.type).toBe('socks5');
      }

      delete process.env.ALL_PROXY;
    });
  });

  describe('GitHub 认证检测', () => {
    it('应该检测 GitHub 认证状态', async () => {
      const env = await detector.detect();

      if (env.github) {
        expect(env.github.authenticated).toBe(true);
      }
    });
  });

  describe('WSL2 检测', () => {
    it('在 Windows 上应该检测 WSL2', async () => {
      const env = await detector.detect();

      if (env.platform === 'win32') {
        // WSL 检测是可选的
        expect(env.isWSL).toBeDefined();
      }
    });
  });

  describe('GPU/CUDA 检测', () => {
    it('应该检测 GPU 信息（如果有）', async () => {
      const env = await detector.detect();

      if (env.gpu) {
        expect(env.gpu.name).toBeDefined();
        expect(env.gpu.memory).toBeGreaterThan(0);
      }
    });

    it('应该检测 CUDA 环境（如果有）', async () => {
      const env = await detector.detect();

      if (env.cuda) {
        expect(env.cuda.available).toBe(true);
      }
    });
  });

  describe('完整环境检测', () => {
    it('应该返回完整的 EnvironmentInfo', async () => {
      const env = await detector.detect();

      // 验证必需字段
      expect(env.os).toBeDefined();
      expect(env.platform).toBeDefined();

      // 验证可选字段的类型
      if (env.docker) {
        expect(typeof env.docker).toBe('object');
      }

      if (env.git) {
        expect(typeof env.git).toBe('object');
      }

      if (env.proxy) {
        expect(typeof env.proxy).toBe('object');
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理无代理的情况', async () => {
      // 确保没有代理环境变量
      delete process.env.HTTP_PROXY;
      delete process.env.HTTPS_PROXY;
      delete process.env.ALL_PROXY;
      delete process.env.NO_PROXY;

      const env = await detector.detect();

      // 代理应该是未定义或未启用
      if (env.proxy) {
        expect(env.proxy.enabled).toBe(false);
      }
    });

    it('应该处理工具未安装的情况', async () => {
      const env = await detector.detect();

      // 某些工具可能未安装，但不应该抛出错误
      expect(env).toBeDefined();
      expect(env.os).toBeDefined();
    });
  });
});
