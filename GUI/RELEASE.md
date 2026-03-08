# KINXKit Desktop 发布说明

## 版本 0.1.0

**发布日期**: 2026-03-08
**类型**: 初始发布

---

## 系统要求

### 最低要求
- **操作系统**: Windows 10/11 (64位)
- **内存**: 4 GB RAM
- **磁盘空间**: 300 MB 可用空间
- **权限**: 标准用户权限（管理员权限仅用于安装）

### 推荐配置
- **操作系统**: Windows 11 最新版本
- **内存**: 8 GB RAM 或更高
- **磁盘空间**: 500 MB 可用空间
- **其他**:
  - Docker Desktop（用于项目容器化）
  - Git（用于版本控制）

---

## 新功能

### 🎯 核心功能
- **可视化项目创建** - 通过直观的图形界面创建项目
- **一键 Docker 管理** - 启动、停止、查看容器状态
- **AI 配置预设** - 快速配置 6 种主流 AI 服务
- **数据库预设** - 支持 PostgreSQL、MySQL、MongoDB 等
- **系统诊断** - 可视化展示系统健康状态
- **日志系统** - 实时查看和过滤应用日志

### 🔧 技术特性
- 基于 Electron 29.x
- 本地化数据存储（无云端依赖）
- IPC 进程间通信架构
- 响应式用户界面

---

## 安装

### 方法 1: 使用安装程序（推荐）

1. 下载 `KINXKit-Desktop-0.1.0.exe`
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 从开始菜单启动 "KINXKit Desktop"

### 方法 2: 使用便携版

1. 下载 `KINXKit-Desktop-Portable-0.1.0.exe`
2. 放置到任意文件夹
3. 双击运行即可使用

---

## 已知问题

### 当前版本限制

1. **图标**: 使用默认 Electron 图标
   - 影响: 任务栏和桌面快捷方式显示默认图标
   - 解决: 下个版本将添加自定义图标

2. **代码签名**: 安装程序未数字签名
   - 影响: Windows SmartScreen 可能显示警告
   - 解决: 安装时点击"更多信息" → "仍要运行"

3. **自动更新**: 当前版本不支持自动更新
   - 影响: 需要手动下载新版本
   - 解决: 下个版本将添加自动更新功能

### 使用注意事项

1. **Docker 依赖**: 某些功能需要 Docker Desktop
2. **网络连接**: AI 服务配置需要网络连接
3. **文件权限**: 确保对项目目录有读写权限

---

## 升级说明

### 从 0.1.0 升级到未来版本

1. 卸载旧版本（可选，保留用户数据）
2. 下载新版本安装程序
3. 运行安装程序
4. 用户配置将自动保留

---

## 验证安装

### 检查清单

- [ ] 应用正常启动
- [ ] 界面显示正常
- [ ] 可以创建新项目
- [ ] Docker 状态显示正确（如已安装）
- [ ] 日志系统正常工作

---

## 卸载

### Windows

1. 打开"控制面板" → "程序和功能"
2. 找到 "KINXKit Desktop"
3. 点击"卸载"
4. 按照卸载向导完成

**注意**: 用户数据（位于 `%APPDATA%/kinxkit-desktop`）默认不会删除。

---

## 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

---

## 支持

### 官方渠道
- **GitHub**: https://github.com/yourusername/kinxkit
- **Issues**: https://github.com/yourusername/kinxkit/issues
- **文档**: https://github.com/yourusername/kinxkit/wiki

### 社区
- **Discussions**: https://github.com/yourusername/kinxkit/discussions

---

## 致谢

感谢以下开源项目：

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Chart.js](https://www.chartjs.org/) - 数据可视化
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 生成

---

## 下个版本预告

### 0.2.0 计划功能

- ✨ 自定义应用图标
- 🔐 代码签名支持
- 🌐 自动更新功能
- 🎨 主题切换（深色/浅色模式）
- 📊 更多图表类型
- 🌍 多语言支持（英文、中文）
- 🔍 项目搜索和管理
- 💾 项目模板导入导出

---

## 更新日志

### [0.1.0] - 2026-03-08

#### 新增
- 初始桌面应用发布
- 项目创建功能
- Docker 管理功能
- AI 配置预设
- 数据库配置预设
- 系统诊断功能
- 日志查看功能

#### 技术细节
- Electron 29.4.6
- Electron Builder 24.13.3
- NSIS 安装程序
- Chart.js 4.x 集成
