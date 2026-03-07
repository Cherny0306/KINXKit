#!/bin/bash

# KINXKit GitHub 仓库创建和推送脚本
# 支持两种方式：手动创建或 API 创建

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║            🚀 KINXKit GitHub 仓库创建和推送工具                       ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 配置
GITHUB_USER="Cherny"
REPO_NAME="KINXKit"
REPO_DESCRIPTION="智能项目助手 - 从创意到运行，5分钟搞定你的项目"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo -e "${YELLOW}请选择创建方式：${NC}"
echo ""
echo "  [1] 手动创建（推荐 - 最简单）"
echo "      我将打开浏览器，您在网页上创建仓库"
echo ""
echo "  [2] API 自动创建"
echo "      需要 GitHub Personal Access Token"
echo ""
read -p "请输入选择 [1/2]: " choice

case $choice in
  1)
    # 手动创建方式
    echo ""
    echo -e "${GREEN}=== 手动创建方式 ===${NC}"
    echo ""
    echo -e "${YELLOW}步骤：${NC}"
    echo ""
    echo "1. 浏览器将自动打开 GitHub 创建页面"
    echo "2. 填写仓库信息："
    echo "   - Repository name: ${REPO_NAME}"
    echo "   - Description: ${REPO_DESCRIPTION}"
    echo "   - 选择 Public 或 Private"
    echo "   - ${RED}重要：不要勾选任何初始化选项！${NC}"
    echo "     ❌ 不要添加 README"
    echo "     ❌ 不要选择 .gitignore"
    echo "     ❌ 不要选择 License"
    echo ""
    echo "3. 点击 'Create repository'"
    echo ""
    read -p "按回车键打开浏览器..."

    # 打开浏览器
    if command -v cmd.exe &> /dev/null; then
      cmd.exe /c start "https://github.com/new" 2>/dev/null || \
      echo "请手动打开: https://github.com/new"
    else
      echo "请手动打开: https://github.com/new"
    fi

    echo ""
    echo -e "${YELLOW}等待您创建仓库...${NC}"
    read -p "创建完成后，按回车键继续..."

    # 检查仓库是否存在
    echo ""
    echo "检查仓库是否存在..."
    if curl -s -o /dev/null -w "%{http_code}" "https://github.com/${GITHUB_USER}/${REPO_NAME}" | grep -q "200"; then
      echo -e "${GREEN}✅ 仓库已创建！${NC}"
    else
      echo -e "${RED}❌ 仓库未找到，请检查：${NC}"
      echo "  1. 是否已创建仓库"
      echo "  2. 用户名是否正确: ${GITHUB_USER}"
      echo "  3. 仓库名称是否正确: ${REPO_NAME}"
      read -p "确认无误后按回车继续，或 Ctrl+C 取消..."
    fi
    ;;

  2)
    # API 自动创建方式
    echo ""
    echo -e "${GREEN}=== API 自动创建方式 ===${NC}"
    echo ""
    echo -e "${YELLOW}需要 GitHub Personal Access Token${NC}"
    echo ""
    echo "获取步骤："
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token' → 'Generate new token (classic)'"
    echo "3. 勾选权限："
    echo "   ✓ repo (full control of private repositories)"
    echo "   ✓ workflow (GitHub Actions workflows)"
    echo "4. 点击生成并复制 token"
    echo ""
    read -sp "请输入您的 GitHub Token: " token
    echo ""

    if [ -z "$token" ]; then
      echo -e "${RED}❌ Token 不能为空${NC}"
      exit 1
    fi

    echo ""
    echo "正在创建仓库..."
    response=$(curl -s -X POST \
      -H "Authorization: token ${token}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/user/repos" \
      -d "{
        \"name\": \"${REPO_NAME}\",
        \"description\": \"${REPO_DESCRIPTION}\",
        \"private\": false,
        \"auto_init\": false
      }")

    if echo "$response" | grep -q "html_url"; then
      echo -e "${GREEN}✅ 仓库创建成功！${NC}"
      echo "仓库地址: https://github.com/${GITHUB_USER}/${REPO_NAME}"
    else
      echo -e "${RED}❌ 创建失败：${NC}"
      echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4
      exit 1
    fi
    ;;

  *)
    echo -e "${RED}❌ 无效的选择${NC}"
    exit 1
    ;;
esac

# 推送代码
echo ""
echo -e "${GREEN}=== 推送代码到 GitHub ===${NC}"
echo ""

# 检查远程仓库
if git remote | grep -q "origin"; then
  echo "移除旧的远程仓库配置..."
  git remote remove origin
fi

echo "添加远程仓库..."
git remote add origin "${REPO_URL}"

echo "重命名主分支为 main..."
git branch -M main 2>/dev/null || true

echo ""
echo -e "${YELLOW}正在推送代码...${NC}"
echo "这可能需要几分钟，取决于您的网络速度..."
echo ""

if git push -u origin main; then
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║ ${NC}✅ 推送成功！${NC}                                                        ${GREEN}║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "📦 仓库地址: ${REPO_URL}"
  echo ""
  echo "🎯 下一步操作："
  echo "  1. 访问仓库查看文件"
  echo "  2. 检查 Actions 标签页（CI/CD 工作流）"
  echo "  3. 设置仓库描述和 Topics"
  echo "  4. 考虑启用 GitHub Pages（如果需要）"
  echo ""
  echo "📚 相关文档："
  echo "  • GITHUB_SETUP.md - GitHub 设置完整指南"
  echo "  • CONTRIBUTING.md - 贡献指南"
  echo "  • README.md - 项目说明"
  echo ""
else
  echo ""
  echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║ ${NC}❌ 推送失败${NC}                                                          ${RED}║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "可能的原因："
  echo "  1. 仓库未创建或 URL 错误"
  echo "  2. 网络连接问题"
  echo "  3. 需要配置代理"
  echo "  4. GitHub 认证问题"
  echo ""
  echo "解决方案："
  echo "  1. 检查仓库是否存在: ${REPO_URL}"
  echo "  2. 配置代理（如果需要）："
  echo "     git config --global http.proxy http://127.0.0.1:7890"
  echo "  3. 使用 SSH 方式："
  echo "     git remote set-url origin git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
  echo ""
  exit 1
fi
