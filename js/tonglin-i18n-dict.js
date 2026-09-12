/* ============================================================
   Tong Lin · 全站共享双语词典（界面框架文案 + 分类/标签显示名）
   静态默认英文；window.I18N 供 tonglin-i18n.js 查表
   页面级追加词条：各页 <script> 里 Object.assign(window.I18N.zh, {...})
   分类/标签：数据里的原名（可能是中文或英文）作为键，
   两本词典都登记全部原名 → 当前语言的显示名（双向映射）。
   ============================================================ */
window.__i18nExtra = window.__i18nExtra || [];
window.__i18nPush = function (o) { window.__i18nExtra.push(o); };
(function () {
  'use strict';
  var D = window.I18N = window.I18N || { zh: {}, en: {} };

  /* 分类/标签原名 → { zh, en } 显示名 */
  var TAX = {
    '技术':            { zh: '技术',        en: 'Tech' },
    'Tech':            { zh: '技术',        en: 'Tech' },
    '学习笔记':         { zh: '学习笔记',     en: 'Learning Notes' },
    'Learning Notes':  { zh: '学习笔记',     en: 'Learning Notes' },
    '文献阅读':         { zh: '文献阅读',     en: 'Literature Notes' },
    'Literature Notes':{ zh: '文献阅读',     en: 'Literature Notes' },
    '分布式系统':       { zh: '分布式系统',   en: 'Distributed Systems' },
    'Distributed Systems': { zh: '分布式系统', en: 'Distributed Systems' },
    '云计算':           { zh: '云计算',      en: 'Cloud Computing' },
    'Cloud Computing': { zh: '云计算',      en: 'Cloud Computing' },
    '数学':            { zh: '数学',        en: 'Math' },
    'Math':            { zh: '数学',        en: 'Math' },
    '最优化':           { zh: '最优化',      en: 'Optimization' },
    'Optimization':    { zh: '最优化',      en: 'Optimization' },
    '性能分析':         { zh: '性能分析',     en: 'Performance Analysis' },
    'Performance Analysis': { zh: '性能分析', en: 'Performance Analysis' },
    'LLM推理':         { zh: 'LLM推理',     en: 'LLM Inference' },
    'LLM Inference':   { zh: 'LLM推理',     en: 'LLM Inference' },
    '内存墙':           { zh: '内存墙',       en: 'Memory Wall' },
    'Memory Wall':     { zh: '内存墙',       en: 'Memory Wall' },
    '静态博客':         { zh: '静态博客',     en: 'Static Blog' },
    'Static Blog':     { zh: '静态博客',     en: 'Static Blog' }
  };
  Object.keys(TAX).forEach(function (name) {
    D.zh['cat-' + name] = TAX[name].zh;
    D.en['cat-' + name] = TAX[name].en;
  });

  D.zh = Object.assign({
    /* ---- 导航 ---- */
    'nav-home': '首页', 'nav-blog': '博客', 'nav-categories': '分类', 'nav-tags': '标签', 'nav-about': '关于',
    'lang-aria-zh': '切换到中文', 'lang-aria-en': 'Switch to Chinese',
    /* ---- 页脚 ---- */
    'footer-sponsor': '<i class="fa fa-heart" aria-hidden="true"></i> 支持我 · Sponsor',
    /* ---- 文章页 ---- */
    'sponsor-tip': '如果这篇文章对你有帮助，欢迎请我喝杯咖啡 ☕',
    'sponsor-btn': '<i class="fa fa-heart" aria-hidden="true"></i> 在 GitHub 上支持我',
    'pager-prev': '上一篇', 'pager-next': '下一篇',
    'posted-by-label': '作者', 'posted-on-label': '发布于',
    'featured-tags': 'FEATURED TAGS', 'about-me': 'ABOUT ME', 'catalog': 'CATALOG', 'friends': 'FRIENDS',
    /* ---- 博客列表/搜索 ---- */
    'search-placeholder': '🔍 搜索文章标题 / 内容 / 标签…（输入后即时模糊搜索）',
    'search-empty': '没有找到匹配的文章。',
    'blog-subheading': '技术笔记 · 学习记录 · 在路上',
    'heading-blog': '博客', 'sub-blog': '技术笔记 · 学习记录 · 在路上', 'title-blog': '博客 - Tong Lin\'s Blog',
    /* ---- 归档 ---- */
    'heading-archives': '历史文章存档', 'sub-archives': '历史文章存档', 'title-archives': '存档 - Tong Lin\'s Blog',
    /* ---- 系统页 ---- */
    'heading-404': '你来到了没有知识的荒原 🙊', 'title-404': '404 - 页面不存在',
    'heading-offline': '网络似乎出现了问题 😥', 'title-offline': '离线 - Tong Lin\'s Blog',
    'categories-empty': '暂无分类，快来写下第一篇文章吧。'
  }, D.zh);

  D.en = Object.assign({
    /* ---- 导航 ---- */
    'nav-home': 'Home', 'nav-blog': 'Blog', 'nav-categories': 'Categories', 'nav-tags': 'Tags', 'nav-about': 'About',
    'lang-aria-zh': '切换到中文', 'lang-aria-en': 'Switch to Chinese',
    /* ---- 页脚 ---- */
    'footer-sponsor': '<i class="fa fa-heart" aria-hidden="true"></i> Support me · Sponsor',
    /* ---- 文章页 ---- */
    'sponsor-tip': 'If this post helped you, a coffee is always welcome ☕',
    'sponsor-btn': '<i class="fa fa-heart" aria-hidden="true"></i> Support me on GitHub',
    'pager-prev': 'Previous', 'pager-next': 'Next',
    'posted-by-label': 'Posted by', 'posted-on-label': 'on',
    'featured-tags': 'FEATURED TAGS', 'about-me': 'ABOUT ME', 'catalog': 'CATALOG', 'friends': 'FRIENDS',
    /* ---- 博客列表/搜索 ---- */
    'search-placeholder': '🔍 Search titles / content / tags… (live fuzzy search)',
    'search-empty': 'No matching posts found.',
    'blog-subheading': 'Tech notes · Learning logs · On the road',
    'heading-blog': 'Blog', 'sub-blog': 'Tech notes · Learning logs · On the road', 'title-blog': 'Blog - Tong Lin\'s Blog',
    /* ---- 归档 ---- */
    'heading-archives': 'Post Archives', 'sub-archives': 'Post archives by year', 'title-archives': 'Archives - Tong Lin\'s Blog',
    /* ---- 系统页 ---- */
    'heading-404': 'You have reached a wasteland with no knowledge 🙊', 'title-404': '404 - Page Not Found',
    'heading-offline': 'Something seems wrong with the network 😥', 'title-offline': 'Offline - Tong Lin\'s Blog',
    'categories-empty': 'No categories yet — write the first post!'
  }, D.en);

  /* 页面级追加词条：正文内联脚本用 window.__i18nPush({zh:{},en:{}}) 注册，
     本文件 defer 加载在所有内联脚本之后，统一合并进词典 */
  var extra = window.__i18nExtra || [];
  extra.forEach(function (e) {
    if (e.zh) Object.assign(D.zh, e.zh);
    if (e.en) Object.assign(D.en, e.en);
  });
})();
