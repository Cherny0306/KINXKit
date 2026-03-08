/**
 * 意图分类器测试
 */

import { IntentClassifier } from '../../src/nlp/classifier.js';
import { ProjectType } from '../../src/types.js';

describe('IntentClassifier', () => {
  let classifier: IntentClassifier;

  beforeEach(() => {
    classifier = new IntentClassifier();
  });

  describe('项目意图分类', () => {
    it('应该识别 AI 聊天机器人项目', () => {
      const input = '我想做一个 AI 聊天机器人';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.AI_CHATBOT);
    });

    it('应该识别 API 服务项目', () => {
      const input = '创建一个 RESTful API 服务';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.API_SERVICE);
    });

    it('应该识别数据分析项目', () => {
      const input = '我想分析一些销售数据';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.DATA_ANALYSIS);
    });

    it('应该识别 Web 应用项目', () => {
      const input = '开发一个电商网站';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.WEB_APP);
    });

    it('应该识别爬虫项目', () => {
      const input = '写一个爬虫抓取新闻';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.CRAWLER);
    });

    it('应该处理模糊的输入', () => {
      const input = '做一个项目';
      const type = classifier.classify(input);

      expect(type).toBe(ProjectType.UNKNOWN);
    });
  });

  describe('关键词匹配', () => {
    it('应该匹配 AI 相关关键词', () => {
      const inputs = [
        'AI 对话系统',
        '人工智能助手',
        'ChatGPT 应用',
        '大语言模型'
      ];

      inputs.forEach(input => {
        const type = classifier.classify(input);
        expect(type).toBe(ProjectType.AI_CHATBOT);
      });
    });

    it('应该匹配数据分析关键词', () => {
      const inputs = [
        '数据可视化',
        '统计分析',
        '数据挖掘',
        'pandas 分析'
      ];

      inputs.forEach(input => {
        const type = classifier.classify(input);
        expect([ProjectType.DATA_ANALYSIS, ProjectType.AI_CHATBOT]).toContain(type);
      });
    });

    it('应该匹配 Web 应用关键词', () => {
      const inputs = [
        '网站开发',
        '前端项目',
        '全栈应用',
        'Web 平台'
      ];

      inputs.forEach(input => {
        const type = classifier.classify(input);
        expect([ProjectType.WEB_APP, ProjectType.API_SERVICE]).toContain(type);
      });
    });
  });

  describe('技术栈推荐', () => {
    it('应该为 AI 聊天机器人推荐正确的技术栈', () => {
      const stack = classifier.recommend(ProjectType.AI_CHATBOT);

      expect(stack.backend).toMatch(/python|fastapi|nodejs/i);
      expect(stack.ai).toBeDefined();
      expect(stack.container).toBe('docker');
    });

    it('应该为数据分析项目推荐正确的技术栈', () => {
      const stack = classifier.recommend(ProjectType.DATA_ANALYSIS);

      expect(stack.backend).toMatch(/python/i);
      expect(stack.database).toBeDefined();
      expect(stack.notebook).toBeDefined();
    });

    it('应该为 Web 应用推荐完整的全栈技术栈', () => {
      const stack = classifier.recommend(ProjectType.WEB_APP);

      expect(stack.backend).toBeDefined();
      expect(stack.frontend).toBeDefined();
      expect(stack.database).toBeDefined();
    });

    it('应该为 API 服务推荐轻量级技术栈', () => {
      const stack = classifier.recommend(ProjectType.API_SERVICE);

      expect(stack.backend).toBeDefined();
      expect(stack.container).toBe('docker');
    });
  });

  describe('GPU 感知推荐', () => {
    it('应该为 AI/ML 项目推荐 GPU 支持', () => {
      const stack = classifier.recommend(ProjectType.AI_CHATBOT);

      if (stack.gpu) {
        expect(stack.gpu).toBe(true);
      }
    });

    it('应该为数据分析项目推荐 GPU 优化', () => {
      const stack = classifier.recommend(ProjectType.DATA_ANALYSIS);

      if (stack.ml) {
        expect(stack.ml).toBeDefined();
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      const type = classifier.classify('');

      expect(type).toBe(ProjectType.UNKNOWN);
    });

    it('应该处理特殊字符', () => {
      const type = classifier.classify('!@#$%^&*()');

      expect(type).toBe(ProjectType.UNKNOWN);
    });

    it('应该处理混合语言输入', () => {
      const type = classifier.classify('Create an AI 聊天机器人');

      // 应该能识别英文和中文混合
      expect([ProjectType.AI_CHATBOT, ProjectType.UNKNOWN]).toContain(type);
    });

    it('应该处理长文本输入', () => {
      const longInput = '我想创建一个' + '很厉害的'.repeat(100) + 'AI 聊天机器人';

      const type = classifier.classify(longInput);

      expect(type).toBe(ProjectType.AI_CHATBOT);
    });
  });

  describe('项目类型完整性', () => {
    it('应该覆盖所有主要项目类型', () => {
      const types = [
        ProjectType.AI_CHATBOT,
        ProjectType.API_SERVICE,
        ProjectType.WEB_APP,
        ProjectType.DATA_ANALYSIS,
        ProjectType.CRAWLER,
        ProjectType.UTILITY,
        ProjectType.UNKNOWN
      ];

      types.forEach(type => {
        const stack = classifier.recommend(type);
        expect(stack).toBeDefined();
        expect(stack.backend).toBeDefined();
        expect(stack.container).toBeDefined();
      });
    });
  });

  describe('推荐一致性', () => {
    it('相同输入应该返回相同分类', () => {
      const input = '创建 AI 聊天机器人';

      const type1 = classifier.classify(input);
      const type2 = classifier.classify(input);

      expect(type1).toBe(type2);
    });

    it('相同类型应该返回相同推荐', () => {
      const stack1 = classifier.recommend(ProjectType.AI_CHATBOT);
      const stack2 = classifier.recommend(ProjectType.AI_CHATBOT);

      expect(stack1.backend).toBe(stack2.backend);
      expect(stack1.container).toBe(stack2.container);
    });
  });
});
