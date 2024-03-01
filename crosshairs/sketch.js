
function setup() {

  createCanvas(windowWidth, windowHeight);



}

function draw() {

  background("black");
  stroke(255);
  strokeWeight(2);
  line(mouseX, 0, mouseX, windowHeight);
  line(0, mouseY, windowWidth, mouseY);


}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
