# KINXKit 测试指南

本文档介绍如何运行和编写 KINXKit 的测试。

## 目录

- [快速开始](#快速开始)
- [运行测试](#运行测试)
- [测试结构](#测试结构)
- [编写测试](#编写测试)
- [覆盖率](#覆盖率)
- [常见问题](#常见问题)

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行带覆盖率的测试

```bash
npm run test:coverage
```

---

## 运行测试

### 基础命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- detector.test.ts

# 运行匹配模式的测试
npm test -- --testNamePattern="Docker"

# 监听模式（自动重新运行）
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### CI/CD 环境

```bash
# CI 模式运行
npm run test:ci
```

---

## 测试结构

```
tests/
├── core/                    # 核心模块测试
│   ├── detector.test.ts    # 环境检测器测试
│   ├── config.test.ts      # 配置管理器测试
│   ├── detector-issues.test.ts  # 问题诊断测试
│   ├── preset-manager.test.ts   # 预设管理测试
│   └── template-manager.test.ts # 模板管理测试
└── nlp/                     # NLP 模块测试
    └── classifier.test.ts  # 意图分类器测试
```

### 测试文件命名

- 测试文件应与源文件同名，后缀为 `.test.ts`
- 例如：`detector.ts` → `detector.test.ts`

---

## 编写测试

### 基本结构

```typescript
/**
 * 模块描述
 */

import { ModuleUnderTest } from '../../src/path/to/module.js';

describe('ModuleName', () => {
  let module: ModuleUnderTest;

  beforeEach(() => {
    // 在每个测试前设置
    module = new ModuleUnderTest();
  });

  afterEach(() => {
    // 在每个测试后清理
  });

  describe('功能分组', () => {
    it('应该做某事', () => {
      // 准备
      const input = 'test';

      // 执行
      const result = module.doSomething(input);

      // 验证
      expect(result).toBeDefined();
    });
  });
});
```

### 测试最佳实践

1. **描述性命名**
   ```typescript
   // ✅ 好的做法
   it('应该检测 Docker 未安装', async () => {
     // ...
   });

   // ❌ 不好的做法
   it('test1', () => {
     // ...
   });
   ```

2. **AAA 模式**（Arrange-Act-Assert）
   ```typescript
   it('应该返回用户信息', async () => {
     // Arrange（准备）
     const userId = '123';

     // Act（执行）
     const user = await getUser(userId);

     // Assert（验证）
     expect(user.id).toBe(userId);
     expect(user.name).toBeDefined();
   });
   ```

3. **异步测试**
   ```typescript
   it('应该处理异步操作', async () => {
     const result = await asyncFunction();
     expect(result).toBe('expected');
   });
   ```

4. **清理资源**
   ```typescript
   afterEach(async () => {
     // 清理临时文件
     await fs.rm(testDir, { recursive: true, force: true });
   });
   ```

### Mock 外部依赖

使用 Jest 的 mock 功能：

```typescript
// Mock 模块
jest.mock('../../src/utils/external.js');

// Mock 函数
const mockFunction = jest.fn().mockReturnValue('test');

// Mock 异步函数
const asyncMock = jest.fn().mockResolvedValue({ data: 'test' });
```

---

## 覆盖率

### 查看覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录：

- `coverage/lcov-report/index.html` - HTML 报告
- `coverage/lcov.info` - LCOV 格式

### 覆盖率目标

- **语句覆盖率**: ≥ 70%
- **分支覆盖率**: ≥ 70%
- **函数覆盖率**: ≥ 70%
- **行覆盖率**: ≥ 70%

### 提高覆盖率

1. 测试边界情况
2. 测试错误路径
3. 测试不同的输入组合

---

## 常见问题

### 1. 测试超时

**问题**: 测试运行时间过长

**解决方案**:
```typescript
it('应该快速完成', async () => {
  // 增加超时时间
}, 10000); // 10秒
```

### 2. 异步测试失败

**问题**: 异步测试没有正确等待

**解决方案**:
```typescript
it('应该处理异步', async () => {
  const promise = asyncFunction();
  await expect(promise).resolves.toBe('result');
});
```

### 3. 环境变量污染

**问题**: 测试修改环境变量影响其他测试

**解决方案**:
```typescript
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = process.env;
});

afterEach(() => {
  process.env = originalEnv;
});
```

### 4. 临时文件清理

**问题**: 测试创建的临时文件没有清理

**解决方案**:
```typescript
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

const testDir = path.join(os.tmpdir(), `test-${Date.now()}`);

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});
```

---

## CI/CD 集成

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
```

---

## 资源

- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Node.js 测试最佳实践](https://github.com/goldbergyoni/nodebestpractices#-testing-and-overall-quality-practices)
