@echo off
chcp 65001 >nul
title KINXKit GitHub 仓库检查和推送

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║              🔍 KINXKit GitHub 仓库检查工具                          ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo.
echo 正在检查 GitHub 仓库状态...
echo.

REM 使用 curl 检查仓库是否存在
curl -s -o nul -w "%%{http_code}" https://github.com/Cherny/KINXKit >nul 2>nul
set HTTP_CODE=%errorlevel%

if "%HTTP_CODE%"=="0" (
    echo ✅ 仓库已找到！
    echo.
    echo 仓库地址: https://github.com/Cherny/KINXKit
    echo.
    echo 正在准备推送...
    echo.
    pause

    cls
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║                                                                        ║
    echo ║              🚀 正在推送代码到 GitHub...                             ║
    echo ║                                                                        ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 这可能需要 1-3 分钟，请耐心等待...
    echo.

    git remote | findstr "origin" >nul
    if %errorlevel% equ 0 (
        git remote remove origin
    )

    git remote add origin https://github.com/Cherny/KINXKit.git
    git branch -M main

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
        echo 🎉 恭喜！您的 KINXKit 项目已成功发布到 GitHub！
        echo.
        echo 📋 下一步操作：
        echo   1. 访问仓库查看文件
        echo   2. 启用 Actions（CI/CD 工作流）
        echo   3. 设置仓库描述和 Topics
        echo.
    ) else (
        echo.
        echo ❌ 推送失败，请检查网络连接或代理设置
        echo.
    )

) else (
    echo ❌ 仓库未找到
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 请先创建 GitHub 仓库：
    echo.
    echo 1. 打开浏览器
    echo.
    echo 2. 访问: https://github.com/new
    echo.
    echo 3. 填写仓库信息：
    echo    • Repository name: KINXKit
    echo    • Description: 智能项目助手 - 从创意到运行，5分钟搞定你的项目
    echo.
    echo 4. ⚠️  重要：不要勾选任何选项！
    echo    ❌ Add a README file
    echo    ❌ Add .gitignore
    echo    ❌ Choose a license
    echo.
    echo 5. 点击 "Create repository"
    echo.
    echo 6. 创建完成后，重新运行此脚本
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
)

pause
