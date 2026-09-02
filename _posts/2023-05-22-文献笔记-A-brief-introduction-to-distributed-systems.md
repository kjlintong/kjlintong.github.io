---
layout: post
title: "文献笔记 A Brief Introduction to Distributed Systems"
subtitle: ""
date: 2023-05-22
author: Ryan
permalink: /blog/lit-note-distributed-systems-overview/
categories:
  - 技术
tags:
  - 文献阅读
  - 分布式系统

description: "本文主要讨论了分布式系统。作者提供了关于分布式系统的概述，是一份很好的新手教程。 Fig.1 大纲 在论文的第一部分，作者简要回顾了计算机的演变，指出了分布式系统的两个技术基础：性能强大的微处理器的发展和高速计算机网络的发明。为什么这些技术很重要？ The result of these techn..."
---
<!-- Migrated from CSDN: https://blog.csdn.net/weixin_42107217/article/details/130808489 -->

文献笔记——A brief introduction to distributed systems(分布式系统)_软件技术分类 distributed system-CSDN博客


# 文献笔记——A brief introduction to distributed systems(分布式系统)


原创
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/identityVipNew.png)](https://mall.csdn.net/vip)


已于 2023-05-22 17:40:58 修改
·
1.3k 阅读

·
![](https://csdnimg.cn/release/blogv2/dist/pc/img/newHeart2023Active.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/newHeart2023Black.png)

0


·

![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect2.png)
![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollectionActive2.png)

1


·

收录于


当前文章被以下社区和专栏收录：


于 2023-05-22 16:38:29 首次发布


![](https://i-operation.csdnimg.cn/images/a7311a21245d4888a669ca3155f1f4e5.png)本文探讨了分布式系统的概念，强调了自主计算元素集合和单一连贯系统这两个关键特征。分布式系统的设计目标包括资源的易访问性、透明性、开放性和可扩展性。透明度分为七种类型，而完全透明度与性能之间存在权衡。开放性涉及互操作性、可组合性和可扩展性。文章还讨论了可扩展性的不同层面及技术，如隐藏通信延迟、工作分布和复制。最后，提到了分布式系统的错误假设和三种类型：分布式计算、分布式信息和普适系统。


*本文主要讨论了分布式系统。作者提供了关于分布式系统的概述，是一份很好的新手教程。*

---


![](https://i-blog.csdnimg.cn/blog_migrate/fe802523c8636420b7f97518eb0c2ea0.png)

Fig.1 大纲


在论文的第一部分，作者简要回顾了计算机的演变，指出了分布式系统的两个技术基础：性能强大的微处理器的发展和高速计算机网络的发明。为什么这些技术很重要？

>

The result of these technologies is that it is now not only feasible but easy, to put together a computing system composed of many networked computers, be they large or small.


## 1、什么是分布式系统?


### 分布式系统的宽泛定义:


>

*A distributed system is **a collection of autonomous computing elements** that appears to its users as **a single coherent system**.*


请注意，有两个特征：

### 特征1：自主计算元素的集合


- 每个计算元素（作为一个节点）都可以相互独立行动。一个集合中的节点可以彼此不同（从非常大的高性能计算机到手机或甚至更小的设备）。
-

- 他们必须沟通和协调行动，以实现一个共同的目标。
-


为了实现这一特点，我们必须考虑如何管理系统中的成员，如何处理缺乏统一的时间参照物的问题。

### 特征2：一个单一的连贯系统


>

in a single coherent system the collection of nodes as a whole operates the same, no matter where, when, and how interaction between a user and the system takes place.


- 一个重要的设计目标：分配透明度。 详细内容见下一节。
-


### 分布式系统像中间件类似组织


>

为了帮助开发分布式应用，分布式系统通常被组织为一个单独的软件层，从逻辑上讲，它被置于作为计算机各自操作系统之上。这种组织方式如图所示。


![](https://i-blog.csdnimg.cn/blog_migrate/03443a844d6e993ad6675e1898b4792c.png)

Fig.2 中间件(from "A brief introduction to distributed systems")


**它提供以下服务：**


- 资源管理
-

- 便于应用间通信的设施
-

- 安全服务
-

- 账户服务
-

- 掩盖故障并修复故障
-


## 2、4个设计目标


>

A distributed system should make resources easily accessible; it should hide the fact that resources are distributed across a network; it should be open; and it should be scalable.
分布式系统应该使资源容易获得；它应该隐藏资源分布在网络上的事实；它应该是开放的；而且应该是可扩展的。


### 1）支持资源共享


资源几乎可以是任何东西，但典型的例子包括外围设备、存储设施、数据、文件、服务和网络，仅举几例。

通过支持资源共享，它有助于降低成本，促进不同节点之间的合作。

###


标签

[#分布式](https://so.csdn.net/so/search/s.do?q=%E5%88%86%E5%B8%83%E5%BC%8F&t=all&o=vip&s=&l=&f=&viparticle=&from_tracking_code=tag_word&from_code=app_blog_art)
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

0


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

1
](javascript:;)


收藏


觉得还不错?

一键收藏

![](https://csdnimg.cn/release/blogv2/dist/pc/img/collectionCloseWhite.png)


-

-
[![](https://csdnimg.cn/release/blogv2/dist/pc/img/toolbar/comment.png)

0
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


专栏目录


![](https://kunyu.csdn.net/1.png?p=58&adBlockFlag=0&adId=1108079&a=1108079&c=4402095&k=文献笔记——A brief introduction to distributed systems分布式系统&spm=1001.2101.3001.5002&articleId=130808489&d=1&t=3&u=2d74e1b766a8423eaa214dcad1e7b8de)


[视觉特征-自监督-同源不同crop视图一致性【2025-08】：DINOv3【DINOv2+Gram损失=DINO损失+（iBOT损失+Gram损失）+KoLeo正则化损失】](https://blog.csdn.net/u013250861/article/details/163609009)


[u013250861的博客](https://blog.csdn.net/u013250861)


08-09
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
215


[自监督学习有望消除手动数据标注的必要性，从而使模型能够轻松处理大规模数据集以及更复杂的架构。由于无需针对特定任务或领域进行定制，这种训练方式能够利用单一算法从各种来源获取视觉表征，这些来源包括自然图像和航空图像等。本技术报告介绍了 DINOv3，它通过简单而有效的策略，为实现这一目标迈出了重要一步。首先，我们通过精心设计数据准备流程并进行优化，从而提升数据集与模型规模的扩展能力；其次，我们提出了一种名为“Gram 锚定”的新方法，该方法有效解决了在长时间训练过程中特征图质量会下降这一长期存在的难题。](https://blog.csdn.net/u013250861/article/details/163609009)


参与评论
您还未登录，请先
登录
后发表或查看评论


[*分布式系统*及其特征介绍（*Introduction* *to* *Distributed* *Systems* and Characterisation）](https://blog.csdn.net/Saul_M/article/details/98478955)


[Saul_M的博客](https://blog.csdn.net/Saul_M)


08-05
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1058


[1.*分布式系统*定义（Defining *Distributed* *Systems*）

*分布式系统*为一个硬件或软件组件分布在网络计算机上，仅仅通过消息传递进行通信和动作协调的系统。
“A *system* in which hardware or software components located at networked computers communicate and coordinate the...](https://blog.csdn.net/Saul_M/article/details/98478955)


[*Introduction* *to* *Distributed* *Systems*](https://download.csdn.net/download/li__paul/2647629)


08-26


[*Introduction* *to* *Distributed* *Systems*](https://download.csdn.net/download/li__paul/2647629)


[CV-骨架02：Swin Transformer V2: Scaling Up Capacity and Resolution【2021-11】](https://blog.csdn.net/u013250861/article/details/159695810)


[u013250861的博客](https://blog.csdn.net/u013250861)


03-31
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
46


[Ze Liu* Han Hu*† Yu*to*ng Lin Zhuliang Yao Zhenda Xie Yixuan Wei Jia Ning Yue Cao Zheng Zhang Li Dong Furu Wei Baining Guo Microsoft Research Asia{v-zeliu1,hanhu,t-yu*to*nglin,t-zhuyao,t-zhxie,t-yixuanwei,v-jianing}@microsoft.com {yuecao,zhez,lidong1,fuwei,bai](https://blog.csdn.net/u013250861/article/details/159695810)


[*分布式*文件系统综述](https://blog.csdn.net/weixin_33916256/article/details/92459537)


[weixin_33916256的博客](https://blog.csdn.net/weixin_33916256)


02-11
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
782


[*分布式*文件系统均为Client/Server架构。数据保存在服务器端，而客户端的应用程序能够像访问本地文件系统一样访问位于远程服务器上的文件。在client通常都对文件数据进行缓存，以提高读写性能和系统可扩展性。然而，缓存和一致性总是一对矛盾，一致性的实现往往比较复杂，这方面的研究有大量论文，在此不再赘述。本文仅限于讨论服务器端的架构，分析其面临的挑战和相应...](https://blog.csdn.net/weixin_33916256/article/details/92459537)


[*分布式*图计算系统与算法简单*文献*综述](https://devpress.csdn.net/v1/article/detail/125929202)


[程哥哥的一亩三分地](https://blog.csdn.net/weixin_42200347)


07-22
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1632


[​引言图作为计算机领域一个很重要的数据结构，很多软件算法都是基于图来实现的，随着人们对算力要求的越来越高，硬件算力也已到达瓶颈，单机的图计算系统已经不能满足巨大的计算需求，因此，*分布式*图计算系统的研究也变得越来越火热。本文简单介绍了当前主流*分布式*图计算系统和算法的发展历程，并对比了不同*分布式*图计算框架的优缺点及差异，文章最后在*分布式*图计算系统与算法领域作了简要总结。......](https://devpress.csdn.net/v1/article/detail/125929202)


[阅读*笔记*（十一）*分布式系统*简介《*Introduction* *to* *Distributed* *Systems*》](https://devpress.csdn.net/v1/article/detail/104088248)


[ty的博客](https://blog.csdn.net/u013354486)


02-02
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
687


[一. 简介
《*Introduction* *to* *Distributed* *Systems*》一文简洁的介绍了*分布式*的各个层面。

](https://devpress.csdn.net/v1/article/detail/104088248)


[*分布式系统*概念与设计-第一章*笔记*](https://blog.csdn.net/weixin_33690963/article/details/92773193)


[weixin_33690963的博客](https://blog.csdn.net/weixin_33690963)


03-25
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
392


[From *Distributed**Systems*ConceptsandDesign *(*5th Edition*)*a *distributed* *system* as one in which hardware or software componentslocated at networked computers communicate and coordinate their act...](https://blog.csdn.net/weixin_33690963/article/details/92773193)


[GO*TO* 语句有害论 | 反对 GO*TO* 语句的理由](https://blog.csdn.net/u013669912/article/details/142929059)


[u013669912的博客](https://blog.csdn.net/u013669912)


10-15
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1805


[……](https://blog.csdn.net/u013669912/article/details/142929059)


[*Introduction* *to* *Distributed* *System* Design](https://blog.csdn.net/u010129347/article/details/43699239)


[两日当头，鱼逆游山高处](https://blog.csdn.net/u010129347)


02-10
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
1291


[I*Introduction* *to* *Distributed* *System* Design

Table of Contents


Audience and Pre-Requisites

The BasicsSo How Is It Done?Remote Procedure Calls*Distributed* Design PrinciplesExercisesReferences](https://blog.csdn.net/u010129347/article/details/43699239)


[*分布式系统**(**Distributed* *System**)*资料](https://blog.csdn.net/xinxing__8185/article/details/49174779)


[张某人ER的技术博客 ==学习&&分享==](https://blog.csdn.net/xinxing__8185)


10-16
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
3934


[原文地址：

https://github.com/ty4z2008/Qix/blob/master/ds.md#*分布式系统**distributed*-*system*资料


*分布式系统**(**Distributed* *System**)*资料


希望转载的朋友，你可以不用联系我．但是一定要保留原文链接，因为这个项目还在继续也在不定期更新．希望看到文章的朋友能够学到更多．


《Rec](https://blog.csdn.net/xinxing__8185/article/details/49174779)


[总结：*Distributed* *systems* for fun and profit](https://blog.csdn.net/u012618715/article/details/76652831)


[Remy的博客](https://blog.csdn.net/u012618715)


08-04
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
3789


[在*分布式系统*的学习过程中，无论是读论文还是做项目，总能看到好多名词：Consistency, failure
detec*to*r, order, timer；好多问题：Consensus, broadcast; 好多结论：FLP, CAP。了解单一名词的意义比较容易，但这些名词背后和*分布式系统*的联系，和商业*分布式系统*是如何利用这些理论的，一直不是很直观。啃了好多论文，却是只见树木，不见森林。偶然](https://blog.csdn.net/u012618715/article/details/76652831)


[Sinfonia: a new paradigm for building scalable *distributed* *systems*（翻译）](https://blog.csdn.net/weixin_33742618/article/details/94596484)


[weixin_33742618的博客](https://blog.csdn.net/weixin_33742618)


07-04
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
2000


[准备了解一下hadoop，翻译篇论文先。
摘要
我们提出一种建立可扩展*分布式系统*的新范式。这种方法不需要处理消息传递协议--已存在的*分布式系统*中最复杂的部分。代替的，开发者只需要使用我们称之为Sinfonia的服务来设计和操纵数据结构。Sinfonia把数据保存在内存节点集合中供一些应用程序使用，每个内存节点占用线性的地址空间。Sinfonia的核心是minitransaction，能够在...](https://blog.csdn.net/weixin_33742618/article/details/94596484)


[MR30系列*分布式*IO在汽车轮毂产线的应用](https://blog.csdn.net/mingdatech/article/details/164204100)


[mingdatech的博客](https://blog.csdn.net/mingdatech)


08-31
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
223


[现代化铝合金轮毂全自动生产线是一条长距离流水线，工序节点沿线分散排布，完整生产链路主要分为五大工段：毛坯预处理与锻造成型：铝棒切割加热后送入万吨锻压机，机械臂完成坯料上下料，锻压成型轮毂毛坯。旋压与热处理：毛坯进行旋压塑形，随后进入热处理与淬火冷却工序。精密机加工：数控机床完成轮毂内外圆切削、钻孔精加工。表面涂装工序：轮毂经清洗、静电喷涂、烘干固化。成品检测与打标出库：开展动平衡检测、外观视觉缺陷检测，合格轮毂激光打码赋码，实现产品全生命周期追溯。](https://blog.csdn.net/mingdatech/article/details/164204100)


[使用Pinpoint作*分布式*链路跟踪系统](https://blog.csdn.net/Databuff/article/details/164119370)


[乘云数字DATABUFF官方博客](https://blog.csdn.net/Databuff)


08-27
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
401


[Pinpoint是一套面向大规模*分布式系统*的应用性能管理（APM）工具[1]，由 NAVER 开源并遵循 Apache 2.0 许可。项目受 GoogleDapper论文启发，在跨服务 RPC 调用中自动注入 TraceId、SpanId 与 ParentSpanId，把原本「黑盒」的*分布式*事务还原为可排序的 Span 树。官方支持Java与PHP（C-Agent）探针，Java 侧通过字节码 instrumentation 介入常见框架与 HTTP 客户端，无需修改业务代码。](https://blog.csdn.net/Databuff/article/details/164119370)


[AFSIM 示例解读（16）· *分布式*推演 XIO 实战（上）：多进程拆分
最新发布](https://blog.csdn.net/m0_38014978/article/details/164230100)


[m0_38014978的博客](https://blog.csdn.net/m0_38014978)


08-31
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
214


[AFSIM*分布式*推演受限于单进程计算开销，XIO通过多进程互联分解负载，各进程只解算本地平台、镜像外部平台，按统一时钟同步。拆分常用按方、按域或按功能切，需确保xio_interface参数一致，避免重复建模，注意realtime与网络配置。](https://blog.csdn.net/m0_38014978/article/details/164230100)


[*分布式*光纤声波DAS测井系统：0.1Hz低频检测、0.1m采样间隔与6066m实井对比](https://blog.csdn.net/zitn2020/article/details/164120444)


[zitn2020的博客](https://blog.csdn.net/zitn2020)


08-27
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
416


[DAS*分布式*声波传感测井基于瑞利散射相位检测实现井下声波/振动连续感知。本文详解ZDAS-P2000的0.1Hz低频测试能力、0.1m空间采样间隔、0.7pε/√Hz本底噪声等核心参数，解读FBE瀑布图方法，重点呈现与Silixa DAS在6066m水平采气井的实井对比结果，并覆盖单模光纤选型、微地震/出砂/窜槽应用及DTS+DAS协同价值。](https://blog.csdn.net/zitn2020/article/details/164120444)


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


![](https://kunyu.csdn.net/1.png?p=56&adId=1100446&adBlockFlag=0&a=1100446&c=0&k=文献笔记——A brief introduction to distributed systems分布式系统&spm=1001.2101.3001.5000&articleId=130808489&d=1&t=3&u=8b73741e02144d7c947a6e4007eed419)


### 热门文章


-
[傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
12555](https://blog.csdn.net/weixin_42107217/article/details/141649920)

-

-
[计算机组成原理  存储器
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
8154](https://blog.csdn.net/weixin_42107217/article/details/103760320)

-

-
[计算机组成原理  CPU 结构和功能
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
5461](https://blog.csdn.net/weixin_42107217/article/details/104077387)

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


[I‘m back](https://blog.csdn.net/weixin_42107217/article/details/130705221)


下一篇：


[文献笔记——A View of Cloud Computing](https://blog.csdn.net/weixin_42107217/article/details/131365713)


### 大家在看


-
[AI 辅助写作汉语言文学论文靠谱吗？本科课程论文、毕业论文分别怎么用](https://blog.csdn.net/paperred/article/details/164302991)

-

-
[提示、模型与记忆：Codex 的三个核心杠杆
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
309](https://blog.csdn.net/tsh2005974tsh/article/details/164233244)

-

-
[从零开始构建你的第一个C#/.NET应用程序：新手入门全指南
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
393](https://blog.csdn.net/2302_82029124/article/details/164227455)

-

-
[C#事件零基础详解（一）：大白话彻底搞懂事件到底是什么
![](https://csdnimg.cn/release/blogv2/dist/pc/img/readCountWhite.png)
150](https://blog.csdn.net/currytc/article/details/164229189)

-

-
[百亿交易、618日9亿：16年金融架构老兵的踩坑全记录](https://blog.csdn.net/chen978616649/article/details/164302326)

-


### 最新文章


-
[傻瓜操作：GraphRAG、Ollama 本地部署及踩坑记录](https://blog.csdn.net/weixin_42107217/article/details/141649920)

-

-
[学习最优化课程中的一些疑惑](https://blog.csdn.net/weixin_42107217/article/details/133916758)

-

-
[文献笔记——A View of Cloud Computing](https://blog.csdn.net/weixin_42107217/article/details/131365713)

-


[2024年1篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2024&month=08)
[2023年4篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2023&month=10)
[2020年4篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2020&month=01)
[2019年8篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2019&month=12)
[2018年14篇](https://blog.csdn.net/weixin_42107217?type=blog&year=2018&month=12)


![](https://kunyu.csdn.net/1.png?p=57&adBlockFlag=0&adId=1110447&a=1110447&c=4492406&k=文献笔记——A brief introduction to distributed systems分布式系统&spm=1001.2101.3001.5001&articleId=130808489&d=1&t=3&u=62297005bc434cc2a46bec881bcc4e93)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/c-blog-slidelogo-White.png)


· AI 阅读助手


### 目录


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)

收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


![](https://kunyu.csdn.net/1.png?p=530&adBlockFlag=0&adId=1110216&a=1110216&c=4475404&k=文献笔记——A brief introduction to distributed systems分布式系统&spm=1001.2101.3001.4647&articleId=130808489&d=1&t=3&u=0f6eaa92561446b59cfbdd9d24dc9bd7)


![](https://csdnimg.cn/release/blogv2/dist/pc/img/c-blog-slidelogo-White.png)


· AI 阅读助手


### 目录


展开全部 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-bot-White.png)

收起 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/arrowup-line-top-White.png)


![](https://kunyu.csdn.net/1.png?p=479&adId=1100447&adBlockFlag=0&a=1100447&c=0&k=文献笔记——A brief introduction to distributed systems分布式系统&spm=1001.2101.3001.4834&articleId=130808489&d=1&t=3&u=679ec5500e81438ca918d566c2eb87d7)


上一篇：


[I‘m back](https://blog.csdn.net/weixin_42107217/article/details/130705221)


下一篇：


[文献笔记——A View of Cloud Computing](https://blog.csdn.net/weixin_42107217/article/details/131365713)


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


评论
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