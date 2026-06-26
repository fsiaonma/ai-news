---
title: "实战 · LangGraph"
description: "阶段五 Lab：LangChain.js、Vercel AI SDK、LangGraph 与 Trace（第 8 周）"
---

# 实战 · LangGraph

## 学习目标

- 用框架重构阶段二/四 Agent，对比直连 SDK
- 接入 LangSmith 或等价 Trace
- 用 LangGraph 实现带条件分支的工作流

## 引言

阶段五做**工程化升华**：不是重学框架，而是把前四阶段产物迁移到可维护架构，并可观测、可选型。

## 章节正文

### 第 1 步：第 8 周任务清单

**框架迁移**
- [ ] 选 **LangChain.js** 或 **Python LangChain** 重构 RAG 链（LCEL）
- [ ] 用 **Vercel AI SDK**（若 Next.js）暴露 `streamText` / `useChat`
- [ ] 工具 Agent 改用 `create_tool_calling_agent` 或 LangGraph

**可观测**
- [ ] 接入 LangSmith / Langfuse / 自建 trace_id 日志
- [ ] 单次请求可看到：retrieval chunks、tool calls、token usage

**LangGraph 工作流**
- [ ] 实现：用户问 → 分类（FAQ vs 需检索）→ 分支处理 → 汇总
- [ ] 或：RAG → 低置信度 → human_review 节点（mock 自动通过）

**对比报告**
- [ ] 表格：直连 SDK vs 框架（代码行数、可测性、流式、调试耗时）

### 第 2 步：验收标准

**必须全部勾选**
- [ ] 能说明 LangChain、LangGraph、Vercel AI SDK 各自适用场景
- [ ] 能说明何时**不**引入框架、直连 SDK 更合适
- [ ] 能展示一次完整 Trace（含检索或工具 span）
- [ ] 能给出团队框架选型建议（1 页以内）
- [ ] 阶段一至四功能在框架版**回归通过**（基本对话、工具、会话、RAG）

**关联章节**
- [LCEL 与 Runnable](../06-frameworks/6.3-lcel与runnable.md)
- [LangGraph](../06-frameworks/6.6-langgraph.md)
- [Eval 与回归](../07-production/7.1-eval与回归测试.md)
- [部署发布](../07-production/7.8-部署与发布.md)

## 动手练习

1. 提交框架选型 1 页 memo
2. 对框架版跑 promptfoo 子集，对比阶段四 baseline

## 本节小结

阶段五：框架重构 + Vercel AI SDK 流式 + LangGraph 分支 + Trace；输出选型 memo 与回归 Eval。
