# 个人主页升级改造 · 工作记录

> 日期：2026-09-02
> 仓库：kjlintong/kjlintong.github.io
> 本文档记录改造的背景、决策、实施细节与踩坑经验，供后续维护参考。

---

## 一、项目现状（改造前分析）

- **框架**：Jekyll 博客（Hux/BY Blog 主题 fork），GitHub Pages 对 `master` 分支自动构建。
- **首页**：`index.html` 是**纯静态自定义页**（无 frontmatter，Jekyll 原样拷贝），暖色调编辑风 + 双语切换 + PWA + 绿植动画，约 1137 行。这是用户精心打磨的资产。
- **文章**：`_posts/` 仅 2 篇；全站**无博客列表页**，首页博客区仅外链 CSDN。
- **评论**：Gitalk（`_config.yml` 里 clientSecret 明文泄露，安全隐患）。
- **统计**：百度统计在用；GA 是老的 UA 代码且被注释。
- **SEO**：基础薄弱，无 OG/Twitter/JSON-LD/sitemap/robots。

## 二、核心决策：不迁移框架，做增量改造

计划书建议迁移 Astro，但分析后**否决**，理由：

1. 首页是 1137 行手工定制设计 + PWA + 双语，全量迁移 = 重写 + 高风险，且用户硬约束是"不破坏布局"。
2. 博客内容极少（2 篇），Jekyll 原生支持 tags/categories，无需换框架。
3. GitHub Pages 自动构建 Jekyll，零 CI 改动；迁移 Astro 反而要加 GitHub Actions + 改部署链路。

**结论：在现有 Jekyll 基础上增量叠加全部新功能。** 用户确认采用。

## 三、关键实施点

### 1. 文章系统
- 新增 `blog/index.html` → URL `/blog/`：文章列表 + Fuse.js 搜索框。
- 新增 `categories.html` → `/categories/`：按分类归档（`site.categories`）。
- `tags.html` 已有，保留。
- `search.json`：Jekyll 构建时自动生成文章 JSON 索引（title/url/date/excerpt/content/description/categories/tags），供 Fuse.js 全文搜索。
- `js/fuse.min.js`：Fuse.js 7.0 本地化（CDN 下载放本地，离线可用）。
- 文章 frontmatter 补 `categories` 和 `description` 字段。
- **踩坑**：加 `categories` 后，Jekyll 默认 permalink 会把中文分类名编码进 URL（`/%E6%8A%80%E6%9C%AF/...`），破坏原有文章 URL。解决：`permalink: /blog/:title/`，语义化且与分类解耦。

### 2. 评论系统（Gitalk → Giscus）
- 移除 Gitalk（密钥泄露 + 已废弃），`_layouts/post.html`、`about.html`、`keynote.html` 全部换 Giscus。
- Giscus 基于 GitHub Discussions，无密钥暴露、无广告、支持 GitHub 登录、跟随系统主题。
- 配置项在 `_config.yml` 的 `giscus` 块，**repo-id / category-id 需用户在 giscus.app 获取后替换**（当前为占位符，评论区显示 "not installed" 属预期）。

### 3. SEO 全套
- `_includes/head.html` 重写：动态 Title/Description/Keywords + Open Graph + Twitter Card + JSON-LD（文章页 BlogPosting，其他页 WebSite/Person）+ canonical + GA4。
- 首页 `index.html` 是静态文件不走模板，**单独在 head 手写**了同款 SEO/OG/Twitter/JSON-LD/GA4。
- `robots.txt`：Allow 全部 + 指向 sitemap。
- `jekyll-sitemap` 插件（GitHub Pages 白名单内）：自动生成 sitemap.xml，覆盖首页/文章/分类/标签/about。
- 文章 URL 语义化：`/blog/hello-world/`。

### 4. GA4
- Jekyll 页面：`head.html` 用 `site.ga4_track_id` 变量注入（`_config.yml` 配置）。
- 首页：head 里直写，`G-XXXXXXXXXX` 占位待替换（共 4 处占位符：config 1 + 首页 3）。

### 5. 打赏（GitHub Sponsors）
- `_config.yml` 的 `github_sponsors` 指向 `https://github.com/sponsors/kjlintong`。
- 入口：页脚（`footer.html` + 首页 footer）、文章页底部按钮、关于页。

### 6. 首页博客区改造（用户二次要求）
- 原为两个"链接卡片"（我的博客 + CSDN），改为**像"精选项目"一样展示文章卡片**。
- **关键**：给 `index.html` 加了**空 frontmatter**（`---\n---`），让 Jekyll 用 Liquid 渲染 `site.posts`（`limit:3`），文章列表随新文章自动更新。
- 安全性：改造前确认 index.html 内无 `{{`/`{%` 字符，加 frontmatter 不会误触发 Liquid；改造后验证 JS/i18n 完好。
- 保留"查看全部文章 →"和"CSDN 博客 →"次要入口。

## 四、本机构建环境（重要，下次直接复用）

本机无系统 Ruby/Jekyll（sudo 需密码装不了），最终通过 **conda** 搭好：

```bash
export PATH="/home/ryan/miniconda3/envs/jekyll-env/bin:$PATH"
export GEM_HOME="/home/ryan/miniconda3/envs/jekyll-env/lib/ruby/gems/2.6.0"
export GEM_PATH="/home/ryan/miniconda3/envs/jekyll-env/lib/ruby/gems/2.6.0"
cd /home/ryan/project/kjlintong.github.io
jekyll build     # 输出 _site/
jekyll serve --host 0.0.0.0 --port 8177 --no-watch   # 预览
```

### 搭建过程的坑（记录备查）
1. **gem install 编译失败**：conda 的 ruby 期望 `x86_64-conda-linux-gnu-cc` 交叉编译器，系统只有普通 gcc，native 扩展（bigdecimal 等）编译失败。
   - 解法：不用 gem 装 jekyll，改用 **conda-forge 预编译包 `rb-jekyll`**（`conda install -c conda-forge rb-jekyll`），避免本地编译。
2. **gem 路径分离**：conda 的 jekyll 4.0.0 装在 `lib/ruby/gems/2.6.0`（配 ruby 2.6），但 kramdown 主包在 `share/rubygems`，且默认 GEM_PATH 只认前者 → 报 `Could not find kramdown`。
   - 解法：把 `share/rubygems` 里的 `kramdown-2.3.1` 及其 gemspec **拷贝**进 `lib/ruby/gems/2.6.0/`，GEM_PATH 指向 2.6 目录即可。
3. **conda 噪音报错**：`conda create`/`install` 常报 "An unexpected error has occurred"（solver/插件问题），但实际装成功了。**以 `ruby -v`/`jekyll -v` 实际可用为准**，忽略这些非致命报错。
4. **conda activate 崩溃**：`conda activate` 报 TypeError（anaconda_anon_usage 插件 + CONDA_DEFAULT_ENV 不一致）。**绕过 activate**，直接用 `export PATH` 指向 `jekyll-env/bin`。
5. **jekyll-sitemap**：`rb-jekyll-sitemap` conda 包没装上时，gem 文件已在 `share/rubygems/cache/`，直接 `gem install <path>/jekyll-sitemap-1.4.0.gem --no-document` 装到 2.6 路径即可。

## 五、验证方法

- `jekyll build` 零 error/warning（曾修复 page/post layout 里的 Liquid 嵌套 bug：`{% if x > {{y}} %}` → 先 `{% assign %}`）。
- 浏览器实测：博客列表、搜索（Fuse.js）、分类/标签页、文章页（Giscus+Sponsor）、首页文章区、双语切换、布局无横向溢出。
- 一次性验证脚本思路：构建 + 产物断言（sitemap 合法 XML、search.json 合法 JSON、文章页含 OG/JSON-LD/Giscus/GA4/Sponsor、首页含文章卡片+无 Liquid 残留、无密钥残留）。

## 六、待用户配置（未完成项）

| 配置项 | 位置 | 获取方式 |
|--------|------|---------|
| ~~GA4 Measurement ID~~ | ~~`_config.yml` ga4_track_id + 首页 head~~ | ✅ 已完成（G-QPRHJYBXNG） |
| Giscus repo-id | `_config.yml` giscus.repo_id | giscus.app |
| Giscus category-id | `_config.yml` giscus.category_id | giscus.app |
| GitHub Sponsors 开通 | 无需改代码 | github.com/sponsors/account |

（GitHub Sponsors 链接已写死生效，只需用户账号开通功能。）

## 七、上线检查清单

1. [ ] 替换 GA4 / Giscus 占位符
2. [ ] `jekyll build` 零警告
3. [ ] `git push origin master`（GitHub Pages 自动构建，约 1 分钟）
4. [ ] Google Search Console 提交 `sitemap.xml`
5. [ ] 微信分享预览确认 OG 卡片

---

*本文档由 Hermes Agent 在 2026-09-02 改造过程中记录。*
