---
layout:     post
title:      literature notes
subtitle:   "A brief introduction to distributed systems"
description: "分布式系统经典入门论文阅读笔记：从微处理器与高速网络两大技术基础出发，概述分布式系统的定义、动机与核心挑战。"
date:       2023-05-21
author:     Ryan
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
categories:
    - 技术
tags:

    - distributed system
    - literature note

---



*This paper mainly talks about distributed systems. The authors provide an overview of distributed systems,  perfect for anyone who are new to distributed systems.*  

***

![outline](https://img-blog.csdnimg.cn/ed00526be2e84204903532fe9ba9ae08.png)

<center>Fig.1 outline</center>

In the first part of the paper,  the authors briefly review the evolution of computing and point out two technical foundations of distributed systems: the development of powerful microprocessors and the invention of high-speed computer networks. Why are these technologies important?

> The result of these technologies is that it is now not only feasible but easy, to put together a computing system composed of many networked computers, be they large or small.

# 1 What is a distributed system?

## a loose definition of distributed systems:

> *A distributed system is **a collection of autonomous computing elements** that appears to its users as **a single coherent system**.*

  Notice that there are two characteristic features.

## Characteristic 1: a collection of autonomous computing elements

* Every computing element (as a node) can act independently from each other. Nodes in a collection could be different from each other (ranging from very big high-performance computers to small plug computers or even smaller devices).
* They have to communicate and coordinate their actions to achieve a common goal. 

To achieve this characteristic, we have to think about how to manage the membership and how to deal with the lack of a common reference of time.

## Characteristic 2: a single coherent system

> in a single coherent system the collection of nodes as a whole operates the same, no matter where, when, and how interaction between a user and the system takes place.

* an important design goal: distribution transparency.  The detail is in the next section.

## A distributed system organized as middleware

> To assist the development of distributed applications, distributed systems are often organized to have a separate layer of software that is logically placed on top of the respective operating systems of the computers that are part of the system. This organization is shown in Fig.

![middleware](https://img-blog.csdnimg.cn/7609ef27ca9447d7aea814983e027581.png)

<center>Fig.2 middleware(from "A brief introduction to distributed systems")</center>

#####   It offers services as follows:

* resource management
* Facilities for interapplication communication
* Security services
* Accounting services
* Masking of and recovery from failures

# 2 Four design goals

> A distributed system should make resources easily accessible; it should hide the fact that resources are distributed across a network; it should be open; and it should be scalable.

## 1）Supporting resource sharing

Resources can be virtually anything, but typical examples include peripherals, storage facilities, data, files, services, and networks, to name just a few.

By supporting resource sharing, it helps to reduce costs and facilitate cooperation between different nodes.

## 2）Making distribution transparent

There are seven types of distribution transparency.

| Transparency |                         Description                          |
| :----------: | :----------------------------------------------------------: |
|    Access    | Hide differences in data representation and how an object is accessed |
|   Location   | Hide where an object is located(often achieved by assigning only logical names to resources) |
|  Relocation  | Hide that an object may be moved to another location while in use (which is becoming increasingly important in the context of cloud computing) |
|  Migration   | Hide that an object may move to another location (it supports the mobility of processes and resources initiated by users, without affecting ongoing communication and operations.) |
| Replication  |              Hide that an object is replicated               |
| Concurrency  | Hide that an object may be shared by several independent users (be achieved through locking mechanisms) |
|   Failure    |          Hide the failure and recovery of an object          |

For distinguishing between relocation and migration transparent, two examples could help to understand:

* Relocation transparent:  the entire site may have been moved from one data center to another to make more efficient use of disk space, yet users should not notice.
* Migration transparent: Communication between mobile phones-regardless whether two people are actually moving, mobile phones will allow them to continue their conversation.

**Attempting to blindly hide all distribution aspects from users is not a good idea. ** Full distribution transparency can never be achieved. There is also a trade-off between a high degree of transparency and the performance of a system.

> The conclusion is that aiming for distribution transparency may be a nice goal when designing and implementing distributed systems, but that it should be considered together with other issues such as performance and comprehensibility. The price for achieving full transparency may be surprisingly high.

## 3）Being open

> An open distributed system is essentially a system that offers components that can easily be used by, or integrated into other systems. At the same time, an open distributed system itself will often consist of components that originate from elsewhere.

* **Interoperability**: the extent by which two implementations of systems or components from different manufacturers can co-exist and work together by merely relying on each other’s services as specified by a common standard.
* **Composability**: Namely Portability, the extent an application developed for a distributed system A can be executed, without modification, on a different distributed system B that implements the same interfaces as A.
* **Extensibility**: It should be easy to add new components or replace existing ones without affecting those components that stay in place.

**Separating policy from mechanism**

> To achieve flexibility in open distributed systems, it is crucial that the system be organized as a collection of relatively small and easily replaceable or adaptable components.
>
> In theory, strictly separating policies from mechanisms seems to be the way to go. However, there is an important trade-off to consider: the stricter the separation, the more we need to make sure that we offer the appropriate collection of mechanisms. In practice, this means that a rich set of features is offered, in turn leading to many configuration parameters.

## 4）Being scalable

### a. different dimensions of scalability

The scalability of a system can be measured along three different dimensions：

* **Size scalability**: A system can be scalable concerning its size, meaning that we can easily add more users and resources to the system without any noticeable loss of performance.

When a system needs to scale, we are often confronted with the limitations of centralized services. Many services are centralized in the sense that they are implemented using a single server, or group of servers, running on the specific machine in the distributed system. The server can simply **become a bottleneck for three root causes**: 

1. The computational capacity, limited by the CPUs
2. The storage capacity, including the transfer rate between CPUs and disks
3. The network between the user and the centralized service

* **Geographical scalability**: A geographically scalable system is one in which the users and resources may lie far apart.

In a geographically scalable system, the fact that communication delays may be significant is hardly noticed.  Another problem that hinders geographical scalability is that communication in wide-area networks is inherently much less reliable than in local-area networks. In addition, we also need to deal with limited bandwidth.

* **Administrative scalability**: An administratively scalable system is one that can still be easily managed even if it spans many independent administrative organizations.

A major problem that needs to be solved is that of conflicting policies with respect to resource usage (and payment), management, and security.

> If a distributed system expands to another domain, two types of security measures need to be taken. First, the distributed system has to protect itself against malicious attacks from the new domain. Second, the new domain has to protect itself against malicious attacks from the distributed system.

### b. Scaling techniques

> When it comes to scaling out, that is, expanding the distributed system by essentially deploying more machines, there are basically only three techniques we can apply: **hiding communication latencies, distribution of work, and replication**.

* Hiding communication latencies is applicable in the case of geographical scalability. The basic idea is simple: try to avoid waiting for
  responses to remote-service requests as much as possible. When we waiting for a reply, we can do other things. 
* partition and distribution, which involves taking a component, splitting it into smaller parts, and subsequently spreading those parts across the system. *Example: the naming service, as provided by DNS, is distributed
  across several machines, thus avoiding that a single server having to deal with all requests for name resolution.*
* Replicate components: Replication not only increases availability but also helps to balance the load between components leading to better performance. And it also could help to hide communication latencies. **Notice that replication requires some global synchronization mechanism.**

### c. conclusion

Size scalability is the least problematic from a technical point of view. Geographical scalability is a much tougher problem as network latencies are naturally bound from below. Combining distribution, replication, and caching
techniques with different forms of consistency generally lead to acceptable solutions. Administrative scalability seems to be the most difficult problem to solve, partly because we need to deal with nontechnical issues.

## 5) Notice some false assumptions

Following false assumptions that everyone makes when developing a distributed application for the first time:

* The network is reliable
* The network is secure
*  The network is homogeneous
* The topology does not change
* Latency is zero
* Bandwidth is infinite
* Transport cost is zero
* There is one administrator

# 3 Three types of distributed systems

There are three main types of distributed systems: distributed computing systems, distributed information systems, and pervasive systems.

## 1) High-performance distributed computing

There are also three types of distributed computing systems:

* **cluster computing**  The underlying hardware consists of a collection of similar workstations or PCs, closely connected using a high-speed local-area network. In addition, each node runs the same operating system. In virtually all cases, cluster computing is used for parallel programming in which a single (compute-intensive) program is run in parallel on multiple machines.

* **grid computing ** Consists of distributed systems that are often constructed as a federation of computer systems, where each system may fall under a different administrative domain, and may be very different when it comes to hardware, software, and deployed network technology. **A key issue** in a grid computing system is that resources from different organizations are brought together to allow the collaboration of a group of people from different institutions, indeed forming a federation of systems.

* **cloud computing**  Provides the facilities to dynamically construct infrastructure and compose what is needed from available services. Unlike grid computing, which is strongly associated with high-performance computing, cloud computing is much more than just providing lots of resources. Cloud computing is characterized by an easily usable and accessible pool of virtualized resources. And how resources are used can be configured dynamically, providing the basis for scalability: if more work needs to be done, a customer can simply acquire more resources. In practice, clouds are organized into four layers, as shown in Fig.3:

  ![the organization of clouds](https://img-blog.csdnimg.cn/ae886d1ecf44409fbff7756e3362482b.png)

<center>Fig.3 The organization of clouds (from "A brief introduction to distributed systems")</center>

1. Hardware: processors, routers, but also power and cooling systems.
2. Infrastructure: The backbone for most cloud computing platforms. It deploys virtualization techniques to provide customers with an infrastructure consisting of virtual storage and computing resources.
3. Platform: The platform layer provides a cloud-computing customer with what an operating system provides to application developers.
4. Application: Actual applications run in this layer and are offered to users for further customization.

**distributed shared-memory multicomputer**(or simply DSM system)

 To overcome the limitations of shared-memory systems and distributed-memory systems, a DSM system allows a processor to address a memory location at
another computer as if it were local memory. This can be achieved using existing techniques available to the operating system, for example, by mapping all main-memory pages of the various processors into a single virtual address space.

But DSM eventually had to be abandoned for the simple reason that performance could never meet the expectations of programmers, who would rather resort to far more intricate, yet better (predictably) performing message-passing programming models.

##### *At the end of this section, the authors said that "An important side-effect of exploring the hardware-software boundaries of parallel processing is a thorough understanding of consistency models".  I can't understand it. If you have any insights into this statement, please do not hesitate to enlighten me*.

## 2) Distributed information systems

> Another important class of distributed systems is found in organizations that were confronted with a wealth of networked applications, but for which interoperability turned out to be a painful experience.

The solution is to integrate applications into an enterprise-wide information system. According to where integration takes place, there are two types of distributed information systems.

* **Distributed transaction processing**: Integration at the lowest level allows clients to wrap several requests, possibly for different servers, into a single larger request and have it executed.
* **Enterprise Application Integration (EAI)**: Integration should also take place by letting applications communicate directly with each other.

In general, there are four ways to support enterprise application integration:

1. **File transfer**: an application produces a file containing shared data that is subsequently read by other applications. There are a lot of things that need to be agreed upon ( File format and layout, File management, Update propagation)
2. **Shared database**: As literally.
3. **Remote procedure call**: A main drawback of RPCs is that caller and callee need to be up and running at the same time for the call to succeed.
4. **Messaging**:  Messaging system carrying requests from application A to act as application B, is what is needed. The messaging system ensures that eventually the request is delivered, and if needed, that a response is eventually returned as well.

##### *I can't understand this part very well. There are many technical details I need to learn further*.

## 3) Pervasive systems

Introduction of mobile and embedded computing devices leading to what is generally referred to as pervasive systems. What makes them unique is that the separation between users and system components is much more blurred.

- **Ubiquitous computing systems**: The system is pervasive and continuously present. The core requirements for a ubiquitous computing system are roughly as follows:

1. *Distribution*: Devices are networked, distributed, and accessible in a transparent manner
2. *Interaction*: Interaction between users and devices is highly unobtrusive
3. *Context awareness*: The system is aware of a user’s context to optimize interaction
4. *Autonomy*: Devices operate autonomously without human intervention, and are thus highly self-managed
5. *Intelligence*: The system as a whole can handle a wide range of dynamic actions and interactions

#####            *I guess the authors must talk about ChatGPT*.

* **Mobile computing systems**: First, the devices that form part of a (distributed) mobile system may vary widely, including smartphones, remote controls, pagers, active badges, car equipment, and so on. Second, in mobile computing, the location of a device is assumed to change over time. So we need to use disruption-tolerant networks.

* **Sensor networks**: A sensor network generally consists of tens to hundreds or thousands of relatively small nodes, each equipped with one or more sensing devices. In addition, nodes can often act as actuators. Most sensor networks use wireless communication, and
  the nodes are often battery-powered. Their limited resources, restricted communication capabilities, and constrained power consumption demand that efficiency is high on the list of design criteria. 

  #####  *There are many technical details I need to learn further in this part*.

# 4 Outlook

At the end of the paper, the authors focus on two areas of the development for coming years in distributed systems. 

## Dependability: making  systems robust and trustworthy

* how to prevent, handle, and recover from failures due to the inherent errors in systems？
* how to provide better protection against deliberate attacks?
* how to protect users from systems?

## Scalability: the Internet of everything

* developing scalable solutions
* viewing the system as a whole and finding the proper formalisms for describing the observed behavior.
