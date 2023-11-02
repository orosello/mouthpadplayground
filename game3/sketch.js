
let yPosition = 0;

function setup() {
  createCanvas(600, 600);
  colorMode(RGB);
}

function draw() {

  //sustain the ball when mouse is clicked
  if (mouseIsPressed) {
    yPosition -= 1;
    fill("black");
    stroke("white");
  } else {
    yPosition += 1;
    fill(255);
    stroke("black");
  };

  background("black");
  fill(255);
  strokeWeight(5);
  rectMode(CENTER);
  circle(300, yPosition, 80, 80);

  //drop new ball when ball is out
  if (yPosition > 600){
    yPosition = 0;
  }


}
