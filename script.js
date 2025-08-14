// ==== 背景 Canvas（星＝#54dbc2／マウス追従なし・最背面） ====
(() => {
  const cvs = document.getElementById('bg');
  if(!cvs) return;
  const ctx = cvs.getContext('2d');
  let w, h, dpr, raf;
  const P = [];

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = cvs.width = Math.floor(innerWidth * dpr);
    h = cvs.height = Math.floor(innerHeight * dpr);
    cvs.style.width = innerWidth + 'px';
    cvs.style.height = innerHeight + 'px';
  };
  resize(); addEventListener('resize', resize);

  const rand = (a,b)=> a + Math.random()*(b-a);
  const spawn = (n=28) => {
    P.length = 0;
    for(let i=0;i<n;i++){
      P.push({
        x: rand(0,w), y: rand(0,h),
        r: rand(1.0*dpr, 2.2*dpr),
        vx: rand(-0.15, 0.15), vy: rand(-0.12, 0.12),
        a: rand(0.25, 0.45)
      });
    }
  };
  spawn();

  const loop = () => {
    ctx.clearRect(0,0,w,h);

    // やさしい固定グラデーション（中央固定・追従なし）
    const mx = w/2, my = h/2;
    const grd = ctx.createRadialGradient(mx,my, 0, mx,my, Math.max(w,h)*0.8);
    grd.addColorStop(0, 'rgba(84,219,194,0.05)');
    grd.addColorStop(1, 'rgba(84,219,194,0.00)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);

    // 星（点）
    for(const p of P){
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(84,219,194,${p.a})`;
      ctx.fill();
    }

    // 近い星だけ細いライン（色は淡い #54dbc2）
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=a.x-b.x, dy=a.y-b.y, dist = Math.hypot(dx,dy);
        if(dist < 120*dpr){
          ctx.strokeStyle = `rgba(84,219,194,${(1 - dist/(120*dpr))*0.12})`;
          ctx.lineWidth = 1*dpr;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
})();

// ==== ハンバーガー（×にモーフ／メニュー開閉のみ） ====
(() => {
  const btn = document.getElementById('menuBtn');
  const panel = document.getElementById('navPanel');
  const backdrop = panel?.querySelector('.nav-backdrop');
  const links = panel?.querySelectorAll('.nav-link');
  if(!btn || !panel) return;

  const toggle = (open) => {
    const root = document.documentElement;
    root.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if(open){ setTimeout(()=> links?.[0]?.focus?.(), 150); } else { btn.focus(); }
  };

  btn.addEventListener('click', () => {
    const isOpen = document.documentElement.classList.contains('nav-open');
    toggle(!isOpen);
  });
  backdrop?.addEventListener('click', () => toggle(false));
  links?.forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => { if(e.key==='Escape') toggle(false); });
})();

