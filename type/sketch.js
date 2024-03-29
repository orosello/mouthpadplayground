let inputText = '';
let blink = true;
let lastBlinkTime = 0;
let customFont;
let keyWidth = 40;
let keyHeight = 40;
let totalKeysPerRow = 10; // Assuming 10 keys per row for QWERTYUIOP, etc.
let extraKeys = [" ", "<"]; // Spacebar and backspace key

function preload() {
  // Load your custom font; replace 'your_font_file.ttf' with the path to your font file
  customFont = loadFont('../assets/led-counter-7/led_counter-7.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont); // Use the custom font
  textSize(32); // Adjust text size as needed
}

function draw() {
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

  // Draw the on-screen keyboard below the text
  drawKeyboard();
}

function drawKeyboard() {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2; // Center the keyboard horizontally
  let startY = height / 2 + 50; // Position the keyboard vertically below the text

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    noFill(); // Changed to have no fill for keys
    stroke(255); // Outline color changed to white
    rect(x, y, keyWidth, keyHeight, 5); // Draw key
    fill(128); // Changed keyboard font color to gray
    noStroke();
    text(keys[i], x + keyWidth / 2 - textWidth(keys[i]) / 2, y + keyHeight / 2 + 10); // Draw letter
  }

  // Draw additional keys
  let extraX = startX + (keys.length % totalKeysPerRow) * keyWidth;
  let extraY = startY + Math.floor(keys.length / totalKeysPerRow) * keyHeight;

  for (let i = 0; i < extraKeys.length; i++) {
    noFill(); // Changed to have no fill for keys
    stroke(255); // Outline color changed to white
    rect(extraX, extraY, keyWidth, keyHeight, 5); // Draw key
    fill(128); // Changed keyboard font color to gray
    noStroke();
    text(extraKeys[i], extraX + keyWidth / 2 - textWidth(extraKeys[i]) / 2, extraY + keyHeight / 2 + 10); // Draw symbol
    extraX += keyWidth;
  }
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2; // Center the keyboard horizontally
  let startY = height / 2 + 50; // Position the keyboard vertically below the text
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM" + extraKeys.join("");

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    // Check if the mouse click is within the bounds of the key
    if (mouseX > x && mouseX < x + keyWidth && mouseY > y && mouseY < y + keyHeight) {
      if (i < keys.length - extraKeys.length) {
        inputText += keys[i];
      } else if (keys[i] === "<") {
        inputText = inputText.slice(0, -1); // Backspace
      } else {
        inputText += " "; // Spacebar
      }
      break; // Exit the loop once the correct key is found
    }
  }
}
function keyPressed() {
  // Check if the key is a character or a space and add it to inputText
  if (key.length === 1) { // This checks if a single character was pressed
    inputText += key;
  } else if (keyCode === BACKSPACE) { // Handle the backspace key
    inputText = inputText.slice(0, -1);
  }
}
