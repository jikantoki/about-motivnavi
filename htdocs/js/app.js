// Motivnavi OS - About : PWA 初期化
(() => {
  'use strict';

  // フッターの年
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // トップの背景画像を3秒ごとに切り替え
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    const INTERVAL_MS = 3000;
    let current = 0;
    let timer = null;
    const next = () => {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    };
    const start = () => { if (!timer) timer = setInterval(next, INTERVAL_MS); };
    const stop = () => { clearInterval(timer); timer = null; };
    // タブが非表示の間は止めておく
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  }

  // ナビゲーション：入りきらない時はハンバーガーメニューに切り替え
  const topbar = document.querySelector('.topbar');
  const menuBtn = document.getElementById('menuBtn');
  const setMenuOpen = (open) => {
    if (!topbar || !menuBtn) return;
    topbar.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  const updateNavLayout = () => {
    if (!topbar) return;
    // 一度通常表示にして、横幅に収まるかを測る
    const fits = () => topbar.scrollWidth <= topbar.clientWidth + 1;
    topbar.classList.remove('is-compact', 'is-icon');
    if (fits()) { setMenuOpen(false); return; }
    topbar.classList.add('is-compact');
    if (!fits()) topbar.classList.add('is-icon');
  };
  if (topbar && menuBtn) {
    menuBtn.addEventListener('click', () => setMenuOpen(!topbar.classList.contains('is-open')));
    // メニュー内のリンクを押したら閉じる
    topbar.querySelectorAll('.topnav-links a').forEach((a) => a.addEventListener('click', () => setMenuOpen(false)));
    // メニューの外を押す / Escキーで閉じる
    document.addEventListener('click', (e) => { if (!topbar.contains(e.target)) setMenuOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && topbar.classList.contains('is-open')) { setMenuOpen(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', updateNavLayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateNavLayout);
    updateNavLayout();
  }

  // 独自機能を1文字ずつ表示 → 1文字ずつ消す（1項目3秒）
  const feature = document.querySelector('.hero-feature');
  const featureText = feature && feature.querySelector('.hero-feature-text');
  if (feature && featureText) {
    const items = (feature.dataset.features || '').split('|').filter(Boolean);
    const CYCLE_MS = 3000; // 1項目あたりの時間
    const TYPE_MS = 90;    // 1文字表示する間隔
    const ERASE_MS = 45;   // 1文字消す間隔
    const GAP_MS = 150;    // 消えてから次を打ち始めるまで
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let index = 0;
    let chars = [];
    let shown = 0;
    let phase = 'type';
    let timer = null;

    const holdTime = () => Math.max(500, CYCLE_MS - chars.length * (TYPE_MS + ERASE_MS) - GAP_MS);
    const render = () => { featureText.textContent = chars.slice(0, shown).join(''); };
    const load = () => { chars = Array.from(items[index]); shown = 0; phase = 'type'; };

    const step = () => {
      let wait;
      if (reduceMotion) {
        // 動きを減らす設定の場合は、文字単位のアニメーションなしで切り替え
        chars = Array.from(items[index]); shown = chars.length; render();
        index = (index + 1) % items.length;
        wait = CYCLE_MS;
      } else if (phase === 'type') {
        shown += 1; render();
        if (shown >= chars.length) { phase = 'erase'; wait = holdTime(); } else { wait = TYPE_MS; }
      } else {
        shown -= 1; render();
        if (shown <= 0) { index = (index + 1) % items.length; load(); wait = GAP_MS; } else { wait = ERASE_MS; }
      }
      timer = setTimeout(step, wait);
    };

    if (items.length) {
      load();
      step();
      // タブが非表示の間は止めておく
      document.addEventListener('visibilitychange', () => {
        clearTimeout(timer); timer = null;
        if (!document.hidden) step();
      });
    }
  }

  // Service Worker 登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[PWA] Service Worker の登録に失敗しました:', err);
      });
    });
  }

  // 写真の拡大表示
  const lightbox = document.getElementById('lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const lbImg = lightbox.querySelector('img');
    const supportsWebp = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');

    document.querySelectorAll('.shot-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const thumb = link.querySelector('img');
        lbImg.src = (supportsWebp && link.dataset.full) || link.href;
        lbImg.alt = thumb ? thumb.alt : '';
        lightbox.showModal();
      });
    });
    // どこをタップしても閉じる（車内での操作性重視）
    lightbox.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('close', () => { lbImg.removeAttribute('src'); });
  }

})();
