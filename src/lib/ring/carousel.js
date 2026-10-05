// Viscose ring (morphin.dev "viscose carousel"), ported from React to a plain
// mount function for the budget hero. Kept from the original: the gooey birth,
// the unfurl, honey threads, cursor melt, drag/flick with snap, click to
// centre and the glass "View" tag. Left out: its in-scene heading, side meta,
// project column and load counter (the page has its own heading and form),
// the wheel hijack (the page has to scroll) and the off-centre stage move —
// here the ring stays centred and sized to go around the content.
import * as THREE from "three";
import gsap from "gsap";

import {
  vertexShader,
  fragmentShader,
  MAX_PLANES,
  MAX_LINKS,
} from "./planeShaders";
import { buildAtlas } from "./atlas";
import { createTag, TAG_W, TAG_H } from "./tag";
import {
  TAU,

  chase,
  clamp01,
  easeOutCubic,
  signedOffset,
  smoothstep,
} from "./utils";

const FAN_START = 0.06;

const params = {
  // geometry, all at the reference ring (radius 340, card 90)
  planeSize: 90,
  aspect: 1, // square cards: the device shots are square-ish, never crop them
  ringRadius: 340,
  radius: 6, // corner
  textured: true,
  blend: 14,

  // entry
  stagger: 0.34,
  spreadTime: 3.6,
  spreadEase: "power2.out",
  stageAt: 0.55,
  spinTurns: 0.25,
  spinTime: 2.6,
  spinEase: "power2.inOut",

  // drag / click
  damping: 0.94,
  maxSpeed: 12,
  dragSpeed: 1,
  snap: true,
  snapTime: 0.8,
  snapFrom: 1,
  pickTime: 0.55,
  pickEase: "power3.inOut",
  drift: 0.05, // rad/s the ring turns on its own once left alone
  driftAfter: 2.5, // s of no input before it does

  // glass lip along the top and bottom of the canvas
  glass: true,
  bandTop: 0.08,
  bandBottom: 0.08,
  refract: 60,
  squeeze: 0.05,
  ripple: 5,
  rippleFreq: 0.02,
  fringe: 1.5,
  sheen: 0.05,

  // pointer
  hover: true,
  touchHold: 0.16,
  touchSlop: 10,
  lag: 0.3,
  melt: 34,
  meltReach: 260,
  reach: 1.7,
  swell: 0.09,
  pull: 26,
  grab: 0.14,
  release: 0.06,
  web: 0.2,
  webReach: 1.15,
  wave: 4,
  waveFreq: 0.05,
  waveSpeed: 7,
  sideScale: 0.035,
  sidePush: 17,
  sideDim: 0.15,
  sideReach: 2.4,

  // cursor tag
  tagFrom: 1024,
  tagText: "View",
  tagSize: 14,
  tagWeight: 500,
  tagArrow: 14,
  tagGap: 6,
  tagX: 64,
  tagY: -38,
  tagFrost: 0.16,
  tagRim: 0.02,
  tagRefract: 39.5,
  textFont: "Inter Tight",

  // honey
  thread: 1.0,
  thin: 0.4,
  pinch: 0.35,
  sag: 6,
  dissolve: 2.9,
  fillet: 14,

  wobble: 3,
  goo: 22, // lower than the original's 35: upright square cards meet corner to corner, closer than radial ones
};

const blankTexture = () => {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

/**
 * Mounts the ring into `container` (positioned, sized by CSS).
 * `layout(w, h)` returns { R, card, count, glass }: ring radius and card long
 * edge in px, how many cards go round, and whether the glass lip is on. Returns a dispose function.
 */
export function mountRing(container, { images, arrow, page = "#0b0b0b", layout: sizeFor }) {
  let disposed = false;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { progress: 0, spread: 0, spin: 0 };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    console.error("[ring] could not create a WebGL context:", err);
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uSize: { value: new THREE.Vector2(150, 100) },
    uRadius: { value: params.radius },
    uCount: { value: 0 },
    uPos: { value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()) },
    uRot: { value: new Float32Array(MAX_PLANES) },
    uScale: { value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uLinkCount: { value: 0 },
    uLinkA: { value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()) },
    uLinkB: { value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()) },
    uLinkPar: { value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector4()) },
    uK: { value: params.goo },
    uWobble: { value: params.wobble },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#141414") },
    uAtlas: { value: blankTexture() },
    uGrid: { value: new THREE.Vector2(1, 1) },
    uBlend: { value: params.blend },
    uTextured: { value: 0 },
    uBandTop: { value: 0 },
    uBandBottom: { value: 0 },
    uGlass: { value: new THREE.Vector4() },
    uFringe: { value: 0 },
    uSheen: { value: 0 },
    uMouse: { value: new THREE.Vector4() },
    uMelt: { value: new THREE.Vector4() },
    uTagTex: { value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1) },
    uTag: { value: new THREE.Vector4() },
    uTagP: { value: new THREE.Vector4() },
    uTagQ: { value: new THREE.Vector4() },
    uPage: { value: new THREE.Color(page) },
  };

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false }),
  );
  scene.add(mesh);

  const tag = createTag(params, uniforms, arrow);

  /* art */
  let firstIn = false;
  const atlas = buildAtlas(images, null, params.aspect);
  uniforms.uAtlas.value.dispose();
  atlas.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  uniforms.uAtlas.value = atlas.texture;
  uniforms.uGrid.value.set(atlas.grid[0], atlas.grid[1]);
  const imageCount = atlas.count;
  atlas.first.then(() => { if (!disposed) firstIn = true; });

  /* size */
  let viewW = 1, viewH = 1;
  let fit = 1, planeK = 1, count = 12, glassOn = true;

  const resize = () => {
    viewW = Math.max(1, container.clientWidth);
    viewH = Math.max(1, container.clientHeight);
    const s = sizeFor(viewW, viewH);
    count = Math.min(MAX_PLANES, s.count);
    glassOn = s.glass !== false;
    fit = s.R / params.ringRadius;
    planeK = s.card / (params.planeSize * fit);
    renderer.setSize(viewW, viewH);
    camera.left = -viewW / 2;
    camera.right = viewW / 2;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
    camera.updateProjectionMatrix();
    mesh.scale.set(viewW, viewH, 1);
    uniforms.uResolution.value.set(viewW, viewH);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  /* spin & input */
  const frontAngle = 0; // ring stays centred, so 3 o'clock is front
  let interactive = false;
  let spinVel = 0;
  let dragging = false;
  let dragPrevAngle = 0;
  let dragPrevTime = 0;
  let settling = false;
  let snapTo = 0;
  let snapCap = 0;
  let picking = false;
  let pointerTravel = 0;
  let travelX = 0;
  let travelY = 0;
  let lastInput = 0;

  const rect = () => container.getBoundingClientRect();
  const pointerAngle = (e) => {
    const r = rect();
    const dx = e.clientX - r.left - viewW * 0.5;
    const dy = e.clientY - r.top - viewH * 0.5;
    return Math.atan2(-dy, dx);
  };

  const stopPick = () => {
    if (!picking) return;
    gsap.killTweensOf(state);
    picking = false;
  };

  const pick = (i) => {
    const slot = TAU / count;
    const base = frontAngle - signedOffset(i) * slot;
    const target = base + Math.round((state.spin - base) / TAU) * TAU;
    const slots = Math.abs(target - state.spin) / slot;
    if (slots < 0.01) return;
    spinVel = 0;
    settling = false;
    picking = true;
    gsap.killTweensOf(state);
    gsap.to(state, {
      spin: target,
      duration: params.pickTime * Math.sqrt(Math.max(1, slots)),
      ease: params.pickEase,
      onComplete: () => { picking = false; },
    });
  };

  const pointer = { x: 0, y: 0, inside: false, seeded: false };
  const cursor = { x: 0, y: 0, amt: 0, wake: 0 };
  let coarse = false;
  let held = false;
  let holdTimer = 0;
  const endHold = () => { clearTimeout(holdTimer); holdTimer = 0; held = false; };
  const beginHold = () => {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => { held = true; }, params.touchHold * 1000);
  };
  const engaged = () => (coarse ? held : pointer.inside);

  const trackPointer = (e) => {
    coarse = e.pointerType === "touch";
    const r = rect();
    pointer.x = e.clientX - r.left - viewW * 0.5;
    pointer.y = viewH * 0.5 - (e.clientY - r.top);
    pointer.inside = true;
    lastInput = performance.now();
    if (!pointer.seeded) {
      pointer.seeded = true;
      cursor.x = pointer.x;
      cursor.y = pointer.y;
    }
  };

  const onPointerLeave = () => { pointer.inside = false; };

  const onPointerDown = (e) => {
    pointerTravel = 0;
    travelX = e.clientX;
    travelY = e.clientY;
    trackPointer(e);
    if (!interactive) return;
    stopPick();
    if (coarse) beginHold();
    dragging = true;
    settling = false;
    spinVel = 0;
    dragPrevAngle = pointerAngle(e);
    dragPrevTime = performance.now();
    renderer.domElement.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    trackPointer(e);
    pointerTravel += Math.abs(e.clientX - travelX) + Math.abs(e.clientY - travelY);
    travelX = e.clientX;
    travelY = e.clientY;
    if (coarse && !held && pointerTravel > params.touchSlop) endHold();
    if (!dragging) return;
    const a = pointerAngle(e);
    let delta = a - dragPrevAngle;
    if (delta > Math.PI) delta -= TAU;
    if (delta < -Math.PI) delta += TAU;
    const turn = delta * params.dragSpeed;
    state.spin += turn;
    const now = performance.now();
    spinVel = turn / (Math.max(8, now - dragPrevTime) / 1000);
    dragPrevAngle = a;
    dragPrevTime = now;
  };

  const onPointerUp = (e) => {
    trackPointer(e);
    endHold();
    if (!dragging) return;
    dragging = false;
    renderer.domElement.releasePointerCapture?.(e.pointerId);
  };

  const onClick = () => {
    if (!interactive || pointerTravel >= 5 || over < 0) return;
    pick(over);
  };

  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);
  container.addEventListener("pointerleave", onPointerLeave);
  container.addEventListener("click", onClick);

  const updatePointer = (dt) => {
    const live = params.hover && engaged() && pointer.seeded && interactive;
    cursor.amt += ((live ? 1 : 0) - cursor.amt) * chase(dt, 0.12);
    const k = chase(dt, params.lag);
    cursor.x += (pointer.x - cursor.x) * k;
    cursor.y += (pointer.y - cursor.y) * k;
    const trail = Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y);
    cursor.wake = Math.max(
      cursor.wake * Math.pow(0.94, dt * 60),
      clamp01(trail / (Math.max(dt, 0.001) * 2600)),
    );
    uniforms.uMouse.value.set(cursor.x, cursor.y, cursor.amt, params.melt * fit);
    uniforms.uMelt.value.set(
      params.meltReach * fit,
      params.wave * fit * cursor.wake * cursor.amt,
      params.waveFreq,
      params.waveSpeed,
    );
  };

  /* the carousel */
  const travel = new Float32Array(MAX_PLANES);
  const cum = new Float32Array(MAX_PLANES);
  const order = [];
  const rest = Array.from({ length: MAX_PLANES }, () => new THREE.Vector2());
  const hoverF = new Float32Array(MAX_PLANES);
  const leanX = new Float32Array(MAX_PLANES);
  const leanY = new Float32Array(MAX_PLANES);
  const webF = new Float32Array(MAX_LINKS);
  const sideF = new Float32Array(MAX_PLANES);
  const focusPos = new THREE.Vector2();
  const swellOf = (i) => Math.max(0.05, 1 + params.swell * hoverF[i] - params.sideScale * sideF[i]);

  let over = -1;
  let tagUp = false;

  const layout = (dt) => {
    uniforms.uCount.value = count;
    const step = TAU / count;
    const spread = clamp01(state.spread);
    const g = fit;

    const W = params.planeSize * planeK * g;
    const H = W / params.aspect;
    uniforms.uSize.value.set(W, H);
    uniforms.uRadius.value = params.radius * planeK * g;

    const sepExtent = H; // radial: long edge points outward
    const faceEdge = W;
    const R = params.ringRadius * g;
    const finalSep = Math.max(1, 2 * R * Math.sin(step / 2) - sepExtent);

    const maxN = Math.max(1, Math.abs(signedOffset(count - 1)));
    const dur = Math.max(0.1, 1 - FAN_START - params.stagger);
    cum[0] = 0;
    for (let n = 1; n <= maxN; n++) {
      const start = FAN_START + ((n - 1) / maxN) * params.stagger;
      const t = clamp01((spread - start) / dur);
      const e = t * t * (3 - 2 * t);
      travel[n] = e;
      cum[n] = cum[n - 1] + e;
    }

    order.length = 0;
    const track = cursor.amt > 0.001;
    const reach = Math.max(1, params.reach * W);
    const sideReach = Math.max(1, params.sideReach * W);
    const kRise = chase(dt, params.grab);
    const kFall = chase(dt, params.release);
    const cellOf = (slot) => (imageCount > 0 ? (((-slot) % imageCount) + imageCount) % imageCount : 0);
    const probe = pointer.inside && pointer.seeded && interactive;
    let overI = -1;
    const focusI = track ? over : -1;

    for (let i = 0; i < count; i++) {
      const sIdx = signedOffset(i);
      const n = Math.abs(sIdx);
      const u = i === 0 ? clamp01(state.progress) : travel[n];
      const cell = cellOf(sIdx);

      // The seed is born in its own slot on the ring rather than at the centre,
      // so the heading and form in the middle are never covered.
      const angle = Math.sign(sIdx) * step * cum[n] + state.spin;
      const px = Math.cos(angle) * R;
      const py = Math.sin(angle) * R;
      rest[i].set(px, py);

      let f = 0, toX = 0, toY = 0;
      if (track) {
        const dx = cursor.x - px;
        const dy = cursor.y - py;
        const dist = Math.hypot(dx, dy);
        f = smoothstep(reach, reach * 0.22, dist) * cursor.amt * u;
        if (f > 0.0001 && dist > 0.0001) {
          const lean = (params.pull * fit * f) / dist;
          toX = dx * lean;
          toY = dy * lean;
        }
      }
      const k = f > hoverF[i] ? kRise : kFall;
      hoverF[i] += (f - hoverF[i]) * k;
      leanX[i] += (toX - leanX[i]) * k;
      leanY[i] += (toY - leanY[i]) * k;

      let sf = 0;
      if (focusI >= 0 && i !== focusI) {
        const d = Math.hypot(focusPos.x - px, focusPos.y - py);
        sf = smoothstep(sideReach, sideReach * 0.2, d) * u;
      }
      sideF[i] += (sf - sideF[i]) * (sf > sideF[i] ? kRise : kFall);

      let pushX = 0, pushY = 0;
      if (sideF[i] > 0.0001) {
        const dx = px - focusPos.x;
        const dy = py - focusPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.0001) {
          const away = (params.sidePush * fit * sideF[i]) / dist;
          pushX = dx * away;
          pushY = dy * away;
        }
      }

      uniforms.uPos.value[i].set(px + leanX[i] + pushX, py + leanY[i] + pushY);
      // Upright, not turned with the ring: both sides of the ring are on
      // screen here, and turned cards would show the left half upside down.
      uniforms.uRot.value[i] = 0;

      const sx = i === 0 ? easeOutCubic(clamp01(u / 0.7)) : easeOutCubic(clamp01(u / 0.34));
      const sy = i === 0 ? easeOutCubic(clamp01((u - 0.18) / 0.74)) : easeOutCubic(clamp01((u - 0.06) / 0.36));
      const sw = swellOf(i);
      uniforms.uScale.value[i].set(sx * sw, sy * sw, 1 - params.sideDim * sideF[i], cell);

      if (probe && overI < 0) {
        const rot = uniforms.uRot.value[i];
        const qx = cursor.x - (px + leanX[i] + pushX);
        const qy = cursor.y - (py + leanY[i] + pushY);
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        if (
          Math.abs(qx * cr + qy * sr) <= W * 0.5 * sx * sw &&
          Math.abs(-qx * sr + qy * cr) <= H * 0.5 * sy * sw
        ) overI = i;
      }
      order.push(i);
    }

    for (let i = count; i < MAX_PLANES; i++) {
      uniforms.uScale.value[i].set(0, 0, 1, 0);
      hoverF[i] = leanX[i] = leanY[i] = sideF[i] = 0;
    }

    over = overI;
    container.style.cursor = over >= 0 ? "pointer" : "";
    const wantTag = over >= 0 && !coarse && viewW > params.tagFrom;
    if (wantTag !== tagUp) {
      tagUp = wantTag;
      tag.show(wantTag);
    }
    if (over >= 0) focusPos.copy(rest[over]);

    uniforms.uTag.value.set(cursor.x + params.tagX, cursor.y + params.tagY, tag.box.sx, tag.box.sy);
    uniforms.uTagP.value.set(TAG_W * 0.5, TAG_H * 0.5, TAG_H * 0.5, params.tagRefract);
    uniforms.uTagQ.value.set(params.tagFrost, params.tagRim, 0, 0);

    /* honey */
    order.sort((a, b) => signedOffset(a) - signedOffset(b));
    const edgeHalf = faceEdge * 0.5 * params.thread;
    const closed = spread > 0.995 && count > 2;
    const linkCount = Math.min(closed ? count : count - 1, MAX_LINKS);

    for (let l = 0; l < linkCount; l++) {
      const ia = order[l];
      const ib = order[(l + 1) % count];
      const ca = uniforms.uPos.value[ia];
      const cb = uniforms.uPos.value[ib];
      const scA = uniforms.uScale.value[ia];
      const scB = uniforms.uScale.value[ib];
      const shrinkA = scA.y / swellOf(ia);
      const shrinkB = scB.y / swellOf(ib);
      const sep = rest[ia].distanceTo(rest[ib]) - sepExtent * 0.5 * (shrinkA + shrinkB);
      const v = clamp01(sep / finalSep);

      let fl = 0;
      if (track && params.web > 0.0001) {
        const mx = (ca.x + cb.x) * 0.5;
        const my = (ca.y + cb.y) * 0.5;
        const webReach = Math.max(1, params.webReach * W);
        const d = Math.hypot(cursor.x - mx, cursor.y - my);
        fl = smoothstep(webReach, webReach * 0.15, d) * cursor.amt;
      }
      webF[l] += (fl - webF[l]) * (fl > webF[l] ? kRise : kFall);

      const w = Math.max(Math.pow(1 - v, params.thin), params.web * webF[l]);
      const rEnd = edgeHalf * w - params.dissolve;
      const rMid = rEnd * (1 - (1 - params.pinch) * smoothstep(0, 0.7, v));
      uniforms.uLinkA.value[l].copy(ca);
      uniforms.uLinkB.value[l].copy(cb);
      uniforms.uLinkPar.value[l].set(
        rEnd,
        rMid,
        params.sag * g * Math.pow(v, 1.5),
        Math.min(params.fillet * g * smoothstep(0, 0.35, v), Math.max(rMid, 0) * 1.5),
      );
    }
    for (let l = linkCount; l < MAX_LINKS; l++) uniforms.uLinkPar.value[l].set(-100, -100, 0, 0);
    uniforms.uLinkCount.value = linkCount;

    uniforms.uK.value = params.goo * planeK * fit;
    uniforms.uWobble.value = params.wobble * fit * (1 - smoothstep(0.2, 0.95, state.progress));
    uniforms.uTextured.value = params.textured && firstIn ? 1 : 0;
    uniforms.uBlend.value = Math.max(0.5, params.blend * planeK * g);

    const on = params.glass && glassOn;
    uniforms.uBandTop.value = on ? params.bandTop * viewH : 0;
    uniforms.uBandBottom.value = on ? params.bandBottom * viewH : 0;
    uniforms.uGlass.value.set(params.refract, params.squeeze, params.ripple, params.rippleFreq);
    uniforms.uFringe.value = on ? params.fringe : 0;
    uniforms.uSheen.value = on ? params.sheen : 0;
  };

  /* entry timeline */
  let tl = null;
  const build = () => {
    if (reduced) {
      Object.assign(state, { progress: 1, spread: 1, spin: 0 });
      interactive = true;
      return null;
    }
    const t = gsap.timeline({ delay: 0.15, onComplete: () => { interactive = true; lastInput = performance.now(); } });
    t.fromTo(state, { progress: 0, spread: 0, spin: 0 }, { progress: 1, duration: 1.2, ease: "power2.out" });
    const spreadStart = t.duration() - 0.15;
    t.to(state, { spread: 1, duration: params.spreadTime, ease: params.spreadEase }, spreadStart);
    t.to(
      state,
      { spin: params.spinTurns * TAU, duration: params.spinTime, ease: params.spinEase },
      spreadStart + params.stageAt * params.spreadTime,
    );
    return t;
  };

  tag.build();
  tag.load(() => { if (!disposed) tag.build(); });

  // Starts once the art is in (or after 4s regardless) and the ring is on screen.
  let artReady = false;
  let seen = false;
  const maybeStart = () => {
    if (disposed || tl || !artReady || !seen) return;
    tag.build();
    tl = build() || true;
  };
  Promise.race([atlas.ready, new Promise((r) => setTimeout(r, 4000))]).then(() => {
    artReady = true;
    maybeStart();
  });
  (document.fonts?.ready ?? Promise.resolve()).then(() => { if (!disposed) tag.build(); });

  /* loop, paused while off screen */
  const start = performance.now();
  let prevT = start;
  const frame = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - prevT) / 1000);
    prevT = now;
    uniforms.uTime.value = (now - start) * 0.001;

    if (interactive && !dragging && !picking) {
      state.spin += spinVel * dt;
      spinVel *= Math.pow(params.damping, dt * 60);

      const idle =
        !reduced && params.drift > 0 && !engaged() && spinVel === 0 &&
        now - lastInput > params.driftAfter * 1000;
      if (idle) {
        // Left alone, it keeps turning slowly instead of sitting parked.
        state.spin += params.drift * dt;
        settling = false;
      } else {
        let off = 0;
        if (params.snap) {
          const slot = TAU / count;
          const decay = Math.max(0.01, -Math.log(params.damping) * 60);
          const engage = Math.max(params.snapFrom, decay * slot * 0.5);
          const rate = 4.8 / Math.max(0.05, params.snapTime);
          if (!settling && Math.abs(spinVel) < engage) {
            const coast = state.spin + spinVel / decay;
            const phase = -frontAngle;
            snapTo = Math.round((coast + phase) / slot) * slot - phase;
            snapCap = Math.max(Math.abs(spinVel), slot * 0.5 * rate);
            settling = true;
          }
          if (settling) {
            off = snapTo - state.spin;
            const aim = Math.max(-snapCap, Math.min(snapCap, off * rate));
            spinVel += (aim - spinVel) * clamp01(rate * dt);
          }
        } else {
          settling = false;
        }
        if (Math.abs(spinVel) < 0.0015 && Math.abs(off) < 0.0008) {
          spinVel = 0;
          state.spin += off;
        }
      }
    }

    updatePointer(dt);
    layout(dt);
    renderer.render(scene, camera);
  };

  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    const vis = entry.isIntersecting && document.visibilityState === "visible";
    if (entry.isIntersecting) { seen = true; maybeStart(); }
    if (vis !== running) {
      running = vis;
      prevT = performance.now();
      renderer.setAnimationLoop(vis ? frame : null);
    }
  });
  io.observe(container);

  return () => {
    disposed = true;
    clearTimeout(holdTimer);
    renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    container.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerup", onPointerUp);
    container.removeEventListener("pointercancel", onPointerUp);
    container.removeEventListener("pointerleave", onPointerLeave);
    container.removeEventListener("click", onClick);
    if (tl && tl !== true) tl.kill();
    gsap.killTweensOf(state);
    tag.dispose();
    mesh.geometry.dispose();
    mesh.material.dispose();
    uniforms.uAtlas.value?.dispose();
    uniforms.uTagTex.value?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
