# 站点维护说明 — kjlintong.github.io

本文档记录 2026-09 明暗双主题改造后的站点架构与维护须知。
改造目标：浏览者可在**明（奶油编辑部）/ 暗（深空观测站）**两套风格间一键切换，默认明；全站页面风格统一。

## 主题系统架构

| 文件 | 职责 |
|---|---|
| `css/tonglin.css` | 全站统一风格核心。`:root` 定义明色 token，`[data-theme="dark"]` 覆盖为暗色 token；字体（Cormorant Garamond 标题 + Inter 正文）、按钮、表格、引用、代码高亮、搜索框、标签云、页脚全部走 CSS 变量 |
| `js/tonglin-theme.js` | 切换逻辑。读取/写入 localStorage 键 `pg-theme`（`light`/`dark`），点击 `.theme-toggle` 按钮切换，同步按钮 aria-label |
| `_includes/head.html` | 内置首屏防闪烁脚本（`<head>` 最前，渲染前应用 `data-theme`）+ 引入 `tonglin.css` 与 `tonglin-theme.js` |
| `_includes/nav.html` | 导航栏的 `.theme-toggle` 切换按钮（月亮/太阳图标） |

**机制要点：**
- 主题状态挂在 `<html data-theme="…">` 上，CSS 用 `[data-theme="dark"]` 选择器分支。
- **默认明**：localStorage 无记录或首次访问一律 `light`；用户切换过一次后全站（含博客页）记住。
- 防闪烁脚本必须在 `<head>` 中、任何 CSS 加载前执行——新页面若不用 `_includes/head.html`，必须原样复制这段内联脚本。

## 新页面/新文章须知

- 文章（`_posts/*.md`）走 `post` 布局，自动继承主题系统，无需额外操作。
- 新增独立页面：优先使用 `default` 布局（自带 `head.html`/`nav.html`/`footer.html`），主题自动生效。
- 自建裸 HTML 页面必须包含三件套：① `<head>` 顶部防闪烁内联脚本；② `<link rel="stylesheet" href="/css/tonglin.css">`（放在 hux-blog.min.css 之后）；③ `<script src="/js/tonglin-theme.js" defer></script>`；④ 导航栏放一个 `class="theme-toggle"` 按钮（图标结构参考 `nav.html`）。
- **禁止在页面里写死主题色 hex**。全部用 `var(--bg) / --surface / --fg / --muted / --line / --accent / --accent-strong / --rose` 等 token，暗色才会自动适配。新增颜色一律用 `oklch()` 从现有 token 派生。

## 暗色星空（全站）

`tonglin.css` 中 `[data-theme="dark"] body::before / ::after` 两层固定星空：
- `::before` 主星层：14 组星点，blur 0.7px，`tl-drift` 90s 缓慢漂移。
- `::after` 辅星 + 星云：9 组星点 + 3 团蓝紫/玫瑰色星云，blur 1.5px，140s 反向漂移。
- 两层均 `position: fixed; z-index: -1`，垫在内容之下，不挡交互。

调整亮度/密度：改 `tonglin.css` 中 `body::before/::after` 的 `box-shadow` 星点列表即可（用 `rgba(218,223,229,…)` 系列，勿引入亮白纯色）。

## 头像与社交图

- `img/profile.jpg` 为选定头像（800×800，玫瑰米调，约 133KB）。替换头像：压到 ≤800px、JPEG 格式后同名覆盖。
- OG/Twitter 分享图默认回退到 `img/profile.jpg`（`head.html` 内 `page.header-img` 缺省逻辑），换头像后分享缓存需重新抓取。

## 中英双语（2026-09 升级为全站机制）

- 记忆键 `pg-lang`（`zh`/`en`），**默认英文**；与 `pg-theme` 平行，切换过一次后全站同步。
- 三个共享文件：
  - `js/tonglin-i18n.js` — 全站语言引擎：读 `<html data-lang>`、换 `data-i18n` 文案、`data-i18n-attr` 属性、`.bi[data-lang]` 双语块显隐（CSS 驱动）、`[data-tax]` 分类/标签组按语言门控、`data-show="zh en"` 通用门控、`a[data-post-url]` 文章链接随语言切镜像（`window.POST_LINKS` / `POST_LINKS_REV`，由 `head.html` 全站生成）、`window.PAGE_TITLE` 换标签页标题。
  - `js/tonglin-i18n-dict.js` — 共享词典（导航/页脚/打赏/搜索/归档/404 + 分类标签 `cat-原名` 双向显示名）。defer 加载，会合并页面内联脚本用 `window.__i18nPush({zh:…,en:…})` 注册的页面级词条。
  - `_includes/head.html` — 防闪烁内联脚本同时应用 `data-theme` + `data-lang`；为每篇带 `lang: en`+`lang_pair` 的镜像文章生成正反两张 URL 映射表。
- 文章双语两种模式并存：
  1. **镜像文章**：中文版 + 英文版各一篇，英文版 frontmatter 标 `lang: en`、`lang_pair: /中文URL/`、`title_zh:`（有英文副标题镜像时中文版用 `title_en:`/`subtitle_en:` 反向标注）。列表页/分类/标签/搜索自动按语言只显示一条、链接指向对应镜像。
  2. **单语文章内嵌双语**：frontmatter `title_en:` 即可让列表/标题处显示双语言（`.bi` span 对）。
- 静态 HTML 文案一律**默认写英文**（无 JS 也显示英文），中文由词典换回。
- 首页 `index.html` 为 layout:null 自定义页，保留独立内联词典（含全站文案 + 合并共享词典分类键），并自带 `.blog-item` 按语言裁剪至 3 条的 `trimBlog()`。
- 新文章须知：中文文章若有英文版，英文版 frontmatter 照上面模式 1 填写即可自动接入；无 `lang_pair` 的文章在两种语言下都显示。

## 构建与发布

```bash
# 本地构建（conda jekyll-env，勿用系统 jekyll）
~/miniconda3/envs/jekyll-env/bin/jekyll build

# 或直接 push 到 main，GitHub Pages 自动构建
git add -A && git commit -m "…" && git push
```

- `_site/` 不入库（`_config.yml` 已 exclude）。
- `docs/` 目录不入库构建（已 exclude），用于放维护文档。
- 推送前至少跑一次 `jekyll build` 确认无 Liquid/构建错误。

## 已知事项

- 页脚 ghbtns.com 星标 iframe 已移除（服务停用，暗色下空白框），版权行保留文字版 Star 链接。
- 页脚 `sponsor` 按钮、标签云颜色、代码高亮暗色调均在 `tonglin.css` 主题化，改样式先查 token 再动手。
- GA4（`ga4_track_id`）在 `_config.yml`，ID 待替换为正式值。
- Giscus 评论系统已移除（2026-09-10）：`_config.yml` 无 giscus 块，`about.html`、`_layouts/post.html`、`_layouts/keynote.html` 均无评论容器。若未来要恢复，重新加回即可。
- about 页工作城市已更新为 Shenzhen（深圳），中英文案同源。
