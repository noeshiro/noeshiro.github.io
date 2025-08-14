// 背景の星アニメ
(() => {
  const cvs = document.getElementById('bg');
  const ctx = cvs.getContext('2d');
  let w, h, dpr;
  let stars = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  function initStars(count = 50) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = varColor;
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#54dbc2';
      ctx.fill();
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0 || s.x > w) s.vx *= -1;
      if (s.y < 0 || s.y > h) s.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => {
    resize();
    initStars();
  });
})();

// ハンバーガーメニュー
(() => {
  const btn = document.getElementById('menuBtn');
  const panel = document.getElementById('navPanel');
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('nav-open');
  });
})();


