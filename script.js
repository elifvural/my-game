const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
const scoreDisplay = document.getElementById('score');

// Top bilgileri
let ball = {
  x: canvas.width/2,
  y: canvas.height-30,
  dx: 2,
  dy: -2,
  radius: 10
};

// Bloklar
const blockRowCount = 3;
const blockColumnCount = 5;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 30;
const colors = ["#33ff57", "#ff5733", "#33d4ff"];

let blocks = [];
for(let c=0; c<blockColumnCount; c++){
  blocks[c] = [];
  for(let r=0; r<blockRowCount; r++){
    blocks[c][r] = { x: 0, y: 0, hit: false, color: colors[r % colors.length] };
  }
}

// Paddle
let paddle = {
  height: 10,
  width: 75,
  x: (canvas.width-75)/2
};
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e){
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e){
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Oyun çizimleri
function drawBall(){
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = "#ff5733";
  ctx.fill();
  ctx.closePath();
}

function drawBlocks(){
  for(let c=0; c<blockColumnCount; c++){
    for(let r=0; r<blockRowCount; r++){
      if(!blocks[c][r].hit){
        let blockX = (c*(blockWidth+blockPadding)) + blockOffsetLeft;
        let blockY = (r*(blockHeight+blockPadding)) + blockOffsetTop;
        blocks[c][r].x = blockX;
        blocks[c][r].y = blockY;
        ctx.fillStyle = blocks[c][r].color;
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
      }
    }
  }
}

function drawPaddle(){
  ctx.fillStyle = "#0095DD";
  ctx.fillRect(paddle.x, canvas.height-paddle.height, paddle.width, paddle.height);
}

function collisionDetection(){
  for(let c=0; c<blockColumnCount; c++){
    for(let r=0; r<blockRowCount; r++){
      let b = blocks[c][r];
      if(!b.hit){
        if(ball.x > b.x && ball.x < b.x + blockWidth &&
           ball.y > b.y && ball.y < b.y + blockHeight){
          ball.dy = -ball.dy;
          b.hit = true;

          // Bonus puan
          if(b.color === "#ff5733") score += 2;
          else score += 1;

          // Bonus: paddle genişlesin
          if(b.color === "#33d4ff"){
            paddle.width += 10;
            if(paddle.width > canvas.width) paddle.width = canvas.width;
          }

          scoreDisplay.textContent = score;
        }
      }
    }
  }
}

// Seviye kontrolü
function checkLevelUp(){
  let allHit = true;
  for(let c=0; c<blockColumnCount; c++){
    for(let r=0; r<blockRowCount; r++){
      if(!blocks[c][r].hit) allHit = false;
    }
  }
  if(allHit){
    for(let c=0; c<blockColumnCount; c++){
      for(let r=0; r<blockRowCount; r++){
        blocks[c][r].hit = false;
      }
    }
    ball.dx *= 1.2;
    ball.dy *= 1.2;
    alert("Seviye Atlandı! Top hızı arttı!");
  }
}

// Oyun döngüsü
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBlocks();
  drawBall();
  drawPaddle();
  collisionDetection();
  checkLevelUp();

  // Top hareketi
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Duvar çarpışması
  if(ball.x + ball.dx > canvas.width-ball.radius || ball.x + ball.dx < ball.radius){
    ball.dx = -ball.dx;
  }
  if(ball.y + ball.dy < ball.radius){
    ball.dy = -ball.dy;
  } else if(ball.y + ball.dy > canvas.height-ball.radius){
    if(ball.x > paddle.x && ball.x < paddle.x + paddle.width){
      ball.dy = -ball.dy;
    } else {
      // Oyun bitti
      if(score > highScore){
        localStorage.setItem("highScore", score);
        highScore = score;
      }
      alert(`Oyun Bitti! Skor: ${score} | En yüksek skor: ${highScore}`);
      document.location.reload();
    }
  }

  // Paddle hareketi
  if(rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += 5;
  if(leftPressed && paddle.x > 0) paddle.x -= 5;

  requestAnimationFrame(draw);
}

draw();
