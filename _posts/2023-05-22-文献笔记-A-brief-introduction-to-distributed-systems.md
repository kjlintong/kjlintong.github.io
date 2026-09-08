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

## 1、什么是分布式系统?

### 分布式系统的宽泛定义:

>

*A distributed system is **a collection of autonomous computing elements** that appears to its users as **a single coherent system**.*

请注意，有两个特征：

### 特征1：自主计算元素的集合

- 每个计算元素（作为一个节点）都可以相互独立行动。一个集合中的节点可以彼此不同（从非常大的高性能计算机到手机或甚至更小的设备）。

- 他们必须沟通和协调行动，以实现一个共同的目标。

为了实现这一特点，我们必须考虑如何管理系统中的成员，如何处理缺乏统一的时间参照物的问题。

### 特征2：一个单一的连贯系统

>

in a single coherent system the collection of nodes as a whole operates the same, no matter where, when, and how interaction between a user and the system takes place.

- 一个重要的设计目标：分配透明度。 详细内容见下一节。

### 分布式系统像中间件类似组织

>

为了帮助开发分布式应用，分布式系统通常被组织为一个单独的软件层，从逻辑上讲，它被置于作为计算机各自操作系统之上。这种组织方式如图所示。

![](/img/posts/2023-05-22-lit-note-distributed/middleware.png)

Fig.2 中间件(from "A brief introduction to distributed systems")

**它提供以下服务：**

- 资源管理

- 便于应用间通信的设施

- 安全服务

- 账户服务

- 掩盖故障并修复故障

## 2、4个设计目标

>

A distributed system should make resources easily accessible; it should hide the fact that resources are distributed across a network; it should be open; and it should be scalable.
分布式系统应该使资源容易获得；它应该隐藏资源分布在网络上的事实；它应该是开放的；而且应该是可扩展的。

### 1）支持资源共享

资源几乎可以是任何东西，但典型的例子包括外围设备、存储设施、数据、文件、服务和网络，仅举几例。

通过支持资源共享，它有助于降低成本，促进不同节点之间的合作。

### 2）让分布透明（Making distribution transparent）

分布透明性一共有七种类型：

| 透明性类型 | 说明 |
| :--- | :--- |
| 访问透明（Access） | 隐藏数据表示方式以及对象访问方式的差异 |
| 位置透明（Location） | 隐藏对象的位置（通常通过只给资源分配逻辑名称实现） |
| 迁移透明（Relocation） | 隐藏对象在使用过程中可能被移动到其他位置的事实（在云计算场景下越来越重要） |
| 转移透明（Migration） | 隐藏对象可能移动到其他位置的事实（支持用户发起的进程和资源移动，且不影响正在进行的通信和操作） |
| 复制透明（Replication） | 隐藏对象被复制的事实 |
| 并发透明（Concurrency） | 隐藏对象可能被多个独立用户共享的事实（通过锁机制实现） |
| 故障透明（Failure） | 隐藏对象的故障和恢复 |

为了区分 Relocation 和 Migration 两种透明性，举两个例子：

- **迁移透明（Relocation）**：整个站点可能为了更有效地利用磁盘空间而从一个数据中心迁到另一个，用户不应该察觉到。
- **转移透明（Migration）**：手机之间的通信——无论通话双方是否在移动，手机都能让对话继续。

**盲目地向用户隐藏所有分布细节并不是一个好主意。** 完全的分布透明性永远无法实现，而且高透明度和系统性能之间存在权衡。

> 结论是：在设计分布式系统时追求分布透明性可能是个不错的目标，但应与其他问题（如性能和可理解性）一起考虑。实现完全透明的代价可能高得惊人。

### 3）保持开放（Being open）

> An open distributed system is essentially a system that offers components that can easily be used by, or integrated into other systems. At the same time, an open distributed system itself will often consist of components that originate from elsewhere.

开放分布式系统本质上是一个提供组件的系统，这些组件可以被其他系统方便地使用或集成；同时，开放分布式系统本身也常常由来自其他系统的组件构成。

- **互操作性（Interoperability）**：来自不同厂商的系统或组件实现，仅依靠共同标准规定的服务就能共存并协同工作的程度。
- **可组合性（Composability）**：即可移植性（Portability），指为分布式系统 A 开发的应用程序，无需修改即可在实现了相同接口的另一个分布式系统 B 上运行的程度。
- **可扩展性（Extensibility）**：在不影响现有组件的情况下，方便地添加新组件或替换旧组件。

**分离策略与机制（Separating policy from mechanism）**

> 为了实现开放分布式系统的灵活性，系统应组织为一组相对较小、易于替换或适配的组件。
> 理论上，严格分离策略与机制似乎是最佳方式。但有一个重要的权衡：分离得越严格，就越需要确保提供适当的机制集合。在实践中，这意味着提供丰富的功能集，从而带来大量配置参数。

### 4）可扩展性（Being scalable）

#### a. 可扩展性的三个维度

系统的可扩展性可以从三个维度衡量：

- **规模可扩展性（Size scalability）**：系统可以在规模上扩展，即可以轻松添加更多用户和资源，而不会明显损失性能。
  当系统需要扩展时，我们常常面临集中式服务的限制。许多服务是集中式的——由分布式系统中某台特定机器上的单个服务器或一组服务器实现。服务器可能因为三个根本原因成为瓶颈：
  1. 计算能力，受限于 CPU
  2. 存储容量，包括 CPU 与磁盘之间的传输速率
  3. 用户与集中式服务之间的网络

- **地理可扩展性（Geographical scalability）**：用户和资源可能相距很远的系统。
  在地理可扩展系统中，通信延迟可能很大这一事实几乎不会被注意到。阻碍地理可扩展性的另一个问题是：广域网中的通信天生比局域网中的通信可靠性低得多。此外，还需要应对带宽有限的限制。

- **管理可扩展性（Administrative scalability）**：即使跨越多个独立的管理组织，仍然易于管理的系统。
  需要解决的一个主要问题是：在资源使用（和计费）、管理以及安全方面相互冲突的策略。

> 如果分布式系统扩展到另一个域，需要采取两类安全措施。第一，分布式系统必须保护自己免受新域的恶意攻击。第二，新域必须保护自己免受分布式系统的恶意攻击。

#### b. 扩展技术（Scaling techniques）

> 说到向外扩展（部署更多机器来扩大分布式系统），基本上只有三种技术可用：**隐藏通信延迟、工作分配、复制（replication）**。

- **隐藏通信延迟**：适用于地理可扩展性。基本思想很简单：尽可能避免等待远程服务的响应。在等待回复时，可以做其他事情。
- **分区与分布（partition and distribution）**：将组件拆分成更小的部分，然后分散到整个系统中。*例如：DNS 提供的命名服务就分布在不同机器上，从而避免单个服务器处理所有名字解析请求。*
- **复制组件（Replication）**：复制不仅能提高可用性，还能在组件之间平衡负载，带来更好的性能；同时也有助于隐藏通信延迟。**注意，复制需要某种全局同步机制。**

#### c. 结论

规模可扩展性从技术角度来看问题最小。地理可扩展性则困难得多，因为网络延迟天然有下限。结合分布、复制和缓存技术，配合不同形式的一致性，通常能得出可接受的解决方案。管理可扩展性似乎是最难解决的问题，部分原因在于需要处理非技术性问题。

### 5）常见错误假设（False assumptions）

每个首次开发分布式应用的人都会做出以下错误假设：

- 网络是可靠的（The network is reliable）
- 网络是安全的（The network is secure）
- 网络是同构的（The network is homogeneous）
- 拓扑结构不会改变（The topology does not change）
- 延迟为零（Latency is zero）
- 带宽是无限的（Bandwidth is infinite）
- 传输成本为零（Transport cost is zero）
- 只有一个管理员（There is one administrator）
