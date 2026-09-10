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

## 中英双语（既有机制）

- 记忆键 `pg-lang`，与 `pg-theme` 平行；切换过一次后全站同步。
- 首页 `index.html` 内的双语文案走 `data-i18n`/`data-i18n-html` 键 + 内联字典，新增文案须同时补中英两条，键名加进两处字典。

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
