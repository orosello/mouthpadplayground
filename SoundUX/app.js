// Main application class
class SoundSampleApp {
    constructor() {
        this.samples = {};
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
        
        // Debug flag - set to true to enable console logging
        this.debug = true;
        
        // Initialize timing variables for event handling
        this.lastClickTime = 0;
        this.lastDoubleClickTime = 0;
        this.isDoubleClickInProgress = false;
        this.pendingClickSoundTimer = null;
        
        // Initialize the app
        this.initializeElements();
        this.setupEventListeners();
    }
    
    // Debug helper method
    logDebug(message) {
        if (this.debug) {
            console.log(`[SoundSampleApp] ${message}`);
        }
    }
    
    initializeElements() {
        // Interaction elements
        this.interactionBox = document.getElementById('interaction-box');
        this.triggerEventsTable = document.getElementById('trigger-events');
        
        // Playback control elements
        this.volumeControl = document.getElementById('volume-control');
        this.playbackSpeed = document.getElementById('playback-speed');
        this.speedValue = document.getElementById('speed-value');
        
        // Load sample sounds button
        this.loadSampleSoundsBtn = document.getElementById('load-sample-sounds');
        
        // Create the interactive circle
        this.createInteractiveCircle();
    }
    
    setupEventListeners() {
        // Playback control events
        this.volumeControl.addEventListener('input', this.updateVolume.bind(this));
        this.playbackSpeed.addEventListener('input', this.updatePlaybackSpeed.bind(this));
        
        // Set up interaction events
        this.setupInteractionEvents();
        
        // Set up event handlers for the trigger events table
        this.setupTriggerEventsTable();
        
        // Set up load sample sounds button
        this.loadSampleSoundsBtn.addEventListener('click', this.loadSampleSounds.bind(this));
    }
    
    setupTriggerEventsTable() {
        // Get all rows in the trigger events table
        const rows = this.triggerEventsTable.querySelectorAll('tbody tr');
        
        // Add event listeners to each row
        rows.forEach(row => {
            const eventType = row.dataset.event;
            const fileInput = row.querySelector('.file-upload');
            const assignBtn = row.querySelector('.assign-btn');
            const playBtn = row.querySelector('.play-btn');
            const stopBtn = row.querySelector('.stop-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            // File input change event
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, eventType);
            });
            
            // Assign button event (trigger file input click)
            assignBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Play button event
            playBtn.addEventListener('click', () => {
                this.playSample(eventType);
            });
            
            // Stop button event
            stopBtn.addEventListener('click', () => {
                this.stopSample(eventType);
            });
            
            // Delete button event
            deleteBtn.addEventListener('click', () => {
                this.deleteSample(eventType);
            });
        });
    }
    
    handleFileUpload(event, eventType) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        // Process the first file
        const file = files[0];
        
        // Only process audio files
        if (!file.type.startsWith('audio/')) return;
        
        // Show loading indicator
        this.showLoadingIndicator(eventType);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.audioContext.decodeAudioData(e.target.result, (buffer) => {
                // Create a sample object
                const sample = {
                    name: file.name,
                    buffer: buffer,
                    source: null
                };
                
                // Store the sample
                this.samples[eventType] = sample;
                
                // Assign the sample to the event type
                this.assignedSounds[eventType] = eventType;
                
                // Update the UI
                this.updateTriggerEventRow(eventType);
                
                // Hide loading indicator
                this.hideLoadingIndicator(eventType);
            });
        };
        
        reader.readAsArrayBuffer(file);
        
        // Reset the file input
        event.target.value = '';
    }
    
    showLoadingIndicator(eventType) {
        const row = this.triggerEventsTable.querySelector(`tr[data-event="${eventType}"]`);
        if (!row) return;
        
        const soundCell = row.querySelector('.sound-cell');
        const soundAssignment = soundCell.querySelector('.sound-assignment');
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        
        // Replace the no-sound message or sound name with loading indicator
        if (soundAssignment.querySelector('.no-sound-message')) {
            soundAssignment.querySelector('.no-sound-message').replaceWith(loadingIndicator);
        } else if (soundAssignment.querySelector('.sound-name')) {
            soundAssignment.querySelector('.sound-name').replaceWith(loadingIndicator);
        } else {
            soundAssignment.insertBefore(loadingIndicator, soundAssignment.firstChild);
        }
        
        // Add loading text
        const loadingText = document.createElement('span');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Loading sound...';
        soundAssignment.insertBefore(loadingText, soundAssignment.querySelector('.sound-controls'));
    }
    
    hideLoadingIndicator(eventType) {
        const row = this.triggerEventsTable.querySelector(`tr[data-event="${eventType}"]`);
        if (!row) return;
        
        const soundCell = row.querySelector('.sound-cell');
        const soundAssignment = soundCell.querySelector('.sound-assignment');
        
        // Remove loading indicator and text
        const loadingIndicator = soundAssignment.querySelector('.loading-indicator');
        const loadingText = soundAssignment.querySelector('.loading-text');
        
        if (loadingIndicator) loadingIndicator.remove();
        if (loadingText) loadingText.remove();
    }
    
    updateTriggerEventRow(eventType) {
        // Get the row for this event type
        const row = this.triggerEventsTable.querySelector(`tr[data-event="${eventType}"]`);
        if (!row) return;
        
        // Get the sound cell
        const soundCell = row.querySelector('.sound-cell');
        
        // Get the assigned sample
        const sample = this.samples[eventType];
        
        // Update the sound name or show "No sound assigned"
        const soundAssignment = soundCell.querySelector('.sound-assignment');
        
        if (sample) {
            // If a sound is assigned, update the UI
            const existingNoSoundMessage = soundAssignment.querySelector('.no-sound-message');
            const existingSoundName = soundAssignment.querySelector('.sound-name');
            
            if (existingNoSoundMessage) {
                // Replace the no-sound message with the sound name
                const soundName = document.createElement('div');
                soundName.className = 'sound-name';
                soundName.textContent = sample.name;
                existingNoSoundMessage.replaceWith(soundName);
            } else if (existingSoundName) {
                // Update the existing sound name
                existingSoundName.textContent = sample.name;
            } else {
                // Create and insert the sound name
                const soundName = document.createElement('div');
                soundName.className = 'sound-name';
                soundName.textContent = sample.name;
                soundAssignment.insertBefore(soundName, soundAssignment.querySelector('.sound-controls'));
            }
            
            // Enable the play, stop, and delete buttons
            soundCell.querySelector('.play-btn').disabled = false;
            soundCell.querySelector('.stop-btn').disabled = false;
            soundCell.querySelector('.delete-btn').disabled = false;
        } else {
            // If no sound is assigned, show the "No sound assigned" message
            const existingSoundName = soundAssignment.querySelector('.sound-name');
            const existingNoSoundMessage = soundAssignment.querySelector('.no-sound-message');
            
            if (existingSoundName) {
                // Replace the sound name with the no-sound message
                const noSoundMessage = document.createElement('span');
                noSoundMessage.className = 'no-sound-message';
                noSoundMessage.textContent = 'No sound assigned';
                existingSoundName.replaceWith(noSoundMessage);
            } else if (!existingNoSoundMessage) {
                // Create and insert the no-sound message
                const noSoundMessage = document.createElement('span');
                noSoundMessage.className = 'no-sound-message';
                noSoundMessage.textContent = 'No sound assigned';
                soundAssignment.insertBefore(noSoundMessage, soundAssignment.querySelector('.sound-controls'));
            }
            
            // Disable the play, stop, and delete buttons
            soundCell.querySelector('.play-btn').disabled = true;
            soundCell.querySelector('.stop-btn').disabled = true;
            soundCell.querySelector('.delete-btn').disabled = true;
        }
    }
    
    playSample(eventType) {
        // Don't play click sounds during double-clicks or if a double-click might be in progress
        if (eventType === 'click') {
            // If double-click is in progress, don't play click sound
            if (this.isDoubleClickInProgress) {
                this.logDebug('Skipping click sound because double-click is in progress');
                return;
            }
            
            // If this click is within the double-click threshold of the last click,
            // delay playing the sound in case this is the first click of a double-click
            const now = Date.now();
            const timeSinceLastClick = now - this.lastClickTime;
            const doubleClickThreshold = 300; // ms
            
            if (timeSinceLastClick < doubleClickThreshold) {
                this.logDebug('Delaying click sound in case this is part of a double-click');
                
                // Clear any existing click sound timer
                if (this.pendingClickSoundTimer) {
                    clearTimeout(this.pendingClickSoundTimer);
                }
                
                // Set a timer to play the click sound after the double-click threshold
                this.pendingClickSoundTimer = setTimeout(() => {
                    // Only play if a double-click hasn't occurred
                    if (!this.isDoubleClickInProgress) {
                        this._playActualSample(eventType);
                    }
                }, doubleClickThreshold);
                
                return;
            }
        }
        
        // For non-click sounds or clicks that aren't part of a double-click
        this._playActualSample(eventType);
    }
    
    // Private method to actually play the sample
    _playActualSample(eventType) {
        const sample = this.samples[eventType];
        if (!sample) {
            this.logDebug(`No sample found for ${eventType}`);
            return;
        }
        
        this.logDebug(`Playing sample for ${eventType}: ${sample.name}`);
        
        // Stop the sample if it's already playing
        this.stopSample(eventType);
        
        // Create a new audio source
        const source = this.audioContext.createBufferSource();
        source.buffer = sample.buffer;
        source.playbackRate.value = parseFloat(this.playbackSpeed.value);
        
        // Connect the source to the gain node
        source.connect(this.gainNode);
        
        // Start playing
        source.start(0);
        
        // Store the source for later stopping
        sample.source = source;
    }
    
    // Add a method to play a looping sample
    playLoopingSample(eventType) {
        const sample = this.samples[eventType];
        if (!sample) {
            this.logDebug(`No sample found for ${eventType}`);
            return;
        }
        
        // Don't start a new loop if one is already playing
        if (sample.isLooping) {
            return;
        }
        
        this.logDebug(`Playing looping sample for ${eventType}: ${sample.name}`);
        
        // Stop any existing playback
        this.stopSample(eventType);
        
        // Create a new audio source
        const source = this.audioContext.createBufferSource();
        source.buffer = sample.buffer;
        source.playbackRate.value = parseFloat(this.playbackSpeed.value);
        source.loop = true; // Enable looping
        
        // Connect the source to the gain node
        source.connect(this.gainNode);
        
        // Start playing
        source.start(0);
        
        // Store the source for later stopping
        sample.source = source;
        sample.isLooping = true;
    }
    
    stopSample(eventType) {
        const sample = this.samples[eventType];
        if (sample && sample.source) {
            sample.source.stop();
            sample.source = null;
            sample.isLooping = false; // Reset the looping state
        }
    }
    
    deleteSample(eventType) {
        // Stop the sample if it's playing
        this.stopSample(eventType);
        
        // Remove the sample
        delete this.samples[eventType];
        
        // Remove the assignment
        this.assignedSounds[eventType] = null;
        
        // Update the UI
        this.updateTriggerEventRow(eventType);
    }
    
    updateVolume() {
        this.gainNode.gain.value = parseFloat(this.volumeControl.value);
    }
    
    updatePlaybackSpeed() {
        const speed = parseFloat(this.playbackSpeed.value);
        this.speedValue.textContent = speed.toFixed(1) + 'x';
    }
    
    setupInteractionEvents() {
        // Remove all existing event listeners (simplified approach)
        const newInteractionBox = this.interactionBox.cloneNode(false);
        this.interactionBox.parentNode.replaceChild(newInteractionBox, this.interactionBox);
        this.interactionBox = newInteractionBox;
        
        // Create the interactive circle
        this.createInteractiveCircle();
        
        // Add event listeners for all interaction types
        this.setupClickEvent();
        this.setupHoverEvent();
        this.setupDragEvent();
        this.setupContextMenuEvent();
        this.setupScrollEvent();
        this.setupDoubleClickEvent();
    }
    
    // Helper method to handle double-click detection
    handleDoubleClick(e, isCircle = false) {
        // Record the time of this double-click
        this.lastDoubleClickTime = Date.now();
        
        // Set the double-click in progress flag
        this.isDoubleClickInProgress = true;
        
        // Clear any pending click timer
        if (this.interactionBoxClickTimer) {
            clearTimeout(this.interactionBoxClickTimer);
            this.interactionBoxClickTimer = null;
        }
        
        // Clear any pending click sound timer
        if (this.pendingClickSoundTimer) {
            clearTimeout(this.pendingClickSoundTimer);
            this.pendingClickSoundTimer = null;
        }
        
        // Reset click pending state
        this.isClickPending = false;
        
        // Prevent the click event from firing
        e.preventDefault();
        e.stopPropagation();
        
        // Play the double-click sound
        if (this.assignedSounds.dblclick) {
            this.logDebug(`Playing double-click sound from ${isCircle ? 'circle' : 'interaction box'}`);
            this.playSample('dblclick');
        }
        
        // Reset the double-click flag after a short delay
        setTimeout(() => {
            this.isDoubleClickInProgress = false;
        }, 500); // Longer delay to ensure we catch all click events
    }
    
    setupDoubleClickEvent() {
        // Track the last double-click time to prevent click sounds from firing
        this.lastDoubleClickTime = 0;
        
        // Flag to indicate a double-click is in progress
        this.isDoubleClickInProgress = false;
        
        this.interactionBox.addEventListener('dblclick', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            this.handleDoubleClick(e, false);
        }, true); // Use capture phase to ensure this runs before other handlers
    }
    
    setupScrollEvent() {
        let lastScrollTime = 0;
        let isScrolling = false;
        const scrollThrottle = 800; // ms - longer cooldown between scroll sounds
        
        // Track accumulated scroll distance
        let accumulatedScrollY = 0;
        let accumulatedScrollX = 0;
        let scrollResetTimer = null;
        
        // Minimum scroll distance required to trigger the sound (in pixels)
        const minScrollDistance = 25; // Reduced from 50 to make it more sensitive
        
        this.interactionBox.addEventListener('wheel', (e) => {
            const now = Date.now();
            
            // Log raw scroll values for debugging
            if (this.debug) {
                console.log(`[SoundSampleApp] Scroll event - deltaX: ${e.deltaX}, deltaY: ${e.deltaY}`);
            }
            
            // Accumulate scroll distance (use smaller values for deltaX since horizontal scrolling is often less pronounced)
            accumulatedScrollY += Math.abs(e.deltaY);
            accumulatedScrollX += Math.abs(e.deltaX) * 2; // Multiply horizontal scroll by 2 to give it more weight
            
            // Clear any existing reset timer
            if (scrollResetTimer) {
                clearTimeout(scrollResetTimer);
            }
            
            // Set a timer to reset accumulated scroll if user stops scrolling
            scrollResetTimer = setTimeout(() => {
                if (this.debug) {
                    console.log(`[SoundSampleApp] Scroll reset - accumulated X: ${accumulatedScrollX}, Y: ${accumulatedScrollY}`);
                }
                accumulatedScrollY = 0;
                accumulatedScrollX = 0;
                isScrolling = false;
            }, 300); // Reset after 300ms of inactivity
            
            // Calculate total scroll distance
            const totalScrollDistance = accumulatedScrollY + accumulatedScrollX;
            
            if (this.debug) {
                console.log(`[SoundSampleApp] Total scroll distance: ${totalScrollDistance}, threshold: ${minScrollDistance}`);
            }
            
            // If we're not currently in a scrolling state and have scrolled enough, start a new scroll action
            if (!isScrolling && totalScrollDistance > minScrollDistance) {
                isScrolling = true;
                
                // Only play the sound if enough time has passed since the last scroll action
                if (now - lastScrollTime > scrollThrottle) {
                    lastScrollTime = now;
                    if (this.assignedSounds.scroll) {
                        this.logDebug(`Playing scroll sound after ${totalScrollDistance}px of scrolling (X: ${accumulatedScrollX}, Y: ${accumulatedScrollY})`);
                        this.playSample('scroll');
                    }
                    
                    // Reset accumulated scroll after playing the sound
                    accumulatedScrollY = 0;
                    accumulatedScrollX = 0;
                }
            }
        });
    }
    
    setupContextMenuEvent() {
        this.interactionBox.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent the default context menu
            
            // Cancel any pending click
            if (this.interactionBoxClickTimer) {
                clearTimeout(this.interactionBoxClickTimer);
                this.interactionBoxClickTimer = null;
            }
            
            // Ensure click is not pending
            this.isClickPending = false;
            
            if (this.assignedSounds.contextmenu) {
                this.playSample('contextmenu');
            }
        }, true); // Use capture phase to ensure this runs before other handlers
    }
    
    setupDragEvent() {
        // Setup drag events for the circle
        this.setupCircleInteractions();
    }
    
    setupClickEvent() {
        let clickMouseDownTime = 0;
        let isClickPending = false;
        let mouseDownX = 0;
        let mouseDownY = 0;
        const movementThreshold = 5; // pixels of movement to consider it a drag
        let lastClickTime = 0;
        const doubleClickThreshold = 300; // ms between clicks to be considered a double-click
        
        // Store isClickPending in a property so other methods can access it
        this.isClickPending = false;
        
        // Initialize lastDoubleClickTime if not already set
        if (!this.lastDoubleClickTime) {
            this.lastDoubleClickTime = 0;
        }
        
        // Initialize lastClickTime if not already set
        if (!this.lastClickTime) {
            this.lastClickTime = 0;
        }
        
        this.interactionBox.addEventListener('mousedown', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // Only handle left clicks (button 0)
            if (e.button !== 0) return;
            
            // Check if this could be part of a double-click
            const now = Date.now();
            if (now - lastClickTime < doubleClickThreshold) {
                // This might be the second click of a double-click, so don't process it as a single click
                return;
            }
            
            clickMouseDownTime = now;
            isClickPending = true;
            this.isClickPending = true;
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;
        });
        
        this.interactionBox.addEventListener('mousemove', (e) => {
            // If significant mouse movement occurs, cancel the pending click
            if (isClickPending) {
                const dx = Math.abs(e.clientX - mouseDownX);
                const dy = Math.abs(e.clientY - mouseDownY);
                
                // If the mouse has moved more than the threshold, cancel the click
                if (dx > movementThreshold || dy > movementThreshold) {
                    isClickPending = false;
                    this.isClickPending = false;
                    
                    // Clear any pending click timer
                    if (this.interactionBoxClickTimer) {
                        clearTimeout(this.interactionBoxClickTimer);
                        this.interactionBoxClickTimer = null;
                    }
                }
            }
        });
        
        this.interactionBox.addEventListener('mouseup', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // Only handle left clicks (button 0)
            if (e.button !== 0) return;
            
            const now = Date.now();
            
            // If this was a quick press and release without movement, it's a click
            if (isClickPending && (now - clickMouseDownTime < 200)) {
                // Check if this is too close to a recent double-click or if a double-click is in progress
                if (now - this.lastDoubleClickTime > 300 && !this.isDoubleClickInProgress) {
                    // Record this click time for double-click detection
                    lastClickTime = now;
                    this.lastClickTime = now; // Store in class property for use in playSample
                    
                    // Play the click sound immediately for better responsiveness
                    if (this.assignedSounds.click) {
                        this.logDebug('Playing click sound from interaction box');
                        this.playSample('click');
                    }
                }
            }
            
            isClickPending = false;
            this.isClickPending = false;
        });
        
        // Add a direct click handler for immediate response
        this.interactionBox.addEventListener('click', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // We already handle the click in mouseup, this is just a fallback
            // to ensure clicks are captured if the mouseup logic fails
        });
    }
    
    setupHoverEvent() {
        // Hover state for the interaction box
        let isBoxHovering = false;
        let boxHoverTimer = null;
        
        // Hover state for the circle
        let isCircleHovering = false;
        let circleHoverTimer = null;
        
        // Interaction box hover events
        this.interactionBox.addEventListener('mouseenter', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // Clear any existing hover timer
            if (boxHoverTimer) {
                clearTimeout(boxHoverTimer);
            }
            
            // Set a small delay to avoid conflict with click events
            boxHoverTimer = setTimeout(() => {
                if (!isBoxHovering) {
                    isBoxHovering = true;
                    if (this.assignedSounds.hover) {
                        this.playSample('hover');
                    }
                }
            }, 50); // Small delay to avoid conflict with click
        });
        
        this.interactionBox.addEventListener('mouseleave', (e) => {
            // If the event originated from the circle, don't handle it here
            if (e.target === this.circle) return;
            
            // Clear any pending hover timer
            if (boxHoverTimer) {
                clearTimeout(boxHoverTimer);
                boxHoverTimer = null;
            }
            isBoxHovering = false;
        });
        
        // Circle hover events
        this.circle.addEventListener('mouseenter', (e) => {
            // Prevent the event from bubbling to the interaction box
            e.stopPropagation();
            
            // Clear any existing hover timer
            if (circleHoverTimer) {
                clearTimeout(circleHoverTimer);
            }
            
            // Set a small delay to avoid conflict with click events
            circleHoverTimer = setTimeout(() => {
                if (!isCircleHovering) {
                    isCircleHovering = true;
                    if (this.assignedSounds.hover) {
                        this.logDebug('Playing hover sound for circle');
                        this.playSample('hover');
                    }
                }
            }, 50); // Small delay to avoid conflict with click
        });
        
        this.circle.addEventListener('mouseleave', (e) => {
            // Prevent the event from bubbling to the interaction box
            e.stopPropagation();
            
            // Clear any pending hover timer
            if (circleHoverTimer) {
                clearTimeout(circleHoverTimer);
                circleHoverTimer = null;
            }
            isCircleHovering = false;
        });
    }
    
    createInteractiveCircle() {
        // Create a draggable circle
        this.circle = document.createElement('div');
        this.circle.className = 'interactive-circle';
        
        // Position the circle in the center of the interaction box
        this.circle.style.left = '50%';
        this.circle.style.top = '50%';
        this.circle.style.transform = 'translate(-50%, -50%)';
        
        // Add the circle to the interaction box
        this.interactionBox.appendChild(this.circle);
        
        // Setup drag events for the circle
        this.setupCircleInteractions();
    }
    
    setupCircleInteractions() {
        let isDragging = false;
        let lastDragTime = 0;
        const dragThrottle = 200; // ms between drag sounds
        let mouseDownTime = 0;
        let mouseDownX = 0;
        let mouseDownY = 0;
        // Add offset variables to track where on the circle the user clicked
        let offsetX = 0;
        let offsetY = 0;
        const movementThreshold = 5; // pixels of movement to consider it a drag
        let isCircleClickPending = false;
        let lastCircleClickTime = 0;
        const doubleClickThreshold = 300; // ms between clicks to be considered a double-click
        
        // Initialize lastDoubleClickTime if not already set
        if (!this.lastDoubleClickTime) {
            this.lastDoubleClickTime = 0;
        }
        
        // Mouse down event
        this.circle.addEventListener('mousedown', (e) => {
            // Only handle left clicks for dragging
            if (e.button !== 0) return;
            
            // Prevent the event from bubbling to the interaction box
            e.stopPropagation();
            
            // Check if this could be part of a double-click
            const now = Date.now();
            if (now - lastCircleClickTime < doubleClickThreshold) {
                // This might be the second click of a double-click, so don't process it as a single click
                return;
            }
            
            isDragging = false; // Reset dragging state
            isCircleClickPending = true; // Set click pending for the circle
            this.circle.classList.add('dragging');
            mouseDownTime = now; // Record when the mouse was pressed
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;
            
            // Reset the drag operation flag
            this.hadDragOperation = false;
            
            // Calculate the offset from the mouse position to the circle's top-left corner
            const circleRect = this.circle.getBoundingClientRect();
            offsetX = mouseDownX - circleRect.left;
            offsetY = mouseDownY - circleRect.top;
            
            // Prevent text selection during drag
            e.preventDefault();
        });
        
        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            if (!this.circle.classList.contains('dragging')) return;
            
            const dx = Math.abs(e.clientX - mouseDownX);
            const dy = Math.abs(e.clientY - mouseDownY);
            
            // Only consider it a drag if the mouse has moved more than the threshold
            if (!isDragging && (dx > movementThreshold || dy > movementThreshold)) {
                isDragging = true;
                isCircleClickPending = false; // Cancel the pending click
                
                // Set a flag to track that we had a drag operation
                // This will persist even after dragging stops
                this.hadDragOperation = true;
                
                // Start playing the drag sound in a loop when drag begins
                if (this.assignedSounds.drag) {
                    this.playLoopingSample('drag');
                }
            }
            
            // Get the bounds of the interaction box
            const boxRect = this.interactionBox.getBoundingClientRect();
            
            // Calculate the new position of the circle, accounting for the initial click offset
            let left = e.clientX - boxRect.left - offsetX;
            let top = e.clientY - boxRect.top - offsetY;
            
            // Constrain the circle within the box
            const circleRadius = this.circle.offsetWidth / 2;
            const circleWidth = this.circle.offsetWidth;
            const circleHeight = this.circle.offsetHeight;
            
            left = Math.max(0, Math.min(boxRect.width - circleWidth, left));
            top = Math.max(0, Math.min(boxRect.height - circleHeight, top));
            
            // Update the circle position
            this.circle.style.left = left + 'px';
            this.circle.style.top = top + 'px';
            this.circle.style.transform = 'none';
        });
        
        // Mouse up event
        document.addEventListener('mouseup', (e) => {
            // Only handle left button releases
            if (e.button !== 0) return;
            
            if (this.circle.classList.contains('dragging')) {
                const wasDragging = isDragging || this.hadDragOperation;
                isDragging = false;
                this.circle.classList.remove('dragging');
                
                // Stop the drag sound when dragging ends
                if (wasDragging && this.assignedSounds.drag) {
                    this.stopSample('drag');
                }
                
                const now = Date.now();
                
                // Only play click sound if it wasn't a drag at all
                // This ensures no click sound plays after a drag operation
                if (isCircleClickPending && !wasDragging && (now - mouseDownTime < 200)) {
                    // Check if this is too close to a recent double-click or if a double-click is in progress
                    if (now - this.lastDoubleClickTime > 300 && !this.isDoubleClickInProgress) {
                        // Record this click time for double-click detection
                        lastCircleClickTime = now;
                        
                        // Also update the global last click time for double-click detection
                        this.lastClickTime = now;
                        
                        // Play the click sound immediately for better responsiveness
                        if (this.assignedSounds.click) {
                            this.logDebug('Playing click sound from circle');
                            this.playSample('click');
                        }
                    }
                }
                
                isCircleClickPending = false;
            }
        });
        
        // Double click event for the circle
        this.circle.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // Prevent the interaction box double click from firing
            
            isDragging = false; // Reset dragging state
            isCircleClickPending = false; // Cancel any pending click
            
            this.handleDoubleClick(e, true);
        });
        
        // Click event for the circle - we'll handle this in mouseup instead
        this.circle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the interaction box click from firing
            
            // If we haven't already processed this click in the mouseup handler
            // and it's not too close to a double-click, play the click sound
            // BUT ONLY if we weren't dragging
            const now = Date.now();
            if (!isDragging && !this.hadDragOperation && 
                now - this.lastDoubleClickTime > 300 && 
                !this.isDoubleClickInProgress && 
                this.assignedSounds.click) {
                // This is a fallback in case the mouseup handler didn't catch it
                this.logDebug('Playing click sound from circle click event');
                
                // Update the last click time
                this.lastClickTime = now;
                
                this.playSample('click');
            }
        });
        
        // Context menu event for the circle
        this.circle.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent the default context menu
            e.stopPropagation(); // Prevent the interaction box context menu from firing
            
            // Cancel any dragging state
            isDragging = false;
            isCircleClickPending = false;
            this.circle.classList.remove('dragging');
            
            if (this.assignedSounds.contextmenu) {
                this.playSample('contextmenu');
            }
        });
    }
    
    // Load sample sounds from the test-sounds folder
    loadSampleSounds() {
        this.logDebug('Loading sample sounds...');
        
        // Define the mapping of sample files to event types
        const sampleMapping = {
            'click': '01left.m4a',
            'contextmenu': '02right.m4a',
            'dblclick': '03doubleclick.m4a',
            'hover': '04hover.m4a',
            'drag': '05drag.m4a',
            'scroll': '06scroll.m4a'
        };
        
        // Load each sample
        Object.entries(sampleMapping).forEach(([eventType, fileName]) => {
            this.loadSampleFromFile(eventType, fileName);
        });
    }
    
    // Load a sample from a file in the test-sounds folder
    loadSampleFromFile(eventType, fileName) {
        this.logDebug(`Loading sample for ${eventType}: ${fileName}`);
        
        // Show loading indicator
        this.showLoadingIndicator(eventType);
        
        // Fetch the sample file
        fetch(`test-sounds/${fileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load sample: ${response.statusText}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                // Decode the audio data
                return this.audioContext.decodeAudioData(arrayBuffer);
            })
            .then(buffer => {
                // Create a sample object
                const sample = {
                    name: fileName,
                    buffer: buffer,
                    source: null
                };
                
                // Store the sample
                this.samples[eventType] = sample;
                
                // Assign the sample to the event type
                this.assignedSounds[eventType] = eventType;
                
                // Update the UI
                this.updateTriggerEventRow(eventType);
                
                // Hide loading indicator
                this.hideLoadingIndicator(eventType);
                
                this.logDebug(`Sample loaded for ${eventType}: ${fileName}`);
            })
            .catch(error => {
                this.logDebug(`Error loading sample: ${error.message}`);
                
                // Hide loading indicator
                this.hideLoadingIndicator(eventType);
                
                // Show error message
                const row = this.triggerEventsTable.querySelector(`tr[data-event="${eventType}"]`);
                if (row) {
                    const soundCell = row.querySelector('.sound-cell');
                    const soundAssignment = soundCell.querySelector('.sound-assignment');
                    const noSoundMessage = soundAssignment.querySelector('.no-sound-message');
                    
                    if (noSoundMessage) {
                        noSoundMessage.textContent = 'Error loading sound';
                        noSoundMessage.style.color = 'red';
                    }
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