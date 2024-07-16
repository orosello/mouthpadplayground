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

  createRadioButtons();
  createSendButton();
}

function createRadioButtons() {
  for (let i = 0; i < inputDevices.length; i++) {
    let radio = createRadio();
    radio.option(inputDevices[i]);
    styleRadioButton(radio);
    radioButtons.push(radio);
  }
}

function styleRadioButton(radio) {
  radio.style("color", "white");
  radio.style("font-family", '"Press Start 2P", Arial, serif');
  radio.style("font-size", "12px");
  radio.style("display", "flex");
  radio.style("align-items", "center");
  radio.style("gap", "10px");
  radio.style("padding-left", "5px");
  radio.elt.querySelector("input").style.marginRight = "5px";
  radio.elt.querySelector("input").style.position = "relative";
  radio.elt.querySelector("input").style.top = "-5px";
  radio.style("accent-color", "magenta");
}

function createSendButton() {
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
  let yOffset = height * 0.05;

  drawInstructions(yOffset);
  yOffset += 50;

  drawInputText(yOffset);
  yOffset += 50;

  window.keyboardStartY = yOffset;
  drawKeyboard(yOffset);
  yOffset += calculateKeyboardHeight() + 50;

  drawInputDevicesPrompt(yOffset);
  yOffset += 80;

  drawInputDevices(yOffset);
  yOffset += radioButtons.length * 30 + 50;

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
  textSize(24);

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    drawKey(x, y, keys[i]);
  }

  let extraX = startX;
  let extraY = startY + Math.ceil(keys.length / totalKeysPerRow) * keyHeight;

  for (let i = 0; i < extraKeys.length; i++) {
    drawKey(extraX, extraY, extraKeys[i]);
    extraX += keyWidth;
  }
}

function drawKey(x, y, key) {
  noFill();
  stroke(255);
  rect(x, y, keyWidth, keyHeight, 5);
  fill(128);
  noStroke();
  text(key, x + keyWidth / 2, y + keyHeight / 2);
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
  return rows * keyHeight + keyHeight; // Add extra row for space and backspace
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;
  let startY = window.keyboardStartY;
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let rows = Math.ceil(keys.length / totalKeysPerRow);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < totalKeysPerRow; col++) {
      let index = row * totalKeysPerRow + col;
      if (index >= keys.length) break;

      let x = startX + col * keyWidth;
      let y = startY + row * keyHeight;

      if (isMouseOverKey(x, y)) {
        inputText += keys[index];
        return;
      }
    }
  }

  let extraStartY = startY + rows * keyHeight;
  for (let i = 0; i < extraKeys.length; i++) {
    let x = startX + i * keyWidth;
    if (isMouseOverKey(x, extraStartY)) {
      if (extraKeys[i] === "<") {
        inputText = inputText.slice(0, -1);
      } else {
        inputText += extraKeys[i];
      }
      return;
    }
  }
}

function isMouseOverKey(x, y) {
  return (
    mouseX > x && mouseX < x + keyWidth && mouseY > y && mouseY < y + keyHeight
  );
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
