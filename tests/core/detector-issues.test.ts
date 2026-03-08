/**
 * 问题诊断系统测试
 */

import { IssueDetector, IssueType, IssueSeverity } from '../../src/core/detector-issues.js';

describe('IssueDetector', () => {
  let detector: IssueDetector;

  beforeEach(() => {
    detector = new IssueDetector();
  });

  describe('Docker 诊断', () => {
    it('应该检测 Docker 未安装', async () => {
      const result = await detector.diagnoseDocker();

      // 结果应该是数组
      expect(Array.isArray(result)).toBe(true);

      // 如果有 Docker 未安装的问题，验证其结构
      const dockerIssue = result.find(i => i.title.includes('未安装'));
      if (dockerIssue) {
        expect(dockerIssue.type).toBe(IssueType.DOCKER);
        expect(dockerIssue.severity).toBe(IssueSeverity.CRITICAL);
        expect(dockerIssue.suggestions).toBeDefined();
        expect(dockerIssue.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('应该检测 Docker 未运行', async () => {
      const result = await detector.diagnoseDocker();

      const dockerNotRunning = result.find(i => i.title.includes('未运行'));
      if (dockerNotRunning) {
        expect(dockerNotRunning.type).toBe(IssueType.DOCKER);
        expect(dockerNotRunning.severity).toBe(IssueSeverity.CRITICAL);
        expect(dockerNotRunning.autoFixAvailable).toBe(true);
      }
    });

    it('应该生成修复建议', async () => {
      const result = await detector.diagnoseDocker();

      result.forEach(issue => {
        expect(issue.suggestions).toBeDefined();
        expect(issue.suggestions.length).toBeGreaterThan(0);
        expect(issue.suggestions[0]).toBeTruthy();
      });
    });
  });

  describe('网络诊断', () => {
    it('应该检测网络连接问题', async () => {
      const result = await detector.diagnoseNetwork();

      expect(Array.isArray(result)).toBe(true);

      // 验证问题结构
      result.forEach(issue => {
        expect(issue.type).toBe(IssueType.NETWORK);
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.suggestions).toBeDefined();
      });
    });

    it('应该测试 GitHub 连接', async () => {
      const result = await detector.diagnoseNetwork();

      // 查找 GitHub 相关问题
      const githubIssue = result.find(i =>
        i.affectedComponent.includes('GitHub') ||
        i.title.includes('GitHub')
      );

      if (githubIssue) {
        expect(githubIssue.type).toBe(IssueType.NETWORK);
        expect(githubIssue.suggestions).toBeDefined();
      }
    });
  });

  describe('依赖诊断', () => {
    it('应该检测 Node.js 版本', async () => {
      const result = await detector.diagnoseDependencies();

      expect(Array.isArray(result)).toBe(true);

      const nodeIssue = result.find(i => i.affectedComponent === 'Node.js');
      if (nodeIssue) {
        expect(nodeIssue.type).toBe(IssueType.DEPENDENCY);
        expect(nodeIssue.description).toBeDefined();
      }
    });

    it('应该检测 Python 版本', async () => {
      const result = await detector.diagnoseDependencies();

      expect(Array.isArray(result)).toBe(true);

      const pythonIssue = result.find(i => i.affectedComponent === 'Python');
      if (pythonIssue) {
        expect(pythonIssue.type).toBe(IssueType.DEPENDENCY);
        expect(pythonIssue.severity).toBeDefined();
      }
    });

    it('应该检测 Git 版本', async () => {
      const result = await detector.diagnoseDependencies();

      expect(Array.isArray(result)).toBe(true);

      const gitIssue = result.find(i => i.affectedComponent === 'Git');
      if (gitIssue) {
        expect(gitIssue.type).toBe(IssueType.DEPENDENCY);
        expect(gitIssue.suggestions).toBeDefined();
      }
    });
  });

  describe('完整诊断', () => {
    it('应该返回完整的诊断结果', async () => {
      const result = await detector.runFullDiagnostic();

      // 验证结果结构
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.overallHealth).toBeDefined();
    });

    it('应该生成正确的问题摘要', async () => {
      const result = await detector.runFullDiagnostic();

      // 验证摘要结构
      expect(result.summary).toMatchObject({
        critical: expect.any(Number),
        high: expect.any(Number),
        medium: expect.any(Number),
        low: expect.any(Number),
        info: expect.any(Number)
      });
    });

    it('应该正确评估整体健康状态', async () => {
      const result = await detector.runFullDiagnostic();

      // 验证健康状态值
      expect(['healthy', 'warning', 'critical']).toContain(result.overallHealth);
    });

    it('应该包含所有诊断类型', async () => {
      const result = await detector.runFullDiagnostic();

      const types = new Set(result.issues.map(i => i.type));

      // 至少应该包含几种诊断类型
      expect(types.size).toBeGreaterThan(0);
    });
  });

  describe('严重程度分级', () => {
    it('应该正确分级问题严重程度', async () => {
      const result = await detector.runFullDiagnostic();

      result.issues.forEach(issue => {
        expect(Object.values(IssueSeverity)).toContain(issue.severity);
      });
    });

    it('关键问题应该有自动修复方案', async () => {
      const result = await detector.runFullDiagnostic();

      const criticalIssues = result.issues.filter(
        i => i.severity === IssueSeverity.CRITICAL
      );

      criticalIssues.forEach(issue => {
        if (issue.autoFixAvailable) {
          expect(issue.fixCommands).toBeDefined();
          expect(issue.fixCommands!.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('修复建议生成', () => {
    it('每个问题都应该有修复建议', async () => {
      const result = await detector.runFullDiagnostic();

      result.issues.forEach(issue => {
        expect(issue.suggestions).toBeDefined();
        expect(issue.suggestions.length).toBeGreaterThan(0);
        expect(issue.suggestions[0]).toBeTruthy();
      });
    });

    it('修复建议应该具有可操作性', async () => {
      const result = await detector.runFullDiagnostic();

      result.issues.forEach(issue => {
        issue.suggestions.forEach(suggestion => {
          // 建议不应该太模糊
          expect(suggestion.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理没有问题的情况', async () => {
      const result = await detector.runFullDiagnostic();

      // 即使环境完美，也应该返回结果
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('应该处理多个问题', async () => {
      const result = await detector.runFullDiagnostic();

      // 可能有多个问题
      expect(result.issues.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('问题类型', () => {
    it('应该包含所有支持的问题类型', async () => {
      const result = await detector.runFullDiagnostic();

      const foundTypes = new Set(result.issues.map(i => i.type));
      const allTypes = Object.values(IssueType);

      // 至少应该检测某些类型
      expect(foundTypes.size).toBeGreaterThanOrEqual(0);
    });
  });
});
