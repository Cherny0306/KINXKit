@echo off
REM KINXKit GitHub 推送脚本 (Windows)
REM 使用前请确保已在 GitHub 网站创建仓库

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║              🚀 KINXKit GitHub 推送工具                               ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM 配置
set GITHUB_USER=Cherny
set REPO_NAME=KINXKit
set REPO_URL=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo 仓库信息:
echo   用户名: %GITHUB_USER%
echo   仓库名: %REPO_NAME%
echo   URL: %REPO_URL%
echo.

REM 检查是否已配置远程仓库
git remote | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo 移除旧的远程仓库配置...
    git remote remove origin
)

echo.
echo [1/3] 添加远程仓库...
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo ❌ 添加远程仓库失败
    pause
    exit /b 1
)
echo ✅ 远程仓库已添加
echo.

echo [2/3] 重命名主分支为 main...
git branch -M main 2>nul
echo ✅ 主分支已设置
echo.

echo [3/3] 推送代码到 GitHub...
echo 这可能需要几分钟，请稍候...
echo.

git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║ ✅ 推送成功！                                                         ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📦 仓库地址: %REPO_URL%
    echo.
    echo 🎯 下一步操作:
    echo   1. 访问仓库查看文件
    echo   2. 检查 Actions 标签页（CI/CD 工作流）
    echo   3. 设置仓库描述和 Topics
    echo   4. 添加仓库徽章到 README.md
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║ ❌ 推送失败                                                           ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 可能的原因:
    echo   1. 仓库未在 GitHub 上创建
    echo   2. 仓库 URL 或用户名不正确
    echo   3. 网络连接问题
    echo   4. 需要配置代理
    echo.
    echo 解决方案:
    echo   1. 确保已在 GitHub 创建仓库: %REPO_URL%
    echo   2. 检查用户名是否正确: %GITHUB_USER%
    echo   3. 如需代理，运行: git config --global http.proxy http://127.0.0.1:7890
    echo   4. 或使用 SSH 方式: git remote set-url origin git@github.com:%GITHUB_USER%/%REPO_NAME%.git
    echo.
)

pause
