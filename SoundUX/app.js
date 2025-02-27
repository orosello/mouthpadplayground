// Main application class
class SoundSampleApp {
    constructor() {
        this.samples = [];
        this.currentSample = null;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        
        // Track assigned sounds for each interaction type
        this.assignedSounds = {
            click: null,
            hover: null,
            drag: null,
            contextmenu: null,
            scroll: null,
            dblclick: null
        };
        
        // Initialize the app
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // File upload elements
        this.fileUploadInput = document.getElementById('file-upload');
        this.samplesList = document.getElementById('samples-list');
        
        // Interaction elements
        this.interactionBox = document.getElementById('interaction-box');
        this.interactionType = document.getElementById('interaction-type');
        
        // Playback control elements
        this.volumeControl = document.getElementById('volume-control');
        this.playbackSpeed = document.getElementById('playback-speed');
        this.speedValue = document.getElementById('speed-value');
        this.loopControl = document.getElementById('loop-control');
        
        // Add assign button
        this.assignButton = document.createElement('button');
        this.assignButton.id = 'assign-button';
        this.assignButton.className = 'assign-button';
        this.assignButton.textContent = 'Assign to Interaction';
        this.assignButton.disabled = true;
        
        // Insert assign button after interaction type dropdown
        const controlGroup = this.interactionType.parentNode;
        controlGroup.appendChild(this.assignButton);
        
        // Create the interactive circle
        this.createInteractiveCircle();
    }
    
    setupEventListeners() {
        // File upload event
        this.fileUploadInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Playback control events
        this.volumeControl.addEventListener('input', this.updateVolume.bind(this));
        this.playbackSpeed.addEventListener('input', this.updatePlaybackSpeed.bind(this));
        
        // Set up interaction events
        this.setupInteractionEvents();
        this.interactionType.addEventListener('change', () => {
            this.updateAssignButtonState();
            this.setupInteractionEvents();
        });
        
        // Add assign button event listener
        this.assignButton.addEventListener('click', this.assignSoundToInteraction.bind(this));
    }
    
    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        // Clear empty message if it exists
        const emptyMessage = this.samplesList.querySelector('.empty-message');
        if (emptyMessage) {
            this.samplesList.removeChild(emptyMessage);
        }
        
        // Process each file
        Array.from(files).forEach(file => {
            // Only process audio files
            if (!file.type.startsWith('audio/')) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.audioContext.decodeAudioData(e.target.result, (buffer) => {
                    const sample = {
                        id: Date.now() + Math.random().toString(36).substr(2, 5),
                        name: file.name,
                        buffer: buffer,
                        source: null
                    };
                    
                    this.samples.push(sample);
                    this.addSampleToUI(sample);
                    
                    // Set as current sample if it's the first one
                    if (this.samples.length === 1) {
                        this.setCurrentSample(sample.id);
                    }
                });
            };
            
            reader.readAsArrayBuffer(file);
        });
        
        // Reset the file input
        event.target.value = '';
    }
    
    addSampleToUI(sample) {
        const sampleItem = document.createElement('div');
        sampleItem.className = 'sample-item';
        sampleItem.dataset.id = sample.id;
        
        sampleItem.innerHTML = `
            <div class="sample-name">${sample.name}</div>
            <div class="sample-controls">
                <button class="play-btn" title="Play">▶</button>
                <button class="stop-btn" title="Stop">■</button>
                <button class="delete-btn" title="Delete">✕</button>
            </div>
        `;
        
        // Add event listeners to the sample item
        sampleItem.addEventListener('click', () => this.setCurrentSample(sample.id));
        sampleItem.querySelector('.play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.playSample(sample.id);
        });
        sampleItem.querySelector('.stop-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.stopSample(sample.id);
        });
        sampleItem.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSample(sample.id);
        });
        
        this.samplesList.appendChild(sampleItem);
    }
    
    setCurrentSample(id) {
        // Remove active class from all samples
        const sampleItems = this.samplesList.querySelectorAll('.sample-item');
        sampleItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to the selected sample
        const selectedItem = this.samplesList.querySelector(`.sample-item[data-id="${id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
            this.currentSample = this.samples.find(sample => sample.id === id);
            this.updateAssignButtonState();
        }
    }
    
    updateAssignButtonState() {
        this.assignButton.disabled = !this.currentSample;
        
        // Update button text to show if a sound is already assigned
        const interactionType = this.interactionType.value;
        const assignedSample = this.assignedSounds[interactionType];
        
        if (assignedSample) {
            const sample = this.samples.find(s => s.id === assignedSample);
            if (sample) {
                this.assignButton.textContent = `Reassign (Current: ${sample.name})`;
                return;
            }
        }
        
        this.assignButton.textContent = 'Assign to Interaction';
    }
    
    assignSoundToInteraction() {
        if (!this.currentSample) return;
        
        const interactionType = this.interactionType.value;
        this.assignedSounds[interactionType] = this.currentSample.id;
        
        // Update the UI to show the assignment
        this.updateAssignButtonState();
        
        // Show a temporary confirmation message
        const originalText = this.assignButton.textContent;
        this.assignButton.textContent = 'Sound Assigned!';
        this.assignButton.classList.add('success');
        
        setTimeout(() => {
            this.assignButton.textContent = originalText;
            this.assignButton.classList.remove('success');
        }, 1500);
    }
    
    playSample(id) {
        const sample = this.samples.find(sample => sample.id === id);
        if (!sample) return;
        
        // Stop the sample if it's already playing
        this.stopSample(id);
        
        // Create a new audio source
        const source = this.audioContext.createBufferSource();
        source.buffer = sample.buffer;
        source.playbackRate.value = parseFloat(this.playbackSpeed.value);
        source.loop = this.loopControl.checked;
        source.connect(this.gainNode);
        source.start(0);
        
        // Store the source for later stopping
        sample.source = source;
    }
    
    stopSample(id) {
        const sample = this.samples.find(sample => sample.id === id);
        if (sample && sample.source) {
            sample.source.stop();
            sample.source = null;
        }
    }
    
    deleteSample(id) {
        // Stop the sample if it's playing
        this.stopSample(id);
        
        // Remove from the samples array
        this.samples = this.samples.filter(sample => sample.id !== id);
        
        // Remove from the UI
        const sampleItem = this.samplesList.querySelector(`.sample-item[data-id="${id}"]`);
        if (sampleItem) {
            this.samplesList.removeChild(sampleItem);
        }
        
        // Remove from assigned sounds if it's assigned
        for (const interactionType in this.assignedSounds) {
            if (this.assignedSounds[interactionType] === id) {
                this.assignedSounds[interactionType] = null;
            }
        }
        
        // Reset current sample if it was deleted
        if (this.currentSample && this.currentSample.id === id) {
            this.currentSample = this.samples.length > 0 ? this.samples[0] : null;
            if (this.currentSample) {
                this.setCurrentSample(this.currentSample.id);
            }
        }
        
        // Update assign button state
        this.updateAssignButtonState();
        
        // Show empty message if no samples left
        if (this.samples.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No sound samples uploaded yet.';
            this.samplesList.appendChild(emptyMessage);
        }
    }
    
    updateVolume() {
        this.gainNode.gain.value = parseFloat(this.volumeControl.value);
    }
    
    updatePlaybackSpeed() {
        const speed = parseFloat(this.playbackSpeed.value);
        this.speedValue.textContent = speed.toFixed(1) + 'x';
        
        // Update playback speed of currently playing sample
        this.samples.forEach(sample => {
            if (sample.source) {
                sample.source.playbackRate.value = speed;
            }
        });
    }
    
    setupInteractionEvents() {
        // Remove all existing event listeners (simplified approach)
        const newInteractionBox = this.interactionBox.cloneNode(false);
        this.interactionBox.parentNode.replaceChild(newInteractionBox, this.interactionBox);
        this.interactionBox = newInteractionBox;
        
        // Create the interactive circle
        this.createInteractiveCircle();
        
        // Add event listeners based on selected interaction type
        this.setupClickEvent();
        this.setupHoverEvent();
        this.setupDragEvent();
        this.setupContextMenuEvent();
        this.setupScrollEvent();
        this.setupDoubleClickEvent();
        
        // Update the assign button state
        this.updateAssignButtonState();
    }
    
    setupDoubleClickEvent() {
        this.interactionBox.addEventListener('dblclick', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // Clear any pending click timer to prevent single click from firing
            if (this.interactionBoxClickTimer) {
                clearTimeout(this.interactionBoxClickTimer);
                this.interactionBoxClickTimer = null;
            }
            
            const assignedId = this.assignedSounds.dblclick;
            if (assignedId) {
                this.playSample(assignedId);
            }
        });
    }
    
    setupScrollEvent() {
        let lastScrollTime = 0;
        let isScrolling = false;
        const scrollThrottle = 800; // ms - longer cooldown between scroll sounds
        
        this.interactionBox.addEventListener('wheel', (e) => {
            const now = Date.now();
            
            // If we're not currently in a scrolling state, start a new scroll action
            if (!isScrolling) {
                isScrolling = true;
                
                // Only play the sound if enough time has passed since the last scroll action
                if (now - lastScrollTime > scrollThrottle) {
                    lastScrollTime = now;
                    const assignedId = this.assignedSounds.scroll;
                    if (assignedId) {
                        this.playSample(assignedId);
                    }
                }
                
                // Set a timeout to reset the scrolling state after a short delay
                setTimeout(() => {
                    isScrolling = false;
                }, 300); // Consider scrolling stopped after 300ms of inactivity
            }
        });
    }
    
    setupContextMenuEvent() {
        this.interactionBox.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const assignedId = this.assignedSounds.contextmenu;
            if (assignedId) {
                this.playSample(assignedId);
            }
            return false;
        });
    }
    
    setupDragEvent() {
        let isDragging = false;
        let hasDragged = false; // Track if dragging actually occurred
        
        this.interactionBox.addEventListener('mousedown', (e) => {
            // Only start dragging on left mouse button (button code 0)
            if (e.button !== 0) return;
            
            // Don't start dragging if the event originated from the circle
            if (e.target === this.circle) return;
            
            isDragging = true;
            hasDragged = false; // Reset drag tracking
        });
        
        this.interactionBox.addEventListener('mousemove', () => {
            if (!isDragging) return;
            
            // If this is the first movement, mark as dragged and play the sound
            if (!hasDragged) {
                hasDragged = true;
                
                // Play drag sound if assigned (only on first movement)
                const assignedId = this.assignedSounds.drag;
                if (assignedId) {
                    this.playSample(assignedId);
                }
            }
            
            // Continue playing drag sound if it stopped and we're still dragging
            const assignedId = this.assignedSounds.drag;
            if (assignedId && hasDragged) {
                const sample = this.samples.find(s => s.id === assignedId);
                if (sample && !sample.source) {
                    this.playSample(assignedId);
                }
            }
        });
        
        this.interactionBox.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Store the drag state for the click handler
            this.interactionBoxHasDragged = hasDragged;
            
            const assignedId = this.assignedSounds.drag;
            if (assignedId) {
                this.stopSample(assignedId);
            }
        });
        
        this.interactionBox.addEventListener('mouseleave', () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Store the drag state for the click handler
            this.interactionBoxHasDragged = hasDragged;
            
            const assignedId = this.assignedSounds.drag;
            if (assignedId) {
                this.stopSample(assignedId);
            }
        });
    }
    
    setupClickEvent() {
        // Use a shared timer variable for the interaction box
        if (!this.interactionBoxClickTimer) {
            this.interactionBoxClickTimer = null;
        }
        
        // Initialize drag tracking
        this.interactionBoxHasDragged = false;
        
        this.interactionBox.addEventListener('click', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // If dragging just occurred, don't trigger click
            if (this.interactionBoxHasDragged) {
                this.interactionBoxHasDragged = false;
                return;
            }
            
            // If there's a pending click timer, clear it
            if (this.interactionBoxClickTimer) {
                clearTimeout(this.interactionBoxClickTimer);
                this.interactionBoxClickTimer = null;
                return; // Don't process the click as it's part of a double-click
            }
            
            // Set a timer to delay the single click action
            this.interactionBoxClickTimer = setTimeout(() => {
                const assignedId = this.assignedSounds.click;
                if (assignedId) {
                    this.playSample(assignedId);
                }
                
                // Reset the timer
                this.interactionBoxClickTimer = null;
            }, 300); // Same delay as in setupCircleInteractions
        });
    }
    
    setupHoverEvent() {
        this.interactionBox.addEventListener('mouseenter', () => {
            const assignedId = this.assignedSounds.hover;
            if (assignedId) {
                this.playSample(assignedId);
            }
        });
        
        this.interactionBox.addEventListener('mouseleave', () => {
            const assignedId = this.assignedSounds.hover;
            if (assignedId) {
                this.stopSample(assignedId);
            }
        });
    }
    
    createInteractiveCircle() {
        // Create an SVG element for the circle
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        
        // Create the circle element
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.circle.setAttribute("cx", "50%");
        this.circle.setAttribute("cy", "50%");
        this.circle.setAttribute("r", "30");
        this.circle.setAttribute("fill", "#3498db");
        this.circle.setAttribute("stroke", "#2980b9");
        this.circle.setAttribute("stroke-width", "2");
        this.circle.classList.add("interactive-circle");
        
        // Add the circle to the SVG
        svg.appendChild(this.circle);
        
        // Add the SVG to the interaction box
        this.interactionBox.style.position = "relative";
        this.interactionBox.innerHTML = '';
        this.interactionBox.appendChild(svg);
        
        // Set up circle interaction events
        this.setupCircleInteractions();
    }
    
    setupCircleInteractions() {
        // Variables for dragging
        let isDragging = false;
        let hasDragged = false; // Track if dragging actually occurred
        let offsetX, offsetY;
        
        // Get the SVG element (parent of the circle)
        const svg = this.circle.parentNode;
        
        // Disable context menu on the circle and interaction box
        this.circle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Play contextmenu sound if assigned
            const assignedId = this.assignedSounds.contextmenu;
            if (assignedId) {
                this.playSample(assignedId);
            }
            
            return false;
        });
        
        this.interactionBox.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Click event with double-click detection
        let clickTimer = null;
        let clickDelay = 300; // milliseconds to wait before triggering single click
        
        this.circle.addEventListener('click', (e) => {
            // Prevent event bubbling
            e.stopPropagation();
            
            // If dragging just occurred, don't trigger click
            if (hasDragged) {
                hasDragged = false;
                return;
            }
            
            // If there's a pending click timer, clear it
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                return; // Don't process the click as it's part of a double-click
            }
            
            // Set a timer to delay the single click action
            clickTimer = setTimeout(() => {
                // Change fill color on click
                const currentFill = this.circle.getAttribute('fill');
                const newFill = currentFill === '#3498db' ? '#e74c3c' : '#3498db';
                this.circle.setAttribute('fill', newFill);
                
                // Play click sound if assigned
                const assignedId = this.assignedSounds.click;
                if (assignedId) {
                    this.playSample(assignedId);
                }
                
                // Reset the timer
                clickTimer = null;
            }, clickDelay);
        });
        
        // Double-click event
        this.circle.addEventListener('dblclick', (e) => {
            // Clear any pending click timer to prevent single click from firing
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
            
            // Play double-click sound if assigned
            const assignedId = this.assignedSounds.dblclick;
            if (assignedId) {
                this.playSample(assignedId);
            }
            
            // Prevent event bubbling
            e.stopPropagation();
        });
        
        // Hover events
        this.circle.addEventListener('mouseenter', () => {
            // Increase radius on hover
            const currentRadius = parseInt(this.circle.getAttribute('r'));
            this.circle.setAttribute('r', currentRadius * 1.1);
            
            // Play hover sound if assigned
            const assignedId = this.assignedSounds.hover;
            if (assignedId) {
                this.playSample(assignedId);
            }
        });
        
        this.circle.addEventListener('mouseleave', () => {
            // Reset radius on mouse leave
            this.circle.setAttribute('r', '30');
            
            // Stop hover sound if assigned
            const assignedId = this.assignedSounds.hover;
            if (assignedId) {
                this.stopSample(assignedId);
            }
        });
        
        // Mouse down event (start dragging)
        this.circle.addEventListener('mousedown', (e) => {
            // Only start dragging on left mouse button (button code 0)
            if (e.button !== 0) return;
            
            isDragging = true;
            hasDragged = false; // Reset drag tracking
            
            // Get the SVG dimensions
            const svgRect = svg.getBoundingClientRect();
            
            // Get current circle position in pixels
            const cx = parseFloat(this.circle.getAttribute('cx')) / 100 * svgRect.width;
            const cy = parseFloat(this.circle.getAttribute('cy')) / 100 * svgRect.height;
            
            // Calculate the offset from the current circle position to the mouse position
            offsetX = e.clientX - svgRect.left - cx;
            offsetY = e.clientY - svgRect.top - cy;
            
            // Add a class for styling during drag
            this.circle.classList.add('dragging');
            
            // Prevent event bubbling
            e.stopPropagation();
        });
        
        // Mouse move event (drag the circle)
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // If this is the first movement, mark as dragged and play the sound
            if (!hasDragged) {
                hasDragged = true;
                
                // Play drag sound if assigned (only on first movement)
                const assignedId = this.assignedSounds.drag;
                if (assignedId) {
                    this.playSample(assignedId);
                }
            }
            
            // Get the SVG dimensions
            const svgRect = svg.getBoundingClientRect();
            
            // Calculate new position relative to the SVG
            let newX = e.clientX - svgRect.left - offsetX;
            let newY = e.clientY - svgRect.top - offsetY;
            
            // Get circle radius (accounting for stroke width)
            const radius = parseInt(this.circle.getAttribute('r'));
            const strokeWidth = parseInt(this.circle.getAttribute('stroke-width'));
            const totalRadius = radius + strokeWidth;
            
            // Constrain to SVG boundaries
            newX = Math.max(totalRadius, Math.min(svgRect.width - totalRadius, newX));
            newY = Math.max(totalRadius, Math.min(svgRect.height - totalRadius, newY));
            
            // Update circle position (as percentage for responsiveness)
            const percentX = (newX / svgRect.width) * 100;
            const percentY = (newY / svgRect.height) * 100;
            
            this.circle.setAttribute('cx', `${percentX}%`);
            this.circle.setAttribute('cy', `${percentY}%`);
            
            // Continue playing drag sound if it stopped and we're still dragging
            const assignedId = this.assignedSounds.drag;
            if (assignedId && hasDragged) {
                const sample = this.samples.find(s => s.id === assignedId);
                if (sample && !sample.source) {
                    this.playSample(assignedId);
                }
            }
        });
        
        // Mouse up event (stop dragging)
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            // Only respond to left mouse button (button code 0)
            if (e.button !== 0) return;
            
            isDragging = false;
            this.circle.classList.remove('dragging');
            
            // Stop drag sound if it's playing
            const dragSoundId = this.assignedSounds.drag;
            if (dragSoundId) {
                this.stopSample(dragSoundId);
            }
        });
        
        // Mouse leave event for the SVG (stop dragging if mouse leaves the area)
        svg.addEventListener('mouseleave', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.circle.classList.remove('dragging');
            
            // Stop drag sound if it's playing
            const dragSoundId = this.assignedSounds.drag;
            if (dragSoundId) {
                this.stopSample(dragSoundId);
            }
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SoundSampleApp();
    
    // Resume AudioContext on user interaction (to handle autoplay policy)
    document.addEventListener('click', () => {
        if (app.audioContext.state === 'suspended') {
            app.audioContext.resume();
        }
    }, { once: true });
}); 