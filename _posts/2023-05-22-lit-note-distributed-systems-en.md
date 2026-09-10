---
layout: post
title: "Reading Notes: A Brief Introduction to Distributed Systems"
title_zh: "文献笔记 A Brief Introduction to Distributed Systems"
subtitle: ""
date: 2023-05-22
author: Ryan
permalink: /blog/lit-note-distributed-systems-en/
lang: en
lang_pair: /blog/lit-note-distributed-systems-overview/
categories:
  - Tech
tags:
  - Literature Notes
  - Distributed Systems
description: "Reading notes on Coulouris-style distributed systems overview: definition, transparency classifications, and common design goals."
---

*[中文原文](/blog/lit-note-distributed-systems-overview/)*

---

## 1. What Is a Distributed System?

### A broad definition of a distributed system:

> *A distributed system is **a collection of autonomous computing elements** that appears to its users as **a single coherent system**.*

Note that there are two characteristics here:

### Characteristic 1: a collection of autonomous computing elements

- Each computing element (acting as a node) can act independently of the others. The nodes in a collection can be very different from each other (from a very large, powerful computer to a mobile phone, or even a smaller device).

- They must communicate and act in a coordinated way in order to achieve a common goal.

To support this characteristic, we have to consider how the members of the system are managed, and how to deal with the absence of a common frame of time reference.

### Characteristic 2: a single coherent system

> in a single coherent system the collection of nodes as a whole operates the same, no matter where, when, and how interaction between a user and the system takes place.

- One important design goal: transparency of distribution. See the next section for details.

### A distributed system is organized like middleware

> To help development of distributed applications, a distributed system is generally organized as a single software layer that is placed, logically, above the operating systems of the computers involved as a whole. This organization is shown in the figure.

![](/img/posts/2023-05-22-lit-note-distributed/middleware.png)

Fig.2 Middleware (from "A brief introduction to distributed systems")

**It provides the following services:**

- Resource management

- Facilities that make it easier for applications to communicate

- Security services

- Accounting services

- Hiding failures and repairing them

## 2. Four design goals

> A distributed system should make resources easily accessible; it should hide the fact that resources are distributed across a network; it should be open; and it should be scalable.

### 1) Supporting resource sharing

Resources can be almost anything, but typical examples include peripherals, storage facilities, data, files, services, and networks, to name just a few.

Supporting resource sharing helps to reduce costs and encourages cooperation between different nodes.

### 2) Making distribution transparent

There are seven types of distribution transparency:

| Transparency type | Description |
| :--- | :--- |
| Access | Hides differences in the way data is represented and the way objects are accessed |
| Location | Hides where an object is located (usually achieved by giving resources logical names only) |
| Relocation | Hides the fact that an object may be moved to another location while it is being used (increasingly important in cloud computing scenarios) |
| Migration | Hides the fact that an object may be moved to another location (supports user-initiated movement of processes and resources without disturbing ongoing communication and operations) |
| Replication | Hides the fact that an object is replicated |
| Concurrency | Hides the fact that an object may be shared by multiple autonomous users (achieved through locking mechanisms) |
| Failure | Hides failures and recovery of an object |

Two examples to tell the Relocation and Migration transparencies apart:

- **Relocation transparency**: an entire site may be moved from one data center to another to make more effective use of disk space, and users should not notice it.
- **Migration transparency**: communication between mobile phones — whether or not the two parties on the call are moving, the phones keep the conversation going.

**Blindly hiding every detail of distribution from the user is not a good idea.** Full distribution transparency can never be achieved, and there is a trade-off between a high degree of transparency and system performance.

> The conclusion is that pursuing distribution transparency may be a good goal when designing a distributed system, but it should be weighed together with other concerns (such as performance and understandability). The cost of achieving full transparency can be alarmingly high.

### 3) Being open

> An open distributed system is essentially a system that offers components that can easily be used by, or integrated into other systems. At the same time, an open distributed system itself will often consist of components that originate from elsewhere.

- **Interoperability**: the extent to which systems or component implementations from different vendors can coexist and work together, relying only on the services specified by common standards.
- **Composability**: that is, portability — the extent to which an application developed for distributed system A can run unmodified on another distributed system B that implements the same interfaces.
- **Extensibility**: adding new components or replacing old ones conveniently, without affecting existing components.

**Separating policy from mechanism**

> To achieve the flexibility of an open distributed system, the system should be organized as a set of relatively small components that are easy to replace or adapt.
> In theory, a strict separation of policy from mechanism seems like the best approach. But there is an important trade-off: the stricter the separation, the more we have to ensure that an appropriate set of mechanisms is offered. In practice, this means providing a rich feature set, which in turn brings a large number of configuration parameters.

### 4) Being scalable

#### a. Three dimensions of scalability

A system's scalability can be measured along three dimensions:

- **Size scalability**: the system can scale in size, that is, more users and resources can be added easily without an obvious loss of performance.
  When a system needs to grow, we often run into the limits of centralized services. Many services are centralized — implemented by a single server, or a group of servers, on one specific machine in the distributed system. A server can become a bottleneck for three fundamental reasons:
  1. Compute capacity, limited by the CPU
  2. Storage capacity, including the transfer rate between the CPU and the disk
  3. The network between users and the centralized service

- **Geographical scalability**: the system is composed of users and resources that may be geographically widely dispersed.
  In a geographically scalable system, the fact that communication latency may be large is hardly noticeable. Another problem that hinders geographical scalability: communication over a wide-area network is inherently much less reliable than communication over a local network. On top of that, limited bandwidth also has to be dealt with.

- **Administrative scalability**: the system is easy to manage even when it spans multiple independent administrative organizations.
  One major problem to solve: conflicting policies on resource usage (and billing), on administration, and on security.

> When a distributed system is scaled into another domain, two classes of security measures are needed. First, the distributed system must protect itself against malicious attacks from the new domain. Second, the new domain must protect itself against malicious attacks from the distributed system.

#### b. Scaling techniques

> When it comes to scaling out (deploying more machines to grow a distributed system), essentially only three techniques are available: **hiding communication latencies, work distribution, and replication**.

- **Hiding communication latencies**: applies to geographical scalability. The basic idea is simple: avoid waiting for a response from a remote service as much as possible. While waiting for a reply, you can do something else.
- **Partition and distribution**: split components into smaller parts and then spread them across the system. *For example, the naming service provided by DNS is distributed over different machines, so that a single server does not have to handle all name-resolution requests.*
- **Replication of components**: replication not only improves availability, it also balances load between components for better performance, and it helps hide communication latencies. **Note that replication requires some form of global synchronization.**

#### c. Conclusion

Size scalability is technically the least problematic. Geographical scalability is much harder, because network latency has a natural lower bound. Combining distribution, replication, and caching techniques, together with different forms of consistency, usually leads to an acceptable solution. Administrative scalability appears to be the hardest problem to solve, partly because non-technical issues have to be handled as well.

### 5) Common false assumptions

Everyone who develops a distributed application for the first time makes the following false assumptions:

- The network is reliable
- The network is secure
- The network is homogeneous
- The topology does not change
- Latency is zero
- Bandwidth is infinite
- Transport cost is zero
- There is one administrator
