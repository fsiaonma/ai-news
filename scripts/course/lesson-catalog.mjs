/**
 * 课时标题目录 — 侧栏与正文 title / h1 统一来源
 * key: 相对 course/ 的路径
 */
export const LESSON_CATALOG = {
  '00-prereq/0.1-python基础.md': 'Python 基础',
  '00-prereq/0.2-深度学习数学.md': '深度学习数学',
  '00-prereq/0.3-nlp-语言模型发展.md': 'NLP 与语言模型',
  '00-prereq/0.4-训练-sft-rlhf.md': '预训练 · SFT · RLHF',
  '00-prereq/0.5-微调基础.md': '微调基础',
  '00-prereq/0.6-轻量化微调.md': 'LoRA 微调',
  '00-prereq/0.7-开源模型行业定制.md': '行业定制',
  '00-prereq/0.8-训练与推理优化.md': '训练推理优化',

  '01-agent-cognition/1.1-ai-ml-dl-llm.md': 'AI · ML · LLM',
  '01-agent-cognition/1.3-transformer-token-embedding.md': 'Transformer 与 Embedding',
  '01-agent-cognition/1.5-国产模型与选型.md': '模型选型',
  '01-agent-cognition/1.6-多模态模型.md': '多模态模型',

  '02-api-prompt/2.1-远程API与本地部署.md': 'API 与本地部署',
  '02-api-prompt/2.2-模型参数与生成控制.md': '生成参数控制',
  '02-api-prompt/2.3-对话消息结构.md': '对话消息结构',
  '02-api-prompt/2.4-SSE与流式输出.md': 'SSE 流式输出',
  '02-api-prompt/2.5-Prompt工程.md': 'Prompt 工程',
  '02-api-prompt/2.6-结构化输出.md': '结构化输出',
  '02-api-prompt/2.7-幻觉与治理.md': '幻觉治理',
  '02-api-prompt/lab-1-阶段一-LLM-API.md': '实战 · 流式 API',

  '03-tools-mcp/3.1-function-calling.md': 'Function Calling',
  '03-tools-mcp/3.2-react-agent-loop.md': 'ReAct 循环',
  '03-tools-mcp/3.3-mcp协议基础.md': 'MCP 基础',
  '03-tools-mcp/3.4-mcp服务链设计.md': 'MCP 服务链',
  '03-tools-mcp/3.5-mcp安全依赖审计.md': '实战 · 依赖审计',
  '03-tools-mcp/3.6-工具系统工程化.md': '工具工程化',
  '03-tools-mcp/3.7-工具安全与权限.md': '工具安全',
  '03-tools-mcp/lab-2-阶段二-Function-Calling.md': '实战 · Tool Calling',

  '04-rag-memory/4.1-rag解决什么问题.md': 'RAG 适用场景',
  '04-rag-memory/4.2-rag标准流程.md': 'RAG 标准流程',
  '04-rag-memory/4.3-文档处理与Loader.md': '文档 Loader',
  '04-rag-memory/4.4-文本切割与Embedding.md': '分块与 Embedding',
  '04-rag-memory/4.5-向量库与检索优化.md': '向量检索',
  '04-rag-memory/4.6-查询改写与重排序.md': '查询改写与重排',
  '04-rag-memory/4.7-advanced-rag-graphrag.md': 'GraphRAG',
  '04-rag-memory/4.8-memory长期记忆.md': '长期记忆',
  '04-rag-memory/lab-3-阶段三-会话管理.md': '实战 · 会话管理',
  '04-rag-memory/lab-4-阶段四-RAG.md': '实战 · 知识库问答',

  '05-agent-engineering/5.1-chatbot-copilot-agent.md': 'Agent 能力分级',
  '05-agent-engineering/5.2-agent六大支柱.md': 'Agent 六大支柱',
  '05-agent-engineering/5.3-agent-loop工程结构.md': 'Agent Loop',
  '05-agent-engineering/5.4-context-engineering.md': '上下文工程',
  '05-agent-engineering/5.5-kv-cache与压缩.md': 'KV Cache 压缩',
  '05-agent-engineering/5.6-workflow与agent边界.md': 'Workflow 边界',
  '05-agent-engineering/5.7-multi-agent.md': 'Multi-Agent',
  '05-agent-engineering/5.8-harness-engineering.md': 'Harness 工程',

  '06-frameworks/6.1-langchain基本介绍.md': 'LangChain 概览',
  '06-frameworks/6.2-模型接口与模板.md': '模型与模板',
  '06-frameworks/6.3-lcel与runnable.md': 'LCEL 与 Runnable',
  '06-frameworks/6.4-output-parser.md': 'Output Parser',
  '06-frameworks/6.5-langchain-tools-agent.md': 'Tools 与 Agent',
  '06-frameworks/6.6-langgraph.md': 'LangGraph',
  '06-frameworks/6.7-框架选型.md': '框架选型',
  '06-frameworks/6.8-平台与低代码.md': '低代码平台',
  '06-frameworks/lab-5-阶段五-框架化Agent.md': '实战 · LangGraph',

  '07-production/7.1-eval与回归测试.md': 'Eval 与回归',
  '07-production/7.2-prompt评测工具链.md': 'Prompt 评测',
  '07-production/7.3-trace与可观测性.md': 'Trace 可观测',
  '07-production/7.4-回退与生产容错.md': '降级与容错',
  '07-production/7.5-安全护栏.md': '安全护栏',
  '07-production/7.6-并发控制与调度.md': '并发与调度',
  '07-production/7.7-成本控制.md': '成本控制',
  '07-production/7.8-部署与发布.md': '部署发布',

  '08-agent-projects/8.1-智能翻译助手.md': '翻译 Agent',
  '08-agent-projects/8.2-安全依赖审计MCP.md': '依赖审计 Agent',
  '08-agent-projects/8.3-knowledge-base-qa.md': '知识库 Agent',
  '08-agent-projects/8.4-AI销售助手.md': '销售 Agent',
  '08-agent-projects/8.5-留学与金融顾问.md': '咨询 Agent',
  '08-agent-projects/8.6-auto-gpt.md': 'Auto-GPT',

  '09-agent-ide/9.1-agent-ide-概览.md': 'Agent IDE 全景',
  '09-agent-ide/9.2-cursor-配置.md': 'Cursor 配置',
  '09-agent-ide/9.3-claude-code-配置.md': 'Claude Code 配置',
  '09-agent-ide/9.4-codex-配置.md': 'Codex 配置',
  '09-agent-ide/9.5-trae-配置.md': 'Trae 配置',
}

export function lessonIdFromSlug(slug) {
  const dotted = slug.match(/^([\d.]+)/)?.[1]
  if (dotted) return dotted
  const lab = slug.match(/^(lab-\d+)/)?.[1]
  if (lab) return lab
  return slug
}

export function lessonHeading(_id, title) {
  return title
}

export function getLessonTitle(relPath) {
  return LESSON_CATALOG[relPath.replace(/\\/g, '/')]
}
