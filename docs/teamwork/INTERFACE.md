# 接口创建与使用指南

> 如何创建接口定义、让团队成员使用、避免冲突

---

## 📋 目录

- [一、什么是接口](#一什么是接口)
- [二、如何创建接口](#二如何创建接口)
- [三、接口使用流程](#三接口使用流程)
- [四、接口修改规范](#四接口修改规范)
- [五、冲突预防](#五冲突预防)
- [六、完整示例](#六完整示例)

---

## 一、什么是接口

### 简单理解

```
接口 = 合同

它定义了:
├── 函数叫什么名字
├── 需要什么输入
└── 会返回什么输出

就像点餐菜单:
├── 菜名 = 函数名
├── 食材 = 输入参数
└── 菜品 = 返回结果
```

### 为什么要接口

```
没有接口的问题:
├── A写了一个函数 add()
├── B不知道怎么用
├── A改了函数名，B不知道
└── 代码到处报错

有接口的好处:
├── 写在文档里，两人都能看到
├── TypeScript 会自动检查
├── 改了接口会立即报错
└── 清晰的"合同"，减少沟通成本
```

---

## 二、如何创建接口

### 方式1：用 Markdown 文档（最简单）

```markdown
<!-- contracts/计算器接口.md -->

# 计算器接口

## 函数1: 加法

**函数名**: add

**输入**:
- a: 数字 (number)
- b: 数字 (number)

**输出**: 数字 (number)

**示例**:
```
add(1, 2) 返回 3
```

**谁实现**: 开发者A
**谁调用**: 开发者B
```

### 方式2：用 TypeScript 类型定义（推荐）

```typescript
// contracts/calculator.interface.ts

/**
 * ⚠️ 重要提示
 *
 * 这是两人的接口约定
 * 修改前必须两人确认！
 */

// ============ 数据类型 ============

/**
 * 计算结果
 */
export interface CalcResult {
  /** 结果值 */
  value: number;
  /** 是否成功 */
  success: boolean;
}

// ============ 函数定义 ============

/**
 * 加法运算
 *
 * @param a - 第一个数字
 * @param b - 第二个数字
 * @returns 计算结果
 *
 * @example
 * ```typescript
 * add(1, 2)  // 返回 { value: 3, success: true }
 * ```
 */
export declare function add(a: number, b: number): CalcResult;

/**
 * 减法运算
 */
export declare function subtract(a: number, b: number): CalcResult;
```

### 创建接口文件的步骤

```bash
# 1. 创建 contracts 目录
mkdir contracts

# 2. 创建接口文件
touch contracts/模块名.interface.ts

# 3. 写入接口定义
# (用上面的模板)

# 4. 提交到仓库
git add contracts/
git commit -m "feat: add calculator interface"
git push origin develop
```

---

## 三、接口使用流程

### 完整流程

```
┌─────────────────────────────────────────────────────────────┐
│  第一步: 两人一起定义接口 (Day 1, 30分钟)                   │
├─────────────────────────────────────────────────────────────┤
│  ├── 讨论需要什么函数                                       │
│  ├── 确定函数名、输入、输出                                  │
│  └── 写入 contracts/xxx.interface.ts                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  第二步: 开发者A 实现接口 (Day 2-4)                        │
├─────────────────────────────────────────────────────────────┤
│  ├── 按照 interface 写函数实现                              │
│  ├── 确保输入输出和定义一致                                  │
│  └── 推送到自己的功能分支                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  第三步: 开发者B 使用接口 (Day 2-4)                        │
├─────────────────────────────────────────────────────────────┤
│  ├── 从 interface 导入类型和函数                            │
│  ├── 调用 A 实现的函数                                      │
│  ├── TypeScript 会自动检查类型                              │
│  └── 推送到自己的功能分支                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  第四步: 合并与测试 (Day 5)                                 │
├─────────────────────────────────────────────────────────────┤
│  ├── 两人合并代码到 develop                                 │
│  ├── 运行测试                                                │
│  └── 修复问题                                                │
└─────────────────────────────────────────────────────────────┘
```

### 开发者A的代码

```typescript
// src/calculator.ts
// 这是 A 的实现代码

import { CalcResult } from '../contracts/calculator.interface.js';

// 实现加法函数
export function add(a: number, b: number): CalcResult {
  return {
    value: a + b,
    success: true
  };
}

// 实现减法函数
export function subtract(a: number, b: number): CalcResult {
  return {
    value: a - b,
    success: true
  };
}
```

### 开发者B的代码

```typescript
// src/app.ts
// 这是 B 的调用代码

// 从接口文件导入类型
import { CalcResult } from '../contracts/calculator.interface.js';
// 从实现文件导入函数
import { add, subtract } from '../calculator.js';

// 使用函数
export function demo() {
  const result1: CalcResult = add(1, 2);
  console.log(result1.value); // 3

  const result2: CalcResult = subtract(5, 3);
  console.log(result2.value); // 2
}
```

---

## 四、接口修改规范

### 修改规则

```
✅ 可以做的:
├── 两人一起讨论后修改
├── 修改后同步更新两人的代码
└── 更新接口文档

❌ 不能做的:
├── 一个人偷偷修改
├── 不通知对方就修改
└── 修改后不更新文档
```

### 修改流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. 发现需要修改接口                                        │
│  └── 例如：需要加一个新函数                                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 两人讨论 (必须！)                                        │
│  ├── 微信/电话会议                                          │
│  ├── 确定新的接口定义                                        │
│  └── 讨论对现有代码的影响                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 更新接口文件                                            │
│  ├── A修改 contracts/xxx.interface.ts                       │
│  ├── 推送到 GitHub                                           │
│  └── 通知 B                                                  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. B 拉取最新代码                                          │
│  ├── git pull origin develop                                │
│  └── 看到接口文件的修改                                      │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 各自更新代码                                            │
│  ├── A 更新函数实现                                          │
│  └── B 更新函数调用                                          │
└─────────────────────────────────────────────────────────────┘
```

### 接口修改示例

```typescript
// ===== 修改前的接口 ======
export interface CalcResult {
  value: number;
  success: boolean;
}

export declare function add(a: number, b: number): CalcResult;

// ===== 修改后的接口 ======
export interface CalcResult {
  value: number;
  success: boolean;
  message: string;  // ← 新增字段
}

export declare function add(a: number, b: number): CalcResult;
export declare function multiply(a: number, b: number): CalcResult;  // ← 新增函数
```

---

## 五、冲突预防

### 1. 接口文件加警告

```typescript
/**
 * ⚠️⚠️⚠️ 警告 ⚠️⚠️⚠️
 *
 * 这个文件是接口定义，修改会影响两个人！
 *
 * 修改前必须：
 * 1. 和对方讨论
 * 2. 双方都同意
 * 3. 一起更新代码
 *
 * @maintainers 开发者A、开发者B
 * @lastModified 2025-03-06
 */
```

### 2. Git 保护规则

```bash
# 在 GitHub 仓库设置中保护 contracts/ 目录

Settings → Branches → Add rule

# 配置:
# Branch name pattern: contracts/*
# Require pull request: ✓
```

### 3. Pre-commit 检查

```bash
# .git/hooks/pre-commit

#!/bin/bash
# 检查是否修改了接口文件

if git diff --cached --name-only | grep -q "contracts/"; then
  echo "⚠️ 你修改了接口文件！"
  echo "请确认已经和对方讨论过。"
  read -p "继续提交? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

---

## 六、完整示例

### 项目：环境检测器

#### 接口定义

```typescript
// contracts/detector.interface.ts

/**
 * 环境检测器接口
 *
 * @author 开发者A、开发者B
 * @date 2025-03-06
 */

// ========== 数据类型 ==========

/**
 * 操作系统信息
 */
export interface OSInfo {
  /** 系统平台 */
  platform: 'win32' | 'darwin' | 'linux';
  /** 系统架构 */
  arch: 'x64' | 'arm64';
  /** 系统版本 */
  version: string;
}

/**
 * 代理信息
 */
export interface ProxyInfo {
  /** 是否启用 */
  enabled: boolean;
  /** 代理地址 */
  host: string;
  /** 代理端口 */
  port: number;
  /** 代理类型 */
  type: 'http' | 'socks5';
}

// ========== 函数定义 ==========

/**
 * 检测操作系统
 * @returns 系统信息，失败返回 null
 */
export declare function detectOS(): Promise<OSInfo | null>;

/**
 * 检测代理
 * @returns 代理信息，没有代理返回 null
 */
export declare function detectProxy(): Promise<ProxyInfo | null>;
```

#### A 的实现

```typescript
// core/detector.ts

import { OSInfo, ProxyInfo } from '../contracts/detector.interface.js';

export async function detectOS(): Promise<OSInfo | null> {
  try {
    return {
      platform: process.platform as any,
      arch: process.arch as any,
      version: process.version
    };
  } catch {
    return null;
  }
}

export async function detectProxy(): Promise<ProxyInfo | null> {
  const proxy = process.env.HTTP_PROXY || process.env HTTPS_PROXY;
  if (!proxy) return null;

  try {
    const url = new URL(proxy);
    return {
      enabled: true,
      host: url.hostname,
      port: parseInt(url.port) || 8080,
      type: url.protocol === 'http:' ? 'http' : 'socks5'
    };
  } catch {
    return null;
  }
}
```

#### B 的使用

```typescript
// commands/status.ts

import { detectOS, detectProxy } from '../core/detector.js';

export async function showStatus() {
  console.log('系统信息:');

  const os = await detectOS();
  if (os) {
    console.log(`  系统: ${os.platform} ${os.arch}`);
  }

  const proxy = await detectProxy();
  if (proxy && proxy.enabled) {
    console.log(`  代理: ${proxy.host}:${proxy.port}`);
  }
}
```

---

## 📋 快速检查清单

### 创建接口时

- [ ] 两人一起讨论接口定义
- [ ] 使用 TypeScript 写入 contracts/
- [ ] 包含清晰的注释和示例
- [ ] 推送到 GitHub
- [ ] 通知对方查看

### 使用接口时

- [ ] 从 contracts/ 导入类型
- [ ] 按照接口定义调用函数
- [ ] TypeScript 检查通过
- [ ] 测试功能正常

### 修改接口时

- [ ] 和对方讨论修改内容
- [ ] 双方都同意后再修改
- [ ] 更新接口文件
- [ ] 同步更新实现和调用代码
- [ ] 一起测试确保没问题

---

*最后更新: 2025-03-06*
