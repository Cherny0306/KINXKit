# 两人团队分布式开发指南

> KINXKit 项目协作开发规范

---

## 🎯 核心原则

```
明确分工 + 规范先行 + 频繁同步 + 代码审查
```

---

## 📋 目录

- [一、角色分工](#一角色分工)
- [二、Git分支策略](#二git分支策略)
- [三、代码提交规范](#三代码提交规范)
- [四、代码审查](#四代码审查)
- [五、沟通机制](#五沟通机制)
- [六、测试策略](#六测试策略)
- [七、文档管理](#七文档管理)
- [八、冲突处理](#八冲突处理)
- [九、最佳实践](#九最佳实践)

---

## 一、角色分工

### 方案A: 前后端分离 (推荐)

```
┌─────────────────────────────────────────────────────────────┐
│                    开发者 A (后端/工具核心)                   │
├─────────────────────────────────────────────────────────────┤
│  负责:                                                       │
│  ├── 环境检测器 (core/detector.ts)                         │
│  ├── Docker 管理器 (core/docker.ts)                         │
│  ├── GitHub 集成 (core/github.ts)                           │
│  ├── 代理检测器 (core/proxy.ts)                             │
│  ├── 意图分类器 (nlp/classifier.ts)                         │
│  └── 代码生成器 (core/generator.ts)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    开发者 B (前端/交互)                        │
├─────────────────────────────────────────────────────────────┤
│  负责:                                                       │
│  ├── CLI 框架搭建 (index.ts, commands/)                     │
│  ├── 交互式提示 (prompt/)                                   │
│  ├── 日志工具 (utils/logger.ts)                             │
│  ├── 命令执行器 (utils/executor.ts)                         │
│  ├── 项目模板 (templates/)                                  │
│  └── 文档和测试                                              │
└─────────────────────────────────────────────────────────────┘
```

### 责任边界

```
┌─────────────────────────────────────────────────────────────┐
│  开发者A的目录 (只有A主要修改)                               │
│  ├── core/                                                  │
│  ├── nlp/                                                   │
│  └── contracts/ (定义接口，两人确认后修改)                  │
├─────────────────────────────────────────────────────────────┤
│  开发者B的目录 (只有B主要修改)                               │
│  ├── commands/                                              │
│  ├── prompt/                                                │
│  ├── utils/                                                 │
│  └── templates/                                             │
├─────────────────────────────────────────────────────────────┤
│  共同维护 (修改前要沟通)                                     │
│  ├── src/index.ts                                           │
│  ├── package.json                                           │
│  └── tsconfig.json                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Git分支策略

### 分支结构

```
main (主分支 - 生产代码)
    │
    └── develop (开发分支)
            │
            ├── feature/detector (A的功能分支)
            ├── feature/docker (A的功能分支)
            ├── feature/commands (B的功能分支)
            └── feature/interactive (B的功能分支)
```

### 分支命名规范

```
feature/功能名      # 新功能开发
├── feature/detector
├── feature/docker
└── feature/github

fix/问题描述       # Bug修复
├── fix/proxy-timeout
└── fix/auth-error

hotfix/紧急问题     # 生产环境紧急修复
└── hotfix/crash-fix

refactor/重构内容   # 代码重构
└── refactor/clean-up
```

### 创建分支

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. 在功能分支上工作
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 3. 创建 Pull Request 合并到 develop
# 在 GitHub 网页操作

# 4. 合并后删除功能分支
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

---

## 三、代码提交规范

### Commit Message 格式

```
<类型>(<范围>): <简短描述>

<详细描述>

<关闭的Issue>
```

### 类型定义

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(detector): add proxy detection` |
| `fix` | Bug修复 | `fix(github): resolve auth timeout` |
| `docs` | 文档更新 | `docs: update installation guide` |
| `style` | 代码格式 | `style: format code with prettier` |
| `refactor` | 重构 | `refactor: simplify template logic` |
| `test` | 测试 | `test(detector): add proxy tests` |
| `chore` | 构建/工具 | `chore: update dependencies` |
| `perf` | 性能优化 | `perf: optimize image build` |

### 提交示例

```bash
# 好的提交
git commit -m "feat(docker): add compose file generator

- Generate docker-compose.yml based on project type
- Support multiple services (app, db, redis)
- Add volume configurations

Closes #12"

# 不好的提交
git commit -m "update"
git commit -m "fix bug"
git commit -m "wip"
```

---

## 四、代码审查

### 审查清单

每次 Pull Request 必须检查：

- [ ] 代码风格符合规范
- [ ] 添加了必要的注释
- [ ] 有对应的测试用例
- [ ] 测试全部通过
- [ ] 文档已更新
- [ ] 没有调试代码 (console.log)
- [ ] 没有敏感信息
- [ ] Commit Message 清晰

### 审查流程

```
1. 开发者完成功能 → 推送到 GitHub
2. 创建 Pull Request
3. 另一位开发者审查
   ├── 代码风格检查
   ├── 逻辑正确性验证
   ├── 潜在问题指出
   └── 改进建议提出
4. 修改并重新提交
5. 审查通过后合并
6. 删除功能分支
```

### 审查模板

```markdown
## Code Review

### 功能概述
简要描述这个 PR 的功能

### 主要改动
- 改动1
- 改动2
- 改动3

### 测试情况
- [ ] 单元测试通过
- [ ] 手动测试通过
- [ ] 边界情况已考虑

### 审查意见
#### 需要修改
- [ ] 问题1
- [ ] 问题2

#### 建议优化
- [ ] 建议1
- [ ] 建议2

### 审查结果
- [ ] 通过，可以合并
- [ ] 需要修改后再审
- [ ] 拒绝，需要重构
```

---

## 五、沟通机制

### 日常沟通

| 场景 | 工具 | 说明 |
|------|------|------|
| 日常讨论 | 微信/钉钉群 | 快速问题即时沟通 |
| 代码讨论 | GitHub PR | 在 Pull Request 中讨论 |
| 文档协作 | 在线文档 | 共同编辑文档 |
| 任务管理 | GitHub Projects | 看板式任务管理 |
| 视频会议 | 腾讯会议/Zoom | 每周同步会议 |

### 同步频率

```
每日异步同步:
  ├── 早上: 今日计划
  ├── 晚上: 完成情况
  └── 遇到问题: 及时沟通

每周同步会议 (30分钟):
  ├── 回顾本周进度
  ├── 讨论遇到的问题
  ├── 计划下周任务
  └── 技术方案讨论
```

---

## 六、测试策略

### 测试分工

```
开发者A:                    开发者B:
├── 单元测试 (核心模块)     ├── 集成测试
├── 模块测试                 └── 端到端测试
└── 性能测试                 └── 用户场景测试
```

### 测试规范

```typescript
// 测试文件命名
*.test.ts        # 单元测试
*.e2e.test.ts    # 端到端测试

// 测试结构
describe('模块名', () => {
  describe('功能A', () => {
    it('应该正确处理正常输入', () => {
      // Given
      const input = '...';

      // When
      const result = function(input);

      // Then
      expect(result).toBe('...');
    });
  });
});
```

---

## 七、文档管理

| 文档 | 负责人 | 更新频率 |
|------|--------|----------|
| README.md | 开发者 B | 每次发版 |
| API 文档 | 开发者 A | 随代码更新 |
| CHANGELOG.md | 开发者 B | 每次发版 |
| CLAUDE.md | 开发者 A | 需要时 |
| PROGRESS.md | 两人共同 | 每周更新 |

---

## 八、冲突处理

### 防止冲突

```
✅ 好习惯:
├── 每天开始工作前：git pull origin main
├── 完成一个小功能就提交
├── 修改不同的文件
└── 要修改共同文件时先和对方说

❌ 坏习惯:
├── 很久才拉取一次
├── 堆积代码才提交
└── 不沟通就改代码
```

### 冲突解决步骤

```bash
# 1. 拉取时发现冲突
git pull origin main
# CONFLICT: content: Merge conflict in file.ts

# 2. 打开冲突文件，会看到：
# <<<<<<< HEAD
# A的代码
# =======
# B的代码
# >>>>>>> origin/main

# 3. 和对方一起讨论，决定保留什么

# 4. 删除冲突标记，保留最终代码

# 5. 标记冲突已解决
git add file.ts

# 6. 完成合并
git commit -m "merge: resolve conflicts"
```

---

## 九、最佳实践

### DO (应该做的)

- ✅ 每天同步代码，避免大冲突
- ✅ 小步提交，清晰的 Commit Message
- ✅ 所有代码都要经过 Code Review
- ✅ 写测试，保证代码质量
- ✅ 及时更新文档
- ✅ 遇到问题及时沟通
- ✅ 使用 Issue 跟踪 Bug 和功能需求

### DON'T (不应该做的)

- ❌ 不要直接推送到 main 分支
- ❌ 不要提交敏感信息 (密钥、密码)
- ❌ 不要写只有自己能懂的代码
- ❌ 不要堆积代码不提交
- ❌ 不要跳过代码审查
- ❌ 不要忽略测试失败
- ❌ 不要在不通知的情况下修改接口

---

## 📞 联系方式

| 场景 | 方式 |
|------|------|
| 紧急问题 | 微信/电话 |
| 代码讨论 | GitHub PR Comment |
| 文档协作 | 在线文档 |
| 定期会议 | 腾讯会议 (每周一次) |

---

*最后更新: 2025-03-06*
