let gameStarted = false; // Variable to toggle between the initial crosshairs and the game
let inputText = '';
let blink = true;
let lastBlinkTime = 0;
let customFont;

function preload() {
  // Load your custom font; replace 'your_font_file.ttf' with the path to your font file
  customFont = loadFont('../assets/led-counter-7/led_counter-7.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont); // Use the custom font
  textSize(50); // Adjust text size as needed
  let hiddenInput = select('#textInput');
  hiddenInput.elt.focus();
  hiddenInput.elt.onblur = () => hiddenInput.elt.focus();
  select('#textInput').input(() => {
    inputText = select('#textInput').value();
  });
}

function draw() {
  if (!gameStarted) {
    // Initial crosshairs setup
    background("black");
    stroke(255);
    strokeWeight(2);
    line(mouseX, 0, mouseX, windowHeight);
    line(0, mouseY, windowWidth, mouseY);
    rectMode(CENTER);
    fill(0);
    rect(mouseX, mouseY, 40, 40);
  } else {
    // Your current game setup with the LED counter font and other details
    background(0); // Changed background color to black

    // Draw the input text and blinking cursor
    fill(255); // Changed font color to white
    noStroke();
    text(inputText + (blink ? '|' : ''), width / 2 - textWidth(inputText) / 2, height / 2);

    // Blink the cursor every 500ms
    if (millis() - lastBlinkTime > 500) {
      blink = !blink;
      lastBlinkTime = millis();
    }
  }
}

function mousePressed() {
  gameStarted = true; // Start the game on mouse press
}

function keyPressed() {
  gameStarted = true; // Start the game on any key press

  if (keyCode === BACKSPACE) { // Handle the backspace key
    // Prevent default backspace behavior to avoid navigating back in browser history
    inputText = inputText.slice(0, -1);
    select('#textInput').value(inputText); // Update hidden input value
    return false; // Prevent any default behavior
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}