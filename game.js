const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let state = "menu";
let keys = {};
let save = JSON.parse(localStorage.getItem("pixelSave")) || { fase: 1 };

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ====== AUDIO (GERADO POR CÓDIGO) ====== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let engineOsc, musicOsc;

function playMusic() {
  if (musicOsc) return;
  musicOsc = audioCtx.createOscillator();
  musicOsc.type = "sawtooth";
  musicOsc.frequency.value = 80;
  musicOsc.connect(audioCtx.destination);
  musicOsc.start();
}

function stopMusic() {
  if (!musicOsc) return;
  musicOsc.stop();
  musicOsc = null;
}

function engineSound(on) {
  if (on && !engineOsc) {
    engineOsc = audioCtx.createOscillator();
    engineOsc.type = "square";
    engineOsc.frequency.value = 120;
    engineOsc.connect(audioCtx.destination);
    engineOsc.start();
  }
  if (!on && engineOsc) {
    engineOsc.stop();
    engineOsc = null;
  }
}

function victorySound() {
  let o = audioCtx.createOscillator();
  o.frequency.value = 600;
  o.connect(audioCtx.destination);
  o.start();
  setTimeout(() => o.stop(), 400);
}

/* ====== PLAYER ====== */
let player = {
  x: 50,
  y: 260,
  w: 16,
  h: 16,
  speed: 2,
  onBike: false
};

let boss = {
  x: 520,
  y: 250,
  life: 50
};

/* ====== SAVE ====== */
function saveGame() {
  localStorage.setItem("pixelSave", JSON.stringify({ fase: save.fase }));
}

/* ====== UPDATE ====== */
function update() {
  if (state === "menu") {
    if (keys["Enter"]) {
      audioCtx.resume();
      playMusic();
      state = "game";
    }
  }

  if (state === "game") {
    let moving = false;

    if (keys["a"]) { player.x -= player.speed; moving = true; }
    if (keys["d"]) { player.x += player.speed; moving = true; }

    engineSound(moving && player.onBike);

    // pegar moto
    if (!player.onBike && Math.abs(player.x - 200) < 20) {
      if (keys["e"]) {
        player.onBike = true;
        player.speed = 4;
      }
    }

    // boss
    if (player.x > boss.x - 20) {
      boss.life -= 0.2;
      if (boss.life <= 0) {
        victorySound();
        stopMusic();
        save.fase = 2;
        saveGame();
        state = "ending";
      }
    }
  }
}

/* ====== DRAW ====== */
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,640,360);

  if (state === "menu") {
    ctx.fillStyle = "#fff";
    ctx.font = "24px monospace";
    ctx.fillText("PIXEL SURVIVORS", 170, 140);
    ctx.font = "14px monospace";
    ctx.fillText("Pressione ENTER", 240, 180);
  }

  if (state === "game") {
    // chão
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 300, 640, 60);

    // moto
    if (!player.onBike) {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(200, 270, 20, 10);
    }

    // player (pixel art)
    ctx.fillStyle = "#4af";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // boss
    ctx.fillStyle = "#f44";
    ctx.fillRect(boss.x, boss.y, 24, 24);

    ctx.fillStyle = "#fff";
    ctx.fillText("Vida Boss: " + Math.floor(boss.life), 10, 20);
    ctx.fillText("E = pegar moto", 10, 40);
  }

  if (state === "ending") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,640,360);

    ctx.fillStyle = "#fff";
    ctx.font = "18px monospace";
    ctx.fillText("A esperança sobreviveu.", 160, 150);
    ctx.font = "14px monospace";
    ctx.fillText("Criado por Jonathan Pereira", 190, 190);
  }
}

/* ====== LOOP ====== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
