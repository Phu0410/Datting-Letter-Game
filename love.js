const $ = (id) => document.getElementById(id);

const aimStage = $("aimStage");
const target = $("target");
const targetEnv = target.querySelector(".envelope");
const envelopeHeartTarget = targetEnv.querySelector('path[fill="#cf4456"]');
const arrow = $("arrow");
const bow = $("bow");
const bowString = $("bowString");
const nockEl = $("nock");
const hint = $("hint");
const hintText = $("hintText");
const win = $("window");
const content = $("content");
const title = $("title");
const catCanvas = $("cat");
const nextStepLoading = $("nextStepLoading");
const foodChoice = $("foodChoice");
const foodChoiceStatus = $("foodChoiceStatus");
const foodChoiceCountdown = $("foodChoiceCountdown");
const FOOD_FORM_ENDPOINT = "https://formspree.io/f/myeedbye";
const buttons = $("buttons");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const finalText = $("final");
const closeBtn = $("closeBtn");
const confettiBox = $("confetti");
const rainBox = $("rain");

// const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reduceMotion = false;

const PAL = {
  k: "#221d1c",
  w: "#fdfdfd",
  p: "#15110f",
  r: "#e23b4e",
  d: "#b22a3b",
  n: "#ff8fa3",
  c: "#ffb3c1",
};

const CAT_IDLE = [
  "..k..........k..",
  ".kkk........kkk.",
  "kkkk........kkkk",
  "kkkkkkkkkkkkkkkk",
  "kwwwwkkkkkkwwwwk",
  "kwppwkkkkkkwppwk",
  "kwppwkkkkkkwppwk",
  "kcckkkknnkkkkcck",
  ".kkkkkkkkkkkkkk.",
  "kkkkkkrrkrrkkkkk",
  "kkkkkrrrrrrrkkkk",
  "kkkkkrrrrrrrkkkk",
  ".kkkkkrrrrrkkkk.",
  "..kkkkkrrrkkkk..",
  "....kk..r.kk....",
  "................",
];

const CAT_HAPPY = [
  "..k..........k..",
  ".kkk........kkk.",
  "kkkk........kkkk",
  "kkkkkkkkkkkkkkkk",
  "kkkkkkkkkkkkkkkk",
  "kwkkwkkkkkkwkkwk",
  "kkwwkkkkkkkkwwkk",
  "kcckkkknnkkkkcck",
  ".kkkkkkkkkkkkkk.",
  "kkkkkkrrkrrkkkkk",
  "kkkkkrrrrrrrkkkk",
  "kkkkkrrrrrrrkkkk",
  ".kkkkkrrrrrkkkk.",
  "..kkkkkrrrkkkk..",
  "....kk..r.kk....",
  "................",
];

const CAT_BLINK = [
  "..k..........k..",
  ".kkk........kkk.",
  "kkkk........kkkk",
  "kkkkkkkkkkkkkkkk",
  "kkkkkkkkkkkkkkkk",
  "kwwwwkkkkkkwwwwk",
  "kkkkkkkkkkkkkkkk",
  "kcckkkknnkkkkcck",
  ".kkkkkkkkkkkkkk.",
  "kkkkkkrrkrrkkkkk",
  "kkkkkrrrrrrrkkkk",
  "kkkkkrrrrrrrkkkk",
  ".kkkkkrrrrrkkkk.",
  "..kkkkkrrrkkkk..",
  "....kk..r.kk....",
  "................",
];

function drawSprite(canvas, rows) {
  const h = rows.length,
    w = rows[0].length;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const col = PAL[row[x]];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

const CONFETTI_COLORS = ["#e8546a", "#f08aa0", "#d83a52", "#f6b3c2", "#c83048"];

const PARALLAX = [];
// design by chatgpt: keep Love Letter-style layered parallax while hearts rise over the Proposal backdrop.
function spawnConfetti(scale = 1) {
  const layers = [
    { factor: 7, size: 0.8, opacity: 0.55 },
    { factor: 16, size: 1, opacity: 0.82 },
    { factor: 30, size: 1.18, opacity: 1 },
  ].map((settings) => {
    const layer = document.createElement("div");
    layer.className = "background-heart-layer";
    layer.style.opacity = settings.opacity;
    confettiBox.appendChild(layer);
    PARALLAX.push({ el: layer, factor: settings.factor });
    return { ...settings, el: layer };
  });

  const addHeart = () => {
    const depth = layers[(Math.random() * layers.length) | 0];
    const heart = document.createElement("span");
    heart.className = "background-heart";
    heart.textContent = Math.random() < 0.5 ? "❤" : "♡";
    heart.style.left = Math.random() * 100 + "%";
    heart.style.fontSize =
      (10 + Math.random() * 18) * depth.size * scale + "px";
    heart.style.opacity = 0.3 + Math.random() * 0.6;
    heart.style.animationDuration = 5.5 + Math.random() * 3.5 + "s";
    heart.addEventListener("animationend", () => heart.remove(), {
      once: true,
    });
    depth.el.appendChild(heart);
  };
  addHeart();
  setInterval(addHeart, 350);
}
let pX = 0,
  pY = 0,
  parallaxRAF = 0;
function applyParallax() {
  parallaxRAF = 0;
  for (const { el, factor } of PARALLAX) {
    el.style.transform = `translate(${-pX * factor}px, ${-pY * factor}px)`;
  }
  target.style.setProperty("--parallax-x", `${pX * 12}px`);
  target.style.setProperty("--parallax-y", `${pY * 9}px`);
}
function onParallax(e) {
  // design by chatgpt: restore full pointer and touch parallax on both axes.
  pX = (e.clientX / window.innerWidth - 0.5) * 2;
  pY = (e.clientY / window.innerHeight - 0.5) * 2;
  if (!parallaxRAF) parallaxRAF = requestAnimationFrame(applyParallax);
}

// chatgpt design: make the envelope a moving Pong-style target while keeping its lowest edge at the original height.
const targetFrame = target.querySelector(".envelope-frame");
let targetMotionRAF = 0;
let targetLastTime = 0;
let targetX = 0,
  targetY = 0,
  targetHomeY = 0;
let targetVX = 150,
  targetVY = -34;
let targetElapsed = 0,
  targetMaxRotation = 18;

function targetMotionBounds(rotationDeg) {
  const stageWidth = aimStage.clientWidth;
  const targetWidth = target.offsetWidth;
  const frameWidth = targetFrame.offsetWidth;
  const frameHeight = targetFrame.offsetHeight;
  const radians = (Math.abs(rotationDeg) * Math.PI) / 180;
  const rotatedWidth =
    Math.cos(radians) * frameWidth + Math.sin(radians) * frameHeight;
  const rotatedHeight =
    Math.sin(radians) * frameWidth + Math.cos(radians) * frameHeight;
  const frameCenterOffsetX =
    targetFrame.offsetLeft + frameWidth / 2 - targetWidth / 2;
  const horizontalExtent = Math.max(
    targetWidth / 2,
    Math.abs(frameCenterOffsetX) + rotatedWidth / 2,
  );
  const verticalExtra = Math.max(0, (rotatedHeight - frameHeight) / 2);
  const stageRect = aimStage.getBoundingClientRect();
  // chatgpt design: use the full stage width as Pong side walls; account for parallax so the envelope stays visible at the edges.
  const sideParallax = 12;
  const minX = Math.min(stageWidth / 2, horizontalExtent + sideParallax);
  const maxX = Math.max(minX, stageWidth - horizontalExtent - sideParallax);
  // chatgpt design: keep the whole letter inside the top third of the viewport and away from the bow.
  const topInset = 9; // leave room for the target's pointer parallax
  const minY = topInset - stageRect.top;
  const topThirdBoundary = window.innerHeight / 3 - stageRect.top;
  const maxY = Math.max(
    minY,
    topThirdBoundary -
      targetFrame.offsetTop -
      frameHeight -
      verticalExtra -
      topInset,
  );
  return { minX, maxX, minY, maxY };
}

// chatgpt design: use the SVG heart's actual filled shape as the only valid arrow hit area.
function arrowTipHitsEnvelopeHeart(clientX, clientY) {
  if (
    !envelopeHeartTarget ||
    typeof envelopeHeartTarget.isPointInFill !== "function"
  )
    return false;
  const matrix = envelopeHeartTarget.getScreenCTM();
  if (!matrix) return false;
  const point = targetEnv.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return envelopeHeartTarget.isPointInFill(
    point.matrixTransform(matrix.inverse()),
  );
}

function chooseTargetRotationLimit() {
  for (let degrees = 24; degrees >= 0; degrees -= 1) {
    const bounds = targetMotionBounds(degrees);
    if (bounds.maxY >= bounds.minY) return degrees;
  }
  return 0;
}

function paintMovingTarget(rotationDeg) {
  // chatgpt design: move the target with transform variables so animation stays smooth without layout shifts.
  target.style.setProperty(
    "--game-offset-x",
    `${targetX - aimStage.clientWidth / 2}px`,
  );
  target.style.setProperty("--game-offset-y", `${targetY - targetHomeY}px`);
  targetFrame.style.rotate = `${rotationDeg.toFixed(2)}deg`;
}

function targetMotionStep(now) {
  targetMotionRAF = 0;
  if (target.classList.contains("is-hit") || win.classList.contains("is-open"))
    return;

  const deltaSeconds = targetLastTime
    ? Math.min((now - targetLastTime) / 1000, 0.05)
    : 0;
  targetLastTime = now;
  targetElapsed += deltaSeconds;
  const rotation = Math.sin(targetElapsed * 1.45) * targetMaxRotation;
  const bounds = targetMotionBounds(rotation);

  targetX += targetVX * deltaSeconds;
  if (targetX < bounds.minX) {
    targetX = bounds.minX + (bounds.minX - targetX);
    targetVX = Math.abs(targetVX);
  } else if (targetX > bounds.maxX) {
    targetX = bounds.maxX - (targetX - bounds.maxX);
    targetVX = -Math.abs(targetVX);
  }

  targetY += targetVY * deltaSeconds;
  if (targetY < bounds.minY) {
    targetY = bounds.minY + (bounds.minY - targetY);
    targetVY = Math.abs(targetVY);
  } else if (targetY > bounds.maxY) {
    targetY = bounds.maxY - (targetY - bounds.maxY);
    targetVY = -Math.abs(targetVY);
  }

  paintMovingTarget(rotation);
  targetMotionRAF = requestAnimationFrame(targetMotionStep);
}

function startTargetMotion(resetPosition = false) {
  if (targetMotionRAF) cancelAnimationFrame(targetMotionRAF);
  targetMotionRAF = 0;
  if (resetPosition) {
    targetHomeY = aimStage.clientHeight * 0.06;
    targetX = aimStage.clientWidth / 2;
    targetY = targetHomeY;
    // chatgpt design: choose fresh Pong directions on page start and whenever the letter is reset after closing the window.
    targetVX = (Math.random() < 0.5 ? -1 : 1) * 150;
    targetVY = (Math.random() < 0.5 ? -1 : 1) * 34;
    targetElapsed = 0;
    targetMaxRotation = chooseTargetRotationLimit();
    const bounds = targetMotionBounds(0);
    targetX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));
    targetY = Math.max(bounds.minY, Math.min(bounds.maxY, targetY));
    targetFrame.style.rotate = "0deg";
  }
  targetLastTime = 0;
  paintMovingTarget(0);
  targetMotionRAF = requestAnimationFrame(targetMotionStep);
}

function resizeTargetMotion() {
  targetHomeY = aimStage.clientHeight * 0.06;
  targetMaxRotation = chooseTargetRotationLimit();
  const bounds = targetMotionBounds(0);
  targetX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));
  targetY = Math.max(bounds.minY, Math.min(bounds.maxY, targetY));
  paintMovingTarget(0);
}

function stopTargetMotion() {
  cancelAnimationFrame(targetMotionRAF);
  targetMotionRAF = 0;
}

function openLetter() {
  aimStage.classList.add("is-gone");
  win.classList.add("is-open");
  win.setAttribute("aria-hidden", "false");
  setTimeout(
    () => yesBtn.focus({ preventScroll: true }),
    reduceMotion ? 0 : 420,
  );
}

function closeLetter() {
  win.classList.remove("is-open");
  win.setAttribute("aria-hidden", "true");
  aimStage.classList.remove("is-gone");
  reset();
  // chatgpt design: recalculate the resting arrow after the stage's scale/position transition completes.
  arrow.classList.remove("is-on");
  setTimeout(resetAim, reduceMotion ? 0 : 480);
  setTimeout(
    () => aimStage.focus({ preventScroll: true }),
    reduceMotion ? 0 : 420,
  );
}

closeBtn.addEventListener("click", closeLetter);

const DEFAULT_HINT =
  "Aim for the heart in the middle of the letter, then hold and release to shoot ♡";
const MISS_HINTS = [
  "So close — try again ♡",
  "Aim for the heart ♡",
  "Cupid never misses twice ♡",
];
// design by chatgpt: use the reference arrow length for correct flight and impact placement.
const ARROW_LEN = 110;

const MIN_DRAW = 6;
const MAX_DRAW = 34;
const DRAW_TIME = 380;
const FLEX = 0.12;
const BASE_SPEED = 8.5;
const MAX_SPEED = 17;
const GRAVITY = 0.03;
const RECOIL_MS = 220;
// design by chatgpt: use Love Letter-style inset envelope collision bounds, without an expanded hit margin.

function restAngle(m) {
  return clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx));
}

let angle = -Math.PI / 2;
let aiming = false;
let flying = false;
let missCount = 0;
let drawn = 0;
let rafId = 0;
let drawRAF = 0;
let drawStartT = 0;

function metrics() {
  const s = aimStage.getBoundingClientRect();
  const n = nockEl.getBoundingClientRect();
  const e = targetEnv.getBoundingClientRect();
  return {
    w: s.width,
    h: s.height,
    left: s.left,
    top: s.top,
    nx: n.left + n.width / 2 - s.left,
    ny: n.top + n.height / 2 - s.top,
    tx: e.left + e.width / 2 - s.left,
    ty: e.top + e.height / 2 - s.top,
    thw: e.width / 2,
    thh: e.height / 2,
  };
}

function clampAngle(a) {
  let d = (a * 180) / Math.PI;
  if (d >= 0) d = d <= 90 ? -10 : -170;
  else {
    if (d > -10) d = -10;
    if (d < -170) d = -170;
  }
  return (d * Math.PI) / 180;
}

// design by chatgpt: rotate the Love Letter bow from its upright rest angle and pull its string with the current draw.
function renderBow(deg, flex) {
  bow.style.transform = `rotate(${deg + 90}deg) scaleX(${flex})`;
  bowString.setAttribute("points", `14,70 110,${70 + drawn} 206,70`);
}

function renderArrow(tailX, tailY, direction) {
  arrow.style.left = tailX - 7 + "px";
  arrow.style.top = tailY - ARROW_LEN + "px";
  arrow.style.transform = `rotate(${((direction + Math.PI / 2) * 180) / Math.PI}deg)`;
  arrow.classList.add("is-on");
}

function renderAim(m) {
  const deg = (angle * 180) / Math.PI;
  renderBow(deg, 1 + (drawn / MAX_DRAW) * FLEX);
  const tailX = m.nx - Math.cos(angle) * drawn;
  const tailY = m.ny - Math.sin(angle) * drawn;
  renderArrow(tailX, tailY, angle);
}

function updateAim(clientX, clientY) {
  if (flying) return;
  const m = metrics();
  angle = clampAngle(
    Math.atan2(clientY - m.top - m.ny, clientX - m.left - m.nx),
  );
  if (!aiming) drawn = 0;
  renderAim(m);
}

function startDraw() {
  if (reduceMotion) {
    drawn = MAX_DRAW;
    renderAim(metrics());
    return;
  }
  drawStartT = performance.now();
  if (!drawRAF) drawRAF = requestAnimationFrame(drawStep);
}
function drawStep(now) {
  drawRAF = 0;
  if (!aiming || flying) return;
  const t = Math.min(1, (now - drawStartT) / DRAW_TIME);
  const eased = 1 - Math.pow(1 - t, 2.2);
  drawn = MIN_DRAW + (MAX_DRAW - MIN_DRAW) * eased;
  if (t > 0.8) drawn += Math.sin(now / 38) * 0.7;
  renderAim(metrics());
  drawRAF = requestAnimationFrame(drawStep);
}

function release() {
  if (!aiming || flying) return;
  aiming = false;
  cancelAnimationFrame(drawRAF);
  drawRAF = 0;
  fire();
}

function fire(power) {
  if (flying) return;
  if (power == null)
    power = clamp01((drawn - MIN_DRAW) / (MAX_DRAW - MIN_DRAW));
  flying = true;
  aiming = false;

  const m = metrics();
  const launchDraw = drawn;
  const startFlex = 1 + (launchDraw / MAX_DRAW) * FLEX;
  drawn = 0;

  if (reduceMotion) {
    renderBow((angle * 180) / Math.PI, 1);
    onHit(m);
    return;
  }

  const speed = BASE_SPEED + power * (MAX_SPEED - BASE_SPEED);
  let vx = Math.cos(angle) * speed,
    vy = Math.sin(angle) * speed;
  let tx = m.nx - Math.cos(angle) * launchDraw;
  let ty = m.ny - Math.sin(angle) * launchDraw;
  const t0 = performance.now();
  let lastStepTime = t0;
  let lastTrailTime = t0;

  function step(now) {
    // chatgpt design: scale movement to elapsed time so Safari FPS changes do not slow the arrow.
    const frameScale = Math.min((now - lastStepTime) / (1000 / 60), 3);
    lastStepTime = now;
    const bt = Math.min(1, (now - t0) / RECOIL_MS);
    const flex = 1 + (startFlex - 1) * Math.cos(bt * Math.PI * 1.5) * (1 - bt);
    renderBow((angle * 180) / Math.PI, Math.max(0.9, flex));

    vy += GRAVITY * frameScale;
    tx += vx * frameScale;
    ty += vy * frameScale;
    const dir = Math.atan2(vy, vx);
    const cos = Math.cos(dir),
      sin = Math.sin(dir);
    renderArrow(tx, ty, dir);
    const tipx = tx + cos * ARROW_LEN;
    const tipy = ty + sin * ARROW_LEN;

    // chatgpt design: emit hearts behind the arrow tail at a steady rate, never over its shaft.
    if (now - lastTrailTime >= 1000 / 30) {
      spawnTrail(tx - cos * 24, ty - sin * 24);
      lastTrailTime = now;
    }
    // chatgpt design: only count a hit when the arrow tip touches the center heart's filled SVG shape.
    if (arrowTipHitsEnvelopeHeart(m.left + tipx, m.top + tipy)) {
      onHit(m, dir, tipx, tipy);
      return;
    }
    // chatgpt design: let the arrow travel all the way to the actual viewport edges on every screen size.
    const tipClientX = m.left + tipx;
    const tipClientY = m.top + tipy;
    if (
      tipClientX < 0 ||
      tipClientX > window.innerWidth ||
      tipClientY < 0 ||
      tipClientY > window.innerHeight
    ) {
      onMiss();
      return;
    }
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function spawnTrail(x, y) {
  const t = document.createElement("span");
  t.className = "heart trail";
  // chatgpt design: center the larger heart particles on the arrow's trail coordinates.
  t.style.left = x - 7.5 + "px";
  t.style.top = y - 7.5 + "px";
  t.style.background = "#f4a9b8";
  t.addEventListener("animationend", () => t.remove());
  aimStage.appendChild(t);
}

function onHit(m, dir, impactX, impactY) {
  cancelAnimationFrame(rafId);
  stopTargetMotion();
  flying = false;
  drawn = 0;
  const a = dir == null ? angle : dir;
  const envelopeRect = targetEnv.getBoundingClientRect();
  const stageRect = aimStage.getBoundingClientRect();
  const localImpactX = Number.isFinite(impactX)
    ? impactX
    : envelopeRect.left - stageRect.left + envelopeRect.width / 2;
  const localImpactY = Number.isFinite(impactY)
    ? impactY
    : envelopeRect.top - stageRect.top + envelopeRect.height / 2;

  // design by chatgpt: anchor the arrow at the actual impact point instead of moving it to the envelope center.
  const tailX = localImpactX - Math.cos(a) * ARROW_LEN;
  const tailY = localImpactY - Math.sin(a) * ARROW_LEN;
  renderArrow(tailX, tailY, a);
  target.classList.add("is-hit");
  target.classList.remove("is-pulse");
  // design by chatgpt: keep the heart explosion at the arrow's actual contact point.
  if (!reduceMotion) {
    spawnImpactBurst(
      stageRect.left + localImpactX,
      stageRect.top + localImpactY,
    );
  }
  setTimeout(openLetter, reduceMotion ? 0 : 700);
}

function onMiss() {
  cancelAnimationFrame(rafId);
  flying = false;
  drawn = 0;
  arrow.classList.remove("is-on");
  hintText.textContent = MISS_HINTS[Math.min(missCount, MISS_HINTS.length - 1)];
  missCount++;
  if (missCount >= 2) target.classList.add("is-pulse");
  setTimeout(() => {
    if (flying) return;
    const m = metrics();
    angle = restAngle(m);
    renderAim(m);
  }, 320);
}

function resetAim() {
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(drawRAF);
  drawRAF = 0;
  flying = false;
  aiming = false;
  missCount = 0;
  drawn = 0;
  target.classList.remove("is-hit", "is-pulse");
  startTargetMotion(true);
  hintText.textContent = DEFAULT_HINT;
  const m = metrics();
  angle = restAngle(m);
  renderAim(m);
}

aimStage.addEventListener("pointermove", (e) => {
  if (!flying) updateAim(e.clientX, e.clientY);
});
aimStage.addEventListener("pointerdown", (e) => {
  if (flying) return;
  const m = metrics();
  angle = clampAngle(
    Math.atan2(e.clientY - m.top - m.ny, e.clientX - m.left - m.nx),
  );
  aiming = true;
  startDraw();
});
window.addEventListener("pointerup", release);

aimStage.addEventListener("keydown", (e) => {
  if (e.key !== " " && e.key !== "Enter") return;
  e.preventDefault();
  if (flying || aiming) return;
  const m = metrics();
  angle = clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx));
  aiming = true;
  startDraw();
  setTimeout(release, reduceMotion ? 0 : DRAW_TIME + 60);
});

window.addEventListener("resize", () => {
  if (!flying) renderAim(metrics());
});

let yesScale = 1;
let catState = "idle";
let choiceTimer = 0;
let redirectDelayTimer = 0;
let redirectCountdownTimer = 0;
// chatgpt design: use the playful NO button reactions from Love Letter after its first three dodges.
const NO_BUTTON_LINES = [
  "NO",
  "Hmm?",
  "Wrong button!",
  "Try again 😼",
  "Can't catch me!",
  "Just say yes ♡",
];
let noDodgeCount = 0;

function dodge(e) {
  if (e) {
    e.preventDefault();
  }

  const area = content.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();
  const pad = 10;

  if (getComputedStyle(noBtn).position !== "absolute") {
    const startX = b.left - area.left;
    const startY = b.top - area.top;
    noBtn.style.position = "absolute";
    noBtn.style.left = startX + "px";
    noBtn.style.top = startY + "px";
  }

  const y = yesBtn.getBoundingClientRect();
  const m = 16;
  const yesL = y.left - area.left - m,
    yesR = y.right - area.left + m;
  const yesT = y.top - area.top - m,
    yesB = y.bottom - area.top + m;

  const minY = area.height * 0.32;
  const maxX = Math.max(pad, area.width - b.width - pad);
  const maxY = Math.max(minY + pad, area.height - b.height - pad);

  let nx = pad,
    ny = minY;
  for (let i = 0; i < 24; i++) {
    nx = pad + Math.random() * (maxX - pad);
    ny = minY + Math.random() * (maxY - minY);
    const hitsYes =
      nx < yesR && nx + b.width > yesL && ny < yesB && ny + b.height > yesT;
    if (!hitsYes) break;
  }
  noBtn.style.left = nx + "px";
  noBtn.style.top = ny + "px";

  noDodgeCount++;
  if (noDodgeCount >= 3) {
    const lineIndex = 1 + ((noDodgeCount - 3) % (NO_BUTTON_LINES.length - 1));
    noBtn.textContent = NO_BUTTON_LINES[lineIndex];
  }

  yesScale = Math.min(1.8, yesScale + 0.07);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.add("is-tempting");
}

// design by chatgpt: match Love Letter's touchstart cancellation so moving NO cannot retarget the tap to YES.
noBtn.addEventListener("pointerenter", (e) => {
  // Keep touch handling on touchstart; pointerenter remains the desktop hover behavior.
  if (e.pointerType !== "touch") dodge(e);
});
noBtn.addEventListener(
  "touchstart",
  (e) => {
    // Cancel the synthesized click before NO moves, preventing the same tap from activating YES.
    e.preventDefault();
    dodge(e);
  },
  { passive: false },
);
noBtn.addEventListener("click", dodge);
noBtn.addEventListener("focus", dodge);

function sayYes() {
  clearTimeout(choiceTimer);
  catState = "happy";
  title.textContent = "Yayyy! I Knew it ♡";
  drawSprite(catCanvas, CAT_HAPPY);
  catCanvas.setAttribute("aria-label", "A happy cat with a bow");
  // design by chatgpt: position the loader below the cat without changing grid layout or burst coordinates.
  nextStepLoading.style.top = `${catCanvas.offsetTop + catCanvas.offsetHeight + 8}px`;
  nextStepLoading.hidden = false;

  buttons.hidden = true;
  finalText.hidden = false;
  requestAnimationFrame(() => finalText.classList.add("is-show"));

  const fh = document.createElement("span");
  fh.className = "heart cat-heart";
  fh.style.left = "50%";
  fh.style.top = "60px";
  fh.style.transform = "translateX(-50%)";
  content.appendChild(fh);

  content.classList.add("is-won");
  win.classList.add("is-celebrate");
  if (!reduceMotion) {
    heartBurst();
    celebrate(() => {
      choiceTimer = setTimeout(showFoodChoice, 4000);
    });
  } else {
    choiceTimer = setTimeout(showFoodChoice, 4000);
  }
}

function showFoodChoice() {
  nextStepLoading.hidden = true;
  title.hidden = true;
  catCanvas.hidden = true;
  finalText.hidden = true;
  content.classList.remove("is-won");
  win.classList.remove("is-celebrate");
  // chatgpt design: enable vertical scrolling only for the checklist screen, where the form may exceed a short viewport.
  win.classList.add("has-scroll");
  foodChoice.hidden = false;
  requestAnimationFrame(() => foodChoice.classList.add("is-visible"));
}

yesBtn.addEventListener("click", sayYes);

// design by chatgpt: recreate Love Letter's large, colorful heart burst on arrow impact.
function spawnImpactBurst(x, y) {
  const colors = [
    "#e85a8a",
    "#f7a1c0",
    "#c8344d",
    "#f4c95d",
    "#b48ef0",
    "#ff9c7a",
  ];
  for (let i = 0; i < 60; i++) {
    const heart = document.createElement("span");
    heart.className = "impact-heart";
    heart.textContent = "❤";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.color = colors[i % colors.length];
    heart.style.fontSize = 14 + Math.random() * 30 + "px";
    const direction = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 380;
    heart.style.setProperty("--dx", Math.cos(direction) * distance + "px");
    heart.style.setProperty(
      "--dy",
      Math.sin(direction) * distance + 200 + "px",
    );
    heart.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
    heart.addEventListener("animationend", () => heart.remove(), {
      once: true,
    });
    document.body.appendChild(heart);
  }
}

function spawnBurst(parent, cx, cy, n = 18) {
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.className = "heart burst";
    const size = 10 + Math.random() * 14;
    h.style.width = h.style.height = size + "px";
    h.style.left = cx - size / 2 + "px";
    h.style.top = cy - size / 2 + "px";
    h.style.background =
      CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 110;
    h.style.setProperty("--bx", Math.cos(ang) * dist + "px");
    h.style.setProperty("--by", Math.sin(ang) * dist - 40 + "px");
    h.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
    h.addEventListener("animationend", () => h.remove());
    parent.appendChild(h);
  }
}

function heartBurst(n = 22) {
  spawnBurst(
    content,
    catCanvas.offsetLeft + catCanvas.offsetWidth / 2,
    catCanvas.offsetTop + catCanvas.offsetHeight / 2,
    n,
  );
}

const LOVE_COLORS = [
  "#e8546a",
  "#ff5d8f",
  "#d83a52",
  "#f08aa0",
  "#ff8fab",
  "#c83048",
  "#ff7eb3",
  "#c79bff",
  "#ff9e6b",
  "#ffd56b",
  "#f6b3c2",
];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

const GRAVITY_C = 0.2;
const DRAG_C = 0.993;

const confetti = [];
// design by chatgpt: lighter heart celebration for phones and touch devices.
const lightweightCelebration = window.matchMedia(
  "(max-width: 600px), (pointer: coarse)",
).matches;
let confettiRAF = 0;
let lastConfettiFrame = 0;
let confettiTimer = 0;
let confScale = 1;

function addConfetti(x, y, vx, vy, size) {
  const el = document.createElement("span");
  el.className = "heart confetti-heart";
  el.style.width = el.style.height = size.toFixed(0) + "px";
  el.style.background = pick(LOVE_COLORS);
  rainBox.appendChild(el);
  confetti.push({
    el,
    x,
    y,
    vx,
    vy,
    rot: rand(0, 360),
    vrot: rand(-7, 7),
    age: 0,
    life: lightweightCelebration ? rand(1.7, 2.2) : rand(2.6, 3.6),
  });
}

function confettiBurst() {
  const W = innerWidth,
    H = innerHeight;
  // fix by chapgt: fewer large hearts on phones to keep the celebration smooth.
  const n = lightweightCelebration ? 1 : confScale < 0.7 ? 4 : 5;
  popper(-14, H + 14, -Math.PI * 0.34, n);
  popper(W + 14, H + 14, -Math.PI * 0.66, n);
  popper(W / 2, H + 14, -Math.PI * 0.5, n);
}

function popper(x, y, ang, n) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-0.42, 0.42);
    const sp = rand(14, 21) * confScale;
    // fix by chapgt: keep phone hearts at full size; confScale is kept for desktop only.
    const size = lightweightCelebration
      ? rand(48, 96)
      : rand(48, 96) * confScale;
    addConfetti(x, y, Math.cos(a) * sp, Math.sin(a) * sp, size);
  }
}

let onCelebrateComplete = null;
function confettiTick(now) {
  confettiRAF = 0;
  // fix by chapgt: apply frame-rate compensation only on phones; preserve desktop motion.
  const frameScale = lightweightCelebration
    ? lastConfettiFrame
      ? Math.min(2, (now - lastConfettiFrame) / (1000 / 60))
      : 1
    : 1;
  lastConfettiFrame = now;
  const H = innerHeight;
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.vy += GRAVITY_C * confScale * frameScale;
    p.vx *= Math.pow(DRAG_C, frameScale);
    p.vy *= Math.pow(DRAG_C, frameScale);
    p.x += p.vx * frameScale;
    p.y += p.vy * frameScale;
    p.rot += p.vrot * frameScale;
    p.age += frameScale / 60;
    const o =
      p.age < 0.1 ? p.age / 0.1 : Math.max(0, 1 - (p.age - 0.1) / p.life);
    p.el.style.opacity = o.toFixed(2);
    p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot | 0}deg)`;
    if (o <= 0 || p.y > H + 120) {
      p.el.remove();
      confetti.splice(i, 1);
    }
  }
  if (confetti.length) confettiRAF = requestAnimationFrame(confettiTick);
  else if (!confettiTimer && onCelebrateComplete) {
    const done = onCelebrateComplete;
    onCelebrateComplete = null;
    done();
  }
}

function celebrate(onComplete) {
  clearInterval(confettiTimer);
  onCelebrateComplete = onComplete;
  confScale = Math.max(
    0.5,
    Math.min(1.15, Math.min(innerWidth, innerHeight) / 900),
  );
  confettiBurst();
  let t = 0;
  const burstInterval = lightweightCelebration ? 480 : 360;
  const burstDuration = lightweightCelebration ? 1920 : 2700;
  confettiTimer = setInterval(() => {
    t += burstInterval;
    confettiBurst();
    if (t >= burstDuration) {
      clearInterval(confettiTimer);
      confettiTimer = 0;
    }
  }, burstInterval);
  if (!confettiRAF) confettiRAF = requestAnimationFrame(confettiTick);
}

function stopCelebrate() {
  clearInterval(confettiTimer);
  confettiTimer = 0;
  cancelAnimationFrame(confettiRAF);
  confettiRAF = 0;
  lastConfettiFrame = 0;
  confetti.forEach((particle) => particle.el.remove());
  confetti.length = 0;
  onCelebrateComplete = null;
}

foodChoice.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selected = [...new FormData(foodChoice).getAll("foods")];
  if (!selected.length) {
    // design by chatgpt: validate food choices first, then the optional-note-independent name field.
    foodChoiceStatus.textContent = "Cậu chọn ít nhất 1 món nhé ♡";
    return;
  }

  const nameInput = foodChoice.querySelector("#foodName");
  const guestName = nameInput.value.trim();
  if (!guestName) {
    foodChoiceStatus.textContent = "Cậu nhập tên nhé ♡";
    nameInput.focus();
    return;
  }
  nameInput.value = guestName;

  if (FOOD_FORM_ENDPOINT.endsWith("/YOUR_FORM_ID")) {
    foodChoiceStatus.textContent =
      "Checklist đã sẵn sàng; cần nối Formspree để gửi phản hồi thật.";
    return;
  }

  const submitButton = foodChoice.querySelector(".food-choice__submit");
  submitButton.disabled = true;
  foodChoiceStatus.textContent = "Đang gửi lựa chọn…";
  const data = new FormData(foodChoice);
  data.set("name", guestName);
  data.set("submittedAt", new Date().toISOString());

  try {
    const response = await fetch(FOOD_FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Form submission failed");
    foodChoiceStatus.textContent = `Cảm ơn cậu ♡ Đã chọn: ${selected.join(", ")}. Tui sẽ tìm vibe quán và món phù hợp này sớm nhất có thể`;
    foodChoice.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.disabled = true;
    });
    foodChoice.querySelector("#foodNotes").disabled = true;
    foodChoice.querySelector("#foodName").disabled = true;
    // design by chatpgt: wait five seconds, count down, then open the next page.
    foodChoiceCountdown.hidden = true;
    foodChoiceCountdown.textContent = "";
    redirectDelayTimer = setTimeout(() => {
      let seconds = 10;
      foodChoiceCountdown.textContent = `Chuyển trang sau ${seconds} giây… sẽ có bất ngờ mới`;
      foodChoiceCountdown.hidden = false;
      redirectCountdownTimer = setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
          clearInterval(redirectCountdownTimer);
          redirectCountdownTimer = 0;
          window.location.href =
            "https://phu0410.github.io/CardHoverAnimation/#";
          return;
        }
        foodChoiceCountdown.textContent = `Chuyển trang sau ${seconds} giây… sẽ có bất ngờ mới`;
      }, 1000);
    }, 5000);
  } catch (error) {
    foodChoiceStatus.textContent =
      "Gửi chưa thành công, cậu thử lại giúp tui nhé ♡";
    submitButton.disabled = false;
  }
});

function blink() {
  if (catState !== "idle") return;
  drawSprite(catCanvas, CAT_BLINK);
  setTimeout(() => {
    if (catState === "idle") drawSprite(catCanvas, CAT_IDLE);
  }, 140);
}

function reset() {
  clearTimeout(choiceTimer);
  choiceTimer = 0;
  clearTimeout(redirectDelayTimer);
  redirectDelayTimer = 0;
  clearInterval(redirectCountdownTimer);
  redirectCountdownTimer = 0;
  foodChoiceCountdown.hidden = true;
  foodChoiceCountdown.textContent = "";
  catState = "idle";
  title.textContent = "I am Phú! Do u wanna date with me ♡ ? Try No🫪";
  title.hidden = false;
  drawSprite(catCanvas, CAT_IDLE);
  catCanvas.setAttribute("aria-label", "A little cat holding a heart");
  buttons.hidden = false;
  finalText.hidden = true;
  catCanvas.hidden = false;
  nextStepLoading.hidden = true;
  foodChoice.hidden = true;
  foodChoice.classList.remove("is-visible");
  win.classList.remove("has-scroll");
  foodChoice.reset();
  foodChoice.querySelector(".food-choice__submit").disabled = false;
  foodChoice.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = false;
  });
  foodChoice.querySelector("#foodNotes").disabled = false;
  foodChoice.querySelector("#foodName").disabled = false;
  foodChoiceStatus.textContent = "";
  finalText.classList.remove("is-show");
  content.classList.remove("is-won");
  win.classList.remove("is-celebrate");
  content.querySelectorAll(".cat-heart, .burst").forEach((el) => el.remove());
  stopCelebrate();
  rainBox.replaceChildren();
  yesScale = 1;
  yesBtn.style.transform = "";
  yesBtn.classList.remove("is-tempting");
  noDodgeCount = 0;
  noBtn.textContent = NO_BUTTON_LINES[0];
  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
}

drawSprite(catCanvas, CAT_IDLE);
spawnConfetti(reduceMotion ? 0.5 : 1);

if (!reduceMotion) {
  window.addEventListener("pointermove", onParallax, { passive: true });
  setInterval(blink, 3600);
}

function layoutAim() {
  if (flying) return;
  const m = metrics();
  angle = restAngle(m);
  renderAim(m);
}
requestAnimationFrame(() => {
  startTargetMotion(true);
  layoutAim();
});
window.addEventListener("load", () => {
  resizeTargetMotion();
  layoutAim();
});
window.addEventListener(
  "resize",
  () => {
    resizeTargetMotion();
    layoutAim();
  },
  { passive: true },
);
if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(() => {
    resizeTargetMotion();
    layoutAim();
  });

if (new URLSearchParams(location.search).has("record")) {
  window.loveAPI = {
    aimUp() {
      const m = metrics();
      angle = clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx));
      renderAim(m);
    },
    setDraw(px) {
      drawn = Math.max(0, px);
      renderAim(metrics());
    },
    release() {
      fire();
    },
    shoot() {
      if (flying) return;
      this.aimUp();
      drawn = MAX_DRAW;
      renderAim(metrics());
      fire();
    },
    open: openLetter,
    yes: sayYes,
    dodge,
    reset,
    els: { noBtn, yesBtn, content, aimStage, win, nock: nockEl },
  };
}
