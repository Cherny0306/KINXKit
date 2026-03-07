"""
数据分析模块
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from scipy import stats


class DataAnalyzer:
    """数据分析器"""

    def __init__(self, df: pd.DataFrame):
        """
        初始化数据分析器

        Args:
            df: 要分析的 DataFrame
        """
        self.df = df

    def get_statistics(self) -> pd.DataFrame:
        """
        获取统计信息

        Returns:
            包含统计信息的 DataFrame
        """
        return self.df.describe()

    def get_info(self) -> Dict[str, Any]:
        """
        获取数据集基本信息

        Returns:
            包含基本信息的字典
        """
        return {
            'shape': self.df.shape,
            'columns': list(self.df.columns),
            'dtypes': self.df.dtypes.to_dict(),
            'missing_values': self.df.isnull().sum().to_dict(),
            'memory_usage': self.df.memory_usage(deep=True).sum()
        }

    def get_correlation(self, method: str = 'pearson') -> pd.DataFrame:
        """
        计算相关性矩阵

        Args:
            method: 相关系数方法 ('pearson', 'kendall', 'spearman')

        Returns:
            相关性矩阵
        """
        # 只选择数值型列
        numeric_df = self.df.select_dtypes(include=[np.number])
        return numeric_df.corr(method=method)

    def find_outliers(
        self,
        column: str,
        method: str = 'iqr',
        threshold: float = 1.5
    ) -> pd.DataFrame:
        """
        查找异常值

        Args:
            column: 列名
            method: 检测方法 ('iqr', 'zscore')
            threshold: 阈值

        Returns:
            包含异常值的 DataFrame
        """
        if column not in self.df.columns:
            raise ValueError(f"列不存在: {column}")

        if method == 'iqr':
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR

            outliers = self.df[
                (self.df[column] < lower_bound) |
                (self.df[column] > upper_bound)
            ]

        elif method == 'zscore':
            z_scores = np.abs(stats.zscore(self.df[column].dropna()))
            outliers = self.df[z_scores > threshold]

        else:
            raise ValueError(f"不支持的异常值检测方法: {method}")

        return outliers

    def group_by_and_aggregate(
        self,
        group_column: str,
        agg_column: str,
        agg_func: str = 'mean'
    ) -> pd.DataFrame:
        """
        分组聚合

        Args:
            group_column: 分组列
            agg_column: 聚合列
            agg_func: 聚合函数 ('mean', 'sum', 'count', 'min', 'max', 'std')

        Returns:
            聚合结果
        """
        if group_column not in self.df.columns:
            raise ValueError(f"列不存在: {group_column}")

        if agg_column not in self.df.columns:
            raise ValueError(f"列不存在: {agg_column}")

        return self.df.groupby(group_column)[agg_column].agg(agg_func)

    def filter_data(
        self,
        filters: Dict[str, Any]
    ) -> pd.DataFrame:
        """
        过滤数据

        Args:
            filters: 过滤条件字典，例如 {'column': 'value'} 或 {'column': {'>': 10}}

        Returns:
            过滤后的 DataFrame
        """
        result = self.df.copy()

        for column, condition in filters.items():
            if column not in result.columns:
                continue

            if isinstance(condition, dict):
                operator, value = list(condition.items())[0]

                if operator == '>':
                    result = result[result[column] > value]
                elif operator == '<':
                    result = result[result[column] < value]
                elif operator == '>=':
                    result = result[result[column] >= value]
                elif operator == '<=':
                    result = result[result[column] <= value]
                elif operator == '==':
                    result = result[result[column] == value]
                elif operator == '!=':
                    result = result[result[column] != value]
                elif operator == 'in':
                    result = result[result[column].isin(value)]
                elif operator == 'not_in':
                    result = result[~result[column].isin(value)]
            else:
                result = result[result[column] == condition]

        return result

    def pivot_table(
        self,
        index: str,
        columns: str,
        values: str,
        aggfunc: str = 'mean'
    ) -> pd.DataFrame:
        """
        创建透视表

        Args:
            index: 行索引列
            columns: 列索引列
            values: 值列
            aggfunc: 聚合函数

        Returns:
            透视表
        """
        return self.df.pivot_table(
            index=index,
            columns=columns,
            values=values,
            aggfunc=aggfunc
        )

    def time_series_analysis(
        self,
        date_column: str,
        value_column: str,
        freq: str = 'D'
    ) -> pd.DataFrame:
        """
        时间序列分析

        Args:
            date_column: 日期列名
            value_column: 值列名
            freq: 重采样频率 ('D'=天, 'W'=周, 'M'=月)

        Returns:
            重采样后的时间序列
        """
        df = self.df.copy()

        # 转换日期列
        df[date_column] = pd.to_datetime(df[date_column])

        # 设置为索引
        df = df.set_index(date_column)

        # 重采样
        return df[value_column].resample(freq).mean()

    def compare_groups(
        self,
        group_column: str,
        value_column: str,
        test: str = 'anova'
    ) -> Dict[str, Any]:
        """
        比较不同组别的差异

        Args:
            group_column: 分组列
            value_column: 值列
            test: 统计检验方法 ('anova', 'ttest')

        Returns:
            检验结果
        """
        groups = self.df.groupby(group_column)[value_column].apply(list)

        if test == 'anova':
            statistic, p_value = stats.f_oneway(*groups)
            test_name = 'ANOVA'
        elif test == 'ttest' and len(groups) == 2:
            statistic, p_value = stats.ttest_ind(*groups)
            test_name = '独立样本 t 检验'
        else:
            raise ValueError(f"不支持的检验方法: {test}")

        return {
            'test': test_name,
            'statistic': statistic,
            'p_value': p_value,
            'significant': p_value < 0.05
        }
