// Shipped variant switcher: a small Shipped dot (bottom-left) that opens a list of design
// variations of the same site. Drop this script on every page of a prototype and define
// window.SHIPPED_VARIANTS = [{ id, name, note, href }] and window.SHIPPED_VARIANT = '<id>' before it.
(() => {
  const list = window.SHIPPED_VARIANTS;
  if (!list?.length) return;
  const current = window.SHIPPED_VARIANT;
  const css = `
  .shv-dot{position:fixed;left:14px;bottom:14px;z-index:9999;width:28px;height:28px;border-radius:50%;border:0;background:rgba(11,11,11,.78);backdrop-filter:blur(8px);display:grid;place-items:center;cursor:pointer;transition:transform .3s cubic-bezier(.2,.7,.2,1)}
  .shv-dot:hover{transform:scale(1.15)} .shv-dot i{width:8px;height:8px;border-radius:50%;background:#d8ff85;animation:shv-blink 3.6s ease-in-out infinite}
  @keyframes shv-blink{0%,64%,100%{opacity:1}72%{opacity:.15}82%{opacity:1}}
  .shv-pop{position:fixed;left:14px;bottom:52px;z-index:9999;width:min(340px,calc(100vw - 28px));background:#0b0b0b;color:#f3f1ea;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;font:14px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.4);opacity:0;transform:translateY(8px) scale(.98);transform-origin:bottom left;pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.2,.7,.2,1)}
  .shv-pop.open{opacity:1;transform:none;pointer-events:auto}
  .shv-pop p{margin:0 4px 10px;font:500 10px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:rgba(243,241,234,.45)}
  .shv-pop a{display:block;padding:10px 12px;border-radius:12px;color:inherit;text-decoration:none;transition:background .2s}
  .shv-pop a:hover{background:rgba(255,255,255,.06)} .shv-pop a[aria-current]{background:#d8ff85;color:#0b0b0b}
  .shv-pop b{display:block;font-weight:600} .shv-pop span{display:block;font-size:12.5px;opacity:.65}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  const dot = Object.assign(document.createElement('button'), { className: 'shv-dot', innerHTML: '<i></i>', title: 'Variaciones (V)' });
  dot.setAttribute('aria-label', 'Ver variaciones del diseño');
  const pop = Object.assign(document.createElement('nav'), { className: 'shv-pop' });
  pop.innerHTML = `<p>shipped. · variaciones</p>` + list.map((v) => `<a href="${v.href}"${v.id === current ? ' aria-current="page"' : ''}><b>${v.name}</b><span>${v.note}</span></a>`).join('');
  document.body.append(dot, pop);
  const toggle = (open = !pop.classList.contains('open')) => pop.classList.toggle('open', open);
  dot.addEventListener('click', () => toggle());
  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'v' && !/input|textarea/i.test(e.target.tagName)) toggle(); if (e.key === 'Escape') toggle(false); });
  addEventListener('click', (e) => { if (!pop.contains(e.target) && !dot.contains(e.target)) toggle(false); });
})();
