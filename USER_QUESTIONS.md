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

## Q: 如何使用问题诊断功能？(Phase 3)

**A:** 使用 `kinx fix` 命令可以诊断和修复常见开发环境问题。

**支持的诊断类型**：
- Docker 问题（安装、运行、网络）
- 网络问题（连接、DNS、代理）
- 依赖问题（Node.js、Python、Git）
- 权限问题（文件系统、Git 仓库）
- 配置问题（环境变量、配置文件）

**使用示例**：
```bash
# 1. 运行完整系统诊断
kinx fix diagnose

# 2. 诊断特定类型的问题
kinx fix docker      # Docker 问题
kinx fix network     # 网络问题
kinx fix deps        # 依赖问题

# 3. 自动修复（如果支持）
# 诊断完成后会询问是否自动修复
```

**诊断结果示例**：
```
🔍 系统诊断结果

总体健康状况: WARNING

🟠 Docker 未运行
   描述: Docker 服务未启动
   建议: sudo systemctl start docker
   修复命令: sudo systemctl start docker
   ✓ 可自动修复

🟡 Python 版本过低
   描述: Python 3.8 已停止维护
   建议: 升级到 Python 3.11+
   修复命令: sudo apt install python3.11
```

**相关文档**：
- [问题诊断模块](src/core/detector-issues.ts)

---

## Q: 如何使用配置预设功能？(Phase 3)

**A:** 使用 `kinx preset` 命令可以快速生成常见服务的配置。

**AI 服务预设**：
```bash
# 1. 列出所有 AI 服务
kinx preset list --type ai

# 2. 应用 AI 服务配置
kinx preset ai openai

# 3. 输入 API 密钥
# 系统会自动生成 .env 文件

# 4. 配置完成！
```

**支持的 AI 服务**：
- OpenAI (GPT-4、GPT-3.5)
- DeepSeek (国产高性能)
- 智谱 AI (GLM-4)
- Anthropic (Claude)
- Azure OpenAI (企业级)
- Moonshot AI (Kimi 长文本)

**数据库预设**：
```bash
# 1. 列出所有数据库预设
kinx preset list --type database

# 2. 应用数据库配置
kinx preset database postgresql

# 3. 输入连接信息
# 系统会生成 .env 和 docker-compose.yml

# 4. 配置完成！
```

**支持的数据库**：
- PostgreSQL (对象关系数据库)
- MySQL (关系数据库)
- MongoDB (NoSQL 文档数据库)
- SQLite (轻量级嵌入式)
- Redis (高性能缓存)

**配置推荐**：
```bash
# 获取项目类型推荐
kinx preset recommend "ai chatbot"

# 输出示例：
# AI 服务: DeepSeek (性价比高)
# 数据库: PostgreSQL (功能强大)
```

**相关文档**：
- [配置预设模块](src/core/preset-manager.ts)

---

## Q: 如何创建自定义模板？(Phase 3)

**A:** 使用 KINXKit 的自定义模板系统可以创建和管理项目模板。

**模板结构**：
```
templates/
└── python/
    └── my-template/
        ├── template.json      # 模板元数据
        ├── README.md          # 模板说明
        └── files/             # 模板文件
            ├── main.py.hbs    # Handlebars 模板
            └── config.py.hbs
```

**创建步骤**：
```bash
# 1. 创建新模板（使用命令）
kinx template create my-template \
  --displayName "我的模板" \
  --description "自定义项目模板" \
  --category python \
  --tags "web,api"

# 2. 添加模板文件
# 在 templates/python/my-template/files/ 中添加模板文件
# 使用 .hbs 扩展名表示 Handlebars 模板

# 3. 使用模板
kinx create my-project --template my-template
```

**模板变量示例**：
```handlebars
# main.py.hbs
#!/usr/bin/env python3
"""
{{ project_name }}
{{ description }}
"""

def main():
    print("{{ project_name }} is running!")

if __name__ == "__main__":
    main()
```

**相关文档**：
- [模板管理模块](src/core/template-manager.ts)

---

*最后更新: 2025-03-08 01:30*
*维护者: KINXKit Team*

---

## 桌面应用 (GUI) 相关

### Q: KINXKit 有桌面应用吗？

**A:** 是的！KINXKit 现在提供图形化桌面界面。

**特性**：
- 🎨 可视化项目创建
- 🐳 Docker 一键管理
- 🔧 AI 配置预设
- 🗄️ 数据库配置
- 📊 系统诊断可视化

**相关文档**：
- [GUI/README.md](GUI/README.md) - 开发指南
- [GUI/INSTALL.md](GUI/INSTALL.md) - 安装指南
- [GUI/RELEASE.md](GUI/RELEASE.md) - 发布说明

---

### Q: 如何安装桌面应用？

**A:** 两种方式：

**方式 1: 下载安装程序** (推荐用户)
1. 访问 [GitHub Releases](https://github.com/Cherny0306/KINXKit/releases)
2. 下载 `KINXKit-Desktop-0.1.0.exe`
3. 双击安装

**方式 2: 从源码构建** (开发者)
```bash
npm run desktop:build
# 输出: release/KINXKit-Desktop-0.1.0.exe
```

**安装要求**：
- Windows 10/11 (64位)
- 4 GB RAM
- 300 MB 磁盘空间

---

### Q: 安装时出现 SmartScreen 警告怎么办？

**A:** 这是正常的，因为当前版本未进行数字签名。

**解决方法**：
1. 点击"更多信息"
2. 点击"仍要运行"
3. 或右键文件 → 属性 → 取消阻止

**未来版本**：将添加代码签名证书

---

### Q: 桌面应用和 CLI 版本有什么区别？

**A:** 

| 特性 | CLI 版本 | 桌面应用 |
|------|----------|----------|
| 界面 | 命令行 | 图形化 |
| 易用性 | 需要熟悉命令 | 直观点击 |
| 可视化 | 文本输出 | Chart.js 图表 |
| 适用场景 | 脚本自动化 | 日常使用 |
| 功能完整性 | 100% | 95% |

**推荐**：
- 开发者/高级用户：CLI 版本
- 新手/日常使用：桌面应用

---

### Q: 如何构建桌面应用？

**A:** 

```bash
# 1. 安装 GUI 依赖
npm run desktop:install

# 2. 构建主项目（如果未构建）
npm run build

# 3. 构建 Windows 安装程序
npm run desktop:build

# 输出位置
# release/KINXKit-Desktop-0.1.0.exe (74 MB)
```

**开发模式运行**：
```bash
npm run desktop:dev
```

---

### Q: 构建失败，提示符号链接权限错误？

**A:** 已在配置中修复，但如果仍有问题：

**临时解决**：
```yaml
# GUI/electron-builder.yml
win:
  signAndEditExecutable: false  # 已默认设置
```

**或以管理员身份运行**：
- 右键 PowerShell → "以管理员身份运行"
- 执行构建命令

---

### Q: 如何添加应用图标？

**A:** 

1. 创建 `GUI/build/icon.ico` (256x256)
2. 取消注释 `electron-builder.yml` 中的配置：
   ```yaml
   win:
     icon: build/icon.ico
   ```
3. 重新构建

**图标制作工具**：
- 在线工具：https://favicon.io
- ImageMagick：`magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
- GIMP：导出为 ICO 格式

详见：[GUI/build/README.md](GUI/build/README.md)

---

### Q: 桌面应用支持哪些平台？

**A:** 

**当前支持**：
- ✅ Windows 10/11 (64位)

**计划支持**：
- 🔜 macOS (Intel + Apple Silicon)
- 🔜 Linux (.AppImage, .deb)

**原因**：Electron 支持跨平台，优先完成 Windows 版本

---

### Q: 桌面应用占多少磁盘空间？

**A:** 

| 项目 | 大小 |
|------|------|
| NSIS 安装程序 | 74 MB |
| 便携版 | 250 MB |
| 安装后 | ~300 MB |
| 用户数据 | ~5 MB |

**优化**：相比 Electron 基础，已优化约 40%

---

### Q: 桌面应用需要网络连接吗？

**A:** 

**必需网络**：
- ❌ 应用启动（完全离线）
- ✅ AI 服务配置（首次配置时）
- ✅ GitHub 集成（推送代码时）
- ✅ 检查更新（可选）

**离线功能**：
- ✅ 项目创建（使用本地模板）
- ✅ Docker 管理
- ✅ 系统诊断
- ✅ 日志查看

---

### Q: 如何卸载桌面应用？

**A:** 

**Windows**：
1. 设置 → 应用 → 已安装的应用
2. 搜索 "KINXKit Desktop"
3. 点击"..." → "卸载"

**便携版**：
1. 关闭应用
2. 删除应用程序文件夹
3. 可选：删除用户数据 `%APPDATA%\kinxkit-desktop\`

**注意**：用户数据默认不会删除

---

### Q: 桌面应用有自动更新功能吗？

**A:** 当前版本不支持自动更新。

**手动更新**：
1. 访问 [GitHub Releases](https://github.com/Cherny0306/KINXKit/releases)
2. 下载新版本
3. 运行安装程序覆盖安装

**计划**：0.2.0 版本将添加自动更新功能

---

## 更新时间

**最后更新**: 2026-03-08
**版本**: 0.3.0 (桌面应用 v0.1.0)
