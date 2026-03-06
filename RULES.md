# KINXKit 开发规范与规则

> 项目开发过程中必须遵循的规范和准则

---

## 📋 目录

- [一、代码规范](#一代码规范)
- [二、Git 规范](#二git-规范)
- [三、文档规范](#三文档规范)
- [四、测试规范](#四测试规范)
- [五、安全规范](#五安全规范)
- [六、项目结构规范](#六项目结构规范)
- [七、命名规范](#七命名规范)
- [八、接口设计规范](#八接口设计规范)
- [九、错误处理规范](#九错误处理规范)
- [十、性能规范](#十性能规范)

---

## 一、代码规范

### TypeScript 代码风格

```typescript
// ========== ✅ 必须使用 async/await ==========
// 好的做法
const result = await detector.detect();

// ❌ 不好的做法
detector.detect().then(result => {
  // 处理结果
});

// ========== ✅ 错误处理必须完整 ==========
try {
  await someOperation();
} catch (error) {
  if (error instanceof KnownError) {
    // 处理已知错误
    logger.error('Known error occurred', { code: error.code });
  } else {
    // 处理未知错误
    logger.error('Unexpected error', { error: error.message });
  }
}

// ========== ✅ 使用 const/let，避免 var ==========
const constantValue = 'immutable';
let mutableValue = 'mutable';

// ❌ 避免使用
var oldValue = 'deprecated';

// ========== ✅ 使用箭头函数 ==========
const getData = async (id: string): Promise<Data> => {
  return await fetch(id);
};

// ========== ✅ 使用模板字符串 ==========
const message = `Hello ${username}, welcome to ${projectName}`;

// ========== ✅ 使用解构赋值 ==========
const { name, version } = packageInfo;
const [first, second] = array;

// ========== ✅ 使用可选链 ==========
const value = obj?.nested?.property;

// ========== ✅ 使用空值合并 ==========
const config = userConfig ?? defaultConfig;
```

### Python 代码风格

```python
# ========== ✅ 遵循 PEP 8 ==========
# 使用类型注解
def process_data(data: List[Dict]) -> Dict[str, Any]:
    """处理数据并返回结果。"""
    result = {}
    for item in data:
        result[item['id']] = item
    return result

# ========== ✅ 使用上下文管理器 ==========
with open('file.txt', 'r') as f:
    content = f.read()

# ========== ✅ 使用列表推导式 ==========
squares = [x**2 for x in range(10)]

# ========== ✅ 使用 f-string ==========
message = f"Hello {name}, you have {count} messages"

# ========== ✅ 异常处理要具体 ==========
try:
    process_file(filepath)
except FileNotFoundError as e:
    logger.error(f"File not found: {filepath}")
except PermissionError as e:
    logger.error(f"Permission denied: {filepath}")
```

---

## 二、Git 规范

### 分支命名规范

```
feature/功能名称     # 新功能开发
├── feature/detector
├── feature/docker-manager
└── feature/github-integration

fix/问题描述         # Bug 修复
├── fix/proxy-detection-timeout
└── fix/gpu-memory-leak

hotfix/紧急问题       # 生产环境紧急修复
└── hotfix/crash-on-startup

refactor/重构内容     # 代码重构
├── refactor/template-engine
└── refactor/logger-system

docs/文档更新         # 文档变更
├── docs/cuda-guide
└── docs/api-reference

test/测试相关         # 测试添加或修改
├── test/detector-tests
└── test/integration-tests
```

### Commit Message 规范 (Conventional Commits)

```
<类型>(<范围>): <简短描述>

<详细描述>

<关闭的Issue>

类型定义:
├── feat: 新功能
├── fix: Bug 修复
├── docs: 文档更新
├── style: 代码格式（不影响功能）
├── refactor: 重构
├── perf: 性能优化
├── test: 测试相关
└── chore: 构建/工具链相关

示例:
feat(detector): add WSL2 detection

Implement WSL2 environment detection by checking
/proc/version and WSL_DISTRO_NAME environment variable.

Closes #12
```

### 提交频率规范

```
✅ 好习惯:
├── 完成一个功能就提交
├── 提交前先拉取最新代码
├── 清晰的 Commit Message
└── 提交前运行测试

❌ 坏习惯:
├── 堆积大量代码才提交
├── 直接提交到 main 分支
├── 模糊的提交信息
└── 跳过测试直接提交
```

### Git 工作流程

```bash
# ========== 日常工作流程 ==========
# 1. 同步最新代码
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发并提交
git add .
git commit -m "feat: add feature"

# 4. 推送分支
git push origin feature/your-feature

# 5. 创建 Pull Request
# (在 GitHub 网页操作)

# 6. 合并后清理
git checkout develop
git pull origin develop
git branch -d feature/your-feature
```

---

## 三、文档规范

### 代码注释规范

```typescript
// ========== ✅ 函数必须有 JSDoc 注释 ==========
/**
 * 检测系统代理配置
 *
 * @description 检查环境变量和常见代理端口
 * @returns {ProxyInfo | null} 代理信息，未检测到返回 null
 * @example
 * ```typescript
 * const proxy = detectProxy();
 * if (proxy) {
 *   console.log(`Proxy: ${proxy.host}:${proxy.port}`);
 * }
 * ```
 */
export function detectProxy(): ProxyInfo | null {
  // 实现代码
}

// ========== ✅ 复杂逻辑需要注释 ==========
// 检查 Windows 注册表中的代理软件
// 优先级: Clash Verge > Clash Nyanpasu > V2rayN
const registryPaths = [
  'HKCU\\Software\\ClashVerge',
  'HKCU\\Software\\ClashNyanpasu',
  'HKCU\\Software\\V2rayN'
];

// ========== ✅ TODO 注释 ==========
// TODO: 添加对 Shadowsocks 的支持
// FIXME: 这个方法在 macOS 上可能不准确
// HACK: 临时解决方案，等待上游修复
```

### README 规范

每个项目模板必须包含 README.md：

```markdown
# 项目名称

一句话描述项目

## 功能特点

- 特点1
- 特点2

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.11+
- Docker

### 安装

\`\`\`bash
npm install
# 或
pip install -r requirements.txt
\`\`\`

### 运行

\`\`\`bash
npm start
# 或
python app/main.py
\`\`\`

### Docker 部署

\`\`\`bash
docker-compose up -d
\`\`\`

## 配置

复制 `.env.example` 到 `.env` 并配置必要参数。

## 测试

\`\`\`bash
npm test
# 或
pytest tests/
\`\`\`

## 许可证

MIT
```

### API 文档规范

```typescript
/**
 * 环境检测器接口
 *
 * @description 提供系统环境、GPU、代理等检测功能
 * @author 开发者A
 * @since 0.1.0
 */
export interface IEnvironmentDetector {
  /**
   * 执行完整的环境检测
   *
   * @returns {Promise<EnvironmentInfo>} 环境信息对象
   * @throws {DetectionError} 当检测过程出现错误
   *
   * @example
   * ```typescript
   * const detector = new EnvironmentDetector();
   * const env = await detector.detect();
   * console.log(env.cuda?.available);
   * ```
   */
  detect(): Promise<EnvironmentInfo>;
}
```

---

## 四、测试规范

### 单元测试规范

```typescript
// ========== 测试文件命名 ==========
*.test.ts        # 单元测试
*.e2e.test.ts    # 端到端测试

// ========== 测试结构 ==========
describe('EnvironmentDetector', () => {
  describe('detectProxy', () => {
    it('should detect proxy from environment variable', async () => {
      // Given - 准备测试数据
      process.env.HTTP_PROXY = 'http://127.0.0.1:7890';

      // When - 执行测试
      const detector = new EnvironmentDetector();
      const proxy = await detector.detectProxy();

      // Then - 验证结果
      expect(proxy).not.toBeNull();
      expect(proxy?.host).toBe('127.0.0.1');
      expect(proxy?.port).toBe(7890);
    });

    it('should return null when no proxy is configured', async () => {
      delete process.env.HTTP_PROXY;

      const detector = new EnvironmentDetector();
      const proxy = await detector.detectProxy();

      expect(proxy).toBeNull();
    });
  });
});
```

### 测试覆盖率要求

```yaml
最低覆盖率要求:
  单元测试:
    ├── 语句覆盖率: ≥ 80%
    ├── 分支覆盖率: ≥ 75%
    ├── 函数覆盖率: ≥ 80%
    └── 行覆盖率: ≥ 80%

  集成测试:
    ├── 核心流程: 100% 覆盖
    ├── 错误处理: ≥ 70% 覆盖
    └── 边界情况: ≥ 60% 覆盖
```

### 测试最佳实践

```typescript
// ========== ✅ 使用测试替身 ==========
// Mock 外部依赖
jest.mock('../core/github', () => ({
  GitHubManager: jest.fn().mockImplementation(() => ({
    createRepo: jest.fn().mockResolvedValue('https://github.com/user/repo'),
    pushCode: jest.fn().mockResolvedValue(undefined)
  }))
}));

// ========== ✅ 测试边界情况 ==========
describe('validateProjectName', () => {
  it('should accept valid names', () => {
    expect(validate('my-project')).toBe(true);
    expect(validate('my_project')).toBe(true);
  });

  it('should reject empty names', () => {
    expect(validate('')).toBe(false);
  });

  it('should reject names with special characters', () => {
    expect(validate('my@project')).toBe(false);
  });
});

// ========== ✅ 测试异步错误 ==========
it('should handle network errors gracefully', async () => {
  // Mock 网络错误
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

  const detector = new Detector();

  await expect(detector.checkOnline()).rejects.toThrow('Network error');
});
```

---

## 五、安全规范

### 密钥和敏感信息

```yaml
禁止提交:
  ├── API 密钥 (OpenAI, GitHub, etc.)
  ├── 数据库密码
  ├── 私钥文件 (.pem, .key)
  ├── 证书文件
  ├── .env 文件
  └── 包敏感信息的配置文件

必须忽略:
  .gitignore:
    ├── .env
    ├── .env.local
    ├── .env.*.local
    ├── *.pem
    ├── *.key
    ├── *.cert
    ├── secrets/
    └── credentials.json
```

### 依赖安全

```bash
# ========== 定期更新依赖 ==========
npm audit           # 检查安全漏洞
npm audit fix       # 自动修复
pip install safety  # Python 安全检查

# ========== 使用锁定版本 ==========
package-lock.json   # npm
yarn.lock          # yarn
requirements.txt   # pip
Pipfile.lock       # pipenv
```

### 输入验证

```typescript
// ========== ✅ 验证用户输入 ==========
import { validate } from 'class-validator';

class CreateProjectInput {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/)
  name: string;

  @IsOptional()
  @IsUrl()
  homepage?: string;
}

// ========== ✅ 清理输出 ==========
import * as sanitizer from 'html-sanitizer';

function renderUserInput(input: string): string {
  // 清理 HTML，防止 XSS
  return sanitizer.sanitize(input);
}

// ========== ✅ 路径遍历防护 ==========
import path from 'path';

function safeResolvePath(basePath: string, userPath: string): string {
  const resolved = path.resolve(basePath, userPath);
  // 确保解析后的路径仍在 basePath 内
  if (!resolved.startsWith(basePath)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}
```

---

## 六、项目结构规范

### 目录组织

```
src/
├── commands/           # 命令实现（单职责）
├── core/              # 核心模块（可复用）
├── nlp/               # 自然语言处理
├── prompt/            # 交互式提示
├── utils/             # 工具函数（纯函数）
└── templates/         # 模板文件

每个模块:
├── index.ts          # 导出接口
├── types.ts          # 类型定义
└── *.test.ts         # 测试文件
```

### 模块依赖原则

```
依赖层次:
  commands → core → utils
        ↓        ↓
      prompt   templates
        ↓
      nlp

禁止:
  ├── utils 依赖 core (循环依赖)
  ├── core 依赖 commands
  └── 跨层直接调用
```

### 文件长度限制

```yaml
代码文件:
  ├── 行数: 建议 < 300 行
  ├── 单个函数: < 50 行
  └── 单个类: < 300 行

配置文件:
  ├── 不限制行数
  └── 保持结构清晰
```

---

## 七、命名规范

### 文件命名

```
TypeScript:
  ├── kebab-case: detector.ts, proxy-detector.ts
  ├── 测试文件: *.test.ts
  └── 类型文件: *.types.ts (可选)

Python:
  ├── snake_case: detector.py, proxy_detector.py
  ├── 测试文件: test_*.py
  └── 私有模块: _private.py

配置文件:
  ├── kebab-case: docker-compose.yml
  ├── 小写: .env.example, .gitignore
  └── 大写缩写: README.md, LICENSE
```

### 变量命名

```typescript
// ========== PascalCase ==========
class EnvironmentDetector {}
interface ProxyInfo {}
enum ProjectType {}

// ========== camelCase ==========
const userName = 'admin';
function detectProxy() {}
const getUserInfo = () => {};

// ========== UPPER_SNAKE_CASE ==========
const MAX_RETRIES = 3;
const DEFAULT_PORT = 8080;
const API_BASE_URL = 'https://api.example.com';

// ========== 私有成员 ==========
class MyClass {
  private _internalState: State;

  private _helperMethod() {}
}

// ========== 布尔变量 ==========
// 使用 is/has/can 前缀
const isValid = true;
const hasPermission = false;
const canAccess = true;
```

### 常量定义

```typescript
// ========== ✅ 使用常量文件 ==========
// constants.ts
export const DEFAULT_TIMEOUT = 30000;
export const MAX_RETRY_COUNT = 3;
export const SUPPORTED_GPU_VENDORS = ['nvidia'] as const;

// ========== ✅ 使用 enum ==========
enum ProjectType {
  AI_CHATBOT = 'ai_chatbot',
  API_SERVICE = 'api_service',
  WEB_APP = 'web_app'
}

// ========== ✅ 配置对象 ==========
interface Config {
  readonly timeout: number;
  readonly retries: number;
  readonly endpoint: string;
}
```

---

## 八、接口设计规范

### 接口定义

```typescript
/**
 * ⚠️ 重要提示
 *
 * 接口修改会影响多人，修改前必须讨论！
 *
 * @maintainers 开发者A、开发者B
 * @lastModified 2025-03-07
 */

// ========== 数据类型 ==========
/**
 * 环境检测结果
 */
export interface EnvironmentInfo {
  /** 操作系统类型 */
  os: string;

  /** 是否在 WSL2 环境中 */
  isWSL?: boolean;

  /** CUDA 信息 */
  cuda?: CUDAInfo;

  /** 代理信息 */
  proxy?: ProxyInfo;
}

// ========== 函数签名 ==========
/**
 * 检测系统环境
 *
 * @returns {Promise<EnvironmentInfo>} 环境信息对象
 * @throws {DetectionError} 当检测过程出现致命错误
 *
 * @example
 * ```typescript
 * const detector = new EnvironmentDetector();
 * const env = await detector.detect();
 * console.log(env.os);
 * ```
 */
export declare function detect(): Promise<EnvironmentInfo>;
```

### 接口修改流程

```
1. 讨论 → 两人确认接口变更
2. 更新 → 修改接口定义文件
3. 通知 → 提交并通知团队成员
4. 同步 → 各自更新实现和调用
5. 测试 → 确保所有测试通过
```

---

## 九、错误处理规范

### 自定义错误类

```typescript
/**
 * KINXKit 基础错误类
 */
export class KinxError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'KinxError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 检测错误
 */
export class DetectionError extends KinxError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'DETECTION_ERROR', suggestions);
    this.name = 'DetectionError';
  }
}

// ========== 使用示例 ==========
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

### 错误处理模式

```typescript
// ========== ✅ 完整的错误处理 ==========
async function createProject(config: ProjectConfig) {
  try {
    // 验证配置
    validateConfig(config);

    // 生成项目
    await generator.generate(config);

    // 构建 Docker
    await docker.build(config.path);

    return { success: true };
  } catch (error) {
    if (error instanceof ValidationError) {
      // 配置错误，给出具体建议
      logger.error('Invalid config', { errors: error.errors });
      throw error;
    } else if (error instanceof DockerError) {
      // Docker 错误，给出解决建议
      logger.error('Docker error', { message: error.message });
      throw new KinxError(
        'Failed to build Docker image',
        'DOCKER_BUILD_FAILED',
        error.suggestions
      );
    } else {
      // 未知错误，记录并抛出
      logger.error('Unexpected error', { error: error.message });
      throw error;
    }
  }
}

// ========== ✅ 错误边界 ==========
try {
  await riskyOperation();
} catch (error) {
  // 清理资源
  cleanup();

  // 重新抛出
  throw error;
}
```

---

## 十、性能规范

### 异步操作

```typescript
// ========== ✅ 并行执行独立操作 ==========
// 好的做法
const [env, proxy, github] = await Promise.all([
  detector.detect(),
  proxyDetector.detect(),
  github.checkAuth()
]);

// ❌ 不好的做法（串行）
const env = await detector.detect();
const proxy = await proxyDetector.detect();
const github = await github.checkAuth();

// ========== ✅ 使用 Promise.allSettled ==========
const results = await Promise.allSettled([
  task1(),
  task2(),
  task3()
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    logger.info(`Task ${index} succeeded`);
  } else {
    logger.error(`Task ${index} failed`, { error: result.reason });
  }
});
```

### 资源管理

```typescript
// ========== ✅ 使用 using (Node.js 20+) ==========
{
  await using file = await fs.open('file.txt', 'r');
  // 自动关闭文件
}

// ========== ✅ 及时清理资源 ==========
async function processLargeFile(filepath: string) {
  const tempFiles: string[] = [];

  try {
    // 处理文件，创建临时文件
    tempFiles.push(await createTempFile());

    // ... 处理逻辑
  } finally {
    // 清理临时文件
    await Promise.all(tempFiles.map(f => fs.unlink(f)));
  }
}
```

### 内存优化

```typescript
// ========== ✅ 流式处理大文件 ==========
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

async function processLargeFile(filepath: string) {
  const fileStream = createReadStream(filepath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    // 逐行处理，不会一次性加载整个文件
    processLine(line);
  }
}

// ========== ✅ 避免内存泄漏 ==========
// 清理事件监听器
class MyClass {
  private listeners: Array<() => void> = [];

  addListener(fn: () => void) {
    this.listeners.push(fn);
  }

  destroy() {
    // 清理所有监听器
    this.listeners = [];
  }
}
```

---

## 📋 规范检查清单

### 代码提交前

```yaml
必须检查:
  ├── [ ] 代码风格符合规范
  ├── [ ] 所有测试通过
  ├── [ ] 没有调试代码 (console.log, debugger)
  ├── [ ] 没有敏感信息
  ├── [ ] Commit Message 清晰
  ├── [ ] 文档已更新
  └── [ ] 代码审查通过

推荐检查:
  ├── [ ] 代码覆盖率没有降低
  ├── [ ] 性能测试通过
  ├── [ ] 没有引入新的警告
  └── ] 错误处理完整
```

### PR 创建前

```yaml
必须满足:
  ├── [ ] CI 检查全部通过
  ├── [ ] 代码审查已通过
  ├── [ ] 文档已同步更新
  ├── [ ] Breaking Change 已标注
  └── [ ] 相关 Issue 已关联

推荐满足:
  ├── [ ] 添加了测试用例
  ├── [ ] 更新了 CHANGELOG
  ├── [ ] 性能影响可接受
  └── ] 向后兼容（主要版本）
```

---

## 🔧 工具配置

### ESLint 配置

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
}
```

### Prettier 配置

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### Git Hooks (Husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  }
}
```

---

## 📚 参考资源

### 代码风格指南
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Python PEP 8](https://pep8.org/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

### Git 规范
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### 测试规范
- [Jest Best Practices](https://jestjs.io/docs/tutorial-react-native)
- [Testing Best Practices](https://testingjavascript.com/)

---

*最后更新: 2025-03-07*
