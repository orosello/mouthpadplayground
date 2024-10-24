let myFont;
let macbethText = `

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

[EXEUNT]`; // Add more text as needed

let yOffset;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(myFont);
  textSize(16); // Adjust text size as needed
  fill(255); // White color
  yOffset = windowHeight / 2 - textAscent(); // Initialize yOffset to half the window height minus the text ascent

  // Disable right-click context menu
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
}

function draw() {
  background(0);
  text(macbethText, 50, yOffset, windowWidth - 50, windowHeight * 10); // Adjusted width
}

function mouseWheel(event) {
  yOffset -= event.delta;
  yOffset = constrain(
    yOffset,
    -windowHeight * 9,
    windowHeight / 2 - textAscent()
  ); // Adjust constraints
}
