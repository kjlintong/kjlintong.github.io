---
layout: post
title: "文献笔记 A View of Cloud Computing"
subtitle: ""
date: 2023-06-24
author: Ryan
permalink: /blog/lit-note-cloud-computing-overview/
categories:
  - 技术
tags:
  - 文献阅读
  - 云计算

description: "经典论文阅读笔记：Armbrust 等人对云计算的权威定义，以及影响云计算落地的 10 大障碍与对应的解决机会。"
---

### Defining Cloud Computing

>

Cloud computing refers to both the applications delivered as services over the Internet and the hardware and systems software in the data centers that provide those services.

### Top 10 Obstacles and Opportunities for Cloud Computing

| # | Obstacle | Opportunity |
| :---: | :--- | :--- |
| 1 | Availability/Business Continuity | Use Multiple Cloud Providers |
| 2 | Data Lock-In | Standardize APIs; Compatible SW to enable Surge or Hybrid Cloud Computing |
| 3 | Data Confidentiality and Auditability | Deploy Encryption, VLANs, Firewalls |
| 4 | Data Transfer Bottlenecks | FedExing Disks; Higher BW Switches |
| 5 | Performance Unpredictability | Improved VM Support; Flash Memory; Gang Schedule VMs |
| 6 | Scalable Storage | Invent Scalable Store |
| 7 | Bugs in Large Distributed Systems | Invent Debugger that relies on Distributed VMs |
| 8 | Scaling Quickly | Invent Auto-Scaler that relies on ML; Snapshots for Conservation |
| 9 | Reputation Fate Sharing | Offer reputation-guarding services like those for email |
| 10 | Software Licensing | Pay-for-use licenses |

Sometimes, sending the disks, or even the whole computer, is more effective than sending a lot of data by a network.
