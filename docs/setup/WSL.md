# WSL (Windows Subsystem for Linux) 安装与配置指南

> 在 Windows 上运行 Linux 环境，配合 KINXKit 进行跨平台开发

---

## 📋 目录

- [一、WSL 简介](#一wsl-简介)
- [二、系统要求](#二系统要求)
- [三、WSL 安装](#三wsl-安装)
- [四、Linux 发行版选择](#四linux-发行版选择)
- [五、开发环境配置](#五开发环境配置)
- [六、CUDA/GPU 支持](#六cudagpu-支持)
- [七、文件系统交互](#七文件系统交互)
- [八、网络配置](#八网络配置)
- [九、常见问题](#九常见问题)
- [十、性能优化](#十性能优化)

---

## 一、WSL 简介

### 什么是 WSL

```
WSL (Windows Subsystem for Linux)
├── WSL 1: Linux 兼容层 (IO 性能较差)
└── WSL 2: 真实 Linux 内核 (推荐)

优势:
├── Windows + Linux 无缝切换
├── 原生 Linux 性能
├── GPU 加速支持
├── Docker Desktop 集成
└── 适合开发、测试、学习
```

### WSL 1 vs WSL 2

| 特性 | WSL 1 | WSL 2 |
|------|-------|-------|
| **内核** | 兼容层 | 真实 Linux 内核 |
| **性能** | IO 较慢 | 接近原生 |
| **GPU** | ❌ 不支持 | ✅ 支持 |
| **Docker** | ❌ 不支持 | ✅ 完整支持 |
| **网络** | 与 Windows 共享 | 独立 IP |
| **磁盘** | 直接访问 | 虚拟磁盘 |

**推荐**: WSL 2 (除非有特殊需求)

---

## 二、系统要求

### 硬件要求

```
最低配置:
├── CPU: 64位处理器
├── 内存: 4GB (推荐 8GB+)
├── 磁盘: 10GB 可用空间
└── 系统: Windows 10 2004+ 或 Windows 11

推荐配置:
├── CPU: 4核心+
├── 内存: 16GB+
├── 磁盘: SSD 50GB+ 可用空间
└── GPU: NVIDIA (用于 CUDA)
```

### 系统版本

```powershell
# 检查 Windows 版本
# 按 Win+R，输入 winver

# 或使用 PowerShell
Get-ComputerInfo
```

**支持的系统版本**:
- Windows 11: 所有版本
- Windows 10:
  - 版本 21H2 (Build 19044+)
  - 版本 21H1 (Build 19043+)
  - 版本 20H2 (Build 19042+)

---

## 三、WSL 安装

### 方法一：自动安装 (推荐)

```powershell
# ========== 以管理员身份运行 PowerShell ==========

# 1. 启用 WSL 功能
wsl --install

# 2. 重启计算机
# 自动下载并安装 Ubuntu 作为默认发行版

# 3. 首次启动，设置用户名和密码
# Enter new UNIX username: yourname
# New password: ********
# Retype new password: ********

# 4. 验证安装
wsl --list --verbose
```

### 方法二：手动安装

```powershell
# ========== 步骤 1: 启用 WSL 功能 ==========
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# ========== 步骤 2: 重启计算机 ==========
# 重启后继续

# ========== 步骤 3: 设置 WSL 2 为默认 ==========
wsl --set-default-version 2

# ========== 步骤 4: 安装 Linux 发行版 ==========
# 方法 A: 从 Microsoft Store 安装
# 搜索: Ubuntu 22.04 LTS / Ubuntu 20.04 LTS

# 方法 B: 使用命令行
wsl --install -d Ubuntu-22.04

# ========== 步骤 5: 初始化发行版 ==========
# 首次启动会提示设置用户名和密码
```

### 方法三：离线安装

```powershell
# 适用于无法访问 Microsoft Store 的情况

# 1. 下载发行版包
# https://learn.microsoft.com/en-us/windows/wsl/install-manual

# 2. 使用 PowerShell 安装
Add-AppxPackage .\Ubuntu_22.04 LTS.appx

# 3. 初始化
ubuntu2204 install
ubuntu2204
```

---

## 四、Linux 发行版选择

### 推荐发行版

| 发行版 | 大小 | 用途 | 推荐度 |
|--------|------|------|--------|
| **Ubuntu 22.04 LTS** | 中等 | 通用开发 | ⭐⭐⭐⭐⭐ |
| **Ubuntu 20.04 LTS** | 中等 | 稳定生产 | ⭐⭐⭐⭐ |
| **Debian GNU/Linux** | 较小 | 轻量开发 | ⭐⭐⭐⭐ |
| **openSUSE Leap** | 中等 | 企业开发 | ⭐⭐⭐ |
| **Fedora** | 较大 | 最新技术 | ⭐⭐⭐ |

### 安装多个发行版

```powershell
# 查看可用发行版
wsl --list --online

# 安装多个发行版
wsl --install -d Ubuntu-22.04
wsl --install -d Debian
wsl --install -d Ubuntu-20.04

# 查看已安装发行版
wsl --list --verbose

# 切换默认发行版
wsl --set-default Ubuntu-22.04

# 运行特定发行版
wsl -d Debian
```

---

## 五、开发环境配置

### 基础工具安装

```bash
# ========== 更新系统 ==========
sudo apt update && sudo apt upgrade -y

# ========== 基础工具 ==========
sudo apt install -y \
    build-essential \
    git \
    curl \
    wget \
    vim \
    nano \
    zip \
    unzip \
    htop \
    tree \
    tmux

# ========== 开发工具 ==========
# Python
sudo apt install -y python3 python3-pip python3-venv

# Node.js (使用 NodeSource 仓库)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker (配合 Docker Desktop)
# https://docs.docker.com/desktop/wsl/

# ========== 语言和编码 ==========
sudo apt install -y \
    language-pack-zh-hans \
    fonts-noto-cjk

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai
```

### 配置 Git

```bash
# ========== Git 配置 ==========
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main

# 保存凭证
git config --global credential.helper store

# 或使用缓存 (1小时)
git config --global credential.helper 'cache --timeout=3600'

# 换行符处理 (Windows 兼容)
git config --global core.autocrlf input
```

### 配置 SSH 密钥

```bash
# ========== 生成 SSH 密钥 ==========
ssh-keygen -t ed25519 -C "your.email@example.com"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub:
# Settings → SSH keys → Add new
```

### 配置 Zsh (可选，推荐)

```bash
# ========== 安装 Zsh ==========
sudo apt install -y zsh

# ========== 安装 Oh My Zsh ==========
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# ========== 设置为默认 Shell ==========
chsh -s $(which zsh)

# ========== 推荐插件 ==========
# 编辑 ~/.zshrc
# plugins=(git docker kubectl vscode)

# ========== 主题选择 ==========
# 常用主题: robbyrussell, agnoster, powerlevel10k
```

---

## 六、CUDA/GPU 支持

### 安装 NVIDIA 驱动

```powershell
# ========== 在 Windows 上安装 ==========
# 下载 WSL2 专用驱动
https://developer.nvidia.com/cuda/wsl

# 或从 NVIDIA 官网下载 GeForce 驱动
https://www.nvidia.com/Download/index.aspx

# ========== 验证驱动 ==========
wsl
nvidia-smi

# 应该看到 GPU 信息
```

### 安装 CUDA Toolkit

```bash
# ========== 在 WSL2 中安装 ==========
# 参考 docs/setup/CUDA.md 的 Linux 安装部分

# 1. 添加 NVIDIA 仓库
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update

# 2. 安装 CUDA Toolkit
sudo apt-get -y install cuda

# 3. 配置环境变量
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# 4. 验证
nvcc --version
```

### 测试 GPU

```bash
# ========== 测试 PyTorch ==========
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

python3 << 'EOF'
import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0)}")
EOF
```

---

## 七、文件系统交互

### 路径访问规则

```bash
# ========== 从 WSL2 访问 Windows 文件 ==========
# Windows 磁盘挂载在 /mnt/
cd /mnt/c/Users/YourUsername/Documents

# ========== 从 Windows 访问 WSL2 文件 ==========
# 方法 1: 使用 \\wsl$\
explorer.exe \\wsl$\Ubuntu-22.04\home\yourname

# 方法 2: 在 PowerShell 中
cd \\wsl$\Ubuntu-22.04\home\yourname

# ========== 性能建议 ==========
# ✅ 好做法: 在 WSL2 文件系统中工作
cd ~/projects
git clone https://github.com/user/project.git

# ❌ 不推荐: 在 /mnt/c 中工作 (IO 慢)
cd /mnt/c/temp
git clone https://github.com/user/project.git  # 会很慢
```

### 文件权限

```bash
# ========== 权限问题 ==========
# Windows 文件系统不支持 Linux 权限
# 可能导致脚本执行问题

# 解决方法 1: 复制到 WSL2 文件系统
cp /mnt/c/script.sh ~/scripts/
chmod +x ~/scripts/script.sh

# 解决方法 2: 挂载选项
# 编辑 /etc/wsl.conf
sudo nano /etc/wsl.conf

# 添加:
[automount]
options = "metadata"
```

### 配置 WSL 挂载

```bash
# ========== 编辑 /etc/wsl.conf ==========
sudo nano /etc/wsl.conf

# ========== 配置示例 ==========
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"
mountFsTab = false

[network]
generateHosts = false
generateResolvConf = false

[interop]
enabled = false
appendWindowsPath = false

# ========== 应用配置 ==========
# 在 PowerShell 中重启 WSL
wsl --shutdown
wsl
```

---

## 八、网络配置

### 网络模式

```
WSL 2 网络模式:
├── NAT 模式 (默认)
│   ├── WSL2 有独立 IP
│   ├── 通过 Windows NAT 访问外网
│   └── 端口转发: localhost 直接访问
└── Mirrored 模式 (Windows 11 22H2+)
    ├── 复制 Windows 网络
    ├── 共享局域网 IP
    └── 更好的网络兼容性
```

### 切换到 Mirrored 模式

```powershell
# ========== 编辑 .wslconfig ==========
# 在 Windows 用户目录下创建
notepad $env:USERPROFILE\.wslconfig

# ========== 配置内容 ==========
[wsl2]
networkingMode=mirrored
autoProxy=true

# ========== 重启 WSL ==========
wsl --shutdown
wsl
```

### 端口转发

```powershell
# ========== 手动端口转发 ==========
netsh interface portproxy add v4tov4 `
    listenport=8080 `
    listenaddress=0.0.0.0 `
    connectport=8080 `
    connectaddress=$(wsl hostname -i)

# ========== 查看转发规则 ==========
netsh interface portproxy show all

# ========== 删除规则 ==========
netsh interface portproxy delete v4tov4 listenport=8080 listenaddress=0.0.0.0
```

---

## 九、常见问题

### Q1: WSL 安装失败

```
问题: Install-WSL.ps1 执行失败

解决:
1. 确认 Windows 版本 >= Windows 10 2004
2. 启用 Windows 虚拟化
   - BIOS 中开启 VT-x/AMD-V
   - Windows 功能中启用 "虚拟机平台"
3. 使用手动安装方式
```

### Q2: 内存占用过高

```
问题: WSL2 占用大量系统内存

解决:
编辑 .wslconfig 限制内存

[wsl2]
memory=8GB
swap=2GB
processors=4
```

### Q3: 磁盘空间占用

```
问题: WSL2 虚拟磁盘持续增长

解决:
1. 压缩虚拟磁盘
wsl --manage Ubuntu-22.04 --set-sparse true

2. 清理包缓存
sudo apt clean
sudo apt autoremove

3. 重置发行版 (慎用)
wsl --unregister Ubuntu-22.04
wsl --install -d Ubuntu-22.04
```

### Q4: 文件 IO 性能差

```
问题: 在 /mnt/c 中操作文件很慢

解决:
1. 将工作目录放在 WSL2 文件系统中
   cd ~/projects

2. 使用 WSLg (图形界面) 进行文件操作

3. 必须访问 Windows 文件时:
   - 使用 \\wsl$ 路径
   - 减少文件系统操作
```

### Q5: DNS 解析失败

```
问题: WSL2 无法解析域名

解决:
1. 编辑 /etc/resolv.conf
sudo nano /etc/resolv.conf

2. 添加 DNS 服务器
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 114.114.114.114

3. 防止覆盖
sudo chattr +i /etc/resolv.conf
```

---

## 十、性能优化

### 配置文件 (.wslconfig)

```ini
# ========== Windows 侧配置 ==========
# 位置: C:\Users\YourName\.wslconfig

[wsl2]
# 内存限制
memory=16GB

# 交换空间
swap=2GB
swapFile=C:\\temp\\wsl-swap.vhdx

# CPU 核心数
processors=8

# 虚拟磁盘大小
sparseVhd=true

# 网络模式 (Windows 11 22H2+)
networkingMode=mirrored
autoProxy=true

# 内核调试 (开发者)
kernelCommandLine = debug

# 自动回收内存
autoMemoryReclaim=gradual
```

### WSL 侧配置

```bash
# ========== /etc/wsl.conf ==========
sudo nano /etc/wsl.conf

[boot]
systemd=true

[automount]
enabled=true
options="metadata,umask=22,fmask=11"
mountFsTab=false

[network]
generateHosts=false
generateResolvConf=false

[interop]
enabled=false
appendWindowsPath=false

[user]
default=yourname
```

### 性能监控

```bash
# ========== 系统监控 ==========
htop              # 进程监控
iotop             # IO 监控
nethogs           # 网络监控

# ========== 磁盘使用 ==========
df -h             # 磁盘空间
du -sh ~/*        # 目录大小

# ========== 内存使用 ==========
free -h           # 内存使用
vmstat            # 虚拟内存统计
```

---

## 十一、集成工具

### Windows Terminal

```json
// ========== Windows Terminal 配置 ==========
// 在 settings.json 中添加 WSL 配置

{
    "guid": "{...}",
    "name": "Ubuntu-22.04",
    "commandline": "wsl.exe -d Ubuntu-22.04",
    "icon": "https://assets.ubuntu.com/v2/assets/logo/logo-ubuntu-png.png",
    "startingDirectory": "~",
    "colorScheme": "Ubuntu",
    "fontSize": 11,
    "fontFace": "Cascadia Code"
}
```

### VS Code 集成

```bash
# ========== 安装 VS Code ==========
# 从 Windows 访问
code .

# 或在 WSL2 中
sudo apt install -y code

# ========== 推荐插件 ==========
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension ms-python.python
code --install-extension ms-vscode.vscode-typescript-next
```

### Docker Desktop

```bash
# ========== 启用 WSL2 集成 ==========
# Docker Desktop → Settings → General
☑ Use the WSL 2 based engine

# Docker Desktop → Settings → Resources → WSL Integration
☑ Enable integration with my default WSL distro
☑ Ubuntu-22.04

# ========== 验证 ==========
docker --version
docker ps
```

---

## 十二、高级技巧

### 导入导出发行版

```powershell
# ========== 导出发行版 ==========
wsl --export Ubuntu-22.04 D:\Backup\ubuntu.tar

# ========== 导入发行版 ==========
wsl --import Ubuntu-Backup D:\WSL\Ubuntu D:\Backup\ubuntu.tar

# ========== 删除发行版 ==========
wsl --unregister Ubuntu-22.04
```

### 运行多个发行版

```powershell
# ========== 同时运行多个发行版 ==========
wsl -d Ubuntu-22.04 -- bash -c "python server.py"
wsl -d Debian -- bash -c "node app.js"

# ========== 在特定发行版中运行命令 ==========
wsl -d Ubuntu-22.04 -- ls -la ~/
```

### 后台运行服务

```bash
# ========== 使用 systemd (推荐) ==========
# 编辑 /etc/wsl.conf
[boot]
systemd=true

# 启用服务
sudo systemctl enable ssh
sudo systemctl start ssh

# ========== 使用 tmux ==========
tmux new -s mysession
# 运行服务
# Ctrl+B, D 分离会话

# 恢复会话
tmux attach -t mysession
```

---

## 十三、参考资源

### 官方文档

- WSL 官方文档: https://learn.microsoft.com/en-us/windows/wsl/
- WSL 2 文档: https://learn.microsoft.com/en-us/windows/wsl/compare-versions
- WSL 安装指南: https://learn.microsoft.com/en-us/windows/wsl/install
- WSL 故障排除: https://learn.microsoft.com/en-us/windows/wsl/troubleshooting

### 社区资源

- WSL GitHub: https://github.com/microsoft/WSL
- Windows Terminal: https://github.com/microsoft/terminal
- Docker WSL2: https://docs.docker.com/desktop/wsl/

---

*最后更新: 2025-03-06*
