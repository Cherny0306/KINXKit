# KINXKit Desktop 安装指南

> 详细的手动安装步骤和故障排除

---

## 📥 下载

### 官方下载地址

- **GitHub Releases**: https://github.com/yourusername/kinxkit/releases
- **备用链接**: [待添加]

### 文件说明

| 文件名 | 类型 | 大小 | 推荐用户 |
|--------|------|------|----------|
| `KINXKit-Desktop-0.1.0.exe` | 安装程序 | 74 MB | 所有用户 |
| `KINXKit-Desktop-Portable-0.1.0.exe` | 便携版 | 250 MB | 高级用户 |

---

## 🖥️ 系统要求

### 最低要求
- **操作系统**: Windows 10 (64位) 或更高
- **处理器**: Intel Core i3 或同等性能
- **内存**: 4 GB RAM
- **磁盘空间**: 300 MB 可用空间
- **显示器**: 1024x768 分辨率

### 推荐配置
- **操作系统**: Windows 11 最新版本
- **处理器**: Intel Core i5 或更高
- **内存**: 8 GB RAM 或更多
- **磁盘空间**: 500 MB 或更多
- **显示器**: 1920x1080 或更高

### 可选组件
以下组件不是必需的，但可以增强功能：

- **Docker Desktop** - 用于容器化项目部署
- **Git** - 用于版本控制和 GitHub 集成
- **Python 3.8+** - 用于 Python 项目
- **Node.js 18+** - 用于 Node.js 项目

---

## 📀 安装步骤

### 方法 1: 使用安装程序（推荐）

#### 步骤 1: 下载

1. 访问 [GitHub Releases](https://github.com/yourusername/kinxkit/releases)
2. 下载最新版本的 `KINXKit-Desktop-Setup-0.1.0.exe`
3. 验证文件完整性（可选）

#### 步骤 2: 运行安装程序

1. 双击下载的 `.exe` 文件
2. 如果看到 SmartScreen 警告：
   - 点击"更多信息"
   - 点击"仍要运行"
3. 在用户账户控制 (UAC) 提示时点击"是"

#### 步骤 3: 选择安装选项

| 选项 | 说明 | 推荐 |
|------|------|------|
| 安装目录 | 选择应用安装位置 | 默认 `C:\Users\<用户>\AppData\Local\Programs\kinxkit-desktop` |
| 创建桌面快捷方式 | 在桌面添加快捷方式 | ✅ 勾选 |
| 创建开始菜单快捷方式 | 在开始菜单添加入口 | ✅ 勾选 |
| 添加到 PATH | 允许命令行访问 | 可选 |

#### 步骤 4: 完成安装

1. 等待安装完成（约 1-2 分钟）
2. 点击"完成"按钮
3. 安装程序会自动启动应用

---

### 方法 2: 使用便携版

#### 优势
- 无需安装，直接运行
- 不写入注册表
- 可以放在 U 盘中使用
- 多版本共存

#### 步骤

1. 下载 `KINXKit-Desktop-Portable-0.1.0.exe`
2. 放置到任意文件夹（如 `C:\Tools\KINXKit\`）
3. 双击运行
4. 可选：创建快捷方式

#### 创建快捷方式

```bash
# 使用 PowerShell
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$HOME\Desktop\KINXKit.lnk")
$Shortcut.TargetPath = "C:\Tools\KINXKit\KINXKit-Desktop-Portable-0.1.0.exe"
$Shortcut.Save()
```

---

## ✅ 安装验证

### 检查清单

安装完成后，请验证以下项目：

#### 1. 应用启动

- [ ] 双击桌面快捷方式，应用正常启动
- [ ] 主界面显示正常，无乱码或错位

#### 2. 基本功能

- [ ] 可以切换不同功能标签
- [ ] Docker 状态显示正确（如果已安装 Docker）
- [ ] 可以查看系统日志

#### 3. 文件位置

- [ ] 配置文件: `%APPDATA%\kinxkit-desktop\`
- [ ] 日志文件: `%APPDATA%\kinxkit-desktop\logs\`

---

## 🔄 卸载

### Windows 程序和功能

1. 按 `Win + I` 打开设置
2. 进入"应用" → "已安装的应用"
3. 搜索 "KINXKit Desktop"
4. 点击"..." → "卸载"
5. 按照卸载向导完成

### 手动删除（便携版）

1. 关闭应用（确保没有后台进程）
2. 删除应用程序文件夹
3. 删除用户数据（可选）:
   - `%APPDATA%\kinxkit-desktop\`
   - `%LOCALAPPDATA%\kinxkit-desktop\`

---

## 🐛 故障排除

### 问题 1: SmartScreen 警告

**症状**:
```
Windows 已保护你的电脑
Windows SmartScreen 筛选器已阻止无法识别的应用启动
```

**原因**: 安装程序未进行数字签名

**解决方案**:
1. 点击"更多信息"
2. 点击"仍要运行"
3. 或在下载前右键点击 → 属性 → 取消阻止

---

### 问题 2: 安装失败

**症状**: 安装程序中途退出或报错

**可能原因**:
1. 杀毒软件阻止
2. 磁盘空间不足
3. 文件损坏

**解决方案**:
```bash
# 1. 临时禁用杀毒软件
# 2. 检查磁盘空间（至少 500MB）
# 3. 重新下载并验证文件完整性

# 使用 PowerShell 验证哈希
Get-FileHash KINXKit-Desktop-0.1.0.exe -Algorithm SHA256
```

---

### 问题 3: 应用无法启动

**症状**: 双击图标后无反应

**排查步骤**:

1. **检查进程**:
   ```bash
   # 打开任务管理器
   # 查看 "KINXKit Desktop" 或 "electron.exe" 进程
   ```

2. **查看日志**:
   ```bash
   # 日志位置
   %APPDATA%\kinxkit-desktop\logs\
   ```

3. **重新安装**:
   ```bash
   # 卸载后重新安装
   # 或使用便携版测试
   ```

---

### 问题 4: 界面显示异常

**症状**:
- 界面元素错位
- 字体显示不正常
- 按钮无法点击

**解决方案**:

1. **检查 DPI 设置**:
   - 右键应用图标 → 属性 → 兼容性
   - 勾选"高 DPI 设置时禁用显示缩放"

2. **更改显示缩放**:
   - 设置 → 系统 → 显示
   - 尝试 100% 缩放

---

### 问题 5: 缺少 VC++ 运行库

**症状**:
```
无法启动此程序，因为计算机中丢失 VCRUNTIME140.dll
```

**解决方案**:
1. 下载 [Microsoft Visual C++ 2015-2022 Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
2. 安装 x64 版本
3. 重启计算机

---

## 📞 获取帮助

### 自助资源

- **文档**: https://github.com/yourusername/kinxkit/wiki
- **FAQ**: https://github.com/yourusername/kinxkit/discussions
- **已知问题**: https://github.com/yourusername/kinxkit/issues

### 报告问题

如果遇到上述方法无法解决的问题：

1. 访问 [Issues](https://github.com/yourusername/kinxkit/issues)
2. 搜索是否有相似问题
3. 创建新 Issue，包含：
   - Windows 版本
   - 应用版本
   - 错误信息
   - 复现步骤
   - 日志文件

---

## 🔒 安全说明

### 代码签名

当前版本未进行数字签名，这是正常的开发版本行为。未来版本将添加代码签名。

### 验证下载

**方法 1: 文件哈希**

在发布页面查看 SHA256 哈希值，然后验证：

```powershell
Get-FileHash KINXKit-Desktop-0.1.0.exe -Algorithm SHA256
```

**方法 2: 病毒扫描**

使用 [VirusTotal](https://www.virustotal.com/) 上传文件进行扫描。

---

## 📚 下一步

安装完成后，请查看：

- [用户指南](../docs/GUIDE.md) - 如何使用各项功能
- [API 文档](../docs/API.md) - 高级用户参考
- [视频教程](https://youtube.com/playlist?list=xxx) - 视频演示

---

## 🎉 开始使用

安装成功后，启动应用并：

1. **查看系统状态** - 了解你的开发环境
2. **创建第一个项目** - 选择项目类型并配置
3. **探索功能** - 熟悉各种工具和选项

祝你使用愉快！ 🚀
