"""
数据可视化模块
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Optional, List, Dict, Any
import numpy as np


class DataVisualizer:
    """数据可视化器"""

    def __init__(self, df: pd.DataFrame, style: str = 'whitegrid'):
        """
        初始化可视化器

        Args:
            df: 要可视化的 DataFrame
            style: Seaborn 样式 ('whitegrid', 'darkgrid', 'white', 'dark', 'ticks')
        """
        self.df = df
        sns.set_style(style)
        plt.rcParams['font.sans-serif'] = ['SimHei']  # 中文字体
        plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

    def plot_histogram(
        self,
        column: str,
        bins: int = 30,
        figsize: tuple = (10, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制直方图

        Args:
            column: 列名
            bins: 箱数
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        self.df[column].hist(bins=bins, ax=ax, edgecolor='black', alpha=0.7)

        ax.set_xlabel(column)
        ax.set_ylabel('频数')
        ax.set_title(title or f'{column} 分布')

        plt.tight_layout()
        return ax

    def plot_boxplot(
        self,
        column: str,
        by: Optional[str] = None,
        figsize: tuple = (10, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制箱线图

        Args:
            column: 列名
            by: 分组列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        if by:
            self.df.boxplot(column=column, by=by, ax=ax)
        else:
            self.df.boxplot(column=column, ax=ax)

        ax.set_title(title or f'{column} 箱线图')
        plt.tight_layout()
        return ax

    def plot_scatter(
        self,
        x: str,
        y: str,
        hue: Optional[str] = None,
        figsize: tuple = (10, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制散点图

        Args:
            x: x 轴列名
            y: y 轴列名
            hue: 颜色分组列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        if hue:
            for group in self.df[hue].unique():
                data = self.df[self.df[hue] == group]
                ax.scatter(data[x], data[y], label=group, alpha=0.6)
            ax.legend()
        else:
            ax.scatter(self.df[x], self.df[y], alpha=0.6)

        ax.set_xlabel(x)
        ax.set_ylabel(y)
        ax.set_title(title or f'{x} vs {y}')

        plt.tight_layout()
        return ax

    def plot_line(
        self,
        x: str,
        y: str,
        figsize: tuple = (12, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制折线图

        Args:
            x: x 轴列名
            y: y 轴列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        ax.plot(self.df[x], self.df[y], marker='o', linestyle='-', linewidth=2)

        ax.set_xlabel(x)
        ax.set_ylabel(y)
        ax.set_title(title or f'{y} 随 {x} 变化趋势')

        plt.xticks(rotation=45)
        plt.tight_layout()
        return ax

    def plot_bar(
        self,
        x: str,
        y: str,
        figsize: tuple = (10, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制柱状图

        Args:
            x: x 轴列名
            y: y 轴列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        ax.bar(self.df[x], self.df[y])

        ax.set_xlabel(x)
        ax.set_ylabel(y)
        ax.set_title(title or f'{y} by {x}')

        plt.xticks(rotation=45)
        plt.tight_layout()
        return ax

    def plot_heatmap(
        self,
        figsize: tuple = (10, 8),
        title: Optional[str] = None,
        annot: bool = True
    ) -> plt.Axes:
        """
        绘制相关性热力图

        Args:
            figsize: 图形大小
            title: 标题
            annot: 是否显示数值

        Returns:
            matplotlib Axes 对象
        """
        # 计算相关性矩阵
        corr = self.df.corr(numeric_only=True)

        fig, ax = plt.subplots(figsize=figsize)

        sns.heatmap(
            corr,
            annot=annot,
            cmap='coolwarm',
            center=0,
            ax=ax,
            square=True
        )

        ax.set_title(title or '相关性热力图')

        plt.tight_layout()
        return ax

    def plot_distribution(
        self,
        column: str,
        figsize: tuple = (10, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制分布图（直方图 + KDE）

        Args:
            column: 列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        fig, ax = plt.subplots(figsize=figsize)

        self.df[column].hist(bins=30, ax=ax, density=True, alpha=0.7, edgecolor='black')
        self.df[column].plot.kde(ax=ax, color='red', linewidth=2)

        ax.set_xlabel(column)
        ax.set_ylabel('密度')
        ax.set_title(title or f'{column} 分布')

        plt.tight_layout()
        return ax

    def plot_pair(
        self,
        columns: Optional[List[str]] = None,
        hue: Optional[str] = None,
        figsize: tuple = (12, 12)
    ) -> plt.Axes:
        """
        绘制配对图

        Args:
            columns: 要绘制的列名列表
            hue: 颜色分组列名
            figsize: 图形大小

        Returns:
            matplotlib Axes 对象
        """
        df_subset = self.df[columns] if columns else self_df

        g = sns.pairplot(df_subset, hue=hue, height=3)
        g.fig.set_size_inches(*figsize)

        return g

    def plot_time_series(
        self,
        date_column: str,
        value_column: str,
        figsize: tuple = (14, 6),
        title: Optional[str] = None
    ) -> plt.Axes:
        """
        绘制时间序列图

        Args:
            date_column: 日期列名
            value_column: 值列名
            figsize: 图形大小
            title: 标题

        Returns:
            matplotlib Axes 对象
        """
        df = self.df.copy()
        df[date_column] = pd.to_datetime(df[date_column])

        fig, ax = plt.subplots(figsize=figsize)

        ax.plot(df[date_column], df[value_column], linewidth=2)

        ax.set_xlabel('日期')
        ax.set_ylabel(value_column)
        ax.set_title(title or f'{value_column} 时间序列')

        plt.xticks(rotation=45)
        plt.tight_layout()
        return ax

    def save_figure(self, filename: str, dpi: int = 300) -> None:
        """
        保存当前图形

        Args:
            filename: 文件名
            dpi: 分辨率
        """
        plt.savefig(filename, dpi=dpi, bbox_inches='tight')
        print(f"图形已保存到: {filename}")

    def show(self) -> None:
        """显示图形"""
        plt.show()

    def close(self) -> None:
        """关闭当前图形"""
        plt.close()
