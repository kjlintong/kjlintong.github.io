/* ============================================================
   Tong Lin · 明暗双主题切换
   - 记忆键 pg-theme,与旧 pg-lang 平行
   - 默认明(light);localStorage 优先,无记忆时回退明
   - 切换按钮统一使用 .theme-toggle 类,全站共享
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'pg-theme';

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var btns = document.querySelectorAll('.theme-toggle');
    var next = t === 'dark' ? 'light' : 'dark';
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-label', next === 'dark' ? '切换到深色模式' : '切换到明亮模式');
      btns[i].setAttribute('data-target', next);
    }
  }

  function wire() {
    var btns = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-bound') === '1') continue;
      btns[i].setAttribute('data-bound', '1');
      btns[i].addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    }
  }

  apply(current());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
