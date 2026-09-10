---
layout: post
title: "Reading Notes: A View of Cloud Computing"
title_zh: "文献笔记 A View of Cloud Computing"
subtitle: ""
date: 2023-06-24
author: Ryan
permalink: /blog/lit-note-cloud-computing-en/
lang: en
lang_pair: /blog/lit-note-cloud-computing-overview/
categories:
  - Tech
tags:
  - Literature Notes
  - Cloud Computing
description: "Classic paper reading notes: Armbrust et al.'s authoritative definition of cloud computing and the 10 obstacles to adoption with their corresponding opportunities."
---

*[中文原文](/blog/lit-note-cloud-computing-overview/)*

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
