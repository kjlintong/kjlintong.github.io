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
