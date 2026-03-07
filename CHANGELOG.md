# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### Phase 2 核心功能 (65% → 85%)
- **项目模板系统** - 新增 2 个完整的项目模板

##### Python 数据分析模板 (`templates/python/data-analysis`)
- **数据加载器** (`app/data_loader.py`)
  - 支持 CSV、Excel、JSON 文件加载
  - 自动编码检测
  - 批量保存功能
- **数据分析器** (`app/analyzer.py`)
  - 统计分析（describe、info）
  - 相关性矩阵计算
  - 异常值检测（IQR、Z-Score）
  - 分组聚合分析
  - 时间序列分析
  - 统计检验（ANOVA、t-test）
- **数据可视化器** (`app/visualizer.py`)
  - 10+ 种图表类型
  - 直方图、箱线图、散点图、折线图、柱状图
  - 相关性热力图
  - 分布图（KDE）
  - 配对图（pair plot）
  - 时间序列图
- **Jupyter Notebook 示例**
  - 完整的数据分析工作流演示
  - 交互式可视化示例
- **Docker 支持**
  - Jupyter Lab 容器化部署
  - 数据持久化卷挂载

##### Node.js Web 应用模板 (`templates/nodejs/web-app`)
- **Express.js + TypeScript**
  - 完整的类型定义
  - 路由模块化结构
  - 中间件系统
- **安全中间件**
  - Helmet.js（安全头）
  - CORS 配置
  - 错误处理
- **日志系统**
  - Morgan HTTP 日志
  - 自定义结构化日志
- **开发工具**
  - tsx 热重载
  - TypeScript 严格模式
  - ESLint + Prettier
- **API 端点**
  - 健康检查（`/health`）
  - 示例 API（`/api/hello`、`/api/echo`）
- **Docker 支持**
  - 生产环境容器化
  - Docker Compose 配置

- **GitHub 集成模块** (`src/core/github.ts`)
  - GitHubManager 类 - 完整的 GitHub API 集成
  - 认证支持
    - GitHub CLI 认证（`gh auth login`）
    - Personal Access Token 认证
    - SSH 认证检测
  - 仓库管理
    - 创建远程仓库（CLI + API 双模式）
    - Git 仓库自动初始化
    - 代码自动推送
  - 安全功能
    - 敏感文件自动检测（.env, .pem, .key 等）
    - .gitignore 建议提示

- **配置管理模块** (`src/core/config.ts`)
  - ConfigManager 类 - 环境变量管理
  - API 配置
    - 支持 5+ 主流 API（OpenAI、DeepSeek、智谱 AI、Azure OpenAI、Anthropic）
    - API 密钥格式验证
    - 自定义 API 服务支持
  - 数据库配置
    - 4 种数据库支持（PostgreSQL、MySQL、MongoDB、SQLite）
    - 连接信息管理
  - 文件生成
    - `.env` 文件自动生成
    - `.env.example` 文件生成
    - TypeScript 配置类模板

- **新增 CLI 命令**
  - `kinx github login` - GitHub 登录认证
  - `kinx github status` - 查看认证状态
  - `kinx github create` - 创建仓库并推送
  - `kinx config api` - 配置 API 密钥
  - `kinx config database` - 配置数据库连接
  - `kinx config init` - 生成配置文件模板

#### Phase 1 MVP 完成 (100%)
- **交互组件完善** (`src/prompt/welcome.ts`)
  - WSL2 推荐提示优化
    - 详细的优势说明（原生性能、Docker支持、GPU加速、无缝集成）
    - 快速安装指南（3步安装流程）
    - 详细文档链接
  - CUDA 检测结果展示增强
    - GPU 性能评分系统（0-100分）
    - 性能等级标签（旗舰级/高端/中高端/中端/入门级/基础）
    - 显存使用建议（<4GB警告，≥8GB推荐）
    - CUDA 版本兼容性提示
    - cuDNN 安装状态检测
  - 进度动画显示增强
    - 新增 `showProgressWithSteps` 函数
    - 步骤追踪（[1/5], [2/5]...）
    - 百分比显示（0-100%）
    - 当前步骤名称显示

#### Phase 0 - 基础设施
- TypeScript 严格模式配置
- Jest 测试框架配置（80% 覆盖率要求）
- ESLint + Prettier 代码质量工具
- Husky + lint-staged Git 钩子
- Commitlint 提交规范
- 完整的项目目录结构
- Commander.js CLI 框架集成
- Inquirer.js 交互式提示
- Chalk + Ora 终端美化

#### 核心功能模块
- **环境检测器** (`src/core/detector.ts`)
  - 操作系统检测（Windows/macOS/Linux）
  - WSL2 环境识别
  - Docker + Compose 版本检测
  - Git 版本和用户配置
  - Python 和 Node.js 版本检测
  - 代理配置检测（环境变量 + 常见端口）
  - GitHub 认证状态检测
  - CUDA 和 GPU 环境检测

- **意图分类器** (`src/nlp/classifier.ts`)
  - 关键词到项目类型映射（9种项目类型）
  - 智能技术栈推荐
  - GPU 感知推荐
  - AI/ML 项目识别

- **模板生成器** (`src/core/generator.ts`)
  - Handlebars 模板引擎集成
  - 6种项目类型支持
  - 自动项目结构生成
  - 配置文件生成（.gitignore, README.md）
  - AI 聊天机器人完整模板

- **Docker 管理器** (`src/core/docker.ts`)
  - Docker 镜像构建
  - 容器启停管理
  - 服务状态查看
  - 日志查询
  - 自动生成 Dockerfile 和 docker-compose.yml

#### 文档体系
- **LOG.md** - 详细的开发日志
- **CHANGELOG.md** - 版本变更记录
- **QUICKREF.md** - 开发者快速参考
- **完整的文档体系** - 8个核心文档文件

#### update-docs Skill
- 文档自动更新工具
- 智能文档扫描
- 批量更新模式
- 自动备份机制
- 完整的错误处理

#### GitHub 集成和发布
- **GitHub 仓库创建**
  - 仓库地址: https://github.com/Cherny0306/KINXKit
  - 成功推送 81 个文件，18,830+ 行代码
  - 7 个提交记录
- **推送工具**
  - `检查并推送.bat` - 自动检查并推送
  - `一键推送.bat` - Windows 一键推送
  - `push-to-github.bat` - Windows 推送脚本
  - `create-and-push.sh` - Linux/Mac 自动化脚本
  - `README_PUSH.md` - 推送指南
  - `QUICKSTART_GITHUB.md` - 快速开始指南
- **项目发布**
  - 代码成功发布到 GitHub
  - CI/CD 工作流配置完成
  - 开源项目标准化配置
  - MIT 许可证应用
  - 完整的贡献指南
- **GitHub Actions CI 更新**
  - 升级所有 actions 从 v3 到 v4
  - 添加 workflow_dispatch 支持手动触发
  - 提升安全性和性能

#### update-docs Skill 增强
- **新增文档支持**
  - CONTEXT.md - 项目状态和上下文
  - USER_QUESTIONS.md - 问答和故障排除
- **功能扩展**
  - 文档数量：7 个 → 9 个
  - 完整的更新指南
  - 智能更新模式
  - 最佳实践文档
- **测试验证**
  - 24 个测试全部通过
  - 完整的错误处理

### Changed
- 项目总体进度更新为 65%
- GitHub 集成模块标记为已完成
- 远程仓库配置为正确的用户名（Cherny0306）
- 所有文档已同步更新

### Fixed
- 修复远程仓库 URL（从 Cherny 更新为 Cherny0306）
- 确保所有推送工具使用正确的仓库地址

### Fixed

#### TypeScript 编译错误（50+ 个错误）
- **导入问题修复**
  - 修复 ora 导入（改为默认导入）
  - 修复 execa 导入（改用 execaCommand）
  - 修复 Handlebars 导入（使用默认导入）

- **类型安全问题**
  - 修复所有 unknown 类型的错误处理
  - 添加完整的类型守卫（error instanceof Error）
  - 修复可能为 undefined 的类型错误

- **接口定义完善**
  - 扩展 TechStack 接口，添加 13 个可选属性
  - 修复重复的属性名（可视化 → 数据可视化）
  - 添加缺失的 ProjectType.UNKNOWN 映射

- **异步处理一致性**
  - 统一使用 execaCommand 替代 exec
  - 修复 detectPython 和 detectNode 的异步声明
  - 完善所有异步函数的类型定义

- **代码质量提升**
  - 修复所有未使用变量警告
  - 移除未使用的 import 语句
  - 添加正确的参数类型注解

#### 项目构建
- ✅ **npm install 成功**: 567 个包，0 个漏洞
- ✅ **TypeScript 编译**: 0 个错误
- ✅ **CLI 正常运行**: 所有命令可用
- ✅ **项目可构建**: `npm run build` 成功

### Changed

#### 错误处理模式
- 统一使用类型守卫处理错误
- 所有 catch 块都正确处理 unknown 类型
- 改进错误消息的显示和记录

#### 代码执行
- 从 exec.exec 统一改为 execa.execaCommand
- 简化了命令执行调用
- 提升了跨平台兼容性

#### 项目状态
- 从"开发中"提升到"可构建、可运行、已准备发布"
- Phase 0 进度: 60% → 100% ✅
- Phase 1 进度: 70% → 85% 🟡
- Phase 2 进度: 40% → 45% 🟡
- 总体进度: 40% → 60%
  - 容器启停管理
  - 服务状态查看
  - 日志查询
  - Dockerfile 和 docker-compose.yml 自动生成
  - GPU 支持配置

- **交互界面** (`src/prompt/welcome.ts`)
  - 欢迎屏幕
  - 环境检测结果展示
  - 项目类型选择菜单
  - 技术栈推荐展示
  - 配置确认界面

#### 命令系统
- `kinx create [name]` - 创建新项目
- `kinx up [path]` - 启动 Docker 服务
- `kinx down [path]` - 停止 Docker 服务
- `kinx status [path]` - 查看服务状态
- `kinx logs [service]` - 查看服务日志

#### 项目模板
- **AI 聊天机器人模板**
  - FastAPI 主应用
  - OpenAI GPT-4o 集成
  - PostgreSQL 数据库
  - Docker 容器化配置
  - 完整的测试文件
  - 生产就绪配置

#### 文档
- `README.md` - 项目说明和快速开始
- `PROJECT_SPEC.md` - 完整的项目规范
- `CLAUDE.md` - AI 开发指南
- `RULES.md` - 开发规范和规则
- `PROGRESS.md` - 进度跟踪
- `LOG.md` - 开发日志
- `CHANGELOG.md` - 本文件

### Changed

- 初始化项目结构
- 建立开发规范

### Fixed

- 无已知修复

---

## [0.1.0] - 2025-03-07

### Added

#### 基础设施
- 项目初始化
- npm 包配置
- TypeScript 配置
- 基础目录结构
- Git 仓库初始化

#### 核心类型定义
- 完整的 TypeScript 接口定义
- 项目类型枚举
- 错误类定义
- 环境信息类型
- Docker 配置类型
- GitHub 仓库类型

#### 日志工具
- 彩色日志输出
- 结构化日志方法
- 多级别日志支持
- 格式化输出工具

---

## [0.2.0] - 待发布

### Planned

- GitHub 集成功能
  - GitHub CLI 认证
  - 仓库创建
  - 代码推送
  - SSH 密钥管理

- 配置管理
  - API 密钥向导
  - 环境变量生成
  - 配置验证
  - .env 文件管理

- 更多项目模板
  - API 服务模板（Python + FastAPI）
  - Web 应用模板（Node.js + Next.js）
  - 数据分析模板（Python + Pandas）
  - 爬虫模板（Python + Scrapy）
  - 工具脚本模板（Python/Node.js）

- 问题诊断功能
  - Docker 故障诊断
  - 网络连接诊断
  - 依赖冲突检测
  - 自动修复建议

- 交互优化
  - 进度动画
  - 实时反馈
  - 错误提示优化
  - 帮助文档集成

---

## [0.3.0] - 计划中

### Planned

- 配置预设系统
  - OpenAI 预设
  - DeepSeek 预设
  - 智谱 AI 预设
  - Azure OpenAI 预设

- 自定义模板支持
  - 用户模板导入
  - 模板变量系统
  - 模板验证
  - 模板分享功能

- 模板市场
  - 在线模板浏览
  - 一键安装模板
  - 模板评分和评论
  - 模板更新通知

- 性能优化
  - 并行构建
  - 缓存机制
  - 增量生成
  - 依赖优化

- 跨平台改进
  - Windows 原生支持
  - macOS 优化
  - Linux 兼容性
  - WSL2 专项优化

---

## [1.0.0] - 未来目标

### Planned

- 稳定的 API
- 完整的测试覆盖（80%+）
- 详细的用户文档
- 多语言支持
- 插件系统
- Web UI
- 云端同步
- 团队协作功能

---

## 版本说明

### 版本号规则

- **主版本号（Major）**: 不兼容的 API 变更
- **次版本号（Minor）**: 向后兼容的功能新增
- **修订号（Patch）**: 向后兼容的问题修复

### 发布周期

- **主版本**: 根据重大功能和架构调整
- **次版本**: 每月或每完成一个主要功能阶段
- **修订版**: 根据需要随时发布

---

*关于 KINXKit 项目的更多信息，请访问: https://github.com/yourusername/kinxkit*
