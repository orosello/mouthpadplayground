let yPosition = 0;
let delay = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
}

function draw() {

  //sustain the ball when mouse is clicked
  if (mouseIsPressed) {
    yPosition -= 1;
    if (yPosition < 40) { // Prevent the ball from going off the top edge
      yPosition = 40;
    }
    fill("black");
    stroke("white");
  } else {
    if (delay > 0) {
      delay--;
    } else {
      yPosition += 1;
    }
    fill(255);
    stroke("black");
  };

  background("black");
  fill(255);
  strokeWeight(5);
  rectMode(CENTER);
  circle(windowWidth / 2, yPosition, 80, 80);

  //drop new ball when ball is out
  if (yPosition - 40 > windowHeight){
    yPosition = -40;
    delay = 30;
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
