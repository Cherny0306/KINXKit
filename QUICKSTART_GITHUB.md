# KINXKit GitHub 仓库快速创建指南

## 🚀 3 分钟完成 GitHub 仓库创建和代码推送

---

## 第 1 步：在 GitHub 创建仓库（2 分钟）

### 1.1 打开 GitHub 创建页面

点击链接或复制到浏览器：
```
https://github.com/new
```

### 1.2 填写仓库信息

| 字段 | 填写内容 |
|------|----------|
| **Repository name** | `KINXKit` |
| **Description** | `智能项目助手 - 从创意到运行，5分钟搞定你的项目` |
| **Visibility** | 选择 `Public` 或 `Private` |

### 1.3 ⚠️ 重要：不要勾选任何选项！

确保以下选项**都不要勾选**：
- ❌ Add a README file
- ❌ Add .gitignore
- ❌ Choose a license
- ❌ Keep this code private (if this is a personal account)

### 1.4 创建仓库

点击绿色的 **"Create repository"** 按钮

✅ 仓库创建完成！页面会显示仓库地址。

---

## 第 2 步：推送代码到 GitHub（1 分钟）

### 方法 A：使用自动化脚本（推荐）

#### Windows 用户：
```cmd
push-to-github.bat
```

#### Mac/Linux 用户：
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

### 方法 B：手动推送命令

如果您的 GitHub 用户名是 `Cherny`，运行：

```bash
git remote add origin https://github.com/Cherny/KINXKit.git
git branch -M main
git push -u origin main
```

**如果用户名不是 Cherny**，请替换为您的实际用户名：

```bash
git remote add origin https://github.com/YOUR_USERNAME/KINXKit.git
git branch -M main
git push -u origin main
```

---

## 第 3 步：验证推送成功

推送成功后，您应该看到：

```
✅ 推送成功！

📦 仓库地址: https://github.com/Cherny/KINXKit
```

### 验证步骤：

1. **访问您的仓库**
   ```
   https://github.com/YOUR_USERNAME/KINXKit
   ```

2. **检查文件是否完整**
   - ✅ 应该看到 75+ 个文件
   - ✅ 应该看到所有源代码
   - ✅ 应该看到完整的文档

3. **检查 Actions 标签页**
   - 点击顶部的 "Actions" 标签
   - 可能需要启用工作流：
     - 点击 "I understand my workflows, go ahead and enable them"

---

## 🎯 推送成功后的下一步

### 立即操作（5 分钟）

1. **设置仓库描述**
   - 点击仓库右上角的 ⚙️ (Settings)
   - 在 "Description" 中填写：智能项目助手 - 从创意到运行，5分钟搞定你的项目
   - 点击 "Save"

2. **添加 Topics**
   - 在 Settings → General 页面
   - 添加以下 Topics：
     - `cli`
     - `project-generator`
     - `developer-tools`
     - `typescript`
     - `docker`
     - `ai`
     - `automation`

3. **启用 GitHub Actions**
   - 访问 "Actions" 标签页
   - 点击 "I understand my workflows, go ahead and enable them"
   - CI/CD 将在每次推送时自动运行

### 可选操作（10 分钟）

4. **添加仓库徽章到 README.md**

```markdown
[![CI](https://github.com/Cherny/KINXKit/workflows/CI/badge.svg)](https://github.com/Cherny/KINXKit/actions)
[![codecov](https://codecov.io/gh/Cherny/KINXKit/branch/main/graph/badge.svg)](https://codecov.io/gh/Cherny/KINXKit)
[![npm version](https://badge.fury.io/js/kinxkit.svg)](https://www.npmjs.com/package/kinxkit)
```

5. **设置分支保护**
   - Settings → Branches
   - Add rule: `main`
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

## ❓ 常见问题

### Q: 推送失败，提示 "Repository not found"

**A:** 检查以下几点：
1. 确保已在 GitHub 网站创建仓库
2. 检查用户名是否正确
3. 检查仓库名称是否为 `KINXKit`（区分大小写）
4. 如果是私有仓库，确保有访问权限

### Q: 推送失败，提示网络错误

**A:** 可能需要配置代理：

```bash
# 配置 git 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 然后重试推送
git push -u origin main
```

### Q: 推送失败，提示认证错误

**A:** 使用 Personal Access Token：

1. 生成 Token:
   - 访问: https://github.com/settings/tokens
   - Generate new token (classic)
   - 勾选 `repo` 权限
   - 生成并复制 token

2. 使用 Token 推送:
```bash
git push https://YOUR_TOKEN@github.com/Cherny/KINXKit.git main
```

### Q: 如何修改远程仓库 URL？

**A:** 如果 URL 错误，可以修改：

```bash
# 查看当前远程仓库
git remote -v

# 修改远程仓库 URL
git remote set-url origin https://github.com/CORRECT_USERNAME/KINXKit.git

# 验证修改
git remote -v
```

---

## 📚 相关文档

- `GITHUB_SETUP.md` - 完整的 GitHub 设置指南
- `CONTRIBUTING.md` - 贡献指南
- `README.md` - 项目说明
- `push-to-github.bat` - Windows 推送脚本
- `create-and-push.sh` - Linux/Mac 自动化脚本

---

## ✅ 完成检查清单

创建并推送完成后，检查以下项目：

- [ ] 仓库在 GitHub 上可见
- [ ] 所有文件都已推送（75+ 个文件）
- [ ] README.md 正确显示
- [ ] Actions 已启用（或已配置）
- [ ] 仓库描述已设置
- [ ] Topics 已添加
- [ ] (可选) 分支保护已启用

---

*创建时间: 2025-03-07*
*维护者: KINXKit Team*

---

## 🎉 需要帮助？

如果遇到问题：

1. 查看 `GITHUB_SETUP.md` 获取详细步骤
2. 查看本文档的"常见问题"部分
3. 提交 Issue 到 GitHub 仓库（创建后）

祝您使用愉快！🚀
