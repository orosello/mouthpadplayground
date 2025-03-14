// Synth and effects setup
let clavinetSynth, rhodesSynth;
let wahWah, phaser, reverb, filter, distortion;
// New effects for Superstition mode
let tremolo, stereoWidener, feedbackDelay;
let started = false;
let isPlaying = false;
let loopBeat;
let lastMouseX = 0;
let lastMouseY = 0;
let smoothedX = 0;
let smoothedY = 0;
let analyzer;
let superstitionPlayer;
let isSuperstitionMode = false;
let myFont;

// Musical parameters - Inspired by "As" and "Isn't She Lovely"
const standardProgression = [
    { chord: ['F3', 'A3', 'C4', 'E4'], duration: '2n' },      // Fmaj7
    { chord: ['Bb3', 'D4', 'F4', 'A4'], duration: '2n' },     // Bbmaj7
    { chord: ['G3', 'Bb3', 'D4', 'F4'], duration: '2n' },     // Gm7
    { chord: ['C3', 'E3', 'G3', 'Bb3'], duration: '2n' }      // C7
];

let currentProgression = standardProgression;
let currentChordIndex = 0;

function preload() {
    myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
    // Make canvas fullscreen
    createCanvas(windowWidth, windowHeight);
    background(0);
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Remove any default margins and padding from the document
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    // Make canvas style position fixed and full screen
    let canvas = document.querySelector('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // Initialize analyzer with lower resolution for mobile
    analyzer = new Tone.Analyser("waveform", 128);  // Reduced from 256
    
    // Initialize standard effects with optimized settings
    filter = new Tone.Filter({
        type: "lowpass",
        frequency: 2000,
        rolloff: -12,
        Q: 1
    }).connect(analyzer).toDestination();

    // Simplified effects chain for better performance
    distortion = new Tone.Distortion({
        distortion: 0.8,
        wet: 0.2
    }).connect(filter);

    // Reduced complexity of AutoWah
    wahWah = new Tone.AutoWah({
        baseFrequency: 400,
        octaves: 3,  // Reduced from 4
        sensitivity: 0.7,
        Q: 2,
        gain: 3,     // Reduced from 4
        follower: 0.2  // Increased for smoother response
    }).connect(distortion);

    // Simplified phaser
    phaser = new Tone.Phaser({
        frequency: 0.5,
        octaves: 2,  // Reduced from 3
        baseFrequency: 1000,
        wet: 0.4
    }).connect(filter);

    // Optimized reverb
    reverb = new Tone.Reverb({
        decay: 1.5,  // Reduced from 2.5
        wet: 0.2     // Reduced from 0.25
    }).connect(filter);

    // Initialize Superstition-specific effects (simple chain)
    tremolo = new Tone.Tremolo({
        frequency: 2,
        type: "square",
        depth: 0.5,
        spread: 180
    }).start();

    feedbackDelay = new Tone.FeedbackDelay({
        delayTime: "16n",
        feedback: 0.3,
        wet: 0.3
    });

    // Connect Superstition effects chain
    tremolo.connect(feedbackDelay);
    feedbackDelay.connect(analyzer);
    analyzer.toDestination();

    // Initialize Superstition player
    superstitionPlayer = new Tone.Player({
        url: "super.mp3",
        loop: true,
        autostart: false,
        volume: 18
    });

    // Enhanced Clavinet sound for standard mode
    clavinetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "square8",
            partials: [1, 0.7, 0.5, 0.3]
        },
        envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.3,
            release: 0.1
        },
        volume: -10
    }).connect(wahWah);

    // Warmer Rhodes sound
    rhodesSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "triangle",
            partials: [1, 0.5, 0.33]
        },
        envelope: {
            attack: 0.02,
            decay: 0.4,
            sustain: 0.7,
            release: 1.2
        },
        volume: -12
    }).connect(phaser);

    // Set up the loop with proper timing
    Tone.Transport.bpm.value = 96;
    
    // Create main pattern loop for standard mode
    loopBeat = new Tone.Loop((time) => {
        if (!isSuperstitionMode) {
            playStandardPattern(time);
        }
    }, "8n").start(0);
}

function draw() {
    if (!started) {
        // Set text properties
        textFont(myFont);
        textSize(16);
        textAlign(CENTER, CENTER);
        fill(255);
        text('Click anywhere to start\nMove cursor to shape the sound\nRight click for Superstition', width/2, height/2);
        return;
    }

    // More aggressive smoothing for mobile
    smoothedX = lerp(smoothedX, mouseX, 0.15);
    smoothedY = lerp(smoothedY, mouseY, 0.15);

    // Optimized background clear
    background(0, 0, 0, 30);  // Increased alpha for better performance
    
    // Draw waveform with reduced points
    const waveform = analyzer.getValue();
    noFill();
    beginShape();
    // Skip points for better performance
    for (let i = 0; i < waveform.length; i += 2) {
        const x = map(i, 0, waveform.length, 0, width);
        const y = map(waveform[i], -1, 1, 0, height);
        const alpha = map(i, 0, waveform.length, 200, 50);  // Reduced max alpha
        stroke(255, alpha);
        vertex(x, y);
    }
    endShape();
    
    // Simplified cursor visualization
    const glowSize = 40;  // Reduced from 50
    const numGlowLayers = 3;  // Reduced from 5
    for (let i = numGlowLayers; i > 0; i--) {
        const size = (glowSize * i) / numGlowLayers;
        const alpha = map(i, 0, numGlowLayers, 0, 80);  // Reduced max alpha
        fill(255, alpha);
        noStroke();
        ellipse(smoothedX, smoothedY, size, size);
    }

    if (isPlaying) {
        if (isSuperstitionMode) {
            // Optimized effect updates with less frequent changes
            if (frameCount % 2 === 0) {  // Update every other frame
                const tremoloFreq = map(smoothedX, 0, width, 0.5, 8);
                const tremoloDepth = map(smoothedY, height, 0, 0.2, 0.8);
                
                tremolo.frequency.rampTo(tremoloFreq, 0.2);  // Increased ramp time
                tremolo.depth.rampTo(tremoloDepth, 0.2);
                feedbackDelay.feedback.rampTo(map(smoothedY, height, 0, 0.1, 0.5), 0.2);
                
                superstitionPlayer.volume.rampTo(map(smoothedY, height, 0, 6, 18), 0.2);
            }
        } else {
            // Optimized standard mode updates
            if (frameCount % 2 === 0) {  // Update every other frame
                const xNorm = smoothedX / width;
                const yNorm = 1 - (smoothedY / height);
                const bottomLeftIntensity = (1 - xNorm) * (1 - yNorm);
                
                // Batch parameter updates
                const filterFreq = Math.pow(2, map(smoothedX, 0, width, 6.5, 14));
                const filterRes = map(smoothedY, height, 0, 0.5, 6);  // Reduced max resonance
                
                filter.set({
                    frequency: filterFreq,
                    Q: filterRes
                });
                
                phaser.set({
                    frequency: map(bottomLeftIntensity, 0, 1, 0.1, 8),  // Reduced max rate
                    wet: map(bottomLeftIntensity, 0, 1, 0.2, 0.6)  // Reduced max wet
                });
                
                reverb.wet.rampTo(map(bottomLeftIntensity, 0, 1, 0.1, 0.3), 0.2);
                
                // Simplified synth updates
                const volOffset = map(bottomLeftIntensity, 0, 1, 0, 2);
                const baseVol = map(smoothedY, height, 0, -16, -7);
                
                clavinetSynth.set({
                    volume: baseVol + volOffset
                });
                
                rhodesSynth.set({
                    volume: baseVol + volOffset
                });
            }
        }
    }

    lastMouseX = smoothedX;
    lastMouseY = smoothedY;
}

// Add window resize handling
function windowResized() {
    // Ensure canvas stays fullscreen on window resize
    resizeCanvas(windowWidth, windowHeight);
    background(0);
    
    // Update canvas style
    let canvas = document.querySelector('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
}

function mousePressed() {
    if (!started) {
        started = true;
        isPlaying = true;
        Tone.start();
        Tone.Transport.start();
        background(0);
        
        // Initialize smooth values with current mouse position
        smoothedX = mouseX;
        smoothedY = mouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        return;
    }

    // Toggle play/pause on left click
    if (mouseButton === LEFT) {
        toggleLoop();
    }
    
    // Switch to Superstition mode on right click
    if (mouseButton === RIGHT) {
        isSuperstitionMode = !isSuperstitionMode;
        
        if (isSuperstitionMode) {
            // Stop standard mode and start Superstition
            Tone.Transport.stop();
            // Ensure proper connection to effects chain
            superstitionPlayer.disconnect();
            superstitionPlayer.connect(tremolo);
            // Load and play
            superstitionPlayer.load("super.mp3").then(() => {
                superstitionPlayer.start();
            });
        } else {
            // Stop Superstition and restart standard mode
            superstitionPlayer.stop();
            superstitionPlayer.disconnect();
            Tone.Transport.start();
        }
        
        return false;  // Prevent context menu
    }
}

function toggleLoop() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        if (isSuperstitionMode) {
            superstitionPlayer.start();
        } else {
            Tone.Transport.start();
        }
    } else {
        if (isSuperstitionMode) {
            superstitionPlayer.stop();
        } else {
            Tone.Transport.stop();
            clavinetSynth.releaseAll();
            rhodesSynth.releaseAll();
        }
    }
}

function playStandardPattern(time) {
    const position = Tone.Transport.position.split(":");
    const beat = parseInt(position[1]);
    
    // Update chord every measure
    if (beat === 0 && position[2] === "0") {
        currentChordIndex = (currentChordIndex + 1) % standardProgression.length;
    }
    
    const currentChord = standardProgression[currentChordIndex];
    
    // Clavinet pattern on every other beat
    if (beat % 2 === 0) {
        clavinetSynth.triggerAttackRelease(
            currentChord.chord,
            "8n",
            time,
            0.8
        );
    }
    
    // Rhodes on the first beat of each measure
    if (beat === 0) {
        rhodesSynth.triggerAttackRelease(
            currentChord.chord,
            "2n",
            time,
            0.7
        );
    }
}
