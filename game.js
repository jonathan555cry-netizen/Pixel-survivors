const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let state = "menu";
let left = false, right = false, action = false;
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ===== AUDIO SEGURO ===== */
let audioCtx;
function beep(freq, time = 0.15) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.value = freq;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
  o.stop(audioCtx.currentTime + time);
}

/* ===== PLAYER ===== */
const player = {
  x: 40,
  y: 260,
  w: 16,
  h: 16,
  speed: 2,
  bike: false
};

/* ===== MOTO ===== */
const bike = { x: 200, y: 270, active: true };

/* ===== BOSS ===== */
const boss = { x: 520, y: 260, life: 40 };

/* ===== UPDATE ===== */
function update() {

  // MENU
  if (state === "menu") {
    if (keys["Enter"] || action) {
      beep(300);
      state = "game";
    }
  }

  // GAME
  if (state === "game") {
    if (keys["a"] || left) player.x -= player.speed;
    if (keys["d"] || right) player.x += player.speed;

    // pegar moto
    if (bike.active &&
        Math.abs(player.x - bike.x) < 20 &&
        (keys["e"] || action)) {
      bike.active = false;
      player.bike = true;
      player.speed = 4;
      beep(150);
    }

    // atacar boss (aproximação)
    if (Math.abs(player.x - boss.x) < 12) {
      boss.life -= 0.15;
      if (boss.life <= 0) {
        beep(700, 0.4);
        state = "ending";
      }
    }
  }
}

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0,0,640,360);

  // MENU
  if (state === "menu") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,640,360);
    ctx.fillStyle = "#fff";
    ctx.font = "24px monospace";
    ctx.fillText("PIXEL SURVIVORS", 170, 150);
    ctx.font = "14px monospace";
    ctx.fillText("ENTER ou AÇÃO para começar", 150, 190);
  }

  // GAME
  if (state === "game") {
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0,0,640,360);

    // chão
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 300, 640, 60);

    // moto
    if (bike.active) {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(bike.x, bike.y, 20, 10);
    }

    // player
    ctx.fillStyle = player.bike ? "#4f4" : "#4af";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // boss
    ctx.fillStyle = "#f44";
    ctx.fillRect(boss.x, boss.y, 24, 24);

    // HUD
    ctx.fillStyle = "#fff";
    ctx.fillText("Boss: " + Math.floor(boss.life), 10, 20);
  }

  // FINAL
  if (state === "ending") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,640,360);
    ctx.fillStyle = "#fff";
    ctx.font = "18px monospace";
    ctx.fillText("O mundo ainda respira...", 170, 150);
    ctx.font = "14px monospace";
    ctx.fillText("Criado por Jonathan Pereira", 165, 200);
  }
}

/* ===== LOOP ===== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
