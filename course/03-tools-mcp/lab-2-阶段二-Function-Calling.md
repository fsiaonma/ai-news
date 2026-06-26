---
title: "实战 · Tool Calling"
description: "阶段二 Lab：三工具 + ReAct 循环 + 前端工具可视化（第 3–4 周）"
---

# 实战 · Tool Calling

## 学习目标

- 实现 weather、calculator、web_fetch 三个工具
- 手写或框架实现 ReAct / Tool Calling 循环
- 前端展示工具名、参数与结果

## 引言

阶段二让模型**能行动**。第 3 周做工具与单步调用，第 4 周闭合 Agent Loop。

## 章节正文

### 第 1 步：第 3 周：三个工具

**实践任务**
- [ ] `get_weather(city)` — mock 或真实 API
- [ ] `calculate(expression)` — safe eval 或 math 库
- [ ] `fetch_url(url)` — 抓取正文前 2000 字（防 SSRF：仅 allowlist 域名）
- [ ] 为每个工具写 JSON Schema description
- [ ] 单测：给定输入，断言输出格式

**验收（Week 3）**
- [ ] 三个工具独立可调用
- [ ] Schema 含类型与描述
- [ ] fetch 有 SSRF 防护说明

### 第 2 步：第 4 周：Agent Loop

**实践任务**
- [ ] 实现循环：LLM → tool_calls? → 执行 → 结果塞回 messages → 直到无 tool 或达 max_iterations=5
- [ ] 处理工具异常：错误字符串回传模型，勿 crash
- [ ] 前端 Timeline：`思考 → 调用 get_weather → 结果 → 最终回答`
- [ ] 死循环检测：相同 tool+args 连续 2 次则终止

**验收标准**
- [ ] 「北京天气怎样，再算 12*8」一次对话完成
- [ ] 工具失败时模型能换策略或告知用户
- [ ] 循环可终止，不会无限请求
- [ ] 前端可见工具步骤

**关联章节**
- [ReAct 循环](../03-tools-mcp/3.2-react-agent-loop.md)
- [Agent Loop](../05-agent-engineering/5.3-agent-loop工程结构.md)

## 动手练习

1. 录制一次多工具调用完整过程
2. 写 3 条 adversarial 输入测试工具权限

## 本节小结

阶段二 4 周：三工具 + ReAct 循环 + 可视化 + 终止条件；SSRF 与 max_iterations 必做。
