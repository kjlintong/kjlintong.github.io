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

description: "目录 一、GraphRAG 介绍 1.引言 2.创新点 3. 算法 4. 数据和实验结果 5.不足和展望 二、本地部署 1.为什么要本地部署 2.环境准备 3. GraphRAG 安装 3.1 下载 GraphGAG 3.2 安装依赖包 3.3 创建数据目录 3.4 项目初始化 3.5 修改配置文件..."
---
<!-- Migrated from CSDN: https://blog.csdn.net/weixin_42107217/article/details/141649920 -->

傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录_graphrag下载-CSDN博客


# 傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录


原创
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/identityVipNew.png)](https://mall.csdn.net/vip)


已于 2024-08-29 09:08:33 修改
·
1.2w 阅读

·
![](https://csdnimg.cn/release/blogv2/dist/pc/img/newHeart2023Active.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/newHeart2023Black.png)

52


·

![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect2.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollectionActive2.png)

185


·

收录于


当前文章被以下社区和专栏收录：


于 2024-08-29 09:01:41 首次发布


#### 目录


- [一、GraphRAG 介绍](#GraphRAG__4)
-

-


- [1.引言](#1_7)
-

- [2.创新点](#2_12)
-

- [3. 算法](#3__19)
-

- [4. 数据和实验结果](#4__25)
-

- [5.不足和展望](#5_35)
-

-

- [二、本地部署](#_39)
-

-


- [1.为什么要本地部署](#1_41)
-

- [2.环境准备](#2_44)
-

- [3. GraphRAG 安装](#3_GraphRAG__50)
-

-


- [3.1 下载 GraphGAG](#31__GraphGAG_51)
-

- [3.2 安装依赖包](#32__57)
-

- [3.3 创建数据目录](#33__67)
-

- [3.4 项目初始化](#34__69)
-

-


- [3.5 修改配置文件](#35__74)
-

-

- [3.6 修改.env文件](#36_env_80)
-

- [3.7 修改源码](#37__87)
-

-

- [4. Indexing](#4_Indexing_202)
-

- [5. query](#5_query_212)
-

-


- [5.1 修改代码](#51__214)
-

- [5.2 开始查询](#52__227)
-

-

- [6. 踩坑总结](#6__277)
-

-


- [6.1 模型选择](#61__278)
-

- [6.2 Indexing 过程其他报错](#62_Indexing__285)
-

- [6.3 查询过程报错](#63__288)
-

-

-

- [参考文档](#_294)
-


折腾了一天终于把 GraphRAG 部署好了，记录一下心酸的踩坑过程。

## 一、GraphRAG 介绍


>

这里按惯例介绍一下 GraphRAG (其实就是水字数，大部分是 GPT 写的)


### 1.引言


微软开源了一个新的基于知识图谱构建的检索增强生成（RAG）系统：GraphRAG。该框架主要解决了如何将检索增强生成（RAG）应用于整个文本语料库的全局性问题，例如“数据集中的主题是什么？”
[论文地址](https://arxiv.org/pdf/2404.16130)
[项目地址](https://microsoft.github.io/graphrag/)

### 2.创新点


- **图RAG方法**：提出了一种新的Graph RAG方法，这种方法结合了知识图谱的构建、检索增强生成（RAG）和查询聚焦摘要（QFS），以支持对整个文本语料库的人类感知制作。这种方法特别针对于全局性问题，如“数据集中的主要主题是什么？”
-

- **两阶段图索引构建**：Graph RAG方法使用大型语言模型（LLM）分两个阶段构建基于图的文本索引：


- **第一阶段**：从源文档中提取实体，构建实体知识图谱。
-

- **第二阶段**：为所有密切相关的实体组预生成社区摘要。
-

-

- **社区检测算法**：利用社区检测算法（如Leiden算法）将图索引划分为模块化的社区，这些社区内的节点（实体）之间有更强的联系。
-

- **查询聚焦摘要**：通过查询聚焦摘要方法，将社区摘要合并为最终的全局答案，这种方法特别适用于处理大规模文本数据集。
-


### 3. 算法


![](https://i-blog.csdnimg.cn/direct/fc18e7c01d784991b31b2f123c7cce10.png#pic_center)


- **图索引构建**：首先，使用LLM对源文档进行处理，提取实体和关系，构建实体知识图谱。然后，使用社区检测算法将图谱划分为社区，并为每个社区生成摘要。
-

- **查询处理**：当接收到用户查询时，系统会使用社区摘要来生成部分答案。这些部分答案随后被汇总和摘要，以形成对用户的最终回答。
-

- **并行处理**：在索引和查询时，系统能够并行处理社区摘要，这提高了处理效率并允许处理大规模数据集。
-

- **模块化和可扩展性**：Graph RAG方法的模块化设计允许它适应不同规模和类型的数据集，同时保持高效和可扩展。
-


### 4. 数据和实验结果


- **数据集选择**：选择了两个大约一百万标记的数据集进行评估，包括播客文稿和新闻文章，这些数据集代表了用户在现实世界活动中可能遇到的文本语料库类型。
-

- **问题生成**：使用活动中心的方法自动化生成需要理解整个语料库的问题，而不是特定文本的细节。
-

- **条件比较**：比较了六种不同的条件，包括使用不同层次的图社区（C0, C1, C2, C3）的Graph RAG，直接对源文本应用map-reduce方法的文本摘要（TS），以及朴素的“语义搜索”RAG方法（SS）。
-

- **评估指标**：采用LLM评估器进行头对头比较，选择了三个目标指标来捕捉对感知制作活动有益的质量：全面性、多样性和赋能性。同时，使用直接性作为有效性的指标。
-

- **结果分析**：


- **全局方法与朴素RAG**：全局方法在全面性和多样性指标上一致优于朴素RAG方法。
-

- **社区摘要与源文本**：社区摘要通常在答案的全面性和多样性上提供了小幅但一致的改进，尤其是在播客数据集的中级社区摘要和新闻数据集的低级社区摘要中。
-

- **赋能性**：赋能性比较显示了混合结果，但LLM分析指出提供具体例子、引用和引证的能力是帮助用户达到知情理解的关键。
-

- **上下文窗口大小**：测试了不同的上下文窗口大小，发现最小的上下文窗口大小（8k）在全面性上普遍表现更好，而在多样性和赋能性上与较大的上下文窗口大小相当。
-

-


### 5.不足和展望


- 目前的评估仅限于一类全局性问题和大约一百万标记的数据集，未来的工作需要在不同类型的问题、数据类型和数据集大小上验证性能。
-

- 考虑构建图索引的权衡，包括计算预算、预期的查询数量以及从图索引中获得的其他价值。
-

- 未来的工作可能包括更本地化的 RAG 方法，以及将基于嵌入的匹配与社区报告结合起来的混合 RAG 方案。
-


## 二、本地部署


>

目前已经有很多教程，但在我跑模型过程中，发现还是很多 bug，这里记录一下。部署过程中主要参考了几个教程，列在文末


### 1.为什么要本地部署


微软开源的 GraphRAG 项目代码和 OpenAI 的 Chat GPT 高度耦合，对我这样又穷又不方便科学上网的人实在不友好，据说跑一个官方的demo 就要 10 刀。还是用开源的模型方便啊，开源万岁！！

>

土豪可以直接用官网的项目，如果使用其他在线的模型可以参考这个教程：http://t.csdnimg.cn/dDEbL


### 2.环境准备


这部分基础环境配置就不废话了，我的环境如下：


- 操作系统 windows 11
-

- PyCharm 2024.2.0.1
-

- Python 3.12
-

- Ollama（Ollama 的安装和使用有一大堆教程，可以参考这个：[handy-ollama](https://github.com/AXYZdong/handy-ollama))
-


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
-

- 注意，embeddings 和前面 llm 是两个不同的模型，推荐使用 nomic-embed-text。另外 api_base 末尾是 api
-


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
只需要引入 Ollama 依赖 ，然后修改最后五行代码即可(见注释，注释掉的代码为源代码)，如下：
-


```

```


标签

[#RAG](https://so.csdn.net/so/search/s.do?q=RAG&t=all&o=vip&s=&l=&f=&viparticle=&from_tracking_code=tag_word&from_code=app_blog_art)
[#文献笔记](https://so.csdn.net/so/search/s.do?q=%E6%96%87%E7%8C%AE%E7%AC%94%E8%AE%B0&t=all&o=vip&s=&l=&f=&viparticle=&from_tracking_code=tag_word&from_code=app_blog_art)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/lock.png)
最低0.47元/天 解锁文章
![](https://i-operation.csdnimg.cn/images/9b8d0d477b4d448787612f4a30dc7431.png)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/vip-limited-close-newWhite.png)

确定要放弃本次机会？

福利倒计时


*:*

*:*


![](https://csdnimg.cn/release/blogv2/dist/pc/img/vip-limited-close-roup.png)
立减 ¥


普通VIP年卡可用

[立即使用](https://mall.csdn.net/vip)


[![](https://profile-avatar.csdnimg.cn/43385410e0134227b5b0e21bb1b984d6_weixin_42107217.jpg!1)

RyanLintong
](https://blog.csdn.net/weixin_42107217)


[关注](javascript:;)
关注


-

![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarThumbUpactive.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/like-active.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/like.png)

52


点赞

-

-

![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/unlike-active.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/unlike.png)


踩

-

-
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/collect-active.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/collect.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/newCollectActive.png)

185
](javascript:;)


收藏


觉得还不错?

一键收藏

![](https://csdnimg.cn/release/blogv2/dist/pc/img/collectionCloseWhite.png)


-

-
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/comment.png)

60
](#commentBox)
评论

-

-
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/share.png)
分享](javascript:;)


复制链接


分享到 QQ


分享到新浪微博


![](https://csdnimg.cn/release/blogv2/dist/pc/img/share/icon-wechat.png)扫一扫


-

-

![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/more.png)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/report.png)
举报


![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/report.png)
举报


-


![](https://kunyu.csdn.net/1.png?p=58&adBlockFlag=0&adId=1106226&a=1106226&c=4353130&k=傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录&spm=1001.2101.3001.5002&articleId=141649920&d=1&t=3&u=412184aba3db4992a2fa3ef0d589ad65)


[一文学懂【微软开源*GraphRag*】项目](https://blog.csdn.net/kiingking/article/details/140363215)


[kiingking的博客](https://blog.csdn.net/kiingking)


07-11
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2303


[*GraphRAG* 是微软开源的一个项目，它的名字里包含了它的主要功能——利用图（Graph）来增强检索（Retrieval）和生成（Generation）的能力。](https://blog.csdn.net/kiingking/article/details/140363215)


60 条评论
您还未登录，请先
登录
后发表或查看评论


[内存预取黑科技：__builtin_prefetch在数据库和游戏开发中的高阶用法
最新发布](https://blog.csdn.net/weixin_29019241/article/details/159272040)


[weixin_29019241的博客](https://blog.csdn.net/weixin_29019241)


03-20
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
391


[本文深入探讨了GCC内置函数`__builtin_prefetch`在数据库和游戏开发中的高阶应用。通过LevelDB的SSTable文件读取优化和UE5引擎场景数据流式加载的实战案例，详细解析了预取参数调优的艺术，并借助perf工具量化分析了不同策略的性能提升效果。文章还介绍了与`__builtin_expect`等内置函数的协同优化技巧，帮助开发者最大化缓存命中率。](https://blog.csdn.net/weixin_29019241/article/details/159272040)


[从*RAG*到*GraphRAG*的应用落地揭秘](https://zengxiaojian.blog.csdn.net/article/details/139096579)


[强化学习曾小健](https://blog.csdn.net/sinat_37574187)


05-21
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2227


[*RAG*（检索增强生成）是什么？正如提到的那样，它是一种技术，可以“良好”地解释用户的查询，检索“相关”信息，将其处理为上下文，然后将此有用信息融入回复中。正如引用的网站所指出的，*RAG*以其成本效益、相对准确性、提供领域特定语境的充足性、反映最新信息的能力以及追踪信息来源文档的透明度和可解释性等特点而被认为是一种主要选择的方法。](https://zengxiaojian.blog.csdn.net/article/details/139096579)


[【Linux 驱动开发】STM32MP1 LCD 显示系统完整实践指南](https://blog.csdn.net/qq_39725309/article/details/158703374)


[猫猫的小茶馆](https://blog.csdn.net/qq_39725309)


03-06
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
463


[STM32MP1 LCD显示系统实践指南 本文全面介绍STM32MP1平台实现MIPI DSI LCD显示的完整流程，涵盖硬件连接、设备树配置、显示原理和驱动实现。主要内容包括： 硬件连接：详细说明MIPI DSI差分对、背光PWM、复位/供电管脚的连接方式 设备树配置： PWM背光控制节点设置 LTDC与DSI端口映射关系 Panel节点参数定义 显示基础：讲解LCD/OLED显示原理、常见接口类型（RGB/LVDS/MIPI/HDMI）及信号时序 驱动实现。](https://blog.csdn.net/qq_39725309/article/details/158703374)


[【深度学习】*本地*运行 *GraphRAG* + *Ollama*](https://blog.csdn.net/qq_20623849/article/details/140374365)


[qq_20623849的博客](https://blog.csdn.net/qq_20623849)


07-12
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
5896


[*本地*允许 *GraphRAG* *Ollama*](https://blog.csdn.net/qq_20623849/article/details/140374365)


[*GraphRAG* + *Ollama* *本地**部署*全攻略：避*坑*实战指南](https://devpress.csdn.net/v1/article/detail/140677990)


[musicml的博客](https://blog.csdn.net/musicml)


07-24
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
8910


[▼最近直播超级多，预约保你有收获—1—为什么要对 *GraphRAG* *本地**部署*？微软开源 *GraphRAG* 后，热度越来越高，目前 *GraphRAG* 只支持 OpenAI 的闭源大模型，导致*部署*后使用范围大大受限，本文通过 *GraphRAG* 源码的修改，来支持更广泛的 Embedding 模型和开源大模型，从而使得 *GraphRAG* 的更容易上手使用。如果对 Grap*RAG* 还不太熟悉的同学，可以看...](https://devpress.csdn.net/v1/article/detail/140677990)


[TensorFlow相关组件的安装](https://devpress.csdn.net/v1/article/detail/135495433)


[AAI666666的博客](https://blog.csdn.net/AAI666666)


01-11
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
3767


[TensorFlow相关组件的安装](https://devpress.csdn.net/v1/article/detail/135495433)


[*GraphRAG*+*Ollama*实现*本地**部署*+neo4j可视化结果](https://devpress.csdn.net/v1/article/detail/142899082)


[qq_42703164的博客](https://blog.csdn.net/qq_42703164)


10-14
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
6057


[最近*部署*微软的*graphrag**踩*了很多*坑*，*记录*一下完整的流程，给后来者一些参考。目前使用*graphrag*还是有一点问题，如果后续解决了会在文章中进行补充。](https://devpress.csdn.net/v1/article/detail/142899082)


[*GraphRAG**本地**部署*（Xinference*本地*模型）+ neo4j可视化](https://blog.csdn.net/2303_78780633/article/details/141064932)


[2303_78780633的博客](https://blog.csdn.net/2303_78780633)


08-09
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
6821


[模型供应商可以选择*ollama*，Xinference等供应商，也可以用我们*本地*api封装的大模型。](https://blog.csdn.net/2303_78780633/article/details/141064932)


[*GraphRAG*+*Ollama* *本地**部署*，保姆教程，*踩**坑*无数，闭*坑*大法](https://devpress.csdn.net/v1/article/detail/140534257)


[xx_nm98的博客](https://blog.csdn.net/xx_nm98)


07-18
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1万+


[最近*RAG*热度不减，微软开源了*GraphRAG*，很是火爆呀，本着学习的态度，我也*部署*使用了一下，无奈没有梯子，不能用openAI，于是想着能不能使用本机的模型，替换openAI的 llm和embedding模型，说干就干，整个过程真是曲折，*踩**坑*不少，但最终 结果还是好的，终于完美*部署*到本机使用了，哈哈，下面来给大家分享一下，自己也*记录*一下，以免后边再使用时重复进*坑*。本人也搞了一个*RAG*项目，非常适合学习，自用，二次开发，欢迎star*graphRAG*的安装还是很简单的，直接pip。](https://devpress.csdn.net/v1/article/detail/140534257)


[*ollama*轻松*部署**本地**GraphRAG*（避雷篇）](https://lizhiyang.blog.csdn.net/article/details/141279919)


[weixin_63866037的博客](https://blog.csdn.net/weixin_63866037)


08-18
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1万+


[本篇文章主要介绍如何使用*ollama**本地**部署*微软的Graph *RAG*，，Graph *RAG*成为*RAG*一种新范式，对于全局总结性问题表现突出，由*ollama*一站式解决。但是中间也出现非常多的问题，比如Columns must be same length as key。跟着本篇文章使用*ollama*+mistral-nemo+mxbai-embed-larg`实现*本地*的*GraphRAG*的*部署*！](https://lizhiyang.blog.csdn.net/article/details/141279919)


[【速成】LLM大模型学习路径指南](https://devpress.csdn.net/v1/article/detail/144050054)


[m0_63171455的博客](https://blog.csdn.net/m0_63171455)


11-26
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1306


[大家好！整理了一些我的大模型学习路线和参考资料，供初学者入门了解和实践LLM大模型算法学习路径LLM发展历程入门系列进阶系列计算资源云服务器：t讯云/a里云/火s引擎 GPU云服务器资源，按量每小时约10元*本地*服务器：单卡/多卡训练，最低6G显存，4090可媲美A100显卡项目应用实践SFT微调：QA数据集构建、Chat基座微调*RAG*知识库问答：知识库解析、向量检索、LLM生成Agent智能体：workflow定义、tools构建、function call模型训练。](https://devpress.csdn.net/v1/article/detail/144050054)


[*GraphRAG*开发指南：从环境配置到项目*部署*](https://carlow.blog.csdn.net/article/details/148570335)


[加入“Super Entity”，与全能开发团队共探AI智能体与数字人项目，开启前沿技术之旅。](https://blog.csdn.net/csdn122345)


06-10
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1729


[本文全面介绍了*GraphRAG*（Graph-based Retrieval Augmented Generation）项目的开发流程。我们将从环境配置、项目结构、开发工具等多个维度，深入解析如何高效地进行*GraphRAG*项目的开发工作。通过本文，您将掌握*GraphRAG*项目的开发最佳实践，以及如何解决开发过程中遇到的常见问题。完善的环境配置清晰的项目结构高效的开发工具完整的测试体系。](https://carlow.blog.csdn.net/article/details/148570335)


[5分钟手把手系列(二)：*本地**部署**Graphrag*（Pycharm+*Ollama*+LM Studio）](https://blog.csdn.net/m0_65555479/article/details/142264718)


[m0_65555479的博客](https://blog.csdn.net/m0_65555479)


09-14
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
3316


[通过搭建*GraphRAG**本地*demo后，笔者通过少量的文本内容（三国演义第一章），初略对比了一下传统*RAG*方案与*GraphRAG*方案，基于少量文本内容而言，*GraphRAG*的效果还是符合其宣传内容的，后续更严谨的测试还是需要海量数据的进行验证。希望本文能帮助到对*GraphRAG*有兴趣的朋友，毕竟读万卷书不如行万里路，看再多的理论介绍，不如自己亲自去动手验证一把来的实在~](https://blog.csdn.net/m0_65555479/article/details/142264718)


[大模型 | *GraphRAG* + *Ollama* *本地**部署*全攻略：避*坑*实战指南](https://devpress.csdn.net/v1/article/detail/141496685)


[老皮的博客](https://blog.csdn.net/m0_59614665)


08-24
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
6157


[AI大模型作为人工智能领域的重要技术突破，正成为推动各行各业创新和转型的关键力量。抓住AI大模型的风口，掌握AI大模型的知识和技能将变得越来越重要。学习AI大模型是一个系统的过程，需要从基础开始，逐步深入到更高级的技术。这里给大家精心整理了一份全面的AI大模型学习资源，包括：AI大模型全套学习路线图（从入门到实战）、精品AI大模型学习书籍手册、视频教程、实战学习、面试题等，资料免费分享！](https://devpress.csdn.net/v1/article/detail/141496685)


[实战微软新一代*RAG*：*GraphRAG*强大的全局理解能力，碾压朴素*RAG*？](https://blog.csdn.net/Python_cocola/article/details/140279385)


[Python_cocola的博客](https://blog.csdn.net/Python_cocola)


07-08
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
5214


[大语言模型（LLM）是在大量数据上训练，但他们并不是在我们私有数据上训练，因此要想让LLM能够回答我们私有数据集上的问题，我们就得使用一种叫做检索增强生成（*RAG*）的技术。它的基本原理是加载我们的文档，然后将每个文档按照一定的规则，比如Token数量、字符数量、语义和层次分割等，将每个文档拆分为一个一个小片段（chunk）。然后使用嵌入技术对这些chunk生成embeding，存储到高维向量数据库中，生成索引Index。](https://blog.csdn.net/Python_cocola/article/details/140279385)


[安装*GraphRAG*](https://blog.csdn.net/make_progress/article/details/142904609)


[make_progress的博客](https://blog.csdn.net/make_progress)


10-13
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1905


[*GraphRAG*是微软开源的一种基于图的检索增强生成 (*RAG*) 方法。# 参考地址# Github地址。](https://blog.csdn.net/make_progress/article/details/142904609)


[微软开源*GraphRAG*的使用教程-使用自定义数据测试*GraphRAG*
热门推荐](https://devpress.csdn.net/v1/article/detail/140253451)


[luxinfeng的博客](https://blog.csdn.net/luxinfeng666)


07-08
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2万+


[这篇文章主要介绍了微软开源的*GraphRAG*的安装教程，并以《太白金星有点烦》为例，动手实操测试了下*GraphRAG*的实际效果。](https://devpress.csdn.net/v1/article/detail/140253451)


[*GraphRAG*+*Ollama*实现*本地**部署*（最全，非常详细，保姆教程）](https://blog.csdn.net/gaotianhao123/article/details/140640415)


[科研探索ing！研究方向：人工智能及优化](https://blog.csdn.net/gaotianhao123)


07-23
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2万+


[*GraphRAG*+*Ollama**本地**部署*， *GraphRAG* *Ollama*
为了找到一种省钱的方式并且能够使用*GraphRAG*便可以调用*Ollama**本地**部署*的开源大模型，但需要修改部分源码，我已经实现过了，给大家避*坑*，快读*部署*。如果对你有用的，欢迎点赞、收藏！](https://blog.csdn.net/gaotianhao123/article/details/140640415)


[*GraphRAG**本地*运行（*Ollama*的LLM接口＋Xinference的embedding模型）无需gpt的api](https://devpress.csdn.net/v1/article/detail/140319467)


[m0_56378800的博客](https://blog.csdn.net/m0_56378800)


07-10
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
9720


[我们不使用openai就会导致，每次既能get到kwargs.get("is_response_valid")，又得到kwargs.get("is_response_valid")值是false的。这里通过我多次的寻找，发现是*graphrag*里面的一个包出现了问题，可能没有使用默认调用的openai，在一个is_response_valid总是不能显示。不知道是不是qwen2：0.5b的性能有限，很多global的问题回答成功率会比较低，之后可以自行启动其他的*ollama*内置的模型。](https://devpress.csdn.net/v1/article/detail/140319467)


[ZuAnBot一键自动发送信息工具一键喷人（随机输入骂人语录）.exe](https://download.csdn.net/download/china365love/89676272)


[ZuAnBot 一键自动发送信息工具，是一款专为应对恶人而设计的独特软件。在面对恶意攻击和不良行为时，它为你提供了绝对反击的利器。这款软件具有强大的功能，能够一键自动发送信息，让你在与恶人的交锋中无需费力打字，即可迅速做出回应。其随机输入骂人语录的特性，更是为你的反击增添了不可预测性和趣味性。当遇到那些无端挑衅、恶意中伤的人时，ZuAnBot 能让你以有力的言辞进行回击，维护自己的尊严和权益。它就像是你的私人护卫，时刻准备为你抵挡恶意的侵袭。然而，需要注意的是，虽然这款软件可以作为对恶人的反击手段，但我们也应该在使用过程中保持理性和克制，避免过度使用而陷入无意义的争吵。让 ZuAnBot 成为你在必要时刻的有力武器，而不是让情绪主导的工具。](https://download.csdn.net/download/china365love/89676272)


[![](https://profile-avatar.csdnimg.cn/43385410e0134227b5b0e21bb1b984d6_weixin_42107217.jpg!1)](https://blog.csdn.net/weixin_42107217)


[RyanLintong](https://blog.csdn.net/weixin_42107217)


博客等级

![](https://csdnimg.cn/identity/blog4.png)

码龄8年


[28
原创](https://blog.csdn.net/weixin_42107217)


111
点赞


465
收藏


74
粉丝


关注


[私信](https://im.csdn.net/chat/weixin_42107217)


[![](https://i-operation.csdnimg.cn/images/dbf1a709c51a4563a0faeddc6fdf6dbc.png)](https://i.csdn.net/#/geek-star-fun-pack?utm_source=260901_vip_blogleftbanner)


![](https://kunyu.csdn.net/1.png?p=56&adBlockFlag=0&adId=1110432&a=1110432&c=4491989&k=傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录&spm=1001.2101.3001.5000&articleId=141649920&d=1&t=3&u=2281ed08ee6d4945857c984cd36b1d07)


### 热门文章


-
[傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
12554](https://blog.csdn.net/weixin_42107217/article/details/141649920)

-

-
[计算机组成原理  存储器
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
8153](https://blog.csdn.net/weixin_42107217/article/details/103760320)

-

-
[计算机组成原理  CPU 结构和功能
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
5460](https://blog.csdn.net/weixin_42107217/article/details/104077387)

-

-
[解决pyqt5中由qtdesigner的ui文件生成的python文件难以修改问题（转载）
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
4211](https://blog.csdn.net/weixin_42107217/article/details/89192579)

-

-
[Unused import statement
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2988](https://blog.csdn.net/weixin_42107217/article/details/81742904)

-


### 分类专栏


-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756913.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

最优化
](https://blog.csdn.net/weixin_42107217/category_12474426.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756918.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

文献笔记
](https://blog.csdn.net/weixin_42107217/category_12327970.html)
2篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756930.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

分布式系统
](https://blog.csdn.net/weixin_42107217/category_12327971.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756780.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

基础知识
](https://blog.csdn.net/weixin_42107217/category_9628827.html)
6篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756922.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

python
](https://blog.csdn.net/weixin_42107217/category_7821040.html)
8篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756925.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

PAT
](https://blog.csdn.net/weixin_42107217/category_7821041.html)
5篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756754.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

数据结构
](https://blog.csdn.net/weixin_42107217/category_8011693.html)
3篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756925.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

pycharm错误类型
](https://blog.csdn.net/weixin_42107217/category_7943217.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756928.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

go
](https://blog.csdn.net/weixin_42107217/category_8404453.html)
6篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756918.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

区块链
](https://blog.csdn.net/weixin_42107217/category_8404770.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756927.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

MySQl
](https://blog.csdn.net/weixin_42107217/category_9206519.html)
5篇

-


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)
收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


上一篇：


[学习最优化课程中的一些疑惑](https://blog.csdn.net/weixin_42107217/article/details/133916758)


### 最新评论


-
[傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录](https://blog.csdn.net/weixin_42107217/article/details/141649920#comments_38524287)


[2301_81875652:](https://blog.csdn.net/2301_81875652)
抱歉我有点没看懂，报错TypeError: argument 'tokens': 'str' object cannot be interpreted as an integer的话，最后一行要改啥，我现在就是运行local模式报错这个问题，其他都成功了


-


### 大家在看


-
[《WiFi 嵌入式物联网开发全套实战》| 第04章 WiFi扫描、认证、关联全过程抓包详解](https://blog.csdn.net/u011697185/article/details/164118426)

-

-
[StakeRare 是需求工程领域的一种数据驱动方法
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
206](https://blog.csdn.net/workflower/article/details/164204906)

-

-
[从零开始构建你的第一个C#/.NET应用程序：新手入门全指南
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
393](https://blog.csdn.net/2302_82029124/article/details/164227455)

-

-
[企业大文件传输怎么选？多款主流工具深度实测对比
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
147](https://blog.csdn.net/anxiao_m/article/details/164266690)

-

-
[电源可靠性实战 02：运动相机 Type‑C 接口隐患｜充电短路、进水腐蚀、插拔耐久量产踩坑｜20 年源头工厂量产经验
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
99](https://blog.csdn.net/FLJwu/article/details/164290933)

-


### 最新文章


-
[学习最优化课程中的一些疑惑](https://blog.csdn.net/weixin_42107217/article/details/133916758)

-

-
[文献笔记——A View of Cloud Computing](https://blog.csdn.net/weixin_42107217/article/details/131365713)

-

-
[文献笔记——A brief introduction to distributed systems(分布式系统)](https://blog.csdn.net/weixin_42107217/article/details/130808489)

-


[2024年1篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2024&month=08)
[2023年4篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2023&month=10)
[2020年4篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2020&month=01)
[2019年8篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2019&month=12)
[2018年14篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2018&month=12)


![](https://kunyu.csdn.net/1.png?p=57&adBlockFlag=0&adId=1110433&a=1110433&c=4492004&k=傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录&spm=1001.2101.3001.5001&articleId=141649920&d=1&t=3&u=93fd06b69ef941f585942446df436255)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/c-blog-slidelogo-White.png)


· AI 阅读助手


### 目录


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)

收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


![](https://kunyu.csdn.net/1.png?p=530&adBlockFlag=0&adId=1110216&a=1110216&c=4475404&k=傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录&spm=1001.2101.3001.4647&articleId=141649920&d=1&t=3&u=6996909ca0d84d5f9b42471de50a0d37)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/c-blog-slidelogo-White.png)


· AI 阅读助手


### 目录


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)

收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


![](https://kunyu.csdn.net/1.png?p=479&adId=1100447&adBlockFlag=0&a=1100447&c=0&k=傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录&spm=1001.2101.3001.4834&articleId=141649920&d=1&t=3&u=3c404b711d8d4394b342d9f18c980980)


上一篇：


[学习最优化课程中的一些疑惑](https://blog.csdn.net/weixin_42107217/article/details/133916758)


### 分类专栏


-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756913.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

最优化
](https://blog.csdn.net/weixin_42107217/category_12474426.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756918.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

文献笔记
](https://blog.csdn.net/weixin_42107217/category_12327970.html)
2篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756930.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

分布式系统
](https://blog.csdn.net/weixin_42107217/category_12327971.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756780.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

基础知识
](https://blog.csdn.net/weixin_42107217/category_9628827.html)
6篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756922.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

python
](https://blog.csdn.net/weixin_42107217/category_7821040.html)
8篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756925.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

PAT
](https://blog.csdn.net/weixin_42107217/category_7821041.html)
5篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756754.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

数据结构
](https://blog.csdn.net/weixin_42107217/category_8011693.html)
3篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756925.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

pycharm错误类型
](https://blog.csdn.net/weixin_42107217/category_7943217.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756928.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

go
](https://blog.csdn.net/weixin_42107217/category_8404453.html)
6篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756918.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

区块链
](https://blog.csdn.net/weixin_42107217/category_8404770.html)
1篇

-

-
[
![](https://i-blog.csdnimg.cn/columns/default/20201014180756927.png?x-oss-process=image/resize,m_fixed,h_64,w_64)

MySQl
](https://blog.csdn.net/weixin_42107217/category_9206519.html)
5篇

-


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)
收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


### 目录


评论 60
![](https://csdnimg.cn/release/blogv2/dist/pc/img/closeBt.png)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/commentArrowLeftWhite.png)被折叠的  条评论
[为什么被折叠?](https://blogdev.blog.csdn.net/article/details/122245662)
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/iconPark.png)到【灌水乐园】发言](https://bbs.csdn.net/forums/FreeZone)


查看更多评论![](https://csdnimg.cn/release/blogv2/dist/pc/img/commentArrowDownWhite.png)


添加红包


祝福语


请填写红包祝福语或标题


红包数量


个


红包个数最小为10个


红包总金额


元


红包金额最低5元


余额支付

当前余额3.43元
[前往充值 >](https://i.csdn.net/#/wallet/balance/recharge)


需支付：10.00元

取消
确定


![](redpacketAuthor.avatar)
成就一亿技术人!


领取后你会自动成为博主和红包主的粉丝
规则


![](https://profile-avatar.csdnimg.cn/default.jpg!2)


hope_wisdom 发出的红包


实付元
[使用余额支付](javascript:;)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/pay-time-out.png)
点击重新获取


![](https://csdnimg.cn/release/blogv2/dist/pc/img/weixin.png)![](https://csdnimg.cn/release/blogv2/dist/pc/img/zhifubao.png)![](https://csdnimg.cn/release/blogv2/dist/pc/img/jingdong.png)扫码支付


钱包余额
0

![](https://csdnimg.cn/release/blogv2/dist/pc/img/pay-help.png)


抵扣说明：

1.余额是钱包充值的虚拟货币，按照1:1的比例进行支付金额的抵扣。
2.余额无法直接购买下载，可以购买VIP、付费专栏及课程。


[![](https://csdnimg.cn/release/blogv2/dist/pc/img/recharge.png)余额充值](https://i.csdn.net/#/wallet/balance/recharge)