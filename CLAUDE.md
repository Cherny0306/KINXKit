# KINXKit - Claude AI 项目指南

> 本文件为 Claude AI 提供 KINXKit 项目的完整上下文和开发指南

---

## 项目概述

**KINXKit** 是一款面向开发新手和小白的智能项目助手，通过对话式交互帮助用户快速将创意转化为可运行的项目。

### 核心价值

- 降低编程门槛，让小白用户快速创建项目
- 自动化环境配置，跳过繁琐的安装步骤
- 智能理解用户意图，推荐合适的技术栈
- 一键生成完整项目，包含代码、配置、部署

### 目标用户

- 编程小白（刚学编程，想快速做点东西）
- 学生（需要完成课程项目）
- 独立开发者（有创意，不想折腾环境）
- 初入职场者（需要快速搭建demo/原型）

---

## 技术栈

### CLI 工具本体

```
语言: TypeScript
运行时: Node.js / Bun
打包: pkg / nexe (单文件二进制)
平台: Windows / macOS / Linux
```

### 支持的项目类型

```
Phase 1 (MVP):
  - Python + FastAPI (AI聊天机器人、API服务)

Phase 2:
  - Python (数据分析、爬虫、工具脚本)
  - Node.js (Web应用、API服务)

Phase 3:
  - Go、Rust、Java、PHP、Ruby
```

---

## 项目结构

```
KINXKit/
├── bin/
│   └── kinx                    # CLI 入口文件
├── src/
│   ├── index.ts                # 主入口
│   ├── commands/               # 命令实现
│   │   ├── create.ts           # 创建项目命令
│   │   ├── up.ts               # 启动服务命令
│   │   ├── down.ts             # 停止服务命令
│   │   ├── status.ts           # 状态查看命令
│   │   ├── config.ts           # 配置管理命令
│   │   └── doctor.ts           # 诊断命令
│   ├── core/
│   │   ├── detector.ts         # 项目/环境检测器
│   │   ├── generator.ts        # 代码生成器
│   │   ├── proxy.ts            # 代理检测器
│   │   ├── github.ts           # GitHub 集成
│   │   └── docker.ts           # Docker 管理器
│   ├── templates/              # 项目模板
│   │   ├── python/
│   │   │   ├── ai-chatbot/     # AI聊天机器人模板
│   │   │   └── api-service/    # API服务模板
│   │   ├── nodejs/
│   │   └── docker/
│   │       ├── Dockerfile.*    # 各语言 Dockerfile 模板
│   │       └── compose.*       # docker-compose 模板
│   ├── nlp/                    # 自然语言处理
│   │   ├── classifier.ts       # 项目意图分类
│   │   └── mapper.ts           # 关键词到技术栈映射
│   ├── prompt/                 # 交互式提示
│   │   ├── select.ts           # 选择题交互
│   │   ├── input.ts            # 输入交互
│   │   └── confirm.ts          # 确认交互
│   └── utils/
│       ├── logger.ts           # 日志工具
│       ├── executor.ts         # 命令执行器
│       └── validator.ts        # 配置验证器
├── templates/                  # 模板文件（会被渲染）
├── package.json
├── tsconfig.json
├── PROJECT_SPEC.md             # 项目说明文档
├── CLAUDE.md                   # 本文件
└── README.md
```

---

## 核心模块说明

### 1. 环境检测器 (core/detector.ts)

```typescript
/**
 * 环境检测结果
 */
interface EnvironmentInfo {
  os: string;              // 操作系统
  platform: string;        // win32 | darwin | linux
  isWSL?: boolean;         // 是否在 WSL2 环境中
  docker?: boolean;        // Docker 是否安装
  git?: boolean;           // Git 是否安装
  gitVersion?: string;     // Git 版本
  python?: string;         // Python 版本
  node?: string;           // Node 版本
  proxy?: ProxyInfo;       // 代理信息
  github?: boolean;        // GitHub 是否登录
  cuda?: CUDAInfo;         // CUDA 信息 (可选)
  gpu?: GPUInfo;           // GPU 信息 (可选)
}

/**
 * CUDA 信息
 */
interface CUDAInfo {
  available: boolean;      // CUDA 是否可用
  version?: string;        // CUDA 版本
  driverVersion?: string;  // 驱动版本
  toolkitPath?: string;    // CUDA Toolkit 路径
  cuDNN?: boolean;         // cuDNN 是否安装
  nvccPath?: string;       // nvcc 编译器路径
}

/**
 * GPU 信息
 */
interface GPUInfo {
  name: string;            // GPU 型号
  memory: number;          // 显存大小 (MB)
  driverVersion?: string;  // 驱动版本
  computeCapability?: string; // 计算能力
}

class EnvironmentDetector {
  async detect(): Promise<EnvironmentInfo>;
  private detectOS(): string;
  private detectPlatform(): string;
  private detectWSL(): boolean;
  private detectDocker(): boolean;
  private detectGit(): boolean;
  private detectProxy(): ProxyInfo | null;
  private detectGitHubAuth(): boolean;
  private detectCUDA(): CUDAInfo | null;
  private detectGPU(): GPUInfo | null;
  private detectPython(): string | null;
  private detectNode(): string | null;
}
```

#### CUDA/WSL 检测逻辑

```typescript
// ========== WSL2 检测 ==========
private detectWSL(): boolean {
  try {
    // 方法1: 检查 /proc/version
    const version = fs.readFileSync('/proc/version', 'utf8');
    if (version.includes('Microsoft') || version.includes('WSL')) {
      return true;
    }

    // 方法2: 检查环境变量
    if (process.env.WSL_DISTRO_NAME) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ========== CUDA 检测 ==========
private async detectCUDA(): Promise<CUDAInfo | null> {
  try {
    // 执行 nvidia-smi 命令
    const { stdout } = await exec('nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader');

    if (stdout.trim()) {
      // 解析 GPU 信息
      const [name, memory, driverVersion] = stdout.split(',').map(s => s.trim());

      // 检查 CUDA 版本
      const nvccVersion = await this.checkNVCC();

      // 检查 cuDNN
      const cuDNN = await this.checkCuDNN();

      return {
        available: true,
        version: nvccVersion,
        driverVersion,
        nvccPath: this.findNVCC(),
        cuDNN
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ========== GPU 检测 ==========
private async detectGPU(): Promise<GPUInfo | null> {
  try {
    const { stdout } = await exec('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits');
    const [name, memory] = stdout.split(',').map(s => s.trim());

    return {
      name,
      memory: parseInt(memory)
    };
  } catch {
    return null;
  }
}
```

### 2. 项目意图分类器 (nlp/classifier.ts)

```typescript
/**
 * 项目类型枚举
 */
enum ProjectType {
  AI_CHATBOT = 'ai_chatbot',
  API_SERVICE = 'api_service',
  WEB_APP = 'web_app',
  DATA_ANALYSIS = 'data_analysis',
  CRAWLER = 'crawler',
  UTILITY = 'utility',
  UNKNOWN = 'unknown'
}

/**
 * 推荐的技术栈
 */
interface TechStack {
  backend: string;         // 后端框架
  frontend?: string;       // 前端框架
  database?: string;       // 数据库
  ai?: string;             // AI 服务
  container: string;       // 容器方案
}

class IntentClassifier {
  classify(input: string): ProjectType;
  recommend(type: ProjectType): TechStack;
  private keywords: Map<ProjectType, string[]>;
}
```

### 3. 代理检测器 (core/proxy.ts)

```typescript
interface ProxyInfo {
  enabled: boolean;
  type: 'http' | 'socks5';
  host: string;
  port: number;
  source: 'env' | 'software' | 'manual';
}

class ProxyDetector {
  detect(): ProxyInfo | null;
  private checkEnvVars(): ProxyInfo | null;
  private checkSoftware(): ProxyInfo | null;
  private checkCommonPorts(): ProxyInfo | null;
}
```

### 4. GitHub 集成 (core/github.ts)

```typescript
class GitHubManager {
  async authenticate(): Promise<boolean>;
  async createRepo(name: string, options: RepoOptions): Promise<string>;
  async pushCode(localPath: string, repoUrl: string): Promise<void>;
  private checkAuthStatus(): boolean;
  private createRemoteRepo(): string;
  private initializeGit(): void;
}
```

### 5. Docker 管理器 (core/docker.ts)

```typescript
class DockerManager {
  async build(path: string): Promise<boolean>;
  async up(composeFile: string): Promise<boolean>;
  async down(composeFile: string): Promise<boolean>;
  async logs(service: string): Promise<string>;
  async status(): Promise<ServiceStatus[]>;
  async generateConfig(project: ProjectInfo): Promise<DockerConfig>;
}
```

### 6. 代码生成器 (core/generator.ts)

```typescript
class CodeGenerator {
  async generate(projectType: ProjectType, options: GenerateOptions): Promise<void>;
  private generateStructure(projectType: ProjectType): Promise<DirectoryTree>;
  private renderTemplate(template: string, data: any): Promise<string>;
  private writeFile(path: string, content: string): Promise<void>;
}
```

---

## 项目模板系统

### 模板目录结构

```
templates/
├── python/
│   ├── ai-chatbot/                 # AI聊天机器人模板
│   │   ├── app/
│   │   │   ├── main.py.j2          # Jinja2 模板
│   │   │   ├── ai.py.j2
│   │   │   └── models.py.j2
│   │   ├── Dockerfile.j2
│   │   ├── docker-compose.yml.j2
│   │   ├── requirements.txt.j2
│   │   └── .env.example.j2
│   └── api-service/                # API服务模板
│       └── ...
└── nodejs/
    └── web-app/                    # Web应用模板
        └── ...
```

### 模板变量

```jinja2
# main.py.j2 示例
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="{{ project_name }}",
    description="{{ project_description }}",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to {{ project_name }}!"}

{% if use_ai %}
@app.post("/chat")
async def chat(message: str):
    # AI integration here
    return {"response": "AI response"}
{% endif %}
```

---

## 开发规范

### 代码风格

```typescript
// 使用 async/await 而非 Promise 链
// ✅ 好的做法
const result = await detector.detect();

// ❌ 不好的做法
detector.detect().then(result => ...);

// 错误处理
try {
  await someOperation();
} catch (error) {
  if (error instanceof KnownError) {
    // 处理已知错误
  } else {
    // 处理未知错误
  }
}

// 日志使用
logger.info('Processing project', { name: projectName });
logger.error('Build failed', { error: error.message });
```

### 命名规范

```
文件名: kebab-case (例如: proxy-detector.ts)
类名: PascalCase (例如: EnvironmentDetector)
函数/方法: camelCase (例如: detectProxy)
常量: UPPER_SNAKE_CASE (例如: DEFAULT_PORT)
接口/类型: PascalCase (例如: ProjectInfo)
```

### 错误处理

```typescript
// 自定义错误类
class KinxError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'KinxError';
  }
}

// 使用示例
if (!dockerInstalled) {
  throw new KinxError(
    'Docker is not installed',
    'DOCKER_NOT_FOUND',
    [
      'Install Docker Desktop from https://www.docker.com/products/docker-desktop',
      'Or run: brew install --cask docker (macOS)'
    ]
  );
}
```

---

## 开发环境配置

### CUDA 环境 (GPU 加速)

当项目需要 GPU 加速时，KINXKit 会检测 CUDA 环境：

```
检测 CUDA 环境:
├── NVIDIA GPU 检测
├── 驱动版本检查
├── CUDA Toolkit 版本检测
├── cuDNN 库检测
└── GPU 可用性测试

详细配置指南: docs/setup/CUDA.md
```

### WSL2 环境 (Windows 用户)

对于 Windows 用户，KINXKit 推荐使用 WSL2 进行开发：

```
WSL2 优势:
├── 原生 Linux 性能
├── Docker 完整支持
├── GPU 加速支持 (CUDA)
└── 与 Windows 无缝集成

详细配置指南: docs/setup/WSL.md
```

### 环境检测策略

```yaml
检测顺序:
  1. 操作系统 (Windows/macOS/Linux)
  2. WSL2 (如果是 Windows)
  3. Docker (容器化支持)
  4. GPU/CUDA (如果需要)
  5. Git (版本控制)
  6. Python/Node.js (运行时)
  7. 代理配置 (网络访问)
  8. GitHub (代码托管)

建议安装:
  Windows 用户:
    - WSL2 + Ubuntu 22.04 LTS
    - Docker Desktop for Windows
    - NVIDIA CUDA Toolkit (如果有 GPU)

  Linux 用户:
    - Docker Engine
    - NVIDIA CUDA Toolkit (如果有 GPU)

  macOS 用户:
    - Docker Desktop for Mac
    - Homebrew (包管理器)
```

### 项目模板与 CUDA/WSL 集成

```yaml
AI/ML 项目模板:
  检测到 CUDA:
    - 添加 GPU 支持的 Dockerfile
    - 配置 PyTorch/TensorFlow CUDA 版本
    - 生成 GPU 优化的 requirements.txt
    - 提供 GPU 测试脚本

  WSL2 环境:
    - 生成 .wslconfig 配置文件
    - 优化 Docker 配置 (使用 WSL2 后端)
    - 配置文件系统挂载
    - 提供性能优化建议

示例项目 (AI 聊天机器人):
  ├── .wslconfig          # WSL2 配置 (Windows)
  ├── docker-compose.yml  # GPU 支持配置
  ├── requirements.txt    # CUDA 依赖版本
  └── scripts/
      ├── check-gpu.py    # GPU 检测脚本
      └── benchmark.py    # 性能测试
```

---

## 交互设计原则

### 对话式交互流程

```
1. 欢迎消息
   └── 简洁友好，说明工具用途

2. 环境检测
   └── 静默检测，结果汇总展示

3. WSL2 推荐 (Windows 用户)
   └── 检测是否在 Windows 上，推荐安装 WSL2
   └── 如已安装 WSL2，显示版本和建议配置

4. CUDA 检测 (AI/ML 项目)
   └── 检测 GPU 和 CUDA 环境
   └── 如有 GPU，自动配置 GPU 加速

5. 意图理解
   └── 提供选项 + 自由输入

6. 确认配置
   └── 展示所有配置，等待确认

7. 执行生成
   └── 显示进度，不要沉默

8. 完成反馈
   └── 清晰的下一步指引
```

### 环境检测展示示例

```
🔍 正在检测你的环境...

基础环境:
  ✓ 操作系统: Windows 11
  ✓ 平台: Windows 原生
  ⚠ WSL2: 未安装 (推荐安装以获得更好性能)

开发工具:
  ✓ Docker: 已安装 (v24.0.0)
  ✓ Git: 已安装 (v2.44.0)
  ✓ Python: 已安装 (v3.11.8)
  ✓ Node.js: 已安装 (v20.11.0)

GPU 加速 (AI/ML 项目需要):
  ✓ NVIDIA GPU: GeForce RTX 3060 (12GB)
  ✓ 驱动版本: 531.14
  ✓ CUDA Toolkit: v12.1
  ✗ cuDNN: 未安装 (建议安装以提升性能)

网络配置:
  ✓ 代理: 127.0.0.1:7890 (Clash)
  ✓ GitHub: 已登录

💡 建议:
  1. 安装 WSL2 以获得更好的 Linux 开发体验
  2. 安装 cuDNN 以提升 AI 模型训练性能

查看详细配置指南:
  - WSL2: docs/setup/WSL.md
  - CUDA: docs/setup/CUDA.md
```

### 输出格式规范

```
✅ 成功操作
⚠️  警告信息
❌ 错误信息
🔍 检测/扫描
📦 生成/构建
🚀 启动/部署
💡 建议/提示
📋 列表/信息
🔧 配置/设置
🌐 网络/代理
🔗 链接/集成
```

---

## 常见任务处理

### 任务1: 创建新项目

```typescript
// 1. 检测环境
const env = await detector.detect();

// 2. 获取用户意图
const input = await prompt.input('描述你的项目想法:');
const projectType = classifier.classify(input);
const techStack = classifier.recommend(projectType);

// 3. 确认技术栈
const confirmed = await prompt.confirm(`使用 ${techStack.backend}?`);

// 4. 配置向导
const config = await configWizard.run(projectType);

// 5. 生成项目
await generator.generate(projectType, {
  name: config.name,
  path: config.path,
  techStack
});

// 6. 构建镜像
await docker.build(config.path);

// 7. 完成
logger.success('项目已就绪！访问 http://localhost:8000');
```

### 任务2: 代理配置

```typescript
// 1. 检测代理
const proxy = proxyDetector.detect();

if (proxy) {
  // 2. 确认使用
  const useProxy = await prompt.confirm(
    `检测到代理: ${proxy.host}:${proxy.port}，是否使用？`
  );

  if (useProxy) {
    // 3. 配置所有工具
    await configureGitProxy(proxy);
    await configureNpmProxy(proxy);
    await configureDockerProxy(proxy);
  }
}
```

### 任务3: GitHub 集成

```typescript
// 1. 检查认证状态
const isAuthenticated = await github.checkAuth();

if (!isAuthenticated) {
  // 2. 引导认证
  logger.info('需要 GitHub 认证');
  logger.info('请选择认证方式:');
  logger.info('  [1] GitHub CLI (推荐)');
  logger.info('  [2] Personal Access Token');
  logger.info('  [3] SSH Key');

  const choice = await prompt.select('选择方式:', ['cli', 'token', 'ssh']);

  // 3. 执行认证
  await github.authenticate(choice);
}

// 4. 创建仓库
const repoUrl = await github.createRepo(projectName, {
  private: false,
  autoInit: true
});

// 5. 推送代码
await github.pushCode(projectPath, repoUrl);
```

---

## 测试策略

### 单元测试

```typescript
// detector.test.ts
describe('EnvironmentDetector', () => {
  it('should detect OS', () => {
    const detector = new EnvironmentDetector();
    const os = detector.detectOS();
    expect(os).toMatch(/win32|darwin|linux/);
  });

  it('should detect proxy from env', () => {
    process.env.HTTP_PROXY = 'http://127.0.0.1:7890';
    const detector = new EnvironmentDetector();
    const proxy = detector.detect();
    expect(proxy).toEqual({
      enabled: true,
      host: '127.0.0.1',
      port: 7890
    });
  });
});
```

### 集成测试

```typescript
// e2e/create-project.test.ts
describe('Create Project E2E', () => {
  it('should create AI chatbot project', async () => {
    const kinx = new KinxKit();

    await kinx.create({
      type: 'ai_chatbot',
      name: 'test-bot',
      path: '/tmp/test-bot'
    });

    expect(fs.existsSync('/tmp/test-bot/app/main.py')).toBe(true);
    expect(fs.existsSync('/tmp/test-bot/Dockerfile')).toBe(true);
  });
});
```

---

## 开发优先级

### Phase 0: 基础设施 (当前)
- [ ] 项目初始化
- [ ] TypeScript 配置
- [ ] 测试框架搭建
- [ ] CLI 框架选择 (commander.js / oclif / yargs)

### Phase 1: MVP (最小可行产品)
- [ ] 环境检测器实现
- [ ] 意图分类器实现
- [ ] 基础模板生成 (Python AI聊天机器人)
- [ ] Docker 配置生成
- [ ] 代理检测与配置

### Phase 2: 核心功能
- [ ] 交互式配置向导
- [ ] GitHub 集成
- [ ] 项目启动/停止命令
- [ ] 更多项目模板

### Phase 3: 增强功能
- [ ] 问题诊断与修复
- [ ] 配置预设市场
- [ ] 自定义模板支持

---

## 重要注意事项

1. **用户友好优先**: 所有错误信息都应该给出解决方案
2. **默认值合理**: 减少用户需要输入的内容
3. **进度可见**: 长时间操作要显示进度
4. **可回滚操作**: 重要操作前确认，失败后清理
5. **跨平台兼容**: Windows/macOS/Linux 都要支持
6. **中文友好**: 界面和文档都使用中文
7. **离线能力**: 核心功能不依赖外部服务

---

## 错误处理最佳实践 (2025-03-07)

### TypeScript 类型安全

```typescript
// ✅ 正确的错误处理模式
try {
  await someOperation();
} catch (error) {
  // 1. 类型守卫
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 2. 记录错误
  logger.error('操作失败', { error: errorMessage });

  // 3. 根据错误类型处理
  if (error instanceof KinxError) {
    // 处理自定义错误
    logger.info('建议：', error.suggestions);
  }

  // 4. 决定是否重新抛出
  throw error;
}
```

### 导入规范

```typescript
// ✅ 使用默认导入（CommonJS 模块）
import ora from 'ora';
import Handlebars from 'handlebars';

// ✅ 命名导入（具名导出）
import { execaCommand } from 'execa';
import { logger } from './utils/logger.js';

// ❌ 避免解构导入（可能导致错误）
// import { ora } from 'ora';
```

### 进程执行

```typescript
// ✅ 使用 execaCommand
import { execaCommand } from 'execa';

// 简单命令
const { stdout } = await execaCommand('npm run build');

// 带参数的命令
const { stdout } = await execaCommand(`git clone ${repoUrl}`);
```

### 类型定义完整性

```typescript
// ✅ 完整的 TechStack 接口
interface TechStack {
  // 必需属性
  backend: string;
  container: string;

  // 可选属性（明确列出所有）
  frontend?: string;
  database?: string;
  ai?: string;
  gpu?: boolean;
  cache?: string;
  auth?: string;
  libs?: string;
  queue?: string;
  proxy?: boolean;
  notebook?: string;
  ui?: string;
  ml?: string;
  cli?: string;
  config?: string;
  runtime?: string;
  docs?: string;
}
```

### 未使用变量处理

```typescript
// ✅ 使用下划线前缀
function processData(
  data: string,
  _unusedParam: string
): void {
  console.log(data);
}
```

---

## 常用命令参考

```bash
# 开发
npm run dev          # 开发模式
npm run build        # 构建
npm run test         # 测试
npm run lint         # 代码检查

# 打包
npm run pkg          # 打包为二进制

# 清理
npm run clean        # 清理构建产物
```

---

## 资源链接

- [Commander.js](https://commander.js.org/) - CLI 框架
- [Chalk](https://www.npmjs.com/package/chalk) - 终端颜色
- [Inquirer.js](https://www.npmjs.com/package/inquirer) - 交互式提示
- [ora](https://www.npmjs.com/package/ora) - 加载动画
- [Listr2](https://www.npmjs.com/package/listr2) - 任务列表
- [EJS](https://ejs.co/) - 模板引擎
