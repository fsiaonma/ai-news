---
title: "实战 · 会话管理"
description: "阶段三 Lab：Redis/DB 会话持久化与多会话管理（第 5 周）"
---

# 实战 · 会话管理

## 学习目标

- 会话存 Redis 或 PostgreSQL，刷新可恢复
- 多 session 列表、切换、删除
- 可选导出 JSON 聊天记录

## 引言

没有持久化就没有「产品感」。第 5 周专注会话工程，为 RAG 阶段铺路。

## 章节正文

### 第 1 步：数据模型与 API

```
sessions: { id, user_id, title, created_at, updated_at }
messages: { id, session_id, role, content, created_at }
```

**实践任务**
- [ ] POST /sessions 创建
- [ ] GET /sessions 列表
- [ ] GET /sessions/:id/messages
- [ ] POST /sessions/:id/messages 追加
- [ ] DELETE /sessions/:id
- [ ] Redis 缓存热 session 或全量 Postgres

### 第 2 步：前端与验收

**实践任务**
- [ ] 左侧会话列表，点击切换
- [ ] 刷新页面后当前 session 消息仍在
- [ ] 新建 / 删除 session
- [ ] 首条 user 消息自动摘要为 title（可调 LLM 或截断）

**验收标准**
- [ ] 刷新后对话恢复
- [ ] 多 session 互不串消息
- [ ] 支持导出单 session JSON
- [ ] 说明 Redis vs DB 选型理由

**关联章节**
- [长期记忆](../04-rag-memory/4.8-memory长期记忆.md)
- [上下文工程](../05-agent-engineering/5.4-context-engineering.md)

## 动手练习

1. 压测 10 个并行 session 无串线
2. 实现 30 天前 session 自动归档策略（设计即可）

## 本节小结

阶段三：session/message 模型 + CRUD + 多会话 UI；刷新恢复是硬验收项。
