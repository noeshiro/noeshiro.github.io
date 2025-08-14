// prefers-reduced-motion
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== 背景 Canvas 粒アニメ ===== */
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
        a: rand(0.08, 0.16)
      });
    }
  };
  spawn();

  let mx = w/2, my = h/2;
  const onMove = e => {
    const p = e.touches ? e.touches[0] : e;
    mx = (p.clientX || innerWidth/2) * dpr;
    my = (p.clientY || innerHeight/2) * dpr;
  };
  addEventListener('pointermove', onMove, {passive:true});
  addEventListener('touchstart', onMove, {passive:true});
  addEventListener('touchmove', onMove, {passive:true});

  const loop = () => {
    ctx.clearRect(0,0,w,h);

    // 淡いラジアルベール
    const grd = ctx.createRadialGradient(mx,my, 0, mx,my, Math.max(w,h)*0.8);
    grd.addColorStop(0, 'rgba(0,0,0,0.03)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);

    // 粒
    for(const p of P){
      p.x += p.vx + (mx - p.x) * 0.00004;
      p.y += p.vy + (my - p.y) * 0.00004;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(17,17,17,${p.a})`;
      ctx.fill();
    }

    // 近距離のみ細線
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=a.x-b.x, dy=a.y-b.y, dist = Math.hypot(dx,dy);
        if(dist < 120*dpr){
          ctx.strokeStyle = `rgba(17,17,17,${(1 - dist/(120*dpr))*0.08})`;
          ctx.lineWidth = 1*dpr;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    if(!REDUCED) raf = requestAnimationFrame(loop);
  };
  if(!REDUCED) raf = requestAnimationFrame(loop);
})();

/* ===== Scroll Reveal ===== */
(() => {
  const els = [...document.querySelectorAll('.reveal,[data-tilt]')];
  if(!('IntersectionObserver' in window) || !els.length) return;
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('is-in'); });
  },{threshold:.15});
  els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
})();

/* ===== Tilt（傾き） ===== */
(() => {
  const targets = document.querySelectorAll('[data-tilt]');
  const max = 6, spring=.12, damp=.85;

  targets.forEach(el => {
    let rx=0, ry=0, vx=0, vy=0, raf=0;

    const loop = () => {
      el.style.transform = `perspective(900px) rotateX(${vx}deg) rotateY(${vy}deg)`;
      if (Math.abs(vx-rx) > .02 || Math.abs(vy-ry) > .02) {
        vx += (rx - vx) * spring; vy += (ry - vy) * spring; vx *= damp; vy *= damp;
        raf = requestAnimationFrame(loop);
      } else { raf = 0; }
    };

    const move = (x,y) => {
      const r = el.getBoundingClientRect();
      const dx = ((x - (r.left + r.width/2)) / (r.width/2));
      const dy = ((y - (r.top + r.height/2)) / (r.height/2));
      ry = Math.max(-1, Math.min(1, dx)) * max;
      rx = Math.max(-1, Math.min(1, -dy)) * max;
      el.classList.add('is-active');
      if (!raf && !REDUCED) loop();
    };

    el.addEventListener('pointermove', e => move(e.clientX, e.clientY));
    el.addEventListener('pointerleave', () => { rx=ry=0; el.classList.remove('is-active'); if (!raf && !REDUCED) loop(); });
    el.addEventListener('touchstart', e => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    el.addEventListener('touchmove',  e => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    el.addEventListener('touchend',  () => { rx=ry=0; if (!raf && !REDUCED) loop(); });
  });
})();

/* ===== Deck 自動切替 ===== */
(() => {
  const deck = document.querySelector('.deck');
  if(!deck) return;
  const imgs = [...deck.querySelectorAll('.deck-img')];
  let i = 0;
  const show = idx => imgs.forEach((img,n)=> img.classList.toggle('is-top', n===idx));
  show(i);
  if(!REDUCED) setInterval(()=>{ i=(i+1)%imgs.length; show(i); }, 3500);
})();

/* ===== Hero タイトル Parallax ===== */
(() => {
  const title = document.getElementById('heroTitle');
  if(!title) return;
  let rx=0, ry=0, vx=0, vy=0, raf=0;
  const max = 8; // px
  const loop = () => {
    title.style.transform = `translate(${vx}px, ${vy}px)`;
    vx += (rx - vx)*0.1; vy += (ry - vy)*0.1;
    if(Math.abs(vx-rx)>0.05 || Math.abs(vy-ry)>0.05){
      raf = requestAnimationFrame(loop);
    } else { raf = 0; }
  };
  const move = (x,y) => {
    const r = title.getBoundingClientRect();
    const dx = ((x - (r.left + r.width/2)) / (r.width/2));
    const dy = ((y - (r.top + r.height/2)) / (r.height/2));
    rx = Math.max(-1,Math.min(1, dx))*max;
    ry = Math.max(-1,Math.min(1,-dy))*max;
    if(!raf && !REDUCED) raf = requestAnimationFrame(loop);
  };
  addEventListener('pointermove', e => move(e.clientX, e.clientY), {passive:true});
})();

/* ===== ハンバーガー（×にモーフ + スライドメニュー） ===== */
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
