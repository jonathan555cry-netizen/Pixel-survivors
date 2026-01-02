const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 360;

// ===== ÁUDIOS =====
const music = new Audio("assets/audio/music.mp3");
const engine = new Audio("assets/audio/engine.mp3");
const victory = new Audio("assets/audio/victory.mp3");

music.loop = true;
engine.loop = true;

// ===== ESTADO =====
let state = "menu";

// ===== SAVE =====
let save = JSON.parse(localStorage.getItem("pixelSave")) || {
  fase: 1,
  vida: 100
};

// ===== PLAYER =====
const player = {
  x: 100,
  y: 180,
  size: 16,
  speed: 2,
  vida: save.vida,
  bike: false
};

// ===== INIMIGO =====
let enemy = {
  x: 500,
  y: 180,
  size: 16,
  vida: 50
};

// ===== CONTROLES =====
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// ===== MENU =====
function drawMenu() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText("PIXEL SURVIVORS", 200, 120);
  ctx.font = "14px monospace";
  ctx.fillText("Pressione ENTER para começar", 170, 180);
}

// ===== UPDATE =====
function update() {
  if (state === "game") {
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Colisão inimigo
    if (Math.abs(player.x - enemy.x) < 16 &&
        Math.abs(player.y - enemy.y) < 16) {
      enemy.vida -= 1;
    }

    // Derrota inimigo
    if (enemy.vida <= 0) {
      state = "final";
      music.pause();
      victory.play();
      localStorage.removeItem("pixelSave");
    }

    // Save automático
    localStorage.setItem("pixelSave", JSON.stringify({
      fase: 1,
      vida: player.vida
    }));
  }
}

// ===== DRAW =====
function drawGame() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Moto
  if (player.bike) {
    ctx.fillStyle = "#888";
    ctx.fillRect(player.x-6, player.y+10, 28, 6);
  }

  // Inimigo
  ctx.fillStyle = "#ff3333";
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.fillStyle = "#fff";
  ctx.fillText("Vida: " + player.vida, 10, 20);
}

// ===== FINAL =====
function drawFinal() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText("A esperança sobreviveu...", 180, 150);
  ctx.fillText("Criado por Jonathan Pereira", 170, 200);
}

// ===== LOOP =====
function loop() {
  if (state === "menu") {
    drawMenu();
    if (keys["Enter"]) {
      state = "game";
      music.play();
    }
  } 
  else if (state === "game") {
    update();
    drawGame();
  } 
  else if (state === "final") {
    drawFinal();
  }
  requestAnimationFrame(loop);
}

loop();
