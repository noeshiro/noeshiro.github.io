// ===== ハンバーガーメニュー =====
(function() {
  const menuBtn = document.getElementById('menuBtn');
  const navPanel = document.getElementById('navPanel');
  const backdrop = document.querySelector('.nav-backdrop');
  
  // スクロールバーの幅を計算
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }
  
  function toggleNav() {
    const isOpen = document.body.classList.contains('nav-open');
    
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  }
  
  function openNav() {
    // スクロールバーの幅を取得してCSS変数に設定
    const scrollbarWidth = getScrollbarWidth();
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    
    document.body.classList.add('nav-open');
    navPanel.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  
  function closeNav() {
    document.body.classList.remove('nav-open');
    navPanel.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    
    // CSS変数をリセット
    document.documentElement.style.setProperty('--scrollbar-width', '0px');
  }
  
  // イベントリスナー
  menuBtn.addEventListener('click', toggleNav);
  backdrop.addEventListener('click', closeNav);
  
  // ESCキーでメニューを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
    }
  });
})();

// ===== スクロールリビール =====
(function() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
})();

// ===== カード束のローテーション =====
(function() {
  const deck = document.querySelector('.deck');
  if (!deck) return;
  
  const imgs = Array.from(deck.querySelectorAll('.deck-img'));
  let currentIndex = 0;
  
  function rotateCards() {
    imgs.forEach((img, i) => {
      img.classList.toggle('is-top', i === currentIndex);
    });
    currentIndex = (currentIndex + 1) % imgs.length;
  }
  
  // 3秒ごとにカードを切り替え
  setInterval(rotateCards, 3000);
})();

// ===== スムーズスクロール =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // メニューが開いている場合は閉じる
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        document.getElementById('navPanel').setAttribute('aria-hidden', 'true');
        document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
        document.documentElement.style.setProperty('--scrollbar-width', '0px');
      }
    }
  });
});

// ===== ナビゲーションリンククリック時にメニューを閉じる =====
// メニューを閉じてから遷移させる
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    
    // アンカーリンク（#で始まる）の場合のみ特別処理
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // メニューを閉じる（遷移を妨げない）
    if (document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      document.getElementById('navPanel').setAttribute('aria-hidden', 'true');
      document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    }
    
    // 通常のリンクはそのまま遷移（e.preventDefault()を呼ばない）
  });
});
