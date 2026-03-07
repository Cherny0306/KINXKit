# KINXKit 开发者快速参考

> 日常开发工作的快速参考指南

---

## 🚀 快速开始

### 首次设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/kinxkit.git
cd kinxkit

# 安装依赖
npm install

# 构建项目
npm run build

# 运行 CLI
node dist/index.js --help
```

### 开发模式

```bash
# 开发模式（自动重编译）
npm run dev

# 运行特定命令
npm run dev create my-project

# 构建并运行
npm run build
npm start
```

---

## 📁 项目结构

```
KINXKit/
├── src/                    # 源代码
│   ├── index.ts           # 主入口
│   ├── types.ts           # 类型定义
│   ├── commands/          # CLI 命令
│   │   ├── create.ts      # 创建项目
│   │   ├── up.ts          # 启动服务
│   │   ├── down.ts        # 停止服务
│   │   ├── status.ts      # 查看状态
│   │   └── logs.ts        # 查看日志
│   ├── core/              # 核心模块
│   │   ├── detector.ts    # 环境检测
│   │   ├── generator.ts   # 代码生成
│   │   └── docker.ts      # Docker 管理
│   ├── nlp/               # NLP 模块
│   │   └── classifier.ts  # 意图分类
│   ├── prompt/            # 交互界面
│   │   └── welcome.ts     # 欢迎界面
│   └── utils/             # 工具函数
│       └── logger.ts      # 日志工具
├── templates/             # 项目模板
│   └── ai-chatbot/        # AI 聊天机器人
├── bin/                   # 可执行文件
│   └── kinx              # CLI 入口
├── tests/                 # 测试文件
├── docs/                  # 文档
├── dist/                  # 编译输出
├── node_modules/          # 依赖
└── *.md                   # 文档文件
```

---

## 🔧 常用命令

### 开发命令

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 清理构建产物
npm run clean

# 运行构建后的代码
npm start
```

### 测试命令

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- detector.test.ts
```

### 代码质量

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### Git 操作

```bash
# 查看状态
git status

# 提交代码（会自动运行 lint 和测试）
git add .
git commit -m "feat: add new feature"

# 推送到远程
git push

# 查看提交历史
git log --oneline
```

---

## 📝 开发规范

### 代码风格

```typescript
// ✅ 好的做法
import { detector } from '../core/detector.js';
import { logger } from '../utils/logger.js';

async function main() {
  try {
    const env = await detector.detect();
    logger.info('检测完成', { env });
  } catch (error) {
    logger.error('检测失败', { error: error.message });
    throw error;
  }
}

// ❌ 不好的做法
import * as detector from '../core/detector';
const det = new Detector();
det.detect().then(env => console.log(env));
```

### 命名规范

- **文件名**: `kebab-case.ts` (例如: `environment-detector.ts`)
- **类名**: `PascalCase` (例如: `EnvironmentDetector`)
- **函数/方法**: `camelCase` (例如: `detectEnvironment`)
- **常量**: `UPPER_SNAKE_CASE` (例如: `DEFAULT_PORT`)
- **接口/类型**: `PascalCase` (例如: `EnvironmentInfo`)

### 错误处理

```typescript
// ✅ 好的做法
import { KinxError } from '../types.js';

function validateProjectName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new KinxError(
      '项目名称不能为空',
      'INVALID_PROJECT_NAME',
      ['请输入有效的项目名称', '项目名称应包含字母和数字']
    );
  }
}

// ❌ 不好的做法
function validateName(name) {
  if (!name) throw 'Error';
}
```

### 日志使用

```typescript
// ✅ 好的做法
logger.debug('调试信息', { data });
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息', { error: err.message });
logger.success('成功信息');
logger.blank();  // 空行
logger.separator('─');  // 分隔线

// ❌ 不好的做法
console.log('信息');
console.error('错误');
```

---

## 🧪 测试指南

### 编写测试

```typescript
// tests/core/detector.test.ts
import { EnvironmentDetector } from '../../src/core/detector';

describe('EnvironmentDetector', () => {
  let detector: EnvironmentDetector;

  beforeEach(() => {
    detector = new EnvironmentDetector();
  });

  describe('detectOS', () => {
    it('should detect OS correctly', () => {
      const os = detector.detectOS();
      expect(os).toMatch(/Windows|macOS|Linux/);
    });
  });
});
```

### 测试覆盖率

```bash
# 生成覆盖率报告
npm run test:coverage

# 目标: 80% 覆盖率
# Statements: 80%
# Branches: 80%
# Functions: 80%
# Lines: 80%
```

---

## 🎯 功能开发清单

### 添加新命令

1. 在 `src/commands/` 创建命令文件
2. 使用 Commander.js 定义命令
3. 在 `src/index.ts` 中注册命令
4. 编写测试文件
5. 更新文档

### 添加新项目模板

1. 在 `templates/` 创建模板目录
2. 创建项目结构和文件
3. 使用 Handlebars 语法添加变量
4. 在 `generator.ts` 中添加项目类型
5. 在 `classifier.ts` 中添加关键词映射
6. 测试模板生成

### 添加新的环境检测

1. 在 `types.ts` 添加类型定义
2. 在 `detector.ts` 实现检测方法
3. 更新 `showEnvironmentInfo` 显示结果
4. 编写测试用例

---

## 🐛 调试技巧

### VS Code 调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug KINXKit",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "args": ["create", "test-project"]
    }
  ]
}
```

### 日志调试

```typescript
// 启用调试日志
process.env.DEBUG = 'kinxkit:*';

// 使用 logger.debug()
logger.debug('调试信息', { data });
```

### TypeScript 类型检查

```bash
# 严格类型检查
npm run build -- --noEmit --strict

# 查看类型错误
tsc --noEmit
```

---

## 📦 发布流程

### 版本发布

```bash
# 1. 更新版本号
npm version major|minor|patch

# 2. 构建项目
npm run build

# 3. 运行测试
npm test

# 4. 发布到 npm
npm publish

# 5. 推送标签
git push --tags
```

### 发布前检查

- [ ] 所有测试通过
- [ ] 代码覆盖率 > 80%
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] README.md 已更新
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告

---

## 🔗 相关资源

### 文档链接

- [项目规范](PROJECT_SPEC.md)
- [开发指南](CLAUDE.md)
- [开发规则](RULES.md)
- [进度跟踪](PROGRESS.md)
- [开发日志](LOG.md)
- [变更日志](CHANGELOG.md)

### 外部资源

- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Node.js 文档](https://nodejs.org/docs/)
- [Commander.js](https://commander.js.org/)
- [Inquirer.js](https://www.npmjs.com/package/inquirer)
- [Jest 文档](https://jestjs.io/docs/getting-started)

---

## 💡 常见问题

### Q: 如何添加新的依赖？

```bash
# 生产依赖
npm install package-name --save

# 开发依赖
npm install package-name --save-dev

# 确保添加类型定义
npm install @types/package-name --save-dev
```

### Q: 如何解决构建错误？

```bash
# 清理并重新构建
npm run clean
npm install
npm run build

# 检查 TypeScript 错误
tsc --noEmit
```

### Q: 如何运行特定命令？

```bash
# 开发模式
npm run dev create my-project

# 构建后运行
npm run build
node dist/index.js create my-project
```

### Q: 如何调试模板生成？

```bash
# 启用详细日志
DEBUG=kinxkit:* npm run dev create test-project

# 查看生成的文件
cd test-project
ls -la
```

---

## 🆘 获取帮助

- 查看 [README.md](README.md) 了解项目概况
- 查看 [PROJECT_SPEC.md](PROJECT_SPEC.md) 了解详细规范
- 查看 [RULES.md](RULES.md) 了解开发规范
- 查看已有代码示例
- 提交 Issue 或 Pull Request

---

## 🐛 常见问题

### Q: TypeScript 编译错误怎么办？

**A:** 项目已修复所有已知编译错误。当前版本（0.1.0）可以成功构建，0 个错误。

如果遇到新错误：
1. 确保 `npm install` 已完成（567 个包）
2. 删除 `node_modules` 和 `dist` 重新安装
3. 检查 TypeScript 版本：`npm ls typescript`
4. 清理构建缓存：`npm run clean && npm run build`

### Q: 项目可以正常构建吗？

**A:** 是的！项目状态：
- ✅ npm install: 成功（567 包，0 漏洞）
- ✅ npm run build: 成功（0 错误）
- ✅ CLI 命令: 全部可用
- ✅ 类型安全: 100%

### Q: 依赖安装失败怎么办？

**A:** 常见解决方案：
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 lock
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果还有问题，尝试使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### Q: 如何验证 CLI 是否正常工作？

**A:** 运行以下命令测试：
```bash
# 构建项目
npm run build

# 查看帮助
node dist/index.js --help

# 测试环境检测
node dist/index.js create --help
```

### Q: 如何开始开发？

**A:** 开发工作流程：
1. 确保 `npm install` 完成
2. 运行 `npm run build` 构建项目
3. 运行 `npm run dev` 进入开发模式（如果配置了）
4. 运行 `npm test` 运行测试
5. 运行 `npm run lint` 检查代码质量

### Q: 项目使用什么技术栈？

**A:** 当前技术栈（已验证）：
- **TypeScript 5.3** - 严格模式，0 编译错误
- **Commander.js 12.0** - CLI 框架
- **Inquirer.js 9.2** - 交互式提示
- **Chalk 5.3** + **Ora 8.0** - 终端美化
- **Handlebars 4.7** - 模板引擎
- **Execa 8.0** - 进程执行
- **Jest 29.7** - 测试框架

### Q: 如何推送到 GitHub？

**A:** 仓库已成功创建并推送！

✅ **GitHub 仓库**: https://github.com/Cherny0306/KINXKit

后续推送：
```bash
# 1. 修改代码后提交
git add .
git commit -m "your commit message"

# 2. 推送到 GitHub
git push origin main
```

**注意**: 使用 HTTPS 方式，无需 SSH 密钥配置。推送时会自动处理认证。

### Q: GitHub 配置包含什么？

**A:** 完整的开源项目配置：
- ✅ CI/CD 工作流（自动构建和测试）
- ✅ Issue 模板（Bug 报告 + 功能请求）
- ✅ Pull Request 模板
- ✅ 贡献指南（CONTRIBUTING.md）
- ✅ MIT 开源许可证
- ✅ GitHub 设置指南（GITHUB_SETUP.md）
- ✅ 快速开始指南（QUICKSTART_GITHUB.md）
- ✅ 推送工具（多个自动化脚本）

---

*最后更新: 2025-03-07 23:45*
*维护者: KINXKit Team*
