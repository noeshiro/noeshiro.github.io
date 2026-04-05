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


// ===== YouTube動画の動的取得（トップページ・Worksページ共通） =====
const YOUTUBE_CHANNEL_ID = 'YOUR_CHANNEL_ID'; // ← チャンネルIDを入れる

async function loadYouTubeVideos(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (YOUTUBE_CHANNEL_ID === 'YOUR_CHANNEL_ID') {
    container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">（YouTubeチャンネルIDを設定してください）</p>';
    return;
  }
  try {
    const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    const items = (json.items ?? []).slice(0, limit);
    if (items.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">動画がありません。</p>';
      return;
    }
    container.innerHTML = items.map(item => {
      const videoId = item.link.split('v=')[1]?.split('&')[0] ?? '';
      const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
        : '';
      const title = item.title ?? '';
      return `
        <article class="tile">
          <a class="thumb" href="${item.link}" target="_blank" rel="noopener noreferrer">
            <img src="${thumb}" alt="${title}" loading="lazy">
          </a>
          <div class="tile-content">
            <h3 class="tile-title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${title}</a></h3>
            <p class="tile-meta">${date} • YouTube</p>
          </div>
        </article>`;
    }).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">動画の取得に失敗しました。</p>';
  }
}

// ===== noteの動的取得（トップページ） =====
async function loadNoteArticles(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch('https://note.com/api/v2/creators/noeshiro/contents?kind=note&page=1');
    if (!res.ok) throw new Error();
    const json = await res.json();
    const items = (json.data?.contents ?? []).slice(0, limit);
    if (items.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">まだ記事がありません。</p>';
      return;
    }
    container.innerHTML = items.map(item => {
      const date = item.publishAt
        ? new Date(item.publishAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
        : '';
      const url = item.noteUrl ?? `https://note.com/noeshiro/n/${item.key}`;
      const title = item.name ?? '';
      const excerpt = item.body ? item.body.replace(/<[^>]*>/g, '').slice(0, 60) + '…' : '';
      return `
        <article class="blog-card">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="blog-card-link">
            <div class="blog-card-content">
              <time class="blog-date">${date}</time>
              <h3 class="blog-title">${title}</h3>
              <p class="blog-excerpt">${excerpt}</p>
            </div>
          </a>
        </article>`;
    }).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">記事の取得に失敗しました。</p>';
  }
}

// ページに応じて呼び出し
loadYouTubeVideos('topWorksList', 3);
loadYouTubeVideos('worksPageList', 12);
loadNoteArticles('topBlogList', 3);
