let ball = {
  x: 300,
  y: 200,
  xspeed: 3,
  yspeed: -3,
  r: 10,
};

let playerPaddle = {
  x: 0,
  y: 0, // temporary value, will be set in setup()
  w: 100,
  h: 20,
};

let computerPaddle = {
  x: 0,
  y: 50,
  w: 100,
  h: 20,
};

let isSecondPlayer = false;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  playerPaddle.y = windowHeight - 200; // set the actual y value here

  // prevent right-click context menu on the entire window
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function draw() {
  background(0);

  // two player instructions
  textFont(myFont);
  textSize(min(windowWidth / 60, 16)); // Adjust text size based on window width, max size is 16
  noStroke();
  fill(255);
  textAlign(CENTER, BOTTOM);
  textWrap(WORD); // Wrap the text within the canvas width
  text(
    "Lick left and right to control the paddle.\nPlayer 2 can use the keyboard arrows to play.",
    windowWidth / 2 - (windowWidth - 100) / 2,
    windowHeight - 50,
    windowWidth - 100 // subtracting 100 to leave some margin on both sides
  );

  // Ball
  ellipse(ball.x, ball.y, ball.r * 2, ball.r * 2);

  // Player Paddle
  rect(mouseX, playerPaddle.y, playerPaddle.w, playerPaddle.h);

  // Computer Paddle
  rect(computerPaddle.x, computerPaddle.y, computerPaddle.w, computerPaddle.h);

  // Ball movement
  ball.x += ball.xspeed;
  ball.y += ball.yspeed;

  // Ball bouncing off walls
  if (ball.x > width || ball.x < 0) {
    ball.xspeed *= -1;
  }
  if (ball.y > height || ball.y < 0) {
    ball.yspeed *= -1;
  }

  // Ball bouncing off paddles
  if (
    ball.y > playerPaddle.y &&
    ball.y < playerPaddle.y + playerPaddle.h &&
    ball.x > mouseX &&
    ball.x < mouseX + playerPaddle.w
  ) {
    ball.yspeed *= -1;
  }

  if (
    ball.y < computerPaddle.y + computerPaddle.h &&
    ball.x > computerPaddle.x &&
    ball.x < computerPaddle.x + computerPaddle.w
  ) {
    ball.yspeed *= -1;
  }

  // Computer paddle movement
  if (isSecondPlayer) {
    if (keyIsDown(LEFT_ARROW)) {
      computerPaddle.x -= 5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      computerPaddle.x += 5;
    }
  } else {
    computerPaddle.x = ball.x - computerPaddle.w / 2;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    isSecondPlayer = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
