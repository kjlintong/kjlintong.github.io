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
  - GraphRAG
  - Ollama

description: "GraphRAG 本地部署完整指南：从环境准备、依赖安装到项目初始化，一步步讲解如何将微软 GraphRAG 与本地 Ollama 模型结合，实现完全离线的知识库问答，并附上部署过程中的踩坑记录。"
---

折腾了一天终于把 GraphRAG 部署好了，记录一下心酸的踩坑过程。

# 一、GraphRAG 介绍

> 这里按惯例介绍一下 GraphRAG（其实就是水字数，大部分是 GPT 写的）

## 1.引言

微软开源了一个新的基于知识图谱构建的检索增强生成（RAG）系统：GraphRAG。该框架主要解决了如何将检索增强生成（RAG）应用于整个文本语料库的全局性问题，例如"数据集中的主题是什么？"

[论文地址](https://arxiv.org/pdf/2404.16130)

[项目地址](https://microsoft.github.io/graphrag/)

## 2.创新点

1. **图RAG方法**：提出了一种新的Graph RAG方法，这种方法结合了知识图谱的构建、检索增强生成（RAG）和查询聚焦摘要（QFS），以支持对整个文本语料库的人类感知制作。这种方法特别针对于全局性问题，如"数据集中的主要主题是什么？"
2. **两阶段图索引构建**：Graph RAG方法使用大型语言模型（LLM）分两个阶段构建基于图的文本索引：
    - **第一阶段**：从源文档中提取实体，构建实体知识图谱。
    - **第二阶段**：为所有密切相关的实体组预生成社区摘要。
3. **社区检测算法**：利用社区检测算法（如Leiden算法）将图索引划分为模块化的社区，这些社区内的节点（实体）之间有更强的联系。
4. **查询聚焦摘要**：通过查询聚焦摘要方法，将社区摘要合并为最终的全局答案，这种方法特别适用于处理大规模文本数据集。

## 3. 算法

![GraphRAG 流水线（论文 Fig.1）](/img/posts/2024-08-28-graphrag-ollama/graphrag-pipeline.png)

- **图索引构建**：首先，使用LLM对源文档进行处理，提取实体和关系，构建实体知识图谱。然后，使用社区检测算法将图谱划分为社区，并为每个社区生成摘要。
- **查询处理**：当接收到用户查询时，系统会使用社区摘要来生成部分答案。这些部分答案随后被汇总和摘要，以形成对用户的最终回答。
- **并行处理**：在索引和查询时，系统能够并行处理社区摘要，这提高了处理效率并允许处理大规模数据集。
- **模块化和可扩展性**：Graph RAG方法的模块化设计允许它适应不同规模和类型的数据集，同时保持高效和可扩展。

## 4. 数据和实验结果

- **数据集选择**：选择了两个大约一百万标记的数据集进行评估，包括播客文稿和新闻文章，这些数据集代表了用户在现实世界活动中可能遇到的文本语料库类型。
- **问题生成**：使用活动中心的方法自动化生成需要理解整个语料库的问题，而不是特定文本的细节。
- **条件比较**：比较了六种不同的条件，包括使用不同层次的图社区（C0, C1, C2, C3）的Graph RAG，直接对源文本应用map-reduce方法的文本摘要（TS），以及朴素的"语义搜索"RAG方法（SS）。
- **评估指标**：采用LLM评估器进行头对头比较，选择了三个目标指标来捕捉对感知制作活动有益的质量：全面性、多样性和赋能性。同时，使用直接性作为有效性的指标。
- **结果分析**：
    - **全局方法与朴素RAG**：全局方法在全面性和多样性指标上一致优于朴素RAG方法。
    - **社区摘要与源文本**：社区摘要通常在答案的全面性和多样性上提供了小幅但一致的改进，尤其是在播客数据集的中级社区摘要和新闻数据集的低级社区摘要中。
    - **赋能性**：赋能性比较显示了混合结果，但LLM分析指出提供具体例子、引用和引证的能力是帮助用户达到知情理解的关键。
    - **上下文窗口大小**：测试了不同的上下文窗口大小，发现最小的上下文窗口大小（8k）在全面性上普遍表现更好，而在多样性和赋能性上与较大的上下文窗口大小相当。

## 5.不足和展望

- 目前的评估仅限于一类全局性问题和大约一百万标记的数据集，未来的工作需要在不同类型的问题、数据类型和数据集大小上验证性能。
- 考虑构建图索引的权衡，包括计算预算、预期的查询数量以及从图索引中获得的其他价值。
- 未来的工作可能包括更本地化的 RAG 方法，以及将基于嵌入的匹配与社区报告结合起来的混合 RAG 方案。

# 二、本地部署

> 目前已经有很多教程，但在我跑模型过程中，发现还是很多 bug，这里记录一下。部署过程中主要参考了几个教程，列在文末

## 1.为什么要本地部署

微软开源的 GraphRAG 项目代码和 OpenAI 的 Chat GPT 高度耦合，对我这样又穷又不方便科学上网的人实在不友好，据说跑一个官方的demo 就要 10 刀。还是用开源的模型方便啊，开源万岁！！

> 土豪可以直接用官网的项目；如果要接本地或国产模型，也可以参考社区里的部署教程。

## 2.环境准备

这部分基础环境配置就不废话了，我的环境如下：

- 操作系统 windows 11
- PyCharm 2024.2.0.1
- Python 3.12
- Ollama（Ollama 的安装和使用有一大堆教程，可以参考这个：[handy-ollama](https://github.com/AXYZdong/handy-ollama)）

## 3. GraphRAG 安装

### 3.1 下载 GraphGAG

命令行操作

```bash
git clone https://github.com/microsoft/graphrag.git 
```

这里注意一下，很多教程上代码地址是： https://github.com/TheAiSingularity/graphrag-local-ollama.git，而本文写的是官网地址。正如前面所说，微软的 GraphRAG 项目代码和 OpenAI 的 Chat GPT 高度耦合，改用 Ollama 需要进行很多修改。TheAiSingularity 和官网的区别正在于此。**但是**，**但是**，截止今天（2024.8.28）我部署情况看，这个修改不完全，还有很多地方要改（我已经提了 pr，希望他们能采纳），为了讲解的完整性，下文直接讲解修改官网的项目（其实改的也不多）

### 3.2 安装依赖包

进入 Graph RAG 安装目录

```bash
cd graphrag 
```

傻瓜操作，安装依赖包

```bash
pip install -e .
```

### 3.3 创建数据目录

在 Graph RAG 安装目录下创建文件夹 ragtest/input，这只是方便管理，也可以直接创建 input 文件夹。把要训练的数据放到 input 文件夹（仅支持 txt 文件，可以有多个）。

### 3.4 项目初始化

```bash
python -m graphrag.index --init --root ./ragtest
```

此时会在 ragtest 目录下生成 output，setting.yaml，prompts，.env (默认隐藏）等目录及文件。setting.yaml 是配置文件，后面需要修改，output 是每次跑模型的结果和运行日志。

#### 3.5 修改配置文件

因为要改用本地模型，必须修改配置文件 setting.yaml。修改以下四处：

![配置文件 1](/img/posts/2024-08-28-graphrag-ollama/config-1.png)

- 我的模型使用的是 mistral，这里根据自己的模型修改即可。api_base 是 Ollama 的默认地址，一般都是这个（确保你的端口没被占用）

![配置文件 2](/img/posts/2024-08-28-graphrag-ollama/config-2.png)

- 注意，embeddings 和前面 llm 是两个不同的模型，推荐使用 nomic-embed-text。另外 api_base 末尾是 api

### 3.6 修改.env文件

把原文件内容删掉，换成下面这个

```bash
GRAPHRAG_API_KEY=ollama
GRAPHRAG_CLAIM_EXTRACTION_ENABLED=True
```

> 必须加上参数GRAPHRAG_CLAIM_EXTRACTION_ENABLED=True，否则无法生成协变量 covariates， 在 Local Search 时会出错。

### 3.7 修改源码

这里需要修改几处代码，放心，很简单，已经完成一大半了

在你的 Graph RAG 安装目录下应该有一个 graphrag 的文件夹，长成这样：

![graphrag 源码目录](/img/posts/2024-08-28-graphrag-ollama/graphrag-folder.png)

我们需要修改其中三个文件

- llm\openai\openai_embeddings_llm.py

![openai_embeddings_llm.py](/img/posts/2024-08-28-graphrag-ollama/openai-embeddings-llm.png)

只需要引入 Ollama 依赖 ，然后修改最后五行代码即可(见注释，注释掉的代码为源代码)，如下：

```python
#openai_embeddings_llm.py

from typing_extensions import Unpack
from graphrag.llm.base import BaseLLM
from graphrag.llm.types import (
    EmbeddingInput,
    EmbeddingOutput,
    LLMInput,
)
from .openai_configuration import OpenAIConfiguration
from .types import OpenAIClientTypes
import ollama # 增加依赖

class OpenAIEmbeddingsLLM(BaseLLM[EmbeddingInput, EmbeddingOutput]):
    _client: OpenAIClientTypes
    _configuration: OpenAIConfiguration

    def __init__(self, client: OpenAIClientTypes, configuration: OpenAIConfiguration):
        self._client = client
        self._configuration = configuration

    async def _execute_llm(
        self, input: EmbeddingInput, **kwargs: Unpack[LLMInput]
    ) -> EmbeddingOutput | None:
        args = {
            "model": self._configuration.model,
            **(kwargs.get("model_parameters") or {}),
        }
        # 修改此处
        '''        
        embedding_list = []
        for inp in input:
            embedding = ollama.embeddings(model=self._configuration.model, prompt=inp)
            embedding_list.append(embedding["embedding"])
        return embedding_list
        '''
        embedding_list = []
        for inp in input:
            embedding = ollama.embeddings(model=self._configuration.model, prompt=inp)
            embedding_list.append(embedding["embedding"])
        return embedding_list

```

- query\llm\oai\embedding.py

![embedding.py](/img/posts/2024-08-28-graphrag-ollama/embedding-py.png)

调用ollama提供的模型服务(见注释，注释掉的代码为原代码)， 如下:

```python
# 增加依赖
import ollama    
def embed(self, text: str, **kwargs: Any) -> list[float]:
        """
        Embed text using OpenAI Embedding's sync function.

        For text longer than max_tokens, chunk texts into max_tokens, embed each chunk, then combine using weighted average.
        Please refer to: https://github.com/openai/openai-cookbook/blob/main/examples/Embedding_long_inputs.ipynb
        """
        token_chunks = chunk_text(
            text=text, token_encoder=self.token_encoder, max_tokens=self.max_tokens
        )
        chunk_embeddings = []
        chunk_lens = []
        for chunk in token_chunks:
            try:
                '''
                embedding, chunk_len = self._embed_with_retry(chunk, **kwargs)
                '''
                # 修改 embedding、chunk_len
                embedding = ollama.embeddings(model='nomic-embed-text', prompt=chunk)['embedding']
                chunk_len = len(chunk)
                chunk_embeddings.append(embedding)
                chunk_lens.append(chunk_len)
            # TODO: catch a more specific exception
            except Exception as e:  # noqa BLE001
                self._reporter.error(
                    message="Error embedding chunk",
                    details={self.__class__.__name__: str(e)},
                )

                continue
        '''
        chunk_embeddings = np.average(chunk_embeddings, axis=0, weights=chunk_lens)
        chunk_embeddings = chunk_embeddings / np.linalg.norm(chunk_embeddings)
        return chunk_embeddings.tolist()
        '''
        return chunk_embeddings
```

-  query\llm\text_utils.py

![text_utils.py](/img/posts/2024-08-28-graphrag-ollama/text-utils-py.png)

在 chunk_text() 函数中增加一行代码即可：

```python
def chunk_text(
    text: str, max_tokens: int, token_encoder: tiktoken.Encoding | None = None
):
    """Chunk text by token length."""
    if token_encoder is None:
        token_encoder = tiktoken.get_encoding("cl100k_base")
    tokens = token_encoder.encode(text)  # type: ignore
    # 增加下面这行代码，将tokens解码成字符串
    tokens = token_encoder.decode(tokens) 

    chunk_iterator = batched(iter(tokens), max_tokens)
    yield from chunk_iterator
```

总算完成了

## 4. Indexing

也就是建立索引（Indexing）的过程，利用 LLM 提取出节点（如实体）、边（如关系）和协变量（如 claim），然后利用社区检测技术对整个知识图谱进行划分，再利用 LLM 进一步总结。

进入 Graph RAG 安装目录，在命令行中输入：

```bash
python -m graphrag.index --root ./ragtest
```

这一过程耗时较长，和在 Input 文件夹中数据大小有关，我放了 6k 的文件跑了 5 分钟。

结束后应该是这样的：

![Indexing 完成](/img/posts/2024-08-28-graphrag-ollama/index-done.png)

## 5. query

也就是开始问答环节了，这一部分还是需要修改两个文件（嘿嘿，很简单）

### 5.1 修改代码

只用改两个文件，同样是 3.7 节中提到的 query 文件夹，在 structured_search 的 global_search 和 local_search 中分别有一个 search.py文件。

![修改 search.py](/img/posts/2024-08-28-graphrag-ollama/modify-code.png)

把其中所有的 search_messages 变量(一共 4 处）修改为如下格式即可(注释掉的代码为原代码)：

```python
#search_messages = [
#  {"role": "system", "content": search_prompt},
#  {"role": "user", "content": query},
#]
search_messages = [ {"role": "user", "content": search_prompt + "\n\n### USER QUESTION ### \n\n" + query} ]
```

> 真的全部改完了，不骗你

### 5.2 开始查询

这就是使用阶段了，查询有两种方式，global_search 和 local_search，全局查询侧重对数据整体的理解，局部则有更多细节。

- global_search

进入 Graph RAG 安装目录，在命令行中输入：

```bash
python -m graphrag.query --root ./ragtest --method global "what is cnn?" 
```

引号里的是你的问题，输出结果如下：

```bash
Convolutional Neural Networks (CNNs) are a type of deep learning model that excel in image processing tasks. They automatically and adaptively learn spatial hierarchies of features from images, making them effective for tasks such as object recognition, image classification, and image segmentation [Data: Reports (1, 2, +more)].

CNNs consist of multiple layers, including convolutional layers, pooling layers, and fully connected layers. Convolutional layers apply a series of filters to the input image, creating feature maps that capture spatial patterns within the image [Data: Reports (1, 3)]. Pooling layers downsample the feature maps, reducing their size and increasing translation invariance [Data: Reports (2, +more)].

One key advantage of CNNs is their ability to learn hierarchical representations of features. This means that they can automatically learn complex patterns at multiple levels of abstraction, making them effective for tasks where the relevant features may be difficult to specify manually [Data: Reports (1, 4)].

However, CNNs can also be challenging to work with due to their complexity and the need for large, diverse, and accurately labeled datasets. Reproducing results from previous studies or experiments involving CNNs can also be difficult [Data: Reports (5)]. Despite these challenges, ongoing research in the field of CNNs continues to improve their performance and applicability. Techniques such as transfer learning, continual learning, and explainability are being explored to address some of these challenges [Data: Reports (1, 6)].
```

- local_search

进入 Graph RAG 安装目录，在命令行中输入：

```bash
python -m graphrag.query --root ./ragtest --method local "what is cnn?" 
```

引号里的是你的问题，输出结果如下：

```bash
CNN, or Convolutional Neural Network, is a type of artificial neural network primarily used for image processing tasks such as object recognition, classification, and localization. It's one of the most popular deep learning architectures due to its effectiveness in handling 2D data like images.

### How CNN Works

CNN operates by using convolutional layers, pooling layers, and fully connected layers. The convolutional layer applies a series of filters (or kernels) to the input image, creating feature maps that help identify patterns within the image. The pooling layer then downsamples these feature maps, reducing their spatial size while retaining important features. Finally, the fully connected layer processes the flattened output from the pooling layer and makes a prediction based on the learned features.

### Advantages of CNN

1. **Efficient Use of Data**: CNNs are designed to take advantage of the spatial hierarchy in data, which means they can learn more efficiently compared to fully connected networks when dealing with large amounts of image data.
2. **Robustness**: CNNs have shown robust performance on various image classification tasks, even when trained on a limited amount of data.
3. **Transfer Learning**: Due to their ability to learn hierarchical features, CNNs can be fine-tuned for different tasks by using pre-trained models, making them versatile and efficient in various applications.

### Examples of CNN Applications

1. Image Classification: Identifying objects within images, such as recognizing animals, vehicles, or specific items.
2. Object Detection: Localizing objects within an image and predicting their bounding boxes.
3. Facial Recognition: Identifying individuals based on facial features in images or videos.
4. Medical Imaging Analysis: Assisting doctors in diagnosing diseases by analyzing medical images like X-rays, MRIs, or CT scans.
5. Self-driving Cars: Helping autonomous vehicles recognize traffic signs, pedestrians, and other vehicles on the road.
```

done.

## 6. 踩坑总结

### 6.1 模型选择

这是我踩的最大的坑，折腾了两个小时。刚开始我的 llm 模型用的是 llama3.1 ，indexing 过程怎么都跑不通，报如下错误：

```bash
RuntimeError: Failed to generate valid JSON output
```

原因是一些模型无法生成有效的 json 输出，将 settings.yaml 中的 model_supports_json 选项设为 false 仍然无法解决。后来改用 mistral 模型就很顺利。所以请注意你的模型。

### 6.2 Indexing 过程其他报错

![Indexing 报错](/img/posts/2024-08-28-graphrag-ollama/error-1.png)

原因基本上是没有修改好文件，参考 3.7

### 6.3 查询过程报错

```bash
ZeroDivisionError: Weights sum to zero, can't be normalized
```

按照 5.1 修改代码即可。

# 参考文档

1. https://github.com/microsoft/graphrag/issues/575
2. https://github.com/microsoft/graphrag/issues/646
3. https://www.cnblogs.com/egalistmir/p/18347600
4. https://www.cnblogs.com/fanzhidongyzby/p/18294348/ms-graphrag
