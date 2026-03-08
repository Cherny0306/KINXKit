# KINXKit Desktop GUI

> KINXKit 的图形化桌面界面 - 让项目创建更简单直观

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Electron](https://img.shields.io/badge/Electron-29.4.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📸 界面预览

### 主界面
- 项目创建面板
- Docker 状态监控
- 系统诊断可视化
- 日志实时查看

---

## 🚀 快速开始

### 安装依赖

```bash
# 从项目根目录
npm run desktop:install
```

### 开发模式运行

```bash
# 编译主项目并启动 GUI
npm run desktop:dev
```

### 构建桌面应用

```bash
# 构建 Windows 安装程序
npm run desktop:build
```

**输出位置**: `release/KINXKit-Desktop-0.1.0.exe`

---

## 📂 目录结构

```
GUI/
├── build/              # 构建资源（图标、图片）
│   └── README.md      # 资源文件说明
├── renderer/           # 渲染进程（用户界面）
│   ├── index.html     # 主界面
│   └── renderer.js    # 界面逻辑
├── scripts/           # 构建脚本
│   └── pre-build-check.js  # 构建前检查
├── main.js            # Electron 主进程
├── preload.js         # 预加载脚本
├── electron-builder.yml  # Electron Builder 配置
├── package.json       # GUI 包配置
└── README.md          # 本文件
```

---

## 🔧 开发指南

### 主进程 (main.js)

主进程负责：
- 应用生命周期管理
- 窗口创建和管理
- IPC 通信处理
- 系统级操作（文件对话框、进程管理等）

**主要 IPC 处理器**:
- `env:detect` - 环境检测
- `project:create` - 项目创建
- `docker:up/down/status` - Docker 管理
- `fix:diagnose` - 问题诊断
- `preset:ai` - AI 预设配置

### 渲染进程 (renderer/)

渲染进程负责：
- 用户界面渲染
- 用户交互处理
- 与主进程的 IPC 通信
- 数据可视化（Chart.js）

### 预加载脚本 (preload.js)

预加载脚本提供：
- 安全的 IPC 桥接
- 暴露有限的 API 给渲染进程
- 隔离上下文

---

## 🛠️ 构建配置

### Electron Builder 配置

主配置文件: `electron-builder.yml`

**重要配置项**:

```yaml
win:
  target: nsis           # NSIS 安装程序
  signAndEditExecutable: false  # 禁用代码签名（开发版）

nsis:
  oneClick: true         # 一键安装
  allowToChangeInstallationDirectory: true  # 允许更改安装目录
  createDesktopShortcut: true    # 创建桌面快捷方式
  createStartMenuShortcut: true  # 创建开始菜单快捷方式
```

---

## 📦 构建输出

### 文件说明

构建后 `release/` 目录包含：

| 文件 | 说明 | 大小 |
|------|------|------|
| `KINXKit-Desktop-0.1.0.exe` | NSIS 安装程序 | ~74 MB |
| `KINXKit-Desktop-Portable-0.1.0.exe` | 便携版 | ~250 MB |
| `win-unpacked/` | 未打包版本 | ~252 MB |
| `*.blockmap` | 增量更新映射 | ~80 KB |

---

## 🎨 自定义

### 添加应用图标

1. 创建 `build/icon.ico` (256x256)
2. 取消注释 `electron-builder.yml` 中的 `icon` 配置
3. 重新构建

详见: [build/README.md](build/README.md)

### 修改界面样式

编辑 `renderer/index.html` 中的 CSS：

```html
<style>
  /* 主色调 */
  :root {
    --primary-color: #3B82F6;
    --success-color: #10B981;
    --warning-color: #F59E0B;
    --danger-color: #EF4444;
  }
</style>
```

### 添加新的 IPC 处理器

在 `main.js` 中添加：

```javascript
ipcMain.handle('your:channel', async (event, ...args) => {
  // 处理逻辑
  return result;
});
```

在渲染进程中调用：

```javascript
const result = await window.electronAPI.yourChannel(...args);
```

---

## 🐛 故障排除

### 构建失败

**问题**: 符号链接权限错误
```
ERROR: Cannot create symbolic link : 客户端没有所需的特权
```

**解决**:
1. 以管理员权限运行
2. 或在 `electron-builder.yml` 中设置 `signAndEditExecutable: false`

### 应用无法启动

**问题**: 找不到主项目模块

**解决**:
```bash
# 先编译主项目
npm run build
# 再启动 GUI
npm run desktop:dev
```

### 界面空白

**问题**: 渲染进程加载失败

**解决**: 检查 `renderer/index.html` 和 `renderer.js` 是否存在

---

## 📝 相关文档

- [主项目 README](../README.md)
- [发布说明](RELEASE.md)
- [构建资源说明](build/README.md)
- [API 文档](../docs/API.md)

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📄 许可证

MIT License - 详见主项目 [LICENSE](../LICENSE)
