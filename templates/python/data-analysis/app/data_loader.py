"""
数据加载模块
"""

import pandas as pd
from pathlib import Path
from typing import Optional
import os


class DataLoader:
    """数据加载器"""

    def __init__(self, base_path: Optional[str] = None):
        """
        初始化数据加载器

        Args:
            base_path: 数据文件基础路径，默认为环境变量 DATA_PATH 或 ./data
        """
        self.base_path = base_path or os.getenv('DATA_PATH', './data')

    def load_csv(
        self,
        filename: str,
        encoding: str = 'utf-8',
        **kwargs
    ) -> pd.DataFrame:
        """
        加载 CSV 文件

        Args:
            filename: 文件名
            encoding: 文件编码
            **kwargs: pandas.read_csv 的其他参数

        Returns:
            DataFrame 对象
        """
        filepath = Path(self.base_path) / filename

        if not filepath.exists():
            raise FileNotFoundError(f"文件不存在: {filepath}")

        return pd.read_csv(filepath, encoding=encoding, **kwargs)

    def load_excel(
        self,
        filename: str,
        sheet_name: str = 0,
        **kwargs
    ) -> pd.DataFrame:
        """
        加载 Excel 文件

        Args:
            filename: 文件名
            sheet_name: 工作表名称或索引
            **kwargs: pandas.read_excel 的其他参数

        Returns:
            DataFrame 对象
        """
        filepath = Path(self.base_path) / filename

        if not filepath.exists():
            raise FileNotFoundError(f"文件不存在: {filepath}")

        return pd.read_excel(filepath, sheet_name=sheet_name, **kwargs)

    def load_json(
        self,
        filename: str,
        **kwargs
    ) -> pd.DataFrame:
        """
        加载 JSON 文件

        Args:
            filename: 文件名
            **kwargs: pandas.read_json 的其他参数

        Returns:
            DataFrame 对象
        """
        filepath = Path(self.base_path) / filename

        if not filepath.exists():
            raise FileNotFoundError(f"文件不存在: {filepath}")

        return pd.read_json(filepath, **kwargs)

    def save_csv(
        self,
        df: pd.DataFrame,
        filename: str,
        encoding: str = 'utf-8',
        **kwargs
    ) -> None:
        """
        保存为 CSV 文件

        Args:
            df: DataFrame 对象
            filename: 文件名
            encoding: 文件编码
            **kwargs: df.to_csv 的其他参数
        """
        filepath = Path(self.base_path) / filename

        # 确保目录存在
        filepath.parent.mkdir(parents=True, exist_ok=True)

        df.to_csv(filepath, encoding=encoding, **kwargs)

    def save_excel(
        self,
        df: pd.DataFrame,
        filename: str,
        sheet_name: str = 'Sheet1',
        **kwargs
    ) -> None:
        """
        保存为 Excel 文件

        Args:
            df: DataFrame 对象
            filename: 文件名
            sheet_name: 工作表名称
            **kwargs: df.to_excel 的其他参数
        """
        filepath = Path(self.base_path) / filename

        # 确保目录存在
        filepath.parent.mkdir(parents=True, exist_ok=True)

        df.to_excel(filepath, sheet_name=sheet_name, **kwargs)
