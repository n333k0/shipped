// Animated phone menu, built from the links already in the page's header nav. On screens under
// 900px it adds a burger to the header; tapping it unfolds a full-screen panel from the button's
// corner and the links rise in one by one. Colours follow CSS variables if the page sets them:
//   --mm-bg (panel), --mm-fg (text), --mm-accent (current/hover), --mm-font (link font).
// Use: <script src="mobile-menu.js" defer></script>  (optionally data-header=".top" data-nav="nav")
(() => {
  const me = document.currentScript;
  const header = document.querySelector(me?.dataset.header ?? 'header');
  const nav = header?.querySelector(me?.dataset.nav ?? 'nav');
  if (!header || !nav) return;
  const links = [...nav.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.textContent.trim()]);
  const css = `
  .mm-btn{display:none;position:relative;width:44px;height:44px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;margin-left:auto;z-index:62;flex:none}
  .mm-btn i{position:absolute;left:13px;right:13px;height:1.5px;background:currentColor;transition:top .5s cubic-bezier(.76,0,.24,1),transform .5s cubic-bezier(.76,0,.24,1)}
  .mm-btn i:first-child{top:17px}.mm-btn i:last-child{top:25px}
  .mm-open .mm-btn{color:var(--mm-fg,#fff);border-color:transparent}
  .mm-open .mm-btn i:first-child{top:21px;transform:rotate(45deg)}.mm-open .mm-btn i:last-child{top:21px;transform:rotate(-45deg)}
  .mm-panel{position:fixed;inset:0;z-index:61;background:var(--mm-bg,#0b0b0b);color:var(--mm-fg,#fff);display:flex;flex-direction:column;justify-content:flex-end;padding:110px 22px 40px;
    clip-path:circle(0px at var(--mm-x,90%) var(--mm-y,40px));transition:clip-path .75s cubic-bezier(.76,0,.24,1);pointer-events:none}
  .mm-open .mm-panel{clip-path:circle(160vmax at var(--mm-x,90%) var(--mm-y,40px));pointer-events:auto}
  .mm-panel a{font:600 clamp(40px,11vw,64px)/1.05 var(--mm-font,inherit);letter-spacing:-.03em;padding:6px 0;border-bottom:1px solid rgba(127,127,127,.25);color:inherit;text-decoration:none;
    opacity:0;transform:translateY(28px);transition:opacity .25s,transform .3s}
  .mm-open .mm-panel a{opacity:1;transform:none;transition:opacity .5s,transform .8s cubic-bezier(.2,.8,.2,1);transition-delay:calc(.28s + var(--i)*.06s)}
  .mm-panel a:hover,.mm-panel a[aria-current]{color:var(--mm-accent,currentColor)}
  @media (max-width:899px){.mm-btn{display:block}}
  @media (min-width:900px){.mm-panel{display:none}}
  @media (prefers-reduced-motion:reduce){.mm-panel,.mm-panel a,.mm-btn i{transition:none!important}}`;
  document.head.append(Object.assign(document.createElement('style'), { textContent: css }));
  const btn = Object.assign(document.createElement('button'), { className: 'mm-btn', innerHTML: '<i></i><i></i>' });
  btn.setAttribute('aria-label', 'Menú');
  btn.setAttribute('aria-expanded', 'false');
  const panel = Object.assign(document.createElement('nav'), { className: 'mm-panel' });
  panel.setAttribute('aria-label', 'Menú');
  panel.innerHTML = links.map(([h, t], i) => `<a href="${h}" style="--i:${i}">${t}</a>`).join('');
  (nav.parentElement ?? header).append(btn);
  document.body.append(panel);
  const set = (open) => {
    const r = btn.getBoundingClientRect();
    document.documentElement.style.setProperty('--mm-x', r.left + r.width / 2 + 'px');
    document.documentElement.style.setProperty('--mm-y', r.top + r.height / 2 + 'px');
    document.body.classList.toggle('mm-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(!document.body.classList.contains('mm-open')));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();
