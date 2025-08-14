// ===== Scroll Reveal =====
(() => {
  const els = [...document.querySelectorAll('.reveal,[data-tilt]')];
  if (!('IntersectionObserver' in window) || !els.length) return;
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); });
  },{threshold:.15});
  els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
})();

// ===== Tilt on Hover/Touch =====
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
      if (!raf) loop();
    };

    el.addEventListener('pointermove', e => move(e.clientX, e.clientY));
    el.addEventListener('pointerleave', () => { rx=ry=0; el.classList.remove('is-active'); if (!raf) loop(); });
    el.addEventListener('touchstart', e => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    el.addEventListener('touchmove',  e => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    el.addEventListener('touchend',  () => { rx=ry=0; if (!raf) loop(); });
  });
})();

// ===== Deck Auto Change =====
(() => {
  const deck = document.querySelector('.deck');
  if (!deck) return;
  const imgs = [...deck.querySelectorAll('.deck-img')];
  let i = 0;

  const show = idx => {
    imgs.forEach((img, n) => img.classList.toggle('is-top', n === idx));
  };
  show(i);

  setInterval(() => {
    i = (i + 1) % imgs.length;
    show(i);
  }, 3500);
})();
