@echo off
chcp 65001 >nul
title KINXKit GitHub 推送工具

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║              🚀 KINXKit GitHub 一键推送工具                          ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo.
echo ✅ 使用前请确保：
echo.
echo   1. 已在 GitHub 创建仓库
echo      访问: https://github.com/new
echo.
echo   2. 仓库信息：
echo      名称: KINXKit
echo      描述: 智能项目助手 - 从创意到运行，5分钟搞定你的项目
echo.
echo   3. ⚠️  创建时不要勾选任何选项！
echo      ❌ Add a README file
echo      ❌ Add .gitignore
echo      ❌ Choose a license
echo.
echo ─────────────────────────────────────────────────────────────────────────
echo.

pause

cls
echo.
echo [1/4] 检查远程仓库配置...
echo.

git remote | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo ⚠️  检测到已配置的远程仓库
    echo 正在移除...
    git remote remove origin
)

echo.
echo [2/4] 添加远程仓库...
echo.
set REPO_URL=https://github.com/Cherny/KINXKit.git
echo 仓库 URL: %REPO_URL%
echo.

git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo ❌ 添加远程仓库失败
    pause
    exit /b 1
)

echo ✅ 远程仓库已添加
echo.

echo [3/4] 设置主分支...
echo.
git branch -M main 2>nul
echo ✅ 主分支已设置为 main
echo.

echo [4/4] 推送代码到 GitHub...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo  正在推送 75 个文件，18,000+ 行代码...
echo  这可能需要 1-3 分钟，请耐心等待...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

git push -u origin main

if %errorlevel% equ 0 (
    cls
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║                                                                        ║
    echo ║                    ✅✅✅ 推送成功！✅✅✅                          ║
    echo ║                                                                        ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📦 仓库地址: https://github.com/Cherny/KINXKit
    echo.
    echo.
    echo 🎉 恭喜！您的 KINXKit 项目已成功发布到 GitHub！
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 📋 下一步操作：
    echo.
    echo   1. 访问您的仓库
    echo      https://github.com/Cherny/KINXKit
    echo.
    echo   2. 检查文件是否完整（应该有 75+ 个文件）
    echo.
    echo   3. 点击 Actions 标签页
    echo      启用 CI/CD 工作流（会显示提示）
    echo.
    echo   4. 设置仓库信息
    echo      • 点击 Settings 标签
    echo      • 添加描述: 智能项目助手 - 从创意到运行，5分钟搞定你的项目
    echo      • 添加 Topics: cli, project-generator, typescript, docker
    echo.
    echo   5. (可选) 添加仓库徽章到 README.md
    echo      查看文件: README.md
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 📚 相关文档：
    echo   • QUICKSTART_GITHUB.md - 3 分钟快速指南
    echo   • GITHUB_SETUP.md - 完整设置指南
    echo   • CONTRIBUTING.md - 贡献指南
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.

) else (
    cls
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║                                                                        ║
    echo ║                    ❌ 推送失败                                       ║
    echo ║                                                                        ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 可能的原因：
    echo.
    echo   1️⃣  仓库未创建
    echo       请访问: https://github.com/new
    echo       创建名为 KINXKit 的仓库
    echo.
    echo   2️⃣  用户名不正确
    echo       当前配置: Cherny
    echo       如需修改，编辑此文件，将 Cherny 改为您的 GitHub 用户名
    echo.
    echo   3️⃣  网络问题
    echo       • 检查网络连接
    echo       • 如需代理: git config --global http.proxy http://127.0.0.1:7890
    echo.
    echo   4️⃣  认证问题
    echo       • 使用 GitHub Personal Access Token
    echo       • 生成: https://github.com/settings/tokens
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 解决方案：
    echo.
    echo 1. 确认仓库已创建
    echo    访问: https://github.com/Cherny/KINXKit
    echo.
    echo 2. 重新运行此脚本
    echo.
    echo 3. 或手动推送：
    echo    git push -u origin main
    echo.
)

pause
