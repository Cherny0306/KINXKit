# CUDA 安装与配置指南

> 适用于 Windows、Linux、macOS 的 CUDA 开发环境配置

---

## 📋 目录

- [一、CUDA 简介](#一cuda-简介)
- [二、系统要求](#二系统要求)
- [三、Windows 安装](#三windows-安装)
- [四、Linux 安装](#四linux-安装)
- [五、WSL2 安装](#五wsl2-安装)
- [六、验证安装](#六验证安装)
- [七、常见问题](#七常见问题)
- [八、版本管理](#八版本管理)

---

## 一、CUDA 简介

### 什么是 CUDA

```
CUDA (Compute Unified Device Architecture)
├── NVIDIA 推出的并行计算平台
├── 允许开发者使用 GPU 进行通用计算
├── 支持 C/C++、Python、Fortran 等语言
└── 广泛应用于：
    ├── 深度学习框架 (PyTorch、TensorFlow)
    ├── 科学计算
    ├── 数据分析
    └── 视频渲染
```

### 为什么需要 CUDA

| 应用场景 | 说明 |
|----------|------|
| **深度学习** | GPU 加速训练和推理，速度提升 10-100x |
| **科学计算** | 大规模并行计算，模拟、仿真 |
| **数据分析** | Pandas、CuDF 加速数据处理 |
| **视频处理** | 视频编码、解码、渲染加速 |
| **密码学** | 哈希计算、加密解密加速 |

---

## 二、系统要求

### 硬件要求

```
GPU 要求:
├── NVIDIA GeForce 系列 (GTX 1060 或更高)
├── NVIDIA RTX 系列 (RTX 2060 或更高)
├── NVIDIA Quadro 系列
└── NVIDIA Tesla 系列

最低显存:
├── 深度学习: 推荐 8GB+
├── 数据分析: 推荐 6GB+
└── 轻度使用: 4GB+ (可能不够)
```

### 软件要求

| 操作系统 | 最低版本 | 推荐版本 |
|----------|----------|----------|
| **Windows** | Windows 10/11 | Windows 11 |
| **Linux** | 内核 3.10+ | Ubuntu 20.04/22.04 |
| **WSL2** | Windows 10 2004+ | Windows 11 |
| **macOS** | 不支持 | 使用 Metal Performance Shaders |

### 驱动要求

```
NVIDIA 驱动版本:
├── CUDA 12.x: 驱动版本 >= 525.60.13
├── CUDA 11.x: 驱动版本 >= 450.80.02
└── 查看当前驱动: nvidia-smi
```

---

## 三、Windows 安装

### 步骤 1: 检查 GPU 和驱动

```powershell
# 在 PowerShell 或 CMD 中运行

# 1. 检查 GPU 信息
nvidia-smi

# 输出示例:
# +-----------------------------------------------------------------------------+
# | NVIDIA-SMI 531.14       Driver Version: 531.14       CUDA Version: 12.1     |
# |-------------------------------+----------------------+----------------------+
# | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
# |   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0  On |                  N/A |
# +-------------------------------+----------------------+----------------------+
```

### 步骤 2: 下载 CUDA Toolkit

```
访问 NVIDIA CUDA 下载页面:
https://developer.nvidia.com/cuda-downloads

选择:
├── Operating System: Windows
├── Architecture: x86_64
├── Version: 11 (推荐) 或 12
├── Installer Type: exe (local)
└── Base Installer: 下载完整安装包 (约 3GB)
```

### 步骤 3: 安装 CUDA Toolkit

```
1. 运行下载的 .exe 文件
2. 安装向导选项:
   ☑ 安装 NVIDIA GeForce Experience (可选)
   ☑ 安装 CUDA Toolkit
   ☑ 安装 CUDA Runtime
   ☑ 安装 CUDA Development
   ☑ 安装 Visual Studio Integration (如果使用 VS)

3. 选择安装路径 (默认):
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1

4. 等待安装完成 (5-10分钟)
```

### 步骤 4: 配置环境变量

```
手动配置 (如果安装程序未自动配置):

1. 打开环境变量设置:
   系统属性 → 高级 → 环境变量

2. 在 Path 中添加:
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\libnvvp

3. 新建系统变量:
   CUDA_PATH = C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1
```

### 步骤 5: 安装 cuDNN (可选，但推荐)

```
1. 下载 cuDNN:
   https://developer.nvidia.com/cudnn
   (需要注册 NVIDIA 开发者账号)

2. 解压下载的 zip 文件

3. 复制文件到 CUDA 目录:
   cuda\bin\*.dll → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin
   cuda\include\*.h → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\include
   cuda\lib\x64\*.lib → C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\lib\x64
```

---

## 四、Linux 安装

### Ubuntu/Debian 安装

```bash
# ========== 步骤 1: 检查 GPU ==========
lspci | grep -i nvidia

# ========== 步骤 2: 安装 NVIDIA 驱动 ==========
# 方法 A: 使用 Ubuntu 驱动管理器 (推荐新手)
sudo apt update
sudo apt install ubuntu-drivers-common
sudo ubuntu-drivers autoinstall
# 重启系统
sudo reboot

# 方法 B: 手动安装指定版本
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
ubuntu-drivers devices
# 安装推荐版本
sudo apt install nvidia-driver-535
sudo reboot

# ========== 步骤 3: 验证驱动 ==========
nvidia-smi

# ========== 步骤 4: 安装 CUDA Toolkit ==========
# 方法 A: 使用 apt (推荐)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda

# 方法 B: 使用 runfile
wget https://developer.download.nvidia.com/compute/cuda/12.1.0/local_installers/cuda_12.1.0_530.30.02_linux.run
sudo sh cuda_12.1.0_530.30.02_linux.run

# 安装选项:
# ☑ Toolkit
# ☐ Driver (已安装则不选)
# ☑ CUDA Samples
# ☑ CUDA Demo Suite

# ========== 步骤 5: 配置环境变量 ==========
echo 'export PATH=/usr/local/cuda-12.1/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.1/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# ========== 步骤 6: 安装 cuDNN ==========
# 下载后解压
sudo cp cudnn-linux-x86_64-8.*.cuda12.1_archive/include/cudnn*.h /usr/local/cuda/include
sudo cp -P cudnn-linux-x86_64-8.*.cuda12.1_archive/lib/libcudnn* /usr/local/cuda/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
```

---

## 五、WSL2 安装

### WSL2 + CUDA 优势

```
Windows + WSL2 + CUDA:
├── Windows 图形界面和办公
├── WSL2 Linux 开发环境
├── 原生 GPU 加速 (无需虚拟化损耗)
└── 适合深度学习开发
```

### 安装步骤

```powershell
# ========== 步骤 1: 启用 WSL ==========
# 以管理员身份运行 PowerShell

# 启用 WSL 功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 重启计算机

# ========== 步骤 2: 设置 WSL 2 为默认 ==========
wsl --set-default-version 2

# ========== 步骤 3: 安装 Ubuntu ==========
# 从 Microsoft Store 安装 Ubuntu 22.04 LTS
# 或使用命令行:
wsl --install -d Ubuntu-22.04

# ========== 步骤 4: 在 WSL2 中安装 NVIDIA 驱动 ==========
# 下载 WSL2 专用驱动
https://developer.nvidia.com/cuda/wsl

# 安装后，在 WSL2 中验证
wsl
nvidia-smi

# ========== 步骤 5: 在 WSL2 中安装 CUDA Toolkit ==========
# 参考 Linux 安装步骤

# ========== 步骤 6: 安装深度学习框架 ==========
# PyTorch with CUDA
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# TensorFlow with CUDA
pip3 install tensorflow[and-cuda]
```

### WSL2 注意事项

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| **路径映射** | Windows 路径在 `/mnt/c` | 使用 `\\wsl$\Ubuntu\home` 访问 WSL 文件 |
| **内存占用** | WSL2 可能占用大量内存 | 限制 `.wslconfig` 中的 memory |
| **GPU 转发** | 部分 GPU 功能不支持 | 使用 WSL2 支持的 CUDA 版本 |
| **性能** | IO 性能略有损耗 | 将工作文件放在 WSL 文件系统中 |

---

## 六、验证安装

### 验证步骤

```bash
# ========== 1. 检查 NVIDIA 驱动 ==========
nvidia-smi

# 应该看到:
# - GPU 型号
# - 驱动版本
# - CUDA 版本

# ========== 2. 检查 CUDA 编译器 ==========
nvcc --version

# 应该看到:
# nvcc: NVIDIA (R) Cuda compiler driver
# Copyright (c) 2005-2024 NVIDIA Corporation
# Built on ...
# Cuda compilation tools, release 12.1, V12.1.xxx

# ========== 3. 编译测试程序 ==========
cat > hello_cuda.cu << 'EOF'
#include <stdio.h>

__global__ void cuda_hello(){
    printf("Hello World from GPU!\n");
}

int main() {
    cuda_hello<<<1,1>>>();
    cudaDeviceSynchronize();
    return 0;
}
EOF

# 编译
nvcc hello_cuda.cu -o hello_cuda

# 运行
./hello_cuda
# 输出: Hello World from GPU!

# ========== 4. Python 验证 ==========
python3 << 'EOF'
import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
    # 测试计算
    x = torch.randn(1000, 1000).cuda()
    y = torch.randn(1000, 1000).cuda()
    z = torch.matmul(x, y)
    print(f"Matrix multiplication on GPU: {z.device}")
EOF
```

### 验证清单

- [ ] `nvidia-smi` 正常显示 GPU 信息
- [ ] `nvcc --version` 正常显示编译器版本
- [ ] CUDA 测试程序编译运行成功
- [ ] PyTorch 能识别并使用 GPU
- [ ] TensorFlow 能识别并使用 GPU (可选)

---

## 七、常见问题

### Q1: nvidia-smi 找不到命令

```
问题: Command 'nvidia-smi' not found

解决:
1. 检查驱动是否安装
2. 检查环境变量 PATH
3. Windows: 添加到 C:\Program Files\NVIDIA Corporation\NVSMI
4. Linux: 重启系统
```

### Q2: CUDA 版本不匹配

```
问题: CUDA runtime version (12.1) vs driver version (11.8)

解决:
1. 更新 NVIDIA 驱动到最新版本
2. 或安装与驱动匹配的 CUDA 版本
3. 查看驱动支持的 CUDA 版本: nvidia-smi
```

### Q3: PyTorch 无法识别 GPU

```
问题: torch.cuda.is_available() 返回 False

解决:
1. 检查 CUDA 安装: nvcc --version
2. 检查驱动: nvidia-smi
3. 重新安装 PyTorch with CUDA:
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
4. 检查 PyTorch CUDA 版本: torch.version.cuda
```

### Q4: WSL2 中无法使用 GPU

```
问题: WSL2 中 nvidia-smi 报错

解决:
1. 确认安装了 WSL2 专用驱动
2. 检查 Windows 驱动版本 >= 470.42
3. 更新到 Windows 11 或 Windows 10 最新版本
4. 重启 WSL: wsl --shutdown
```

### Q5: CUDA out of memory

```
问题: 运行大模型时显存不足

解决:
1. 减小 batch size
2. 使用梯度累积
3. 使用混合精度训练 (FP16)
4. 使用梯度检查点
5. 清理 GPU 缓存:
   torch.cuda.empty_cache()
```

---

## 八、版本管理

### CUDA 版本选择

```
推荐版本:
├── CUDA 11.8 (稳定，大部分框架支持)
├── CUDA 12.1 (最新，性能更好)
└── CUDA 12.4 (最新特性，可能不兼容)

版本对应:
├── PyTorch 2.1+: CUDA 11.8 或 12.1
├── TensorFlow 2.13+: CUDA 11.8 或 12.1
└── TensorFlow 2.15+: CUDA 12.x
```

### 版本兼容性

| 框架 | CUDA 11.8 | CUDA 12.1 | CUDA 12.4 |
|------|-----------|-----------|-----------|
| PyTorch 2.0+ | ✅ | ✅ | ✅ |
| PyTorch 2.1+ | ✅ | ✅ | ✅ |
| TensorFlow 2.13 | ✅ | ✅ | ❌ |
| TensorFlow 2.15 | ✅ | ✅ | ✅ |
| JAX 0.4+ | ✅ | ✅ | ✅ |

---

## 九、参考资源

### 官方文档

- CUDA Toolkit: https://developer.nvidia.com/cuda-toolkit
- CUDA Downloads: https://developer.nvidia.com/cuda-downloads
- cuDNN: https://developer.nvidia.com/cudnn
- WSL2 + CUDA: https://developer.nvidia.com/cuda/wsl

---

*最后更新: 2025-03-06*
