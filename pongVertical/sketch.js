let windowWidth, windowHeight;

let ball = {
  x: 400,
  y: 400,
  xspeed: 15,
  yspeed: -15,
  r: 20,
};

let playerPaddle = {
  x: 0,
  y: 0,
  w: 20,
  h: 150,
  fillColor: 255, // Fill color for player's paddle
  maxColor: [200, 0, 200], // Maximum fill color (purple)
  colorChangeDuration: 60, // Duration of color change animation (frames)
  colorChangeTimer: 0, // Timer for color change animation
};

let computerPaddle = {
  x: 0,
  y: 0,
  w: 20,
  h: 150,
  fillColor: 255, // Fill color for computer's paddle
};

let isSecondPlayer = false;

function setup() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  let cnv = createCanvas(windowWidth, windowHeight);
  playerPaddle.x = windowWidth - playerPaddle.w - 300;
  playerPaddle.y = windowHeight / 2 - playerPaddle.h / 2;
  computerPaddle.x = 300;
  computerPaddle.y = windowHeight / 2 - computerPaddle.h / 2;

  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function draw() {
  background(0);
  noStroke();
  fill(255);

  ellipse(ball.x, ball.y, ball.r * 2, ball.r * 2);

  let paddleY = constrain(mouseY, 0, windowHeight - playerPaddle.h);
  fill(playerPaddle.fillColor); // Apply fill color for player's paddle
  rect(playerPaddle.x, paddleY, playerPaddle.w, playerPaddle.h);

  fill(computerPaddle.fillColor); // Apply fill color for computer's paddle
  rect(computerPaddle.x, computerPaddle.y, computerPaddle.w, computerPaddle.h);

  ball.x += ball.xspeed;
  ball.y += ball.yspeed;

  // Ball collision with walls
  if (ball.x > width - ball.r || ball.x < ball.r) {
    ball.xspeed *= -1;
  }
  if (ball.y > height - ball.r || ball.y < ball.r) {
    ball.yspeed *= -1;
  }

  // Ball collision with player's paddle
  if (
    ball.x + ball.r > playerPaddle.x &&
    ball.x - ball.r < playerPaddle.x + playerPaddle.w &&
    ball.y + ball.r > paddleY &&
    ball.y - ball.r < paddleY + playerPaddle.h
  ) {
    ball.xspeed *= -1;

    // Start color change animation for player's paddle
    playerPaddle.colorChangeTimer = playerPaddle.colorChangeDuration;
  }

  // Smoothly change player's paddle fill color during color change animation
  if (playerPaddle.colorChangeTimer > 0) {
    let t = map(playerPaddle.colorChangeTimer, playerPaddle.colorChangeDuration, 0, 1, 0);
    playerPaddle.fillColor = lerpColor(color(255), color(playerPaddle.maxColor), t);
    playerPaddle.colorChangeTimer--;
  } else {
    // If not colliding or animation is finished, smoothly change paddle fill color back to white
    playerPaddle.fillColor = lerpColor(color(playerPaddle.fillColor), color(255), 0.1);
  }

  // Ball collision with computer's paddle
  if (
    ball.x + ball.r > computerPaddle.x &&
    ball.x - ball.r < computerPaddle.x + computerPaddle.w &&
    ball.y + ball.r > computerPaddle.y &&
    ball.y - ball.r < computerPaddle.y + computerPaddle.h
  ) {
    ball.xspeed *= -1;
  }

  // Directly set computer's paddle y position to match the ball's y position
  computerPaddle.y = ball.y - computerPaddle.h / 2;

  // Ensure paddles cannot leave the screen
  playerPaddle.y = constrain(paddleY, 0, windowHeight - playerPaddle.h);
  computerPaddle.y = constrain(computerPaddle.y, 0, windowHeight - computerPaddle.h);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    isSecondPlayer = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  playerPaddle.x = windowWidth - playerPaddle.w - 100;
  computerPaddle.x = 100;
}
