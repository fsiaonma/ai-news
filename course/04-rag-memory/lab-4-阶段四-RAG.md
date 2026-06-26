---
title: "实战 · 知识库问答"
description: "阶段四 Lab：RAG 上传、检索、引用与优化（第 6–7 周）"
---

# 实战 · 知识库问答

## 学习目标

- 文档上传、切分、Embedding、向量检索
- 回答带引用；实现 Query Rewrite 或 Rerank 之一
- 文档更新后增量索引

## 引言

阶段四是知识库问答核心。第 6 周 MVP 检索，第 7 周优化与增量。

## 章节正文

### 第 1 步：第 6 周：RAG MVP

**实践任务**
- [ ] 上传 PDF / Markdown / TXT
- [ ] Loader + Splitter（chunk 500–1000，overlap 50–100）
- [ ] Embedding 写入 Chroma/Qdrant/FAISS
- [ ] 问答题：检索 Top-4 → 拼 Prompt → 生成
- [ ] UI 展示引用 snippet + 来源文件名/页码
- [ ] 无命中时拒答：「知识库中未找到相关信息」

**Week 6 验收**
- [ ] 5 个文档内问题回答正确且带引用
- [ ] 故意问库外问题会拒答

### 第 2 步：第 7 周：优化与增量

**实践任务（至少完成一项优化）**
- [ ] Query Rewrite：口语问题改写为检索 query
- [ ] Rerank：cross-encoder 或 Cohere rerank 精排
- [ ] Hybrid：BM25 + 向量（可选）

**增量索引**
- [ ] 文档 `doc_id` + `version`
- [ ] 更新时 delete_by_doc_id 再 re-embed
- [ ] 后台 job 状态：indexing / ready / failed

**验收标准**
- [ ] 能检索相关片段并解释 chunk 策略
- [ ] 回答附来源
- [ ] 能演示优化前后同一问题的 retrieval 差异
- [ ] 更新文档后答案跟随变化

**关联章节**
- [文档 Loader](../04-rag-memory/4.3-文档处理与Loader.md)
- [向量检索](../04-rag-memory/4.5-向量库与检索优化.md)
- [查询改写与重排](../04-rag-memory/4.6-查询改写与重排序.md)

## 动手练习

1. 提交优化前后对比表格（问题、命中 chunk、答案质量）
2. 写 Eval 集 10 条 RAG case

## 本节小结

阶段四 2 周：RAG MVP + 引用 + 拒答；第二周 Rewrite/Rerank + 增量索引；对照 4.2–4.6。
