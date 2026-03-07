# KINXKit 常见问题解答

> 用户常见问题和解决方案汇总

---

## Q: KINXKit 是什么？

**A:** KINXKit 是一款面向开发新手和小白的智能项目助手 CLI 工具。

通过对话式交互，帮助用户：
- 🗣️ 像聊天一样描述项目想法
- 🧠 自动识别需求，推荐技术栈
- 🤖 生成项目代码和配置
- 🐳 一键部署到本地环境

**适用人群**：
- 编程小白
- 学生（课程项目）
- 独立开发者
- 初入职场者

**相关文档**：
- [README.md](README.md) - 项目说明
- [PROJECT_SPEC.md](PROJECT_SPEC.md) - 完整规范

---

## Q: 如何安装 KINXKit？

**A:** 安装步骤如下：

```bash
# 1. 克隆仓库
git clone https://github.com/Cherny0306/KINXKit.git
cd KINXKit

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 运行 CLI
node dist/index.js --help
```

**常见问题**：
- ❌ `npm install` 失败：检查网络连接，可能需要配置代理
- ❌ TypeScript 编译错误：确保 Node.js 版本 >= 18.x
- ❌ 权限错误：在 Windows 上以管理员身份运行

**See Also**:
- [QUICKREF.md](QUICKREF.md) - 项目使用 FAQ
- [CHANGELOG.md](CHANGELOG.md) - 版本信息

---

## Q: GitHub 提示需要更新 CI 文件怎么办？

**A:** 这是 GitHub 官方建议升级 GitHub Actions 的提示。

**已解决** ✅：
- 所有 actions 已从 v3 升级到 v4
- 提交：`ebf152d - ci: 更新 GitHub Actions 到 v4 版本`

**v4 版本优势**：
- 更好的安全性
- 改进的性能
- 更好的缓存支持
- 避免弃用警告

**手动触发工作流**：
现在可以在 GitHub Actions 页面手动运行 CI 工作流。

---

## Q: 如何创建一个新项目？

**A:** 使用 `kinx create` 命令：

```bash
# 基础用法
kinx create my-project

# 指定描述
kinx create my-project --description "一个 AI 聊天机器人"
```

**流程**：
1. 运行命令
2. 选择或描述项目类型
3. 查看推荐的技术栈
4. 确认配置
5. 自动生成项目

**支持的项目类型**：
- AI 聊天机器人
- API 服务
- Web 应用
- 数据分析
- 爬虫
- 工具脚本

**相关文档**：
- [README.md](README.md) - 快速开始
- [PROJECT_SPEC.md](PROJECT_SPEC.md) - 功能说明

---

## Q: 如何启动 Docker 服务？

**A:** 使用 `kinx up` 命令：

```bash
# 基础用法
kinx up

# 指定项目路径
kinx up /path/to/project
```

**前置条件**：
- ✅ Docker 已安装并运行
- ✅ 项目包含 docker-compose.yml
- ✅ 已配置环境变量

**常见错误**：
```
Error: Cannot connect to Docker daemon
```
**解决**：启动 Docker Desktop

**相关命令**：
- `kinx down` - 停止服务
- `kinx status` - 查看状态
- `kinx logs` - 查看日志

---

## Q: TypeScript 编译失败怎么办？

**A:** 检查以下步骤：

1. **确保依赖已安装**
   ```bash
   npm install
   ```

2. **清理构建产物**
   ```bash
   npm run clean
   ```

3. **重新构建**
   ```bash
   npm run build
   ```

**如果问题仍然存在**：

- 检查 Node.js 版本：`node --version`（需要 >= 18.x）
- 检查 TypeScript 版本：`npm list typescript`
- 删除 node_modules：`rm -rf node_modules package-lock.json`
- 重新安装：`npm install`

**已知的 TypeScript 问题**：
- ✅ 50+ 个编译错误已修复
- ✅ 所有导入问题已解决
- ✅ 所有类型安全问题已解决

**See Also**:
- [CLAUDE.md](CLAUDE.md) - 错误处理最佳实践
- [LOG.md](LOG.md) - TypeScript 修复记录

---

## Q: 如何推送到 GitHub？

**A:** 仓库已成功创建并推送！

**仓库地址**：https://github.com/Cherny0306/KINXKit

**后续推送步骤**：
```bash
# 1. 添加文件
git add .

# 2. 提交更改
git commit -m "your commit message"

# 3. 推送到 GitHub
git push origin main
```

**注意**：
- ✅ 使用 HTTPS 方式（无需 SSH 密钥）
- ✅ 提交信息遵循 Conventional Commits 规范
- ✅ 推送前确保代码已通过测试

**相关工具**：
- `检查并推送.bat` - Windows 自动推送工具
- `QUICKSTART_GITHUB.md` - 快速开始指南

---

## Q: 如何配置代理？

**A:** KINXKit 会自动检测代理配置。

**自动检测的代理端口**：
- Clash: 7890, 7891
- V2Ray: 10808, 10809
- Shadowsocks: 1080
- Surge: 6152

**手动配置**：
```bash
# 配置 git 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 配置 npm 代理
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890
```

**验证代理**：
```bash
# 测试连接
curl -I https://www.google.com
```

**取消代理**：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## Q: 项目支持哪些编程语言？

**A:** 当前支持 Python 和 Node.js，更多语言开发中。

**Phase 1 支持**：
- ✅ Python 3.8+ (FastAPI, Flask, 等)
- ✅ Node.js 18+ (Express, NestJS, 等)

**计划支持**（Phase 2/3）：
- ⏳ Go
- ⏳ Rust
- ⏳ Java
- ⏳ PHP
- ⏳ Ruby

**技术栈推荐**：
- AI/ML：Python + FastAPI
- API 服务：Python/Node.js
- Web 应用：Next.js, React
- 数据分析：Python + Pandas
- 爬虫：Python + Scrapy

---

## Q: 如何启用 GPU 支持？

**A:** KINXKit 会自动检测 GPU 和 CUDA 环境。

**检测内容**：
- ✅ NVIDIA GPU 型号和显存
- ✅ CUDA 版本
- ✅ cuDNN 安装状态
- ✅ 驱动版本

**GPU 感知推荐**：
- AI/ML 项目自动启用 GPU
- 无 GPU 时显示警告
- 提供 GPU 测试脚本

**手动验证 GPU**：
```bash
# 检查 GPU
nvidia-smi

# 检查 CUDA
nvcc --version

# Python 中检查
python -c "import torch; print(torch.cuda.is_available())"
```

**相关文档**：
- [docs/setup/CUDA.md](docs/setup/CUDA.md) - CUDA 配置指南
- [docs/setup/WSL.md](docs/setup/WSL.md) - WSL 配置指南

---

## Q: 如何参与贡献？

**A:** 欢迎贡献！请遵循以下流程：

**贡献流程**：
1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 进行开发和测试
4. 提交 Pull Request
5. 等待审查和合并

**代码规范**：
- 遵循 TypeScript 严格模式
- 使用 ESLint + Prettier 格式化
- 编写单元测试（80% 覆盖率）
- 遵循 Conventional Commits

**相关文档**：
- [CONTRIBUTING.md](CONTRIBUTING.md) - 完整贡献指南
- [CLAUDE.md](CLAUDE.md) - 开发规范

---

## Q: 如何报告 Bug？

**A:** 请使用 GitHub Issues：

**Bug 报告模板**：
1. 访问：https://github.com/Cherny0306/KINXKit/issues
2. 点击 "New Issue"
3. 选择 "Bug report" 模板
4. 填写信息：
   - 问题描述
   - 复现步骤
   - 环境信息
   - 日志输出
   - 截图（如果适用）

**需要包含的信息**：
- 操作系统和版本
- Node.js 版本
- KINXKit 版本
- 完整的错误消息
- 复现步骤

**相关文档**：
- [ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)

---

## Q: 如何建议新功能？

**A:** 我们欢迎功能建议！

**提交流程**：
1. 访问：https://github.com/Cherny0306/KINXKit/issues
2. 点击 "New Issue"
3. 选择 "Feature request" 模板
4. 填写信息：
   - 功能描述
   - 使用场景
   - 期望的解决方案
   - 优先级

**功能请求类别**：
- 新项目类型支持
- 新编程语言支持
- UI/UX 改进
- 性能优化
- 文档改进

**相关文档**：
- [ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)
- [PROJECT_SPEC.md](PROJECT_SPEC.md) - 项目路线图

---

## Q: 如何使用 update-docs skill？

**A:** update-docs 是一个文档自动更新工具。

**使用方式**：
```
update all docs
```

**支持的文档**（9 个）：
1. LOG.md - 开发日志
2. PROGRESS.md - 进度跟踪
3. CHANGELOG.md - 版本变更
4. README.md - 用户文档
5. QUICKREF.md - 快速参考
6. CONTEXT.md - 项目状态
7. USER_QUESTIONS.md - 问答 ⭐
8. CLAUDE.md - AI 开发指南
9. PROJECT_SPEC.md - 项目规范

**更新模式**：
- `update all docs` - 更新所有文档
- `update progress` - 只更新进度相关文档
- `update user docs` - 只更新用户文档

**特点**：
- ✅ 自动创建备份
- ✅ 智能更新分析
- ✅ 完整的错误处理
- ✅ 保持文档同步

**相关文档**：
- `C:\Users\A\.claude\skills\update-docs\SKILL.md` - Skill 文档

---

## Q: 项目当前完成度如何？

**A:** 项目总体进度为 72%。

**各阶段进度**：
```
Phase 0: 基础设施    100% ✅
Phase 1: MVP 核心      95% 🟡
Phase 2: 核心功能     45% 🟡
Phase 3: 增强功能      0% ⚪
```

**已完成功能**：
- ✅ 环境检测器（完整功能）
- ✅ 意图分类器（9 种类型）
- ✅ 模板生成器（AI 聊天机器人）
- ✅ Docker 管理器（完整操作）
- ✅ CLI 命令系统（5 个命令）
- ✅ GitHub 集成（仓库创建和推送）
- ✅ 完整文档体系（9 个文档）

**待完成功能**：
- ⏳ 配置管理模块
- ⏳ 更多项目模板
- ⏳ 交互组件细节
- ⏳ 问题诊断功能

**相关文档**：
- [PROGRESS.md](PROGRESS.md) - 详细进度
- [CHANGELOG.md](CHANGELOG.md) - 版本历史

---

## Q: 遇到错误怎么办？

**A:** 遵循系统化调试流程：

**第一步：收集信息**
```bash
# 查看完整错误信息
kinx create myproject --verbose

# 检查日志
kinx logs myproject

# 查看状态
kinx status
```

**第二步：诊断问题**
- 检查环境：`kinx doctor`
- 查看配置：`kinx config list`
- 验证依赖：`npm list`

**第三步：查找解决方案**
- 查看 [QUICKREF.md](QUICKREF.md) FAQ
- 查看 [LOG.md](LOG.md) 类似问题
- 搜索 GitHub Issues

**第四步：寻求帮助**
- 创建 GitHub Issue
- 提供完整的错误信息
- 包含复现步骤

**常见错误**：
```
Error: Docker not found
→ 安装 Docker Desktop

Error: Port 8000 already in use
→ 更改端口配置或停止占用服务

Error: Cannot find module
→ 运行 npm install
```

---

## Q: GPU 性能评分是什么意思？

**A:** KINXKit 会根据你的 GPU 型号和显存大小自动计算性能评分（0-100分）。

**评分等级**：
- 90-100分：旗舰级（RTX 4090, 24GB+）
- 75-89分：高端（RTX 4080/3090, 16GB+）
- 60-74分：中高端（RTX 4070/3080, 12GB+）
- 45-59分：中端（RTX 4060/3070, 8GB+）
- 30-44分：入门级（GTX 1660, 6GB）
- 0-29分：基础（GTX 1650 或更低）

**显存建议**：
- ≥8GB：可运行大型 AI 模型 ✅
- 4-8GB：适合中小型模型 ⚠️
- <4GB：建议使用云 GPU 或轻量级模型 ⚠️

**相关文档**：
- [docs/setup/CUDA.md](docs/setup/CUDA.md) - CUDA 配置指南
- [LOG.md](LOG.md) - GPU 性能评分实现

---

## Q: WSL2 为什么推荐用于 Windows 开发？

**A:** WSL2 (Windows Subsystem for Linux) 为 Windows 用户提供原生 Linux 开发体验。

**WSL2 优势**：
- ✅ **原生性能**：比虚拟机更快，接近原生 Linux
- ✅ **完整 Docker 支持**：无需额外配置，Docker Desktop 直接支持
- ✅ **GPU 加速**：支持 CUDA，可用于 AI/ML 开发
- ✅ **无缝集成**：与 Windows 文件系统共享，可访问 Windows 文件
- ✅ **开发工具**：完整的 Linux 工具链（grep, awk, sed, etc.）

**快速安装**：
```powershell
# 1. 打开 PowerShell (管理员)
# 2. 运行安装命令
wsl --install

# 3. 重启电脑并完成 Ubuntu 设置
```

**详细指南**：
- [docs/setup/WSL.md](docs/setup/WSL.md) - WSL 完整配置教程

---

## Q: 如何使用 KINXKit 创建 GitHub 仓库？

**A:** KINXKit 提供了完整的 GitHub 集成功能，可以一键创建仓库并推送代码。

**步骤**：

1. **GitHub 登录**
   ```bash
   kinx github login
   ```
   选择认证方式：
   - GitHub CLI（推荐）
   - Personal Access Token

2. **查看认证状态**
   ```bash
   kinx github status
   ```

3. **创建仓库并推送**
   ```bash
   kinx github create --path ./my-project --name "my-project"
   ```

**功能特性**：
- ✅ 自动创建远程仓库
- ✅ 自动初始化 Git 仓库
- ✅ 自动推送代码
- ✅ 敏感文件检测和警告
- ✅ 支持私有/公开仓库

**相关文档**：
- [GitHub 集成文档](src/core/github.ts)
- [LOG.md](LOG.md) - GitHub 集成实现记录

---

## Q: 如何配置 API 密钥？

**A:** 使用 `kinx config api` 命令可以快速配置 API 密钥。

**支持的 API 服务**：
- OpenAI
- DeepSeek
- 智谱 AI
- Azure OpenAI
- Anthropic
- 自定义 API

**配置步骤**：
```bash
# 1. 运行配置命令
kinx config api

# 2. 选择 API 服务提供商
# 例如：OpenAI

# 3. 输入 API 密钥
# sk-...

# 4. 配置完成！
```

**生成的文件**：
- `.env` - 实际配置（包含密钥）
- `.env.example` - 示例配置（不含密钥）

**环境变量格式**：
```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-your-api-key-here
```

**See Also**:
- [配置管理文档](src/core/config.ts) - 完整配置指南

---

## Q: 如何配置数据库连接？

**A:** 使用 `kinx config database` 命令可以快速配置数据库。

**支持的数据库**：
- PostgreSQL
- MySQL
- MongoDB
- SQLite

**配置步骤**：
```bash
# 1. 运行配置命令
kinx config database

# 2. 选择数据库类型
# 例如：PostgreSQL

# 3. 输入连接信息
# - 主机：localhost
# - 端口：5432
# - 数据库名：mydb
# - 用户名：user
# - 密码：******

# 4. 配置完成！
```

**生成的环境变量**：
```env
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mydb
DATABASE_USER=user
DATABASE_PASSWORD=your_password
```

**相关文档**：
- [配置管理文档](src/core/config.ts)

---

*最后更新: 2025-03-07 23:45*
*维护者: KINXKit Team*
