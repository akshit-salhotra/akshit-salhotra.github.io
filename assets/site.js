(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);

  /* ---------- sound: one soft tick, off by default ---------- */
  let ac = null;
  let soundOn = false;
  try { soundOn = localStorage.getItem('sound') === 'on'; } catch (e) {}
  function tick(hi) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = hi ? 1600 : 1100;
      o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.start(t); o.stop(t + 0.07);
    } catch (e) {}
  }
  const soundBtn = $('#sound');
  function paintSound() {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', soundOn);
    soundBtn.textContent = soundOn ? 'sound on' : 'sound off';
  }
  paintSound();
  soundBtn && soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('sound', soundOn ? 'on' : 'off'); } catch (e) {}
    paintSound(); tick(true);
  });
  document.addEventListener('click', (e) => { if (e.target.closest('a, .copy')) tick(false); });

  /* ---------- light / dark toggle ---------- */
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const themeBtn = $('#theme');
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    tick(true);
  });

  /* ---------- copy email ---------- */
  const mail = $('#mail');
  mail && mail.addEventListener('click', async () => {
    const addr = mail.dataset.addr;
    const label = mail.textContent;
    try { await navigator.clipboard.writeText(addr); mail.textContent = 'copied'; }
    catch (err) { mail.textContent = addr; }
    setTimeout(() => { mail.textContent = label; }, 1800);
  });

  /* ---------- word-by-word reveal with blur (intro line only) ---------- */
  const lede = $('.lede');
  if (lede && !RM) {
    lede.innerHTML = lede.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const ws = [...lede.querySelectorAll('.w')];
    ws.forEach((w) => { w.style.opacity = '0'; w.style.filter = 'blur(4px)'; });
    ws.forEach((w, i) => setTimeout(() => { w.style.opacity = ''; w.style.filter = ''; }, 250 + i * 85));
  }

  /* ---------- text scramble on hover (nav and links) ---------- */
  const G = 'abcdefghijklmnopqrstuvwxyz';
  document.querySelectorAll('[data-scr]').forEach((el) => {
    const orig = el.textContent;
    let busy = false;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.addEventListener('pointerenter', () => {
      if (RM || busy) return;
      busy = true;
      let f = 0;
      (function step() {
        el.textContent = [...orig].map((c, i) => (c === ' ' || i < f / 2) ? c : G[(Math.random() * 26) | 0]).join('');
        if (f / 2 < orig.length) { f++; requestAnimationFrame(step); }
        else { el.textContent = orig; busy = false; }
      })();
    });
  });

  /* ---------- dot cursor (mouse only) ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    const c = document.createElement('div');
    c.className = 'cur'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    root.classList.add('js-cursor');
    let x = -50, y = -50, cx = x, cy = y;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      c.classList.toggle('hot', !!e.target.closest('a, button'));
    });
    (function loop() {
      cx += (x - cx) * (RM ? 1 : 0.3);
      cy += (y - cy) * (RM ? 1 : 0.3);
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
