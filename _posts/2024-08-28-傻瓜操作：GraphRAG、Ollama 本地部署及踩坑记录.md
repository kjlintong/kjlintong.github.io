---
layout: post
title: "傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录"
subtitle: ""
date: 2024-08-28
author: Ryan
permalink: /blog/graphrag-ollama-local-deployment-guide/
categories:
  - 技术
tags:
  - 技术笔记
  - GraphRAG
  - Ollama

description: "GraphRAG 本地部署完整指南：从环境准备、依赖安装到项目初始化，一步步讲解如何将微软 GraphRAG 与本地 Ollama 模型结合，实现完全离线的知识库问答，并附上部署过程中的踩坑记录。"
---

## 一、GraphRAG 介绍

>

这里按惯例介绍一下 GraphRAG (其实就是水字数，大部分是 GPT 写的)

### 1.引言

微软开源了一个新的基于知识图谱构建的检索增强生成（RAG）系统：GraphRAG。该框架主要解决了如何将检索增强生成（RAG）应用于整个文本语料库的全局性问题，例如“数据集中的主题是什么？”
[论文地址](https://arxiv.org/pdf/2404.16130)
[项目地址](https://microsoft.github.io/graphrag/)

### 2.创新点

- **图RAG方法**：提出了一种新的Graph RAG方法，这种方法结合了知识图谱的构建、检索增强生成（RAG）和查询聚焦摘要（QFS），以支持对整个文本语料库的人类感知制作。这种方法特别针对于全局性问题，如“数据集中的主要主题是什么？”

- **两阶段图索引构建**：Graph RAG方法使用大型语言模型（LLM）分两个阶段构建基于图的文本索引：

- **第一阶段**：从源文档中提取实体，构建实体知识图谱。

- **第二阶段**：为所有密切相关的实体组预生成社区摘要。

- **社区检测算法**：利用社区检测算法（如Leiden算法）将图索引划分为模块化的社区，这些社区内的节点（实体）之间有更强的联系。

- **查询聚焦摘要**：通过查询聚焦摘要方法，将社区摘要合并为最终的全局答案，这种方法特别适用于处理大规模文本数据集。

### 3. 算法

![](https://i-blog.csdnimg.cn/direct/fc18e7c01d784991b31b2f123c7cce10.png#pic_center)

- **图索引构建**：首先，使用LLM对源文档进行处理，提取实体和关系，构建实体知识图谱。然后，使用社区检测算法将图谱划分为社区，并为每个社区生成摘要。

- **查询处理**：当接收到用户查询时，系统会使用社区摘要来生成部分答案。这些部分答案随后被汇总和摘要，以形成对用户的最终回答。

- **并行处理**：在索引和查询时，系统能够并行处理社区摘要，这提高了处理效率并允许处理大规模数据集。

- **模块化和可扩展性**：Graph RAG方法的模块化设计允许它适应不同规模和类型的数据集，同时保持高效和可扩展。

### 4. 数据和实验结果

- **数据集选择**：选择了两个大约一百万标记的数据集进行评估，包括播客文稿和新闻文章，这些数据集代表了用户在现实世界活动中可能遇到的文本语料库类型。

- **问题生成**：使用活动中心的方法自动化生成需要理解整个语料库的问题，而不是特定文本的细节。

- **条件比较**：比较了六种不同的条件，包括使用不同层次的图社区（C0, C1, C2, C3）的Graph RAG，直接对源文本应用map-reduce方法的文本摘要（TS），以及朴素的“语义搜索”RAG方法（SS）。

- **评估指标**：采用LLM评估器进行头对头比较，选择了三个目标指标来捕捉对感知制作活动有益的质量：全面性、多样性和赋能性。同时，使用直接性作为有效性的指标。

- **结果分析**：

- **全局方法与朴素RAG**：全局方法在全面性和多样性指标上一致优于朴素RAG方法。

- **社区摘要与源文本**：社区摘要通常在答案的全面性和多样性上提供了小幅但一致的改进，尤其是在播客数据集的中级社区摘要和新闻数据集的低级社区摘要中。

- **赋能性**：赋能性比较显示了混合结果，但LLM分析指出提供具体例子、引用和引证的能力是帮助用户达到知情理解的关键。

- **上下文窗口大小**：测试了不同的上下文窗口大小，发现最小的上下文窗口大小（8k）在全面性上普遍表现更好，而在多样性和赋能性上与较大的上下文窗口大小相当。

### 5.不足和展望

- 目前的评估仅限于一类全局性问题和大约一百万标记的数据集，未来的工作需要在不同类型的问题、数据类型和数据集大小上验证性能。

- 考虑构建图索引的权衡，包括计算预算、预期的查询数量以及从图索引中获得的其他价值。

- 未来的工作可能包括更本地化的 RAG 方法，以及将基于嵌入的匹配与社区报告结合起来的混合 RAG 方案。

## 二、本地部署

>

目前已经有很多教程，但在我跑模型过程中，发现还是很多 bug，这里记录一下。部署过程中主要参考了几个教程，列在文末

### 1.为什么要本地部署

微软开源的 GraphRAG 项目代码和 OpenAI 的 Chat GPT 高度耦合，对我这样又穷又不方便科学上网的人实在不友好，据说跑一个官方的demo 就要 10 刀。还是用开源的模型方便啊，开源万岁！！

>

土豪可以直接用官网的项目；如果要接本地或国产模型，也可以参考社区里的部署教程。

### 2.环境准备

这部分基础环境配置就不废话了，我的环境如下：

- 操作系统 windows 11

- PyCharm 2024.2.0.1

- Python 3.12

- Ollama（Ollama 的安装和使用有一大堆教程，可以参考这个：[handy-ollama](https://github.com/AXYZdong/handy-ollama))

### 3. GraphRAG 安装

#### 3.1 下载 GraphGAG

命令行操作

```
git clone https://github.com/microsoft/graphrag.git
```

这里注意一下，很多教程上代码地址是： https://github.com/TheAiSingularity/graphrag-local-ollama.git，而本文写的是官网地址。正如前面所说，微软的 GraphRAG 项目代码和 OpenAI 的 Chat GPT 高度耦合，改用 Ollama 需要进行很多修改。TheAiSingularity 和官网的区别正在于此。**但是**，**但是**，截止今天（2024.8.28）我部署情况看，这个修改不完全，还有很多地方要改（我已经提了 pr，希望他们能采纳），为了讲解的完整性，下文直接讲解修改官网的项目（其实改的也不多）

#### 3.2 安装依赖包

进入 Graph RAG 安装目录

```
cd graphrag
```

傻瓜操作，安装依赖包

```
pip install -e .
```

#### 3.3 创建数据目录

在 Graph RAG 安装目录下创建文件夹 ragtest/input，这只是方便管理，也可以直接创建 input 文件夹。把要训练的数据放到 input 文件夹（仅支持 txt 文件，可以有多个）。

#### 3.4 项目初始化

```
python -m graphrag.index --init --root ./ragtest
```

此时会在 ragtest 目录下生成 output，setting.yaml，prompts，.env (默认隐藏）等目录及文件。setting.yaml 是配置文件，后面需要修改，output 是每次跑模型的结果和运行日志。

##### 3.5 修改配置文件

因为要改用本地模型，必须修改配置文件 setting.yaml。修改以下四处：
![](https://i-blog.csdnimg.cn/direct/8dc49b8bae2e4c1ba5fdbd9c80d67152.png)

- 我的模型使用的是 mistral，这里根据自己的模型修改即可。api_base 是 Ollama 的默认地址，一般都是这个（确保你的端口没被占用）
![](https://i-blog.csdnimg.cn/direct/c9bd6f1c1f294dca8a82da70081f4bb4.png)

- 注意，embeddings 和前面 llm 是两个不同的模型，推荐使用 nomic-embed-text。另外 api_base 末尾是 api

#### 3.6 修改.env文件

把原文件内容删掉，换成下面这个

```
GRAPHRAG_API_KEY=ollama
GRAPHRAG_CLAIM_EXTRACTION_ENABLED=True
```

>

必须加上参数GRAPHRAG_CLAIM_EXTRACTION_ENABLED=True，否则无法生成协变量 covariates， 在 Local Search 时会出错。

#### 3.7 修改源码

这里需要修改几处代码，放心，很简单，已经完成一大半了
在你的 Graph RAG 安装目录下应该有一个 graphrag 的文件夹，长成这样：
![](https://i-blog.csdnimg.cn/direct/56bb711adc8848e08c13829d3ed54e53.png)
我们需要修改其中三个文件

- llm\openai\openai_embeddings_llm.py
![](https://i-blog.csdnimg.cn/direct/972a22bbcab6447fa8be9172347ff9de.png)
只需要引入 Ollama 依赖，然后修改最后五行代码即可（见注释，注释掉的代码为源代码）：
