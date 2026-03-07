# Node.js Web 应用项目

基于 Express.js 和 TypeScript 的 Web 应用项目模板。

## 功能特性

- ⚡ Express.js 框架
- 🔷 TypeScript 支持
- 🛡️ 安全中间件 (Helmet)
- 🌐 CORS 支持
- 📝 日志记录 (Morgan)
- 🔧 环境变量配置
- 🧪 Jest 测试框架
- 🐳 Docker 支持

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建项目
npm run build

# 生产模式
npm start
```

### Docker 运行

```bash
# 构建镜像
docker build -t web-app .

# 运行容器
docker run -p 3000:3000 web-app
```

## 项目结构

```
web-app/
├── src/
│   ├── index.ts              # 应用入口
│   ├── app.ts                # Express 应用配置
│   ├── routes/               # 路由定义
│   │   ├── index.ts
│   │   ├── health.ts         # 健康检查路由
│   │   └── api.ts            # API 路由
│   ├── controllers/          # 控制器
│   ├── middleware/           # 中间件
│   │   ├── error.ts          # 错误处理
│   │   └── logger.ts         # 日志中间件
│   └── types/                # TypeScript 类型定义
├── tests/                    # 测试文件
├── dist/                     # 编译输出
├── Dockerfile                # Docker 配置
├── docker-compose.yml        # Docker Compose 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目配置
└── README.md                # 本文件
```

## API 端点

### 健康检查

```
GET /health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 示例 API

```
GET /api/hello
```

响应：
```json
{
  "message": "Hello from Express + TypeScript!"
}
```

## 配置

### 环境变量

创建 `.env` 文件：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 日志配置
LOG_LEVEL=info

# CORS 配置
CORS_ORIGIN=*
```

## 开发指南

### 添加新的路由

在 `src/routes/` 目录下创建新的路由文件：

```typescript
// src/routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

export default router;
```

然后在 `src/app.ts` 中注册：

```typescript
import userRoutes from './routes/users';
app.use('/api/users', userRoutes);
```

### 添加中间件

在 `src/middleware/` 目录下创建中间件：

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 验证逻辑
  next();
};
```

### 错误处理

应用已经配置了全局错误处理中间件。在路由中抛出错误：

```typescript
throw new Error('Something went wrong');
```

或使用 HTTP 错误：

```typescript
res.status(404).json({ error: 'Not found' });
```

## 测试

```bash
# 运行测试
npm test

# 监视模式
npm test -- --watch

# 覆盖率报告
npm test -- --coverage
```

## 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 部署

### 构建

```bash
npm run build
```

### Docker 部署

```bash
docker build -t web-app .
docker run -p 3000:3000 -e NODE_ENV=production web-app
```

### Docker Compose

```bash
docker-compose up -d
```

## 性能优化建议

1. **启用 gzip 压缩**：添加 `compression` 中间件
2. **使用集群模式**：利用 `cluster` 模块
3. **缓存静态资源**：配置 `express-static-cache`
4. **数据库连接池**：使用连接池管理数据库连接

## 安全建议

1. **Helmet**：已配置，设置安全相关的 HTTP 头
2. **CORS**：已配置，根据需要调整允许的来源
3. **Rate Limiting**：建议添加 `express-rate-limit`
4. **输入验证**：使用 `joi` 或 `zod` 验证用户输入
5. **SQL 注入**：使用 ORM 或参数化查询

## 常见问题

### Q: 如何修改端口？

A: 修改 `.env` 文件中的 `PORT` 变量。

### Q: 如何添加数据库？

A: 安装相应的数据库驱动（如 `pg` for PostgreSQL），然后创建数据库连接。

### Q: 如何添加身份验证？

A: 可以使用 Passport.js 或 JWT，在 `src/middleware/` 目录下创建认证中间件。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
