let inputText = "";
let blink = true;
let lastBlinkTime = 0;
let customFont;
let pressStart2PFont;
let keyWidth = 40;
let keyHeight = 40;
let totalKeysPerRow = 10;
let extraKeys = [" ", "<"];
let sendButton;
const googleScriptURL =
  "https://script.google.com/macros/s/AKfycbxXcyBxYw1V_80g7ALKlDG4W6wQ_zseqWpg2T9L4Eidvf0Mc7TMf3vNHBdY0ttcdciZ/exec";

let inputDevices = [
  "MouthPad^ (Head Tracking and Tongue Clicks)",
  "MouthPad^ (Tongue Control Only)",
  "Lip/Chin Joystick (e.g., Quadstick, Quadjoy)",
  "Sip-and-Puff (e.g., Jouse)",
  "Head-tracking (e.g., Glassouse)",
  "Eye-tracking (e.g., Tobii)",
  "Mouth stick",
  "Mouse (Standard Handheld)",
  "Trackpad (Standard Laptop)",
  "Other",
];
let selectedDevice = "";
let radioButtons = [];

function preload() {
  customFont = loadFont("../assets/led-counter-7/led_counter-7.ttf");
  pressStart2PFont = loadFont(
    "../assets/Press_Start_2P/PressStart2P-Regular.ttf"
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont);
  textSize(32);

  for (let i = 0; i < inputDevices.length; i++) {
    let radio = createRadio();
    radio.option(inputDevices[i]);
    radio.style("color", "white");
    radio.style("font-family", '"Press Start 2P", Arial, serif');
    radio.style("font-size", "12px");
    radio.style("display", "flex");
    radio.style("align-items", "center");
    radio.style("gap", "10px");
    radio.style("padding-left", "5px");
    radio.elt.querySelector("input").style.marginRight = "5px";
    // Add this line to move the radio button up by 2 pixels
    radio.elt.querySelector("input").style.position = "relative";
    radio.elt.querySelector("input").style.top = "-5px";
    radio.style("accent-color", "magenta");
    radioButtons.push(radio);
  }

  sendButton = createButton("Send");
  sendButton.mousePressed(sendMessage);
  sendButton.style("font-size", "18px");
  sendButton.style("background-color", "black");
  sendButton.style("color", "white");
  sendButton.style("border", "2px solid white");
  sendButton.style("font-family", '"Press Start 2P", Arial, serif');
  sendButton.style("padding", "10px 20px");
  sendButton.style("cursor", "pointer");
}

function draw() {
  background(0);
  drawElements();
}

function drawElements() {
  let yOffset = height * 0.05; // Starting position

  // Element 1: What's your name text
  drawInstructions(yOffset);
  yOffset += 50;

  // Element 2: Blinker cursor
  drawInputText(yOffset);
  yOffset += 50;

  // Element 3: On screen keyboard
  drawKeyboard(yOffset);
  yOffset += calculateKeyboardHeight() + 50;

  // Element 4: Which input device did you use text
  drawInputDevicesPrompt(yOffset);
  yOffset += 80; // Increased from 50 to 70 to add more space

  // Element 5: List of radial buttons
  drawInputDevices(yOffset);
  yOffset += radioButtons.length * 30 + 50;

  // Element 6: Send button
  drawSendButton(yOffset - 30);
}

function drawInstructions(y) {
  textFont(pressStart2PFont);
  textSize(14);
  fill(255);
  textAlign(CENTER, TOP);
  text("1. What's your first and last name?", width / 2, y);
}

function drawInputText(y) {
  textFont(customFont);
  textSize(32);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text(inputText + (blink ? "|" : ""), width / 2, y);

  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }
}

function drawKeyboard(startY) {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;

  textAlign(CENTER, CENTER);
  textSize(24); // Adjust this value if needed for better fit

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    noFill();
    stroke(255);
    rect(x, y, keyWidth, keyHeight, 5);
    fill(128);
    noStroke();
    text(keys[i], x + keyWidth / 2, y + keyHeight / 2);
  }

  let extraX = startX + (keys.length % totalKeysPerRow) * keyWidth;
  let extraY = startY + Math.floor(keys.length / totalKeysPerRow) * keyHeight;

  for (let i = 0; i < extraKeys.length; i++) {
    noFill();
    stroke(255);
    rect(extraX, extraY, keyWidth, keyHeight, 5);
    fill(128);
    noStroke();
    text(extraKeys[i], extraX + keyWidth / 2, extraY + keyHeight / 2);
    extraX += keyWidth;
  }
}

function drawInputDevicesPrompt(y) {
  textFont(pressStart2PFont);
  textSize(14);
  fill(255);
  textAlign(CENTER, TOP);
  text("2. Which input device did you use?", width / 2, y);
}

function drawInputDevices(startY) {
  for (let i = 0; i < radioButtons.length; i++) {
    radioButtons[i].position(width / 2 - 200, startY + i * 30);
  }

  for (let radio of radioButtons) {
    if (radio.value()) {
      selectedDevice = radio.value();
      break;
    }
  }
}

function drawSendButton(y) {
  sendButton.position(width / 2 - 75, y);
}

function calculateKeyboardHeight() {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let rows = Math.ceil(keys.length / totalKeysPerRow);
  return rows * keyHeight;
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;
  let startY = height * 0.1 + 100; // Adjusted for new layout
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM" + extraKeys.join("");

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    if (
      mouseX > x &&
      mouseX < x + keyWidth &&
      mouseY > y &&
      mouseY < y + keyHeight
    ) {
      if (i < keys.length - extraKeys.length) {
        inputText += keys[i];
      } else if (keys[i] === "<") {
        inputText = inputText.slice(0, -1);
      } else {
        inputText += " ";
      }
      break;
    }
  }
}

function sendMessage() {
  if (inputText.trim() === "" || selectedDevice === "") return;

  let message = inputText;
  let metrics = JSON.parse(localStorage.getItem("benchmarkMetrics"));

  let data = {
    name: message,
    inputDevice: selectedDevice,
    ...metrics,
  };

  jsonp(googleScriptURL, data, function (response) {
    console.log("Response:", response);
    if (response.result === "success") {
      console.log("Message, metrics, and input device sent successfully!");
      localStorage.removeItem("benchmarkMetrics");
      window.location.href = "../benchmark/benchmark.html";
    } else {
      console.error("Error sending message, metrics, and input device.");
    }
  });

  inputText = "";
}

function keyPressed() {
  if (key.length === 1) {
    inputText += key;
  } else if (keyCode === BACKSPACE) {
    inputText = inputText.slice(0, -1);
  } else if (keyCode === RETURN || keyCode === ENTER) {
    sendMessage();
  }
}

function jsonp(url, data, callback) {
  let callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());

  url += (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
  for (let key in data) {
    url += "&" + key + "=" + encodeURIComponent(data[key]);
  }

  let script = document.createElement("script");
  script.src = url;

  window[callbackName] = function (data) {
    callback(data);
    document.body.removeChild(script);
    delete window[callbackName];
  };

  document.body.appendChild(script);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
