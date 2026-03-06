# GitHub 协作设置指南

> 如何邀请团队成员、解决冲突、设置分支

---

## 📋 目录

- [一、邀请协作者](#一邀请协作者)
- [二、Fork 方式协作](#二fork-方式协作)
- [三、解决代码冲突](#三解决代码冲突)
- [四、设置 Git 分支](#四设置-git-分支)
- [五、保护主分支](#五保护主分支)
- [六、常见问题](#六常见问题)

---

## 一、邀请协作者

### 方法一：GitHub 协作者方式（推荐）

#### 步骤1：打开仓库设置

```
1. 访问你的 GitHub 仓库
   https://github.com/你的用户名/kinxkit

2. 点击顶部的 "Settings" (设置) 标签
```

#### 步骤2：进入协作设置

```
1. 在左侧菜单找到 "Collaborators" (协作者)
2. 点击 "Add people" (添加人员)
```

#### 步骤3：邀请成员

```
1. 输入成员的 GitHub 用户名或邮箱
   用户名: example-user
   或邮箱: user@example.com

2. 选择权限级别:
   ┌─────────────────────────────────────┐
   │ ☑ Read (只读)                       │
   │ ☑ Write (写入) ✅ 推荐             │
   │ ☑ Admin (管理员)                   │
   └─────────────────────────────────────┘

3. 点击 "Send invitation" 发送邀请
```

#### 步骤4：成员接受邀请

```
被邀请者会收到邮件，点击 "Accept invitation" 即可
或访问 GitHub 通知中心接受
```

### 权限说明

| 权限 | 可以做什么 |
|------|-------------|
| **Read** | 查看代码、克隆仓库 |
| **Write** | 推送代码、创建分支 |
| **Admin** | 全部权限 + 仓库设置 |

---

## 二、Fork 方式协作

### 适合场景

```
✅ 开源项目
✅ 大团队协作
✅ 外部贡献者
```

### 操作步骤

```
1. 访问原始仓库
   https://github.com/A/kinxkit

2. 右上角点击 "Fork" 按钮

3. 选择复制到自己的账号下
   现在你有: https://github.com/B/kinxkit

4. 克隆自己的仓库
   git clone https://github.com/B/kinxkit.git

5. 添加原始仓库为上游
   cd kinxkit
   git remote add upstream https://github.com/A/kinxkit.git

6. 定期同步上游代码
   git fetch upstream
   git checkout main
   git merge upstream/main
```

---

## 三、解决代码冲突

### 什么是冲突？

```
冲突发生: A和B都修改了同一个文件的同一行

Git 不知道该保留谁的修改 → 需要人工解决
```

### 预防冲突

```bash
# ✅ 好习惯
# 每天开始工作前
git checkout develop
git pull origin develop

# 完成一个小功能就提交
git add .
git commit -m "feat: small feature"
git push

# ❌ 坏习惯
# 很久才拉取一次
# 堆积很多代码才提交
# 不沟通就改代码
```

### 冲突解决步骤

#### 步骤1：发现冲突

```bash
$ git pull origin main

Auto-merging file.ts
CONFLICT (content): Merge conflict in file.ts
Automatic merge failed; fix conflicts and then commit.
```

#### 步骤2：查看冲突文件

```typescript
// 文件中会看到冲突标记

export async function detectOS(): Promise<OSInfo> {
  return {
<<<<<<< HEAD           // A的版本（当前你的版本）
    platform: process.platform,
    arch: process.arch.toUpperCase()   // A改了这里
=======
    platform: process.platform,
    arch: process.arch.toLowerCase()   // B改了这里
>>>>>>> origin/main     // B的版本（仓库里的版本）
    version: process.version
  };
}
```

#### 步骤3：和对方一起解决

```
1. 找对方，一起看这个文件
2. 讨论保留谁的代码，或者合并
3. 删除冲突标记
4. 保留最终想要的代码
```

#### 步骤4：标记冲突已解决

```bash
# 删除冲突标记后的文件
git add file.ts

# 告诉 Git 冲突已解决
git commit -m "merge: resolve conflicts"
```

### 快速解决命令

```bash
# 使用对方的代码（放弃自己的）
git checkout --theirs file.ts

# 使用自己的代码（放弃对方的）
git checkout --ours file.ts

# 然后标记解决
git add file.ts
git commit -m "merge: resolved conflicts"
```

---

## 四、设置 Git 分支

### 基础操作

```bash
# ========== 查看分支 ==========
git branch               # 查看本地分支
git branch -a           # 查看所有分支（包括远程）
git branch -v           # 查看分支和最新提交

# ========== 创建分支 ==========
git checkout -b develop                     # 创建并切换
git checkout -b feature/detector          # 功能分支
git checkout -b fix/proxy-error           # 修复分支

# ========== 切换分支 ==========
git checkout main                         # 切换到主分支
git checkout develop                      # 切换到开发分支

# ========== 删除分支 ==========
git branch -d feature/detector            # 删除本地分支
git push origin --delete feature/detector  # 删除远程分支

# ========== 重命名分支 ==========
git branch -m old-name new-name           # 重命名当前分支
```

### 推荐分支结构

```
main (主分支)
│
└── develop (开发分支)
        │
        ├── feature/detector
        ├── feature/docker
        ├── feature/github
        └── feature/commands
```

### 推荐的分支命名

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 新功能 | `feature/功能名` | `feature/detector` |
| Bug修复 | `fix/问题描述` | `fix/proxy-timeout` |
| 紧急修复 | `hotfix/问题描述` | `hotfix/crash-fix` |
| 重构 | `refactor/描述` | `refactor/clean-up` |
| 发布 | `release/v版本号` | `release/v1.0.0` |

---

## 五、保护主分支

### 为什么保护主分支？

```
防止意外:
├── 误删代码
├── 推送未测试的代码
└── 绕过代码审查
```

### 设置步骤

```
1. 打开 GitHub 仓库
   Settings → Branches

2. 点击 "Add rule"

3. 配置规则:
   ┌─────────────────────────────────────────────────────────┐
   │ Branch name: main                                     │
   │                                                         │
   │ ☑ Require a pull request before merging              │
   │   ☑ Require approvals: 1                             │
   │   ☑ Dismiss stale PR approvals when new commits push │
   │                                                         │
   │ ☑ Require status checks to pass before merging       │
   │   ☑ Require branches to be up to date before merging  │
   │                                                         │
   │ ☑ Do not allow bypassing the above settings           │
   └─────────────────────────────────────────────────────────┘

4. 点击 "Create" 保存
```

### 保护后的效果

```
✅ main 分支不能直接推送
✅ 必须通过 Pull Request
✅ 必须有人审查才能合并
✅ 必须通过所有测试
```

---

## 六、常见问题

### Q1: 无法推送代码到 main

```
原因: main 分支被保护了

解决:
1. 创建功能分支
   git checkout -b feature/your-feature

2. 在功能分支上工作并推送
   git push origin feature/your-feature

3. 创建 Pull Request
4. 审查通过后合并
```

### Q2: 冲突太多了怎么办

```
解决:
1. 和对方一起逐个解决
2. 或者放弃自己的代码，重新拉取
   git reset --hard origin/main
   git pull origin main
```

### Q3: 如何查看谁改了什么

```
# 查看提交历史
git log --oneline --graph --all

# 查看某文件的修改历史
git log --follow file.ts

# 查看某行是谁修改的
git blame file.ts
```

### Q4: 如何撤销最近的提交

```
# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1

# 撤销已推送的提交
git revert <commit-hash>
```

### Q5: 如何暂时保存工作

```
# 保存当前工作
git stash

# 恢复工作
git stash pop

# 查看所有保存的工作
git stash list
```

---

## 📋 快速参考

```bash
# ========== 日常操作 ==========

# 开始新一天的工作
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 工作中...
git add .
git commit -m "feat: add feature"
git push origin feature/my-feature

# 合并到 develop
# (在 GitHub 创建 Pull Request)

# 删除已合并的分支
git checkout develop
git pull origin develop
git branch -d feature/my-feature

# ========== 解决冲突 ==========

git pull origin develop
# 发现冲突后...
# 编辑文件解决冲突
git add .
git commit -m "merge: resolve conflicts"

# ========== 快速命令 ==========

git status           # 查看状态
git log --oneline    # 查看提交历史
git diff             # 查看修改
```

---

*最后更新: 2025-03-06*
