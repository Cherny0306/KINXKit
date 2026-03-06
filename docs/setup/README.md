# 开发环境配置指南

> KINXKit 开发环境完整配置教程

---

## 📋 配置指南列表

| 配置项 | 说明 | 适用场景 | 难度 |
|--------|------|----------|------|
| [CUDA](./CUDA.md) | NVIDIA GPU 加速环境 | AI/ML 项目、深度学习 | ⭐⭐⭐ |
| [WSL](./WSL.md) | Windows Linux 子系统 | Windows 开发环境 | ⭐⭐ |

---

## 🎯 配置推荐

### 根据项目类型选择

```
AI/机器学习项目:
├── CUDA (必需)
│   ├── NVIDIA GPU + CUDA Toolkit
│   ├── cuDNN 加速库
│   └── PyTorch/TensorFlow GPU 版本
└── WSL2 (Windows 用户，推荐)
    ├── 原生 Linux 性能
    └── Docker 完整支持

数据分析项目:
├── CUDA (可选)
│   └── GPU 加速 Pandas/NumPy
└── WSL2 (Windows 用户，推荐)

Web 应用项目:
└── WSL2 (Windows 用户，推荐)
    └── Docker 容器化开发
```

### 根据操作系统选择

| 系统 | 推荐配置 | 原因 |
|------|----------|------|
| **Windows 11** | WSL2 + CUDA | 最佳开发体验 |
| **Windows 10** | WSL2 + 可选 CUDA | Linux 兼容性 |
| **Linux** | CUDA (如有 GPU) | 原生支持 |
| **macOS** | 无 CUDA (Apple Silicon) | 使用 Metal/MPS |

---

## 📖 快速开始

### Windows 用户

```powershell
# ========== 步骤 1: 安装 WSL2 ==========
wsl --install
# 重启后设置 Ubuntu 用户名密码

# ========== 步骤 2: 安装 NVIDIA 驱动 ==========
# 下载 WSL2 专用驱动
https://developer.nvidia.com/cuda/wsl

# ========== 步骤 3: 验证 GPU ==========
wsl
nvidia-smi

# ========== 步骤 4: 安装 CUDA Toolkit (可选) ==========
# 参考 WSL.md 详细步骤
```

### Linux 用户

```bash
# ========== 步骤 1: 安装 NVIDIA 驱动 ==========
sudo ubuntu-drivers autoinstall
sudo reboot

# ========== 步骤 2: 验证驱动 ==========
nvidia-smi

# ========== 步骤 3: 安装 CUDA Toolkit ==========
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda

# 参考 CUDA.md 详细步骤
```

---

## 🔧 配置验证

### 完整环境检查清单

```bash
# ========== 1. 系统信息 ==========
# Windows + WSL2
wsl --list --verbose
uname -a

# ========== 2. GPU 信息 ==========
nvidia-smi

# ========== 3. CUDA 版本 ==========
nvcc --version

# ========== 4. Python 环境 ==========
python3 --version
pip3 --version

# ========== 5. PyTorch GPU 支持 ==========
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"

# ========== 6. Docker 环境 ==========
docker --version
docker ps
```

### 验证脚本

```bash
#!/bin/bash
# 环境验证脚本

echo "🔍 检查开发环境..."

# 检查 WSL2
if grep -qi microsoft /proc/version 2>/dev/null; then
    echo "✅ WSL2: 已安装"
else
    echo "⚠️  WSL2: 未检测到"
fi

# 检查 NVIDIA 驱动
if command -v nvidia-smi &> /dev/null; then
    echo "✅ NVIDIA 驱动: 已安装"
    nvidia-smi --query-gpu=name --format=csv,noheader
else
    echo "❌ NVIDIA 驱动: 未安装"
fi

# 检查 CUDA
if command -v nvcc &> /dev/null; then
    echo "✅ CUDA: $(nvcc --version | grep 'release' | sed 's/.*release //' | sed 's/,.*//')"
else
    echo "⚠️  CUDA Toolkit: 未安装或不在 PATH 中"
fi

# 检查 Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version | sed 's/.*version //')"
else
    echo "❌ Docker: 未安装"
fi

# 检查 Python
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version | sed 's/Python //')"
else
    echo "❌ Python: 未安装"
fi

# 检查 PyTorch CUDA
if python3 -c "import torch; torch.cuda.is_available()" 2>/dev/null; then
    echo "✅ PyTorch CUDA: 可用"
else
    echo "⚠️  PyTorch CUDA: 不可用"
fi

echo ""
echo "详细配置指南:"
echo "  - CUDA: docs/setup/CUDA.md"
echo "  - WSL: docs/setup/WSL.md"
```

---

## 🐛 常见问题

### Q: Windows 上是否必须安装 WSL2?

```
推荐安装:
├── 开发体验更好 (接近原生 Linux)
├── Docker 完整支持
├── 性能优于 Git Bash/WSL1
└── GPU 加速支持

可以不安装:
├── 使用 Docker Desktop 的 Windows 容器
├── 或使用原生 Windows 开发
└── 部分 KINXKit 功能受限
```

### Q: CUDA 必须安装吗?

```
AI/ML 项目: 必需
├── PyTorch/TensorFlow GPU 版本需要 CUDA
├── 训练速度提升 10-100x
└── 大模型推理必需

普通项目: 可选
├── Web 应用不需要
├── API 服务不需要
└── 数据分析可用 CPU
```

### Q: macOS 用户如何配置?

```
Apple Silicon (M1/M2/M3):
├── 使用 MPS (Metal Performance Shaders)
├── PyTorch 通过 MPS 加速
└── 不支持 CUDA

Intel Mac:
├── 支持 CUDA (较老 GPU)
└── 建议使用 Linux 虚拟机或 Docker
```

---

## 📚 进阶配置

### 多 CUDA 版本管理

```bash
# 安装多个 CUDA 版本
sudo apt install cuda-11-8 cuda-12-1

# 切换版本
export PATH=/usr/local/cuda-12.1/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.1/lib64:$LD_LIBRARY_PATH
```

### WSL2 性能优化

```ini
# .wslconfig (Windows 用户目录)
[wsl2]
memory=16GB
processors=8
swap=2GB
```

### Docker GPU 支持

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 🔗 相关资源

### 官方文档
- CUDA Toolkit: https://developer.nvidia.com/cuda-toolkit
- WSL 官方文档: https://learn.microsoft.com/en-us/windows/wsl/
- PyTorch CUDA: https://pytorch.org/get-started/locally/

### KINXKit 集成
- CUDA 在 KINXKit 中的应用: `CLAUDE.md` → 环境检测器
- WSL 在 KINXKit 中的应用: `CLAUDE.md` → 开发环境配置

---

## 📝 配置检查表

### Windows 用户

- [ ] 安装 WSL2
- [ ] 安装 Ubuntu 22.04 LTS
- [ ] 安装 NVIDIA WSL2 驱动 (如有 GPU)
- [ ] 验证 `nvidia-smi` 在 WSL2 中可用
- [ ] 安装 Docker Desktop for Windows
- [ ] 启用 Docker WSL2 集成
- [ ] 配置 Git 凭据
- [ ] 配置代理 (如需要)

### Linux 用户

- [ ] 安装 NVIDIA 驱动
- [ ] 安装 CUDA Toolkit
- [ ] 安装 cuDNN (可选)
- [ ] 安装 Docker Engine
- [ ] 配置 NVIDIA Container Toolkit
- [ ] 验证 GPU 访问
- [ ] 配置 Git 凭据
- [ ] 配置代理 (如需要)

---

*最后更新: 2025-03-06*
