# GitHub 开源项目完整指南：从零到部署

## 核心流程概览

```
项目规划 → 本地开发 → Git版本控制 → GitHub协作 → CI/CD测试 → Docker部署 → 版本发布 → 持续维护
```

---

## 一、项目文件体系

### 必备文件清单
```
your-project/
├── README.md              # 项目说明书（最重要）
├── LICENSE                # 开源协议
├── CHANGELOG.md           # 版本变更记录
├── .gitignore             # Git忽略配置
├── .github/
│   └── workflows/
│       └── ci.yml         # CI自动化测试
├── Dockerfile             # Docker镜像定义
├── docker-compose.yml     # 容器编排配置
├── .env.example           # 环境变量示例
├── requirements.txt       # Python依赖
├── src/                   # 源代码
└── tests/                 # 测试代码
```

### 文件优先级
| 优先级 | 文件 | 必要性 |
|--------|------|--------|
| ⭐⭐⭐ | README.md | 必须 |
| ⭐⭐⭐ | LICENSE | 必须 |
| ⭐⭐⭐ | .gitignore | 必须 |
| ⭐⭐ | .github/workflows/ci.yml | 推荐 |
| ⭐⭐ | requirements.txt / package.json | 必须 |
| ⭐ | CHANGELOG.md | 推荐 |
| ⭐ | CONTRIBUTING.md | 推荐 |
| ⭐ | Dockerfile | 推荐 |

---

## 二、Git 工作流程

### 分支策略（Git Flow 简化版）
```
main (主分支)         → 生产环境代码，始终保持稳定
  ├── feature/xxx    → 新功能开发
  ├── bugfix/xxx     → 问题修复
  └── hotfix/xxx     → 紧急修复
```

### 标准操作循环
```bash
# 1. 开始新功能
git checkout main
git pull origin main
git checkout -b feature/new-function

# 2. 开发并提交
git add .
git commit -m "feat: add new function"

# 3. 推送并创建PR
git push origin feature/new-function
# (在GitHub网页创建Pull Request)

# 4. 合并后清理
git checkout main
git pull origin main
git branch -d feature/new-function
```

### 提交消息规范 (Conventional Commits)
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具链相关

示例：
feat: add power function to calculator
fix: handle division by zero error
docs: update installation instructions
```

---

## 三、Docker 容器化部署

### 三个核心文件

**Dockerfile** - 镜像构建配方
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

**docker-compose.yml** - 服务编排
```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - API_KEY=${API_KEY}
    volumes:
      - ./data:/app/data
```

**.dockerignore** - 构建时忽略
```
.git
__pycache__
*.pyc
.env
tests/
```

### 构建与运行
```bash
# 构建镜像
docker-compose build

# 运行容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

---

## 四、CI/CD 自动化

### GitHub Actions 基本模板
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install & Test
        run: |
          pip install -r requirements.txt
          pytest tests/

  docker:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push
        run: |
          docker build -t myapp:$GITHUB_SHA .
          docker push myregistry/myapp:$GITHUB_SHA
```

---

## 五、版本发布流程

### 发布前检查清单
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新

### 发布步骤
```bash
# 1. 更新版本号
# 2. 更新 CHANGELOG.md
# 3. 提交更改
git add .
git commit -m "chore: release v1.0.0"

# 4. 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 5. 推送代码和标签
git push origin main
git push origin v1.0.0

# 6. 在 GitHub 创建 Release
```

### 语义化版本 (SemVer)
```
主版本.次版本.修订号
v1.2.3
 │ │ └── 修复bug，向后兼容
 │ └──── 新功能，向后兼容
 └────── 重大变更，可能不兼容
```

---

## 六、完整项目示例

### 项目：simple-api（简单计算器API）

```
simple-api/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI测试
├── src/
│   └── api.py              # FastAPI应用
├── tests/
│   └── test_api.py         # API测试
├── Dockerfile              # 镜像定义
├── docker-compose.yml      # 本地开发
├── requirements.txt        # 依赖
├── .gitignore              # 忽略配置
├── .env.example            # 环境变量示例
├── README.md               # 使用文档
├── CHANGELOG.md            # 版本历史
└── LICENSE                 # MIT协议
```

### 快速开始（用户视角）
```bash
# 克隆项目
git clone https://github.com/user/simple-api.git
cd simple-api

# 配置环境
cp .env.example .env
# 编辑 .env 文件

# Docker 一键启动
docker-compose up -d

# 访问 API
curl http://localhost:8000/add?a=5&b=3
```

---

## 七、命令速查卡

| 场景 | 命令 |
|------|------|
| **项目初始化** | `git init && git add . && git commit -m "init"` |
| **连接远程** | `git remote add origin <url>` |
| **首次推送** | `git push -u origin main` |
| **功能分支** | `git checkout -b feature/xxx` |
| **提交更改** | `git add . && git commit -m "feat: xxx"` |
| **同步最新** | `git pull origin main` |
| **Docker构建** | `docker-compose build` |
| **Docker运行** | `docker-compose up -d` |
| **查看日志** | `docker-compose logs -f` |
| **创建标签** | `git tag -a v1.0.0 -m "Release"` |
| **推送标签** | `git push origin v1.0.0` |

---

## 八、最佳实践

### 代码质量
- 编写测试（测试覆盖率 > 80%）
- 使用 linter（black, flake8, eslint）
- 代码审查

### 安全
- 使用 `.env` 存储敏感信息
- 不提交 `.env` 到 Git
- 定期更新依赖
- 使用 Dependabot 自动更新

### 文档
- README 清晰说明如何使用
- API 文档（OpenAPI/Swagger）
- 代码注释

### 社区
- 响应 Issue
- 欢迎 PR
- 行为准则

---

## 九、学习路径

```
第1周：Git 基础
├── init/add/commit/push/pull
└── 分支操作

第2周：GitHub 基础
├── 创建仓库/PR/Merge
└── Issue 管理

第3周：Docker 基础
├── Dockerfile 编写
└── docker-compose 使用

第4周：CI/CD
├── GitHub Actions
└── 自动化测试和部署

第5周：项目实践
└── 从零发布一个完整项目
```

---

## 总结

一个成熟的 GitHub 项目 = **代码 + 测试 + 文档 + CI/CD + 容器化 + 社区**

| 阶段 | 重点 |
|------|------|
| 初始化 | 清晰的项目结构 |
| 开发 | Git分支管理 |
| 协作 | Pull Request + Code Review |
| 质量 | CI自动化测试 |
| 部署 | Docker容器化 |
| 发布 | 版本标签 + Release Notes |
| 维护 | Issue处理 + 社区互动 |
