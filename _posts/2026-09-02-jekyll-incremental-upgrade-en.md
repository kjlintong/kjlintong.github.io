---
layout: post
title: "Upgrading My Personal Site: Jekyll Incremental Refactoring — Trade-offs and What Actually Shipped"
title_zh: "个人主页升级实战：Jekyll 增量改造的取舍与落地"
subtitle: ""
subtitle_zh: "从「要不要迁移框架」到「搜索、评论、SEO 全都要」的一次完整记录"
date: 2026-09-02
author: Ryan
permalink: /blog/jekyll-incremental-upgrade-en/
lang: en
lang_pair: /blog/jekyll-incremental-upgrade-guide/
catalog: true
categories:
  - Tech
tags:
  - Jekyll
  - GitHub Pages
  - SEO
  - Static Blog
description: "A real personal-site upgrade: resisting the temptation to migrate to Astro, I did incremental refactoring on the existing Jekyll setup and shipped categories/tags, full-text search, Giscus comments, a full SEO pass, GA4 analytics, and a sponsor button. This post records the full decision process, implementation details, and pitfalls."
---

> I recently upgraded my GitHub Pages personal site. The hardest question to decide was: **should I migrate to a more modern framework (Astro)?**
> In the end I chose "incremental refactoring on top of the existing Jekyll setup". This post is about why, and how each feature actually shipped.

---

## 1. Understand the Current State Before Touching Anything

A lot of people open an old project and their first instinct is "rewrite it". Before doing anything, I spent half an hour going through the repo properly, and found that its actual shape didn't quite match the impression of "outdated":

- **The framework is Jekyll** (a fork of the Hux/BY Blog theme), and GitHub Pages auto-builds the `master` branch — no CI needed at all.
- **The homepage is a purely static custom page** (~1100 lines): warm editorial-style design + Chinese/English language switching + PWA, with heavy signs of hand-crafted polish.
- **Only 2 articles existed**, and the site somehow had no blog listing page at all — the blog section on the homepage just linked out to CSDN.
- **The comment system (Gitalk)** had its `clientSecret` sitting in plain text in `_config.yml` (a serious security problem for a public repo).
- **SEO was essentially zero**: no OG tags, no sitemap, no structured data.

That "health check" directly changed my judgment about the plan.

## 2. The Core Decision: Why Not Migrate to Astro

The plan a friend handed me recommended a **full migration to Astro** (SSG, zero JS, Content Collections, Pagefind… it all sounds lovely). I was tempted for a while too, but after a cool-headed analysis I rejected it:

**1. Migration cost and risk are out of proportion to the benefit**
The homepage is 1100 lines of hand-customized design, with PWA and bilingual logic on top. A full migration = rewriting the whole design as Astro components — restoring the styles, restoring the interactions — a very high-risk exercise that could easily break the visuals that were so carefully polished.

**2. Jekyll is fully sufficient feature-wise**
Categories, tags, archives, RSS, sitemap — these are all capabilities Jekyll provides natively or via the GitHub Pages whitelisted plugins. With only 2 blog posts, there is no performance or content-scale problem to speak of.

**3. Zero changes to the deployment pipeline**
GitHub Pages builds Jekyll natively: push and it's live. Migrating to Astro would instead mean introducing GitHub Actions and changing the deploy branch — gratuitous complexity.

> **Conclusion: the real motivation for a framework migration should be "the current stack can't meet the requirements", not "the new framework is cooler".** Every requirement this time could be met incrementally, so I took the zero-risk route.

## 3. The Incremental Refactoring Checklist

The final plan: **keep Jekyll + the existing homepage design, and layer all the new features on top**. Here is how each item was done.

### 1. Post system: categories, tags, search

- Added a `/blog/` listing page (article cards: title, date, excerpt, category, tags).
- Added a `/categories/` archive page; the `/tags/` page was kept.
- Added `categories` and `description` fields to the article frontmatter; Jekyll aggregates them automatically.

For **search** I used **Fuse.js** (a lightweight fuzzy-search library, deployed locally with no backend). The core idea is to have Jekyll generate a `search.json` index at build time (title/content/excerpt/categories/tags); the frontend loads it into Fuse.js for instant fuzzy search — fully offline, zero dependencies:

```json
// search.json —— Jekyll 构建时自动生成
{
  "title": "文章标题",
  "url": "/blog/my-post/",
  "date": "2026-09-02",
  "content": "正文全文…",
  "categories": ["技术"],
  "tags": ["Jekyll"]
}
```

```js
// 前端 Fuse.js 全文搜索
const fuse = new Fuse(data, {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'tags', weight: 0.1 },
    { name: 'categories', weight: 0.05 }
  ],
  threshold: 0.4,
  ignoreLocation: true
});
```

**New posts automatically enter search/categories/sitemap/RSS** — because all the indexes are generated at build time, you just write Markdown and push; the workflow doesn't change at all.

> **Pitfall**: once `categories` was added, Jekyll's default permalink URL-encoded the Chinese category name into the path (`/%E6%8A%80%E6%9C%AF/...`), which effectively changed every old article URL and would break already-indexed SEO. The fix: set `permalink: /blog/:title/` explicitly — semantic, decoupled from categories, and permanently stable.

### 2. Comment system: Gitalk → Giscus

The original Gitalk required exposing `clientSecret` to the frontend — **the secret sat in plain text in a public repo**, which was a hazard that had to be dealt with.

Switched to **Giscus** (built on GitHub Discussions):
- No secret exposure at all, more secure
- Free, ad-free, GitHub login supported
- Markdown, emoji reactions, follows the system theme
- Comment data lands directly in the repo's Discussions

Integration is a single `<script>` tag (get the repo-id / category-id from giscus.app):
```html
<script src="https://giscus.app/client.js"
  data-repo="owner/repo"
  data-repo-id="你的repo-id"
  data-category="Announcements"
  data-category-id="你的category-id"
  data-mapping="pathname"
  data-theme="preferred_color_scheme"
  data-lang="zh-CN"
  crossorigin="anonymous" async></script>
```

### 3. SEO: Meta / OG / Twitter / JSON-LD / Sitemap

For **Jekyll pages**, everything is generated dynamically with Liquid in `_includes/head.html`: per-page unique Title, Description, and Keywords, plus Open Graph, Twitter Card, canonical, and JSON-LD structured data (`BlogPosting` for article pages, `WebSite` + `Person` for everything else):

```html
{% raw %}
<meta property="og:title" content="{{ page.title }} - {{ site.SEOTitle }}">
<meta property="og:url" content="{{ page.url | prepend: site.url }}">
<meta property="og:image" content="{{ site.url }}/img/profile.jpg">
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "…",
  "datePublished": "…",
  "author": { "@type": "Person", "name": "…" }
}
</script>
{% endraw %}
```

**Sitemap & robots**: `jekyll-sitemap` is on the GitHub Pages whitelist, so one line of config auto-generates `sitemap.xml`; then hand-write a `robots.txt` that references it.

> **Special warning**: if your homepage is a **purely static file that doesn't go through Jekyll templates**, `head.html` has no effect on it — you have to **hand-write the SEO tags again** inside the homepage's `<head>`. This is the easiest thing to miss.

### 4. Analytics: GA4

Inject gtag.js centrally in `head.html`, with the Measurement ID configured in `_config.yml` (easier to manage):
```html
{% raw %}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.ga4_track_id }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ site.ga4_track_id }}');
</script>
{% endraw %}
```
The static homepage needs its own copy added separately. Once you substitute the real ID, visit data shows up in the GA dashboard.

### 5. Tipping: GitHub Sponsors

Set up a single link, `https://github.com/sponsors/kjlintong`, and put entry buttons in the footer, at the bottom of article pages, and on the homepage. Anyone can click to tip through GitHub Sponsors — no fees, purely the official channel.

### 6. Homepage posts section: let Jekyll render the latest posts

Originally the homepage just had two external-link cards. The goal was to show a post list the way the "featured projects" section works. **Key trick**: add an **empty frontmatter** (`---`) to the previously pure-static `index.html`, and Jekyll will render it with Liquid, so the post list updates automatically:

```html
{% raw %}
---
---
{% for post in site.posts limit:3 %}
  <!-- 文章卡片：标题 / 日期 / 摘要 / 分类 / 标签 -->
{% endfor %}
{% endraw %}
```

> Pre-flight check: confirm there are no leftover Liquid template sequences in the homepage (curly-brace-plus-curly-brace, or curly-brace-plus-percent combinations) before you dare add frontmatter. After the change, re-verify that the JS and the bilingual logic weren't broken.

## 4. Lessons Worth Remembering

1. **Health check first, decide second.** Understand the repo's real structure before touching anything, so your plan isn't built on wrong assumptions.
2. **Incremental beats rewrite.** Framework-migration costs are chronically underestimated (rewriting design, changing deployment, regression testing) while the benefits are overestimated. If the requirements can be met with the existing stack, don't churn.
3. **Never put any secret in a public repo.** Gitalk's plaintext clientSecret in the repo = running naked — it must be replaced (Giscus exposes no secrets).
4. **Change URL structures carefully.** Chinese category names leaking into permalinks silently rewrite every old link and break SEO — use a stable custom permalink.
5. **Static homepages are an SEO blind spot.** Purely static pages that bypass the templates don't get `head.html`, so you have to add OG/JSON-LD/GA4 by hand for them.

## 5. Closing Thoughts

This upgrade didn't swap the framework and didn't rewrite the homepage, yet on top of preserving the original visual design it filled in the modern-site staples: the post system, full-text search, comments, SEO, analytics, and tipping. **Sometimes the best refactoring is the clear-eyed decision not to refactor.** I hope this account of the trade-offs and the implementation details helps if you, like me, maintain an old blog.

If you're also tinkering with a Jekyll / GitHub Pages site, comments are welcome — or support me via GitHub Sponsors ☕
