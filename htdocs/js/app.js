// Motivnavi OS - About : PWA 初期化
(() => {
  'use strict';

  // フッターの年
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Service Worker 登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[PWA] Service Worker の登録に失敗しました:', err);
      });
    });
  }

  // インストールボタン（Chrome / Edge などで有効）
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      installBtn.hidden = true;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
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

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
  });
})();
