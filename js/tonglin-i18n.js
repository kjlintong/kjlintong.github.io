/* ============================================================
   Tong Lin · 全站中英双语切换
   - 记忆键 pg-lang（'zh' / 'en'），与 pg-theme 平行
   - 默认英文：无记录时一律 en（head 内联防闪烁脚本先行写入）
   - 词典：window.I18N = { zh: {...}, en: {...} }（_includes/i18n-dict.html 及各页面提供）
   - 文案元素：
     · data-i18n="key"               文本类，innerHTML 替换
     · data-i18n-attr="attr:key"     属性替换（空格分隔多组）
     · .bi[data-lang="zh|en"]        双语块；显隐由 <html data-lang> + CSS 控制
   - 语言按钮：.lang-btn[data-lang="zh|en"]，全站共享
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'pg-lang';

  function current() {
    var l = document.documentElement.getAttribute('data-lang');
    return l === 'zh' ? 'zh' : 'en';
  }

  function apply() {
    var key = current();
    var d = (window.I18N && window.I18N[key]) || null;
    document.documentElement.lang = key === 'zh' ? 'zh-CN' : 'en';

    if (d) {
      var els = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < els.length; i++) {
        var k = els[i].getAttribute('data-i18n');
        if (d[k] != null) els[i].innerHTML = d[k];
      }
      var attrs = document.querySelectorAll('[data-i18n-attr]');
      for (var j = 0; j < attrs.length; j++) {
        var pairs = (attrs[j].getAttribute('data-i18n-attr') || '').split(/\s+/);
        for (var p = 0; p < pairs.length; p++) {
          var seg = pairs[p].split(':');
          if (seg.length === 2 && d[seg[1]] != null) {
            attrs[j].setAttribute(seg[0], d[seg[1]]);
          }
        }
      }
    }

    var btns = document.querySelectorAll('.lang-btn');
    for (var n = 0; n < btns.length; n++) {
      btns[n].classList.toggle('active', btns[n].getAttribute('data-lang') === key);
    }

    // 分类/标签组语言门控:[data-tax="原名"] —— 词典中该原名在 zh/en 下显示不同、
    // 且当前语言与名字语言不符时隐藏(如 en 模式下隐藏「技术」组,只显示「Tech」组)
    var taxa = document.querySelectorAll('[data-tax]');
    for (var x = 0; x < taxa.length; x++) {
      var tn = taxa[x].getAttribute('data-tax');
      if (!tn) continue;
      var I = window.I18N || { zh: {}, en: {} };
      var z = I.zh['cat-' + tn], e = I.en['cat-' + tn];
      if (z == null || e == null || z === e) continue; // 专有名词/未登记 → 不门控
      var cjk = /[\u3400-\u9FFF\uF900-\uFAFF]/.test(tn);
      taxa[x].style.display = ((key === 'zh') === cjk) ? '' : 'none';
    }

    // 语言可见性门控：data-show="zh en" 的元素只在所列语言下显示
    var gated = document.querySelectorAll('[data-show]');
    for (var g = 0; g < gated.length; g++) {
      var show = gated[g].getAttribute('data-show') || '';
      gated[g].style.display = show.indexOf(key) >= 0 ? '' : 'none';
    }

    // 文章链接按语言切到镜像版本：页面提供 window.POST_LINKS = { 原文URL: 英文版URL }
    var links = (key === 'en' ? (window.POST_LINKS || {}) : (window.POST_LINKS_REV || {}));
    var pa = document.querySelectorAll('a[data-post-url]');
    for (var q = 0; q < pa.length; q++) {
      var u = pa[q].getAttribute('data-post-url');
      var mapped = links[u];
      if (mapped && u !== mapped) { pa[q].setAttribute('href', mapped); }
      else if (!mapped) { pa[q].setAttribute('href', u); }
    }

    // 浏览器标签页标题：页面提供 window.PAGE_TITLE = { zh:'', en:'' }
    if (window.PAGE_TITLE && window.PAGE_TITLE[key]) document.title = window.PAGE_TITLE[key];

    // 通知需要重渲染的组件（如搜索结果列表）
    try {
      document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: key } }));
    } catch (e) {}
  }

  function setLang(next) {
    next = next === 'zh' ? 'zh' : 'en';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    document.documentElement.setAttribute('data-lang', next);
    apply();
  }
  window.i18nSetLang = setLang;
  window.i18nLang = current;
  window.i18nText = function (k) {
    var d = (window.I18N && window.I18N[current()]) || {};
    return d[k] != null ? d[k] : null;
  };

  function wire() {
    apply();
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-bound') === '1') continue;
      btns[i].setAttribute('data-bound', '1');
      btns[i].addEventListener('click', function () {
        setLang(this.getAttribute('data-lang'));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
