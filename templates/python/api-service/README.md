# {{projectName}}

{{description}}

## 技术栈

- **后端**: FastAPI {{python_version}}
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **迁移**: Alembic
- **容器化**: Docker

## 快速开始

### 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env

# 启动数据库
docker-compose up -d db

# 运行迁移
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
{{projectName}}/
├── app/
│   ├── main.py          # FastAPI 应用
│   ├── models.py        # 数据模型
│   ├── schemas.py       # Pydantic 模式
│   ├── database.py      # 数据库连接
│   ├── crud/            # CRUD 操作
│   ├── routers/         # API 路由
│   └── config.py        # 配置管理
├── alembic/             # 数据库迁移
├── tests/               # 测试文件
├── requirements.txt     # Python 依赖
├── Dockerfile           # Docker 配置
└── docker-compose.yml   # Docker Compose 配置
```

## 开发指南

### 添加新的 API 端点

1. 在 `app/routers/` 创建新的路由文件
2. 在 `app/crud/` 添加 CRUD 操作
3. 在 `app/models/` 添加数据模型
4. 在 `app/schemas/` 添加 Pydantic 模式
5. 在 `app/main.py` 注册路由

### 数据库迁移

```bash
# 创建新迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 测试

```bash
# 运行测试
pytest

# 运行测试并查看覆盖率
pytest --cov=app --cov-report=html
```

## 许可证

MIT
