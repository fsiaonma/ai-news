---
title: "实战 · 流式 API"
description: "阶段一 Lab：LLM API、流式对话、参数调试与错误处理（第 1–2 周）"
---

# 实战 · 流式 API

## 学习目标

- 封装可复用的 /api/chat 后端与流式前端
- 调试 Temperature、Top P、Max Tokens 对输出的影响
- 实现对话历史、错误提示与重试

## 引言

阶段一是全课程地基。按**周计划**推进，每周结束对照验收标准自检。代码风格参考 2.x：先跑通最小路径，再叠加历史与错误处理。

## 章节正文

### 第 1 步：第 1 周：最小 Chat API

**目标**：非流式对话跑通。

```javascript
// app/api/chat/route.js (Next.js 示例)
export async function POST(req) {
  const { messages } = await req.json()
  const res = await fetch(process.env.LLM_BASE_URL + "/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    return Response.json({ error: "upstream_failed", status: res.status }, { status: 502 })
  }
  const data = await res.json()
  return Response.json({ reply: data.choices[0].message.content })
}
```

**实践任务（Week 1）**
- [ ] 申请至少一家模型 API Key（OpenAI / DeepSeek / 通义等）
- [ ] 配置 `.env`，**勿提交 Git**
- [ ] 实现 POST `/api/chat`，body: `{ messages: [{role, content}] }`
- [ ] 前端单页：输入框 + 发送 + 展示回复
- [ ] 固定 System Prompt：「你是简洁中文助手」

**Week 1 验收**
- [ ] curl 或前端能收到模型回复
- [ ] 能区分 system / user 消息
- [ ] API 失败返回 JSON error，非 500 空白页

### 第 2 步：第 2 周：流式、参数与历史

**流式接口**（对齐 2.4）：

```javascript
const res = await fetch(url, { method: "POST", body, headers })
const reader = res.body.getReader()
const decoder = new TextDecoder()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  // 解析 SSE data: 行，累加 delta.content
}
```

**实践任务（Week 2）**
- [ ] 增加 `stream: true`，前端逐字渲染
- [ ] 设置面板：Temperature、Top P、Max Tokens，改参后对比同一问题
- [ ] 内存维护 `messages[]` 多轮历史（至少 5 轮）
- [ ] AbortController「停止生成」
- [ ] 失败时 UI 提示 + 「重试」按钮（最多 3 次）

**Week 2 验收标准**
- [ ] 能调用至少一家模型 API
- [ ] 能展示逐字流式输出
- [ ] 口头或文档解释 Temperature、Top P、Max Tokens
- [ ] 能区分 System Prompt 与 User Prompt
- [ ] API 失败有用户可见错误与重试

**关联章节**
- [生成参数控制](../02-api-prompt/2.2-模型参数与生成控制.md)
- [对话消息结构](../02-api-prompt/2.3-对话消息结构.md)
- [Prompt 工程](../02-api-prompt/2.5-Prompt工程.md)

## 动手练习

1. 提交 Week 2 验收清单截图或录屏（流式 + 改参 + 停止）
2. 写 200 字：低 Temperature 适合什么场景？

## 本节小结

阶段一 2 周：Week1 非流式 API，Week2 流式+参数+历史+错误处理；对照验收清单过关再进阶段二。
