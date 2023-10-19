
let yPosition = 0;

function setup() {
  createCanvas(600, 600);
  colorMode(RGB);
  print("hello");
}

function draw() {

  //sustain the ball when mouse is clicked
  if (mouseIsPressed) {
    yPosition -= 1;
  } else {
    yPosition += 1;
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
