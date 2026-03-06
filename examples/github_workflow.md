# 🎯 GitHub 项目从零到一完整流程

## 示例项目：一个简单的计算器工具

---

## 第一阶段：本地初始化

### 1. 创建项目结构
```bash
# 创建项目目录
mkdir simple-calc
cd simple-calc

# 初始化 Git
git init

# 创建基本文件结构
simple-calc/
├── .gitignore          # Git忽略配置
├── README.md           # 项目说明
├── LICENSE             # 开源协议
├── requirements.txt    # 依赖
├── src/
│   └── calc.py        # 源代码
└── tests/
    └── test_calc.py   # 测试
```

### 2. 编写代码
```python
# src/calc.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

### 3. 编写测试
```python
# tests/test_calc.py
import pytest
from src.calc import add, subtract, multiply, divide

def test_add():
    assert add(2, 3) == 5

def test_subtract():
    assert subtract(5, 3) == 2

def test_multiply():
    assert multiply(3, 4) == 12

def test_divide():
    assert divide(10, 2) == 5

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

### 4. 配置文件
```python
# requirements.txt
pytest==7.4.0
```

```
# .gitignore
__pycache__/
*.pyc
.env
.venv/
dist/
*.egg-info/
```

```markdown
# README.md
# Simple Calc

一个简单的Python计算器库。

## 安装
```bash
pip install -r requirements.txt
```

## 使用
```python
from src.calc import add
result = add(2, 3)  # 5
```

## 测试
```bash
pytest tests/
```
```

---

## 第二阶段：Git 版本控制

### 1. 首次提交
```bash
# 添加所有文件
git add .

# 查看状态
git status

# 首次提交
git commit -m "Initial commit: Add basic calculator functions"
```

### 2. 功能开发（分支工作流）
```bash
# 创建功能分支
git checkout -b feature/power-function

# 开发新功能
# 编辑 src/calc.py，添加 power 函数

# 提交更改
git add src/calc.py
git commit -m "Add power function"

# 切换回主分支
git checkout main

# 合并功能
git merge feature/power-function
```

---

## 第三阶段：GitHub 远程仓库

### 1. 创建远程仓库
```bash
# 在 GitHub 网站创建仓库后，连接本地
git remote add origin https://github.com/your-username/simple-calc.git

# 推送到远程
git push -u origin main
```

### 2. 典型协作流程
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建新分支
git checkout -b feature/sqrt-function

# 3. 开发并提交
git add .
git commit -m "Add square root function"

# 4. 推送分支
git push origin feature/sqrt-function

# 5. 在 GitHub 创建 Pull Request (PR)

# 6. Code Review 后合并

# 7. 删除已合并分支
git checkout main
git pull origin main
git branch -d feature/sqrt-function
```

---

## 第四阶段：CI/CD 自动化

### 1. GitHub Actions 工作流
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt

    - name: Run tests
      run: |
        pytest tests/ -v
```

### 2. 提交 CI 配置
```bash
git add .github/workflows/ci.yml
git commit -m "Add CI workflow"
git push origin main
```

---

## 第五阶段：版本发布

### 1. 更新 CHANGELOG
```markdown
# CHANGELOG.md

## [1.0.0] - 2024-01-15
### Added
- Basic calculator functions: add, subtract, multiply, divide
- Power function
- Square root function
```

### 2. 创建 Git Tag
```bash
# 创建带注释的标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
```

### 3. GitHub Release
在 GitHub 网站上：
- 进入 Releases 页面
- 点击 "Draft a new release"
- 选择标签 v1.0.0
- 发布 Release

---

## 第六阶段：持续维护

### 1. 处理 Issue
```
用户报告 Bug → 创建 Issue → 分配给开发者 →
创建修复分支 → 修复代码 → 提交 PR → Code Review →
合并 → 关闭 Issue
```

### 2. 依赖更新
```bash
# 更新依赖
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt

# 提交更新
git add requirements.txt
git commit -m "Update dependencies"
git push origin main
```

---

## 完整流程图

```
┌─────────────┐
│  项目构思   │
└──────┬──────┘
       ▼
┌─────────────┐
│ 本地初始化  │ ← git init, 创建文件
└──────┬──────┘
       ▼
┌─────────────┐
│ 功能开发    │ ← 编码, 测试
└──────┬──────┘
       ▼
┌─────────────┐
│ Git 提交    │ ← git add/commit
└──────┬──────┘
       ▼
┌─────────────┐
│ 推送 GitHub │ ← git push
└──────┬──────┘
       ▼
┌─────────────┐
│ 创建 PR     │ ← Code Review
└──────┬──────┘
       ▼
┌─────────────┐
│ 合并代码    │
└──────┬──────┘
       ▼
┌─────────────┐
│ CI 自动测试 │ ← GitHub Actions
└──────┬──────┘
       ▼
┌─────────────┐
│ 版本发布    │ ← Git Tag + Release
└──────┬──────┘
       ▼
┌─────────────┐
│ 持续维护    │ ← Issue, Bug Fix
└─────────────┘
```

---

## 关键命令速查

| 操作 | 命令 |
|------|------|
| 初始化仓库 | `git init` |
| 连接远程 | `git remote add origin <url>` |
| 创建分支 | `git checkout -b <branch>` |
| 提交更改 | `git add . && git commit -m "msg"` |
| 推送代码 | `git push origin <branch>` |
| 拉取更新 | `git pull origin main` |
| 查看状态 | `git status` |
| 查看历史 | `git log --oneline` |
| 创建标签 | `git tag -a v1.0.0 -m "msg"` |
