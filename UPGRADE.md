# kjlintong.github.io 个人主页升级说明

本仓库为 **Jekyll 博客**（Hux/BY Blog 主题 + 自定义暖色调首页），托管于 GitHub Pages。
本次做了**增量升级**（未迁移框架、未破坏现有首页设计），新增：文章系统（分类/标签/搜索）、
Giscus 留言板、SEO 全套优化、GA4 统计、GitHub Sponsors 打赏。

---

## 一、上线前需要你替换的配置项

所有待替换项都在 **`_config.yml`** 中用 `TODO: 用户替换` 标注，共 3 处：

### 1. Google Analytics 4（GA4）测量 ID
- 文件：`_config.yml` 第 94 行 `ga4_track_id: "G-XXXXXXXXXX"`
- 获取方式：打开 [analytics.google.com](https://analytics.google.com) → 左下角「管理」→「创建媒体资源」→「创建数据流」→ Web，生成 `G-XXXXXXXXXX` 格式的 ID。
- 替换后 `_includes/head.html` 会自动在所有 Jekyll 页面注入 GA4 代码。
- ⚠️ 首页 `index.html` 是**静态文件**（不走 Jekyll 模板），其 head 里也有一段 GA4 代码，同样需要把 `G-XXXXXXXXXX` 手动替换掉（全文共 2 处）。

### 2. Giscus 评论系统（repo-id 和 category-id）
- 文件：`_config.yml` 第 83、85 行
  ```
  repo_id: "REPLACE_WITH_YOUR_REPO_ID"
  category_id: "REPLACE_WITH_YOUR_CATEGORY_ID"
  ```
- 前置条件：
  1. 仓库 `kjlintong/kjlintong.github.io` 需**开启 Discussions**：仓库 Settings → 拉到最底 General → Features → 勾选 Discussions。
  2. 访问 [giscus.app](https://giscus.app)，在「Repository」填 `kjlintong/kjlintong.github.io`，勾选「Discussion 分类」→ 页面会自动生成 `data-repo-id` 和 `data-category-id`，复制填入。
- 替换后文章页 / 关于页 / keynote 页的评论区即可正常工作（当前显示"giscus is not installed"属预期，说明集成是活的，配置后即消失）。
- ⚠️ **安全提醒**：原 `_config.yml` 里 Gitalk 的 `clientSecret` 明文泄露在公开仓库，本次已全部移除并更换为 Giscus（Giscus 无需暴露任何密钥，更安全）。

### 3. GitHub Sponsors 链接
- 文件：`_config.yml` 第 41 行 `github_sponsors: "https://github.com/sponsors/kjlintong"`
- 前提：账号需已开通 GitHub Sponsors（[github.com/sponsors/account](https://github.com/sponsors/account)）。
- 链接已指向你的账号，若未开通会自动跳转引导页，无需修改。

---

## 二、本次新增/修改的文件清单

### 新增
| 文件 | 作用 |
|------|------|
| `blog/index.html` | 博客列表页 `/blog/`：文章列表 + Fuse.js 全文搜索框 |
| `categories.html` | 分类归档页 `/categories/` |
| `search.json` | Jekyll 构建时自动生成的文章搜索索引（Fuse.js 数据源） |
| `js/fuse.min.js` | Fuse.js 7.0 本地库（已下载，离线可用） |
| `robots.txt` | 搜索引擎抓取规则 + Sitemap 引用 |

### 修改
| 文件 | 改动 |
|------|------|
| `_config.yml` | 清理 Gitalk 密钥 → 换 Giscus；新增 GA4 / Sponsors / author(JSON-LD) / jekyll-sitemap 插件；URL 改为 `/blog/:title/` |
| `_includes/head.html` | 动态 Title/Description/Keywords + Open Graph + Twitter Card + JSON-LD + GA4 |
| `_includes/nav.html` | 固定导航（Home/Blog/分类/标签/About） |
| `_includes/footer.html` | 新增「支持我 · Sponsor」入口 |
| `_layouts/post.html` | Gitalk → Giscus；新增文章底部打赏按钮；修复 featured-tags Liquid 嵌套 bug |
| `_layouts/page.html` | 修复 featured-tags Liquid 嵌套 bug |
| `_layouts/keynote.html` | Gitalk → Giscus |
| `about.html` | Gitalk → Giscus |
| `index.html`（首页） | head 补 SEO/OG/Twitter/JSON-LD/GA4；导航加「博客」；博客区内链 `/blog/` + 保留 CSDN；页脚加 Sponsor 按钮 |
| `_posts/*.md` | 两篇文章补 `categories` 和 `description` 字段 |
| `.travis.yml` | 移除 jekyll-paginate / 失效 codecov，换 jekyll-sitemap |
| `.gitignore` | 忽略 `.jekyll-cache` |

---

## 三、如何写新文章（工作流不变）

1. 在 `_posts/` 新建 Markdown 文件，命名 `YYYY-MM-DD-标题.md`。
2. frontmatter 示例：
   ```yaml
   ---
   layout: post
   title: "文章标题"
   description: "摘要，用于 SEO 和列表展示"
   date: 2026-09-02
   author: Ryan
   catalog: true
   categories:
     - 技术
   tags:
     - Jekyll
     - SEO
   ---
   ```
3. 推送后 GitHub Pages 自动构建，新文章会自动：
   - 出现在 `/blog/` 列表（按日期倒序）
   - 归类到 `/categories/` 对应分类
   - 被 `search.json` 索引，纳入全文搜索
   - 生成到 `/sitemap.xml` 和 `/feed.xml`
   - 自动获得 OG / JSON-LD SEO 标签

---

## 四、部署流程（GitHub Pages 自动构建）

仓库根目录含 `_config.yml`，GitHub Pages 会**自动用 Jekyll 构建**，无需任何 CI 配置：

```bash
git add -A
git commit -m "feat: blog system + giscus + SEO + GA4 + sponsors"
git push origin master
```

等待约 1 分钟，访问 https://kjlintong.github.io 即可看到新版本。

### 本地预览（可选）
本机已配置好 Jekyll 环境（conda 的 `jekyll-env`），构建命令：
```bash
export PATH="/home/ryan/miniconda3/envs/jekyll-env/bin:$PATH"
export GEM_HOME="/home/ryan/miniconda3/envs/jekyll-env/lib/ruby/gems/2.6.0"
export GEM_PATH="/home/ryan/miniconda3/envs/jekyll-env/lib/ruby/gems/2.6.0"
cd /home/ryan/project/kjlintong.github.io
jekyll build        # 输出到 _site/
jekyll serve        # 或直接预览
```

---

## 五、上线后建议

1. **Google Search Console**：https://search.google.com/search-console 添加 `kjlintong.github.io`，提交 sitemap（`https://kjlintong.github.io/sitemap.xml`），验证 meta 里的 google-site-verification 已存在。
2. **微信分享预览**：微信无法实时抓取 OG 标签，建议在已收录页面分享前，先用第三方工具（如 [微信调试工具](https://mp.weixin.qq.com/) 或 opengraph.xyz）预览卡片。
3. **GA4 生效确认**：替换 ID 后，访问站点并打开浏览器控制台（Network 标签）确认有 `gtag/js` 请求，或等 24h 在 GA 实时报告中看到访问。
4. **暗色模式**：Giscus 已用 `preferred_color_scheme` 跟随系统主题；首页是浅色暖调设计，如需暗色可后续再加（本次未动以免破坏现有布局）。

---

*文档生成日期：2026-09-02*
