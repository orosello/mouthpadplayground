let myFont;
const macbethText = ` 































SCENE I. Three witches plan to meet Macbeth.

FIRST WITCH
When shall we three meet again
In thunder, lightning, or in rain?

SECOND WITCH
When the hurlyburly's done,
When the battle's lost and won.

THIRD WITCH
That will be ere the set of sun.

FIRST WITCH
Where the place?

SECOND WITCH
Upon the heath.

THIRD WITCH
There to meet with Macbeth.

ALL
Fair is foul, and foul is fair:
Hover through the fog and filthy air.

[EXEUNT]

SCENE II. A camp near Forres.

Alarum within. Enter DUNCAN, MALCOLM, DONALBAIN, LENNOX, with Attendants, meeting a bleeding Sergeant

DUNCAN
What bloody man is that? He can report,
As seemeth by his plight, of the revolt
The newest state.

MALCOLM
This is the sergeant
Who like a good and hardy soldier fought
'Gainst my captivity. Hail, brave friend!
Say to the king the knowledge of the broil
As thou didst leave it.

Sergeant
Doubtful it stood;
As two spent swimmers, that do cling together
And choke their art. The merciless Macdonwald--
Worthy to be a rebel, for to that
The multiplying villanies of nature
Do swarm upon him--from the western isles
Of kerns and gallowglasses is supplied;
And fortune, on his damned quarrel smiling,
Show'd like a rebel's whore: but all's too weak:
For brave Macbeth--well he deserves that name--
Disdaining fortune, with his brandish'd steel,
Which smoked with bloody execution,
Like valour's minion carved out his passage
Till he faced the slave;
Which ne'er shook hands, nor bade farewell to him,
Till he unseam'd him from the nave to the chaps,
And fix'd his head upon our battlements.

DUNCAN
O valiant cousin! worthy gentleman!

SERGEANT
As whence the sun 'gins his reflection
Shipwrecking storms and direful thunders break,
So from that spring whence comfort seem'd to come
Discomfort swells. Mark, king of Scotland, mark:
No sooner justice had with valour arm'd
Compell'd these skipping kerns to trust their heels,
But the Norweyan lord surveying vantage,
With furbish'd arms and new supplies of men
Began a fresh assault.

DUNCAN
Dismay'd not this
Our captains, Macbeth and Banquo?

SERGEANT
Yes;
As sparrows eagles, or the hare the lion. If I say sooth, I must report they were
As cannons overcharged with double cracks, so they
Doubly redoubled strokes upon the foe:
Except they meant to bathe in reeking wounds,
Or memorise another Golgotha,
I cannot tell.
But I am faint, my gashes cry for help.

DUNCAN
So well thy words become thee as thy wounds;
They smack of honour both. Go get him surgeons.

[EXIT SERGEANT, ATTENDED]

Who comes here?

Enter ROSS

MALCOLM
The worthy thane of Ross.

LENNOX
What a haste looks through his eyes! So should he look
That seems to speak things strange.

ROSS
God save the king!

DUNCAN
Whence camest thou, worthy thane?

ROSS
From Fife, great king;
Where the Norweyan banners flout the sky
And fan our people cold. Norway himself,
With terrible numbers,
Assisted by that most disloyal traitor
The thane of Cawdor, began a dismal conflict;
Till that Bellona's bridegroom, lapp'd in proof,
Confronted him with self-comparisons,
Point against point rebellious, arm 'gainst arm.
Curbing his lavish spirit: and, to conclude,
The victory fell on us.

DUNCAN
Great happiness!

ROSS
That now
Sweno, the Norways' king, craves composition:
Nor would we deign him burial of his men
Till he disbursed at Saint Colme's inch
Ten thousand dollars to our general use.

DUNCAN
No more that thane of Cawdor shall deceive
Our bosom interest: go pronounce his present death,
And with his former title greet Macbeth.

ROSS
I'll see it done.

DUNCAN
What he hath lost noble Macbeth hath won.

[EXEUNT]`;

// Global variables for animation and scroll control
let yOffset = 0;
let targetYOffset = 0;
let angle = 0;
let targetAngle = 0;
const SCROLL_SPEED = 0.1;
const ROTATION_SPEED = 0.3; // Reduced for smoother rotation
const SMOOTHING = 0.05; // Reduced for smoother animation
let cubeSize; // Dynamic cube size based on screen size

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  // Create canvas in WEBGL mode for 3D rendering
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Calculate cube size based on screen dimensions
  updateCubeSize();

  // Initialize text settings
  textFont(myFont);
  textSize(min(16, windowWidth / 40)); // Responsive text size
  textAlign(LEFT, TOP);

  // Set initial camera and rendering settings
  angleMode(DEGREES);
  perspective(60, width / height, 0.1, 10000);

  // Disable context menu and handle touch events
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("touchmove", (e) => e.preventDefault(), {
    passive: false,
  });
}

function updateCubeSize() {
  // Make cube size responsive to screen size
  cubeSize = min(windowWidth, windowHeight) * 0.8;
}

function draw() {
  // Clear background
  background(0);

  // Smooth scrolling animation
  yOffset = lerp(yOffset, targetYOffset, SMOOTHING);
  angle = lerp(angle, targetAngle, SMOOTHING);

  // Draw background cube
  drawCube();

  // Draw scrolling text
  drawText();

  // Draw scroll indicator
  drawScrollIndicator();
}

function drawCube() {
  push();
  // Position cube behind text
  translate(0, 0, -1200); // Moved further back for larger appearance

  // Rotate cube based on scroll position
  rotateX(angle);
  rotateY(angle * 0.7);

  // Set cube appearance
  stroke(255, 100); // Reduced opacity for better text readability
  strokeWeight(5);
  noFill();

  // Draw nested cubes with increasing size
  for (let i = 1; i <= 5; i++) {
    push();
    // Scale rotation slightly for each cube
    rotateX(angle * (1 + i * 0.01));
    rotateY(angle * (1 + i * 0.01));
    // Reduce opacity for outer cubes
    stroke(255, 40 / i);
    box(cubeSize * (i * 0.5));
    pop();
  }

  pop();
}

function drawText() {
  push();
  // Reset transformation for 2D text rendering
  translate(-width / 2, -height / 2);

  // Set text appearance
  fill(255);
  noStroke();

  // Calculate text margins based on screen size
  const margin = width * 0.1;

  // Adjust the x position to ensure text is not cropped
  const xOffset = margin + 50; // Add a small offset to prevent cropping

  // Draw text with scroll offset
  text(
    macbethText,
    xOffset, // Use adjusted x position
    yOffset + height / 2,
    width - margin * 2,
    height * 10
  );

  pop();
}

function drawScrollIndicator() {
  if (yOffset > -10) {
    push();
    translate(0, height / 3);
    fill(255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(min(16, windowWidth / 45));
    text(
      "To scroll, touch the top or bottom edge \n of the trackpad with your tongue \n and maintain contact.",
      0,
      0
    );

    // Animated arrow
    const arrowBob = sin(frameCount * 2) * 10;
    translate(0, 50 + arrowBob);
    triangle(-10, 0, 10, 0, 0, 10);
    pop();
  }
}

function mouseWheel(event) {
  // Update target scroll position
  targetYOffset -= event.delta;

  // Constrain scroll range
  targetYOffset = constrain(
    targetYOffset,
    -height * 9,
    height / 2 - textAscent()
  );

  // Update cube rotation target
  targetAngle += event.delta * ROTATION_SPEED;

  // Prevent default scroll behavior
  return false;
}

function windowResized() {
  // Handle window resizing
  resizeCanvas(windowWidth, windowHeight);

  // Update responsive elements
  updateCubeSize();
  textSize(min(16, windowWidth / 40));

  // Recalculate scroll constraints
  targetYOffset = constrain(
    targetYOffset,
    -height * 9,
    height / 2 - textAscent()
  );

  // Force redraw after resize
  redraw();
}
("");

// Enhanced mobile touch support
let touchStartY = 0;
let lastTouchY = 0;
let touchVelocity = 0;

function touchStarted() {
  if (touches.length > 0) {
    touchStartY = touches[0].y;
    lastTouchY = touches[0].y;
    touchVelocity = 0;
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    // Calculate touch velocity for smoother scrolling
    const currentY = touches[0].y;
    touchVelocity = lastTouchY - currentY;
    lastTouchY = currentY;

    // Update targets based on touch movement
    targetYOffset -= touchVelocity;
    targetAngle += touchVelocity * ROTATION_SPEED;

    // Constrain scroll range
    targetYOffset = constrain(
      targetYOffset,
      -height * 9,
      height / 2 - textAscent()
    );
  }
  return false;
}

function touchEnded() {
  // Add momentum scrolling
  const momentum = touchVelocity * 0.5;
  targetYOffset -= momentum;
  targetAngle += momentum * ROTATION_SPEED;

  // Constrain scroll range
  targetYOffset = constrain(
    targetYOffset,
    -height * 9,
    height / 2 - textAscent()
  );

  touchVelocity = 0;
  return false;
}
