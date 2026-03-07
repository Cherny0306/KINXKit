# Python 数据分析项目

基于 Pandas、NumPy 和 Matplotlib 的数据分析项目模板。

## 功能特性

- 📊 数据处理：Pandas DataFrame 操作
- 📈 数据可视化：Matplotlib + Seaborn
- 🔬 科学计算：NumPy + SciPy
- 📓 交互式分析：Jupyter Notebook
- 🤖 机器学习：Scikit-learn
- 🐳 Docker 支持

## 快速开始

### 本地运行

```bash
# 安装依赖
pip install -r requirements.txt

# 启动 Jupyter Lab
jupyter lab

# 或启动 Jupyter Notebook
jupyter notebook
```

### Docker 运行

```bash
# 构建镜像
docker build -t data-analysis .

# 运行容器
docker run -p 8888:8888 -v $(pwd)/notebooks:/workspace/notebooks data-analysis
```

## 项目结构

```
data-analysis/
├── app/                    # Python 源代码
│   ├── __init__.py
│   ├── data_loader.py      # 数据加载模块
│   ├── analyzer.py         # 数据分析模块
│   └── visualizer.py       # 数据可视化模块
├── notebooks/              # Jupyter Notebooks
│   └── example.ipynb       # 示例笔记本
├── data/                   # 数据文件目录
│   └── .gitkeep
├── tests/                  # 测试文件
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── requirements.txt        # Python 依赖
└── README.md              # 本文件
```

## 使用示例

### 数据分析

```python
from app.data_loader import DataLoader
from app.analyzer import DataAnalyzer
from app.visualizer import DataVisualizer

# 加载数据
loader = DataLoader()
df = loader.load_csv('data/sample.csv')

# 分析数据
analyzer = DataAnalyzer(df)
stats = analyzer.get_statistics()

# 可视化
visualizer = DataVisualizer(df)
visualizer.plot_histogram()
```

## 配置

### 环境变量

创建 `.env` 文件：

```env
# Jupyter 配置
JUPYTER_PORT=8888
JUPYTER_TOKEN=your_token_here

# 数据路径
DATA_PATH=./data
NOTEBOOKS_PATH=./notebooks
```

## 依赖说明

- **pandas**: 数据处理和分析
- **numpy**: 数值计算
- **matplotlib**: 基础绘图
- **seaborn**: 高级统计图表
- **jupyter**: 交互式笔记本
- **scipy**: 科学计算
- **scikit-learn**: 机器学习

## 开发指南

### 添加新的分析模块

在 `app/` 目录下创建新的 Python 文件：

```python
# app/custom_analyzer.py
import pandas as pd

class CustomAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def your_method(self):
        # 实现你的分析方法
        pass
```

### 创建新的 Notebook

```bash
# 启动 Jupyter
jupyter lab

# 在 notebooks/ 目录创建新的 .ipynb 文件
```

## 常见问题

### Q: 如何安装额外的 Python 库？

A: 修改 `requirements.txt`，添加新的依赖，然后重新构建镜像：

```bash
pip install new-package
pip freeze > requirements.txt
```

### Q: 数据文件应该放在哪里？

A: 将数据文件放在 `data/` 目录下，或者通过环境变量 `DATA_PATH` 指定。

### Q: 如何导出 Notebook 为 Python 脚本？

A: 使用 Jupyter 的转换功能：

```bash
jupyter nbconvert --to script notebooks/your_notebook.ipynb
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
