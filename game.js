const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 360;

/* ===== INPUT ===== */
let keys = {};
let left=false,right=false,shoot=false,block=false,use=false;

document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

/* ===== AUDIO ===== */
const menuMusic = new Audio("audio/menu.mp3");
const gameMusic = new Audio("audio/game.mp3");
const bossMusic = new Audio("audio/boss.mp3");
const endMusic  = new Audio("audio/end.mp3");
const motoSound = new Audio("audio/moto.wav");
motoSound.loop = true;

/* ===== IMAGENS ===== */
const imgPlayer = new Image(); imgPlayer.src="assets/player.png";
const imgDog    = new Image(); imgDog.src="assets/dog.png";
const imgZombie = new Image(); imgZombie.src="assets/zombie.png";
const imgBoss   = new Image(); imgBoss.src="assets/boss.png";
const imgMoto   = new Image(); imgMoto.src="assets/moto.png";
const imgCity   = new Image(); imgCity.src="assets/city.png";
const imgBairro = new Image(); imgBairro.src="assets/bairro.png";

/* ===== ESTADOS ===== */
let state="menu";
let map=1;

/* ===== PLAYER ===== */
const player={
  x:50,y:260,w:16,h:16,
  life:100,
  speed:2,
  damage:10,
  fury:false,
  onMoto:false
};

/* ===== DOG ===== */
const dog={x:30,y:260,w:12,h:12,alive:true};

/* ===== MOTO ===== */
const moto={x:200,y:270,w:28,h:10};

/* ===== ZOMBIS ===== */
let zombies=[];
function spawnZombies(){
  zombies=[];
  for(let i=0;i<4;i++){
    zombies.push({x:400+i*50,y:260,w:16,h:16,life:40});
  }
}
spawnZombies();

/* ===== BOSS ===== */
const boss={x:500,y:220,w:40,h:40,life:300};

/* ===== TIROS ===== */
let bullets=[];

/* ===== CUTSCENE ===== */
let textIndex=0,textFrame=0;
const cutsceneText=[
  "O monstro era forte demais...",
  "Seu cachorro pulou na frente.",
  "",
  "Ele salvou sua vida."
];
const endText=[
  "O silêncio voltou.",
  "A cidade ficou para trás.",
  "",
  "Mas você sobreviveu.",
  "",
  "Criado por Jonathan Pereira"
];

/* ===== SAVE ===== */
function save(){
  localStorage.setItem("save",JSON.stringify({map,player, dogAlive:dog.alive}));
}
function load(){
  const s=JSON.parse(localStorage.getItem("save"));
  if(!s) return;
  map=s.map;
  Object.assign(player,s.player);
  dog.alive=s.dogAlive;
}

/* ===== UPDATE ===== */
function update(){

  if(state==="menu"){
    menuMusic.play();
    if(keys["Enter"]){
      menuMusic.pause();
      gameMusic.loop=true;
      gameMusic.play();
      load();
      state="game";
    }
    return;
  }

  if(state==="game"){
    if(keys["a"]||left) player.x-=player.speed;
    if(keys["d"]||right) player.x+=player.speed;

    if((keys[" "]||shoot)&&bullets.length<5){
      bullets.push({x:player.x+16,y:player.y+8});
      shoot=false;
    }

    bullets.forEach(b=>b.x+=6);
    bullets=bullets.filter(b=>b.x<640);

    zombies.forEach(z=>{
      if(z.life>0){
        if(z.x>player.x) z.x-=0.4;
        if(Math.abs(z.x-player.x)<14 && !block) player.life-=0.2;
      }
    });

    bullets.forEach(b=>{
      zombies.forEach(z=>{
        if(z.life>0 && b.x<z.x+z.w){
          z.life-=10;
          b.x=700;
        }
      });
    });

    if(dog.alive) dog.x+=(player.x-20-dog.x)*0.05;

    if(keys["e"]||use){
      if(Math.abs(player.x-moto.x)<20){
        player.onMoto=!player.onMoto;
        if(player.onMoto){player.speed=4;motoSound.play();}
        else{player.speed=2;motoSound.pause();}
      }
      use=false;
    }

    if(player.x>620){
      map++;
      player.x=0;
      spawnZombies();
      if(map===3) state="cutscene";
    }

    save();
  }

  if(state==="cutscene"){
    textFrame++;
    if(textFrame%40===0 && textIndex<cutsceneText.length) textIndex++;
    if(textIndex>=cutsceneText.length && keys["Enter"]){
      dog.alive=false;
      player.fury=true;
      player.speed=4;
      player.damage=25;
      gameMusic.pause();
      bossMusic.play();
      state="boss";
    }
  }

  if(state==="boss"){
    if(keys["a"]) player.x-=player.speed;
    if(keys["d"]) player.x+=player.speed;

    if((keys[" "]||shoot)&&bullets.length<8){
      bullets.push({x:player.x+16,y:player.y+8});
      shoot=false;
    }

    bullets.forEach(b=>{
      b.x+=7;
      if(b.x<boss.x+boss.w){
        boss.life-=player.damage;
        b.x=700;
      }
    });

    if(Math.abs(boss.x-player.x)<30) player.life-=0.4;

    if(boss.life<=0){
      bossMusic.pause();
      endMusic.play();
      localStorage.clear();
      state="end";
      textIndex=0;
    }
  }
}

/* ===== DRAW ===== */
function draw(){
  ctx.clearRect(0,0,640,360);

  if(state==="menu"){
    ctx.fillStyle="#fff";
    ctx.font="24px monospace";
    ctx.fillText("JOGO PÓS-PANDEMIA",150,150);
    ctx.font="16px monospace";
    ctx.fillText("ENTER para iniciar",220,210);
    return;
  }

  if(map===1) ctx.drawImage(imgCity,0,0,640,360);
  if(map===2) ctx.drawImage(imgBairro,0,0,640,360);

  ctx.drawImage(imgMoto,moto.x,moto.y);
  ctx.drawImage(imgPlayer,player.x,player.y);

  if(dog.alive) ctx.drawImage(imgDog,dog.x,dog.y);

  zombies.forEach(z=>z.life>0 && ctx.drawImage(imgZombie,z.x,z.y));

  bullets.forEach(b=>{
    ctx.fillStyle="#fff";
    ctx.fillRect(b.x,b.y,4,2);
  });

  if(state==="boss"){
    ctx.drawImage(imgBoss,boss.x,boss.y);
    ctx.fillText("BOSS: "+boss.life,460,20);
  }

  ctx.fillText("Vida: "+Math.floor(player.life),10,20);

  if(state==="cutscene"){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,640,360);
    ctx.fillStyle="#fff";
    ctx.font="18px monospace";
    for(let i=0;i<textIndex;i++){
      ctx.fillText(cutsceneText[i],80,140+i*24);
    }
  }

  if(state==="end"){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,640,360);
    ctx.fillStyle="#fff";
    ctx.font="18px monospace";
    for(let i=0;i<textIndex;i++){
      ctx.fillText(endText[i],80,140+i*24);
    }
  }
}

/* ===== LOOP ===== */
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
