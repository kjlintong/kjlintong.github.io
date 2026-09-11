# LT Blog · kjlintong.github.io

林通的个人博客,基于 Hux 主题改造的 Jekyll 站点。

记录大模型与 Agent 相关的技术笔记、学习心得,全站中英双语。

## 本地预览

```bash
~/miniconda3/envs/jekyll-env/bin/jekyll serve
```

浏览器打开 http://127.0.0.1:4000/ 即可预览,修改主题文件后强刷浏览器即可看到变化。

## 写文章

在 `_posts/` 下新建 Markdown 文件,文件名格式 `YYYY-MM-DD-title.md`,开头带上 YAML frontmatter:

```yaml
---
layout: post
title: 文章标题
subtitle: 副标题
date: 2026-09-11
author: Tong Lin
header-img: img/post-bg-xxx.jpg
catalog: true
tags:
  - LLM
---
```

## 自定义

站点标题、社交链接、侧边栏等配置都在 `_config.yml`;页面布局在 `_layouts/` 和 `_includes/` 目录下。

## 致谢

主题最初 fork 自 [qiubaiying.github.io](https://github.com/qiubaiying/qiubaiying.github.io),模板出自 [Hux](https://github.com/Huxpro/huxpro.github.io),感谢两位原作者的模板与教程。

## License

遵循 MIT 许可证,详见 [LICENSE](LICENSE)。
