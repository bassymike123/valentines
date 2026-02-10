/********************

 * CONFIG

 ********************/

const CONFIG = {

  herName: "Sarah",

  artist: "Hunxho",

  trackTitle: "Your Friends",

  playlist: [

    "/static/images/Your-20Friends_spotdown.org.mp3",

    "/static/images/Yes_spotdown.org.mp3",

    "/static/images/Interlude_spotdown.org.mp3"

  ],

  centerHoldMs: 1600,

  afterMiniMs: 800

};

/********************

 * ELEMENTS

 ********************/

const nowCard = document.getElementById("nowCard");

const letterWrap = document.getElementById("letterWrap");

const questionWrap = document.getElementById("questionWrap");

const tapLayer = document.getElementById("tapLayer");

const yesWrap = document.getElementById("yesWrap");

const noWrap = document.getElementById("noWrap");

const toast = document.getElementById("toast");

/********************

 * TEXT BINDINGS

 ********************/

document.getElementById("qName").textContent = `${CONFIG.herName}🌺`;

document.getElementById("artistName").textContent = CONFIG.artist;

document.getElementById("trackTitle").textContent = CONFIG.trackTitle;

/********************

 * AUDIO

 ********************/

const player = document.getElementById("player");

let idx = 0;

let audioUnlocked = false;

function loadTrack(i) {

  idx = (i + CONFIG.playlist.length) % CONFIG.playlist.length;

  player.src = CONFIG.playlist[idx];

}

function playCurrent() {

  return player.play().catch(() => {});

}

player.addEventListener("ended", () => {

  loadTrack(idx + 1);

  playCurrent();

});

loadTrack(0);

/********************

 * TOAST

 ********************/

let toastTimeout = null;

function showToast(msg, sticky = false) {

  toast.textContent = msg;

  toast.classList.add("show");

  if (toastTimeout) {

    clearTimeout(toastTimeout);

    toastTimeout = null;

  }

  if (!sticky) {

    toastTimeout = setTimeout(() => {

      toast.classList.remove("show");

    }, 1400);

  }

}

function hideToast() {

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = null;

  toast.classList.remove("show");

}

/********************

 * STATE

 ********************/

let state = 1;

let transitioning = false;

/********************

 * AUDIO UNLOCK

 ********************/

async function unlockAudio() {

  if (audioUnlocked) return;

  audioUnlocked = true;

  hideToast();

  showToast("Sound on 💗");

  await playCurrent();

}

/********************

 * USER ENTRY POINT

 ********************/

window.addEventListener("pointerdown", async () => {

  if (transitioning) return;

  if (!audioUnlocked) {

    await unlockAudio();

  }

  if (state === 1) {

    startFlow();

  }

});

/********************

 * FLOW

 ********************/

function startFlow() {

  if (state !== 1) return;

  transitioning = true;

  setTimeout(goToScene2, CONFIG.centerHoldMs);

}

/********************

 * SCENE 2 — CARD MOVE

 ********************/

function goToScene2() {

  state = 2;

  const anim = animateCardToCorner(nowCard);

  anim.onfinish = () => {

    // 1) HARD CLEAR BLUR (must happen BEFORE any cancel/layout lock)

    nowCard.classList.remove("motion-blur");

    nowCard.style.filter = "none";

    nowCard.style.opacity = "1";

    nowCard.offsetHeight; // force flush

    // 2) Cancel animations AFTER blur is cleared

    nowCard.getAnimations().forEach(a => a.cancel());

    // 3) Freeze exact visual position (so it never disappears/jumps)

    const rect = nowCard.getBoundingClientRect();

    nowCard.style.left = rect.left + "px";

    nowCard.style.top = rect.top + "px";

    nowCard.style.transform = "scale(0.92)";

    nowCard.style.willChange = "auto";

    // 4) Switch to mini layout next frame (no jump)

    requestAnimationFrame(() => {

      nowCard.classList.add("mini");

      nowCard.style.left = "";

      nowCard.style.top = "";

      nowCard.style.transform = "";

      nowCard.style.filter = "";

      nowCard.style.opacity = "";

    });

    state = 3;

    transitioning = false;

    setTimeout(showLetter, CONFIG.afterMiniMs);

  };

}

/********************

 * LETTER

 ********************/

function showLetter() {

  letterWrap.classList.add("show");

  tapLayer.classList.add("show");

}

tapLayer.addEventListener("pointerdown", () => {

  if (state !== 3) return;

  state = 4;

  letterWrap.classList.remove("show");

  tapLayer.classList.remove("show");

  setTimeout(() => {

    questionWrap.classList.add("show");

  }, 1000);

});

/********************

 * YES / NO

 ********************/

document.getElementById("yesBtn").addEventListener("click", () => {

  if (state !== 4) return;

  state = 5;

  questionWrap.classList.remove("show");

  stopFlowers(); // 🌺 stop flowers so confetti owns finale

  setTimeout(() => {

    yesWrap.classList.add("show");

    startConfetti();

  }, 240);

});

document.getElementById("noBtn").addEventListener("click", () => {

  if (state !== 4) return;

  state = 6;

  questionWrap.classList.remove("show");

  stopFlowers(); // 🌺 stop flowers so confetti owns finale

  stopConfetti();

  setTimeout(() => {

    noWrap.classList.add("show");

  }, 240);

});

/********************

 * CONFETTI

 ********************/

const confettiCanvas = document.getElementById("confetti");

const cctx = confettiCanvas.getContext("2d");

let cw = 0, ch = 0, confetti = [], confettiId = null;

function resizeConfetti() {

  cw = confettiCanvas.width = window.innerWidth * devicePixelRatio;

  ch = confettiCanvas.height = window.innerHeight * devicePixelRatio;

  confettiCanvas.style.width = window.innerWidth + "px";

  confettiCanvas.style.height = window.innerHeight + "px";

  cctx.setTransform(1, 0, 0, 1, 0, 0);

}

window.addEventListener("resize", resizeConfetti);

resizeConfetti();

function rand(min, max) {

  return Math.random() * (max - min) + min;

}

function spawnConfetti(n = 160) {

  confetti = Array.from({ length: n }).map(() => ({

    x: rand(0, cw),

    y: rand(-ch, 0),

    w: rand(6, 14) * devicePixelRatio,

    h: rand(10, 20) * devicePixelRatio,

    vy: rand(1.2, 3.2) * devicePixelRatio,

    vx: rand(-0.6, 0.6) * devicePixelRatio,

    rot: rand(0, Math.PI * 2),

    vr: rand(-0.06, 0.06),

    a: rand(0.65, 1)

  }));

}

function tickConfetti() {

  cctx.clearRect(0, 0, cw, ch);

  cctx.fillStyle = "rgba(255,255,255,.9)";

  for (const p of confetti) {

    p.y += p.vy;

    p.x += p.vx;

    p.rot += p.vr;

    if (p.y > ch + 40 * devicePixelRatio) {

      p.y = rand(-200 * devicePixelRatio, -40 * devicePixelRatio);

      p.x = rand(0, cw);

    }

    cctx.save();

    cctx.translate(p.x, p.y);

    cctx.rotate(p.rot);

    cctx.globalAlpha = p.a;

    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

    cctx.restore();

  }

  confettiId = requestAnimationFrame(tickConfetti);

}

function startConfetti() {

  confettiCanvas.classList.add("show");

  spawnConfetti();

  if (confettiId) cancelAnimationFrame(confettiId);

  tickConfetti();

}

function stopConfetti() {

  confettiCanvas.classList.remove("show");

  if (confettiId) cancelAnimationFrame(confettiId);

  confetti = [];

  confettiId = null;

  cctx.clearRect(0, 0, cw, ch);

}

/********************

 * 🌺 SIMPLE FLOWER FALL (FAST, NO COLLISIONS, iPHONE SAFE)

 * Needs: <canvas id="flowers"></canvas>

 ********************/

const flowerCanvas = document.getElementById("flowers");

const fctx = flowerCanvas.getContext("2d", { alpha: true });

const DPR = Math.min(window.devicePixelRatio || 1, 2);

let fw = 0, fh = 0;

function resizeFlowers() {

  fw = flowerCanvas.width = Math.floor(window.innerWidth * DPR);

  fh = flowerCanvas.height = Math.floor(window.innerHeight * DPR);

  flowerCanvas.style.width = window.innerWidth + "px";

  flowerCanvas.style.height = window.innerHeight + "px";

  fctx.setTransform(1, 0, 0, 1, 0, 0);

}

window.addEventListener("resize", resizeFlowers);

resizeFlowers();

/* Your flower images */

const FLOWER_SRC = [

  "/static/images/image-from-rawpixel-id-15075931-png.png",
  "/static/images/vecteezy_vibrant-red-hibiscus-flower-closeup-botanical-beauty_68656606.png"

];

/* Optional: soft-remove white background */

const CHROMA_THRESHOLD = 245;

const CHROMA_SOFTNESS = 18;

function chromaKey(img) {

  const c = document.createElement("canvas");

  c.width = img.naturalWidth;

  c.height = img.naturalHeight;

  const x = c.getContext("2d");

  x.drawImage(img, 0, 0);

  const im = x.getImageData(0, 0, c.width, c.height);

  const d = im.data;

  for (let i = 0; i < d.length; i += 4) {

    const w = Math.min(d[i], d[i + 1], d[i + 2]);

    if (w > CHROMA_THRESHOLD) {

      const fade = Math.min(1, (w - CHROMA_THRESHOLD) / CHROMA_SOFTNESS);

      d[i + 3] *= (1 - fade);

    }

  }

  x.putImageData(im, 0, 0);

  return c;

}

const flowerImgs = [];

async function loadFlowerImages() {

  const promises = FLOWER_SRC.map(src => new Promise(res => {

    const img = new Image();

    img.onload = () => res(img);

    img.onerror = () => res(null);

    img.src = src;

  }));

  const imgs = (await Promise.all(promises)).filter(Boolean);

  imgs.forEach(img => flowerImgs.push(chromaKey(img)));

}

/* Flower behaviour — HEAVIER + CLEAN */

const FLOWERS = {

  maxDesktop: 70,

  maxMobile: 40,

  burstDesktop: 28,

  burstMobile: 16,

  fallSpeedMin: 1.8 * DPR,

  fallSpeedMax: 3.2 * DPR,

  drift: 0.35 * DPR,

  minSize: 28 * DPR,

  maxSize: 56 * DPR

};

let flowers = [];

let flowerRAF = null;

function isMobile() {

  return /iPhone|Android/i.test(navigator.userAgent) || window.innerWidth < 720;

}

function rand(min, max) {

  return Math.random() * (max - min) + min;

}

function makeFlower(y = null) {

  return {

    x: rand(0, fw),

    y: y !== null ? y : rand(-fh, -50 * DPR),

    vy: rand(FLOWERS.fallSpeedMin, FLOWERS.fallSpeedMax),

    vx: rand(-FLOWERS.drift, FLOWERS.drift),

    size: rand(FLOWERS.minSize, FLOWERS.maxSize),

    rot: rand(0, Math.PI * 2),

    vr: rand(-0.01, 0.01),

    img: flowerImgs[Math.floor(Math.random() * flowerImgs.length)]

  };

}

function drawFlower(f) {

  fctx.save();

  fctx.translate(f.x, f.y);

  fctx.rotate(f.rot);

  fctx.globalAlpha = 0.95;

  fctx.drawImage(f.img, -f.size / 2, -f.size / 2, f.size, f.size);

  fctx.restore();

}

function flowerTick() {

  fctx.clearRect(0, 0, fw, fh);

  for (let i = 0; i < flowers.length; i++) {

    const f = flowers[i];

    f.y += f.vy;

    f.x += f.vx;

    f.rot += f.vr;

    if (f.y > fh + 80 * DPR) {

      flowers[i] = makeFlower(rand(-fh * 0.4, -50 * DPR));

      continue;

    }

    if (f.x < -60 * DPR) f.x = fw + 60 * DPR;

    if (f.x > fw + 60 * DPR) f.x = -60 * DPR;

    drawFlower(f);

  }

  flowerRAF = requestAnimationFrame(flowerTick);

}

function startFlowers() {

  if (flowerRAF) return;

  flowers = [];

  const mobile = isMobile();

  const burst = mobile ? FLOWERS.burstMobile : FLOWERS.burstDesktop;

  const max = mobile ? FLOWERS.maxMobile : FLOWERS.maxDesktop;

  for (let i = 0; i < Math.min(burst, max); i++) {

    flowers.push(makeFlower(rand(-fh, 0)));

  }

  flowerRAF = requestAnimationFrame(flowerTick);

}

function stopFlowers() {

  if (flowerRAF) cancelAnimationFrame(flowerRAF);

  flowerRAF = null;

  flowers = [];

  fctx.clearRect(0, 0, fw, fh);

}

/* Pause for performance */

document.addEventListener("visibilitychange", () => {

  if (document.hidden) stopFlowers();

  else startFlowers();

});

/* Init */

(async function () {

  await loadFlowerImages();

  startFlowers();

})();
 


/********************

 * CARD ANIMATION

 ********************/

function animateCardToCorner(card) {

  const rect = card.getBoundingClientRect();

  const targetX = 18;

  const targetY = 54;

  const scale = 0.92;

  const dx = targetX - rect.left;

  const dy = targetY - rect.top;

  card.style.willChange = "transform, filter";

  card.classList.add("motion-blur");

  return card.animate(

    [

      {

        transform: "translate(-50%, -50%) scale(1)",

        filter: "blur(0px)",

        opacity: 1

      },

      {

        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`,

        filter: "blur(6px)",

        opacity: 0.88

      }

    ],

    {

      duration: 520,

      easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",

      fill: "forwards"

    }

  );

}

/********************

 * INIT

 ********************/

showToast("Tap once to start 💗", true);
 