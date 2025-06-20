// Error handling and loading
let loadingComplete = false;
let assetsLoaded = 0;
const totalAssets = 1; // Only background.png needs to load

// Sound effects (optional)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(frequency, duration, type = 'sine') {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

// Loading functions
function imageLoaded() {
    assetsLoaded++;
    checkLoadingComplete();
}

function imageError() {
    console.error('Failed to load background image');
    // Don't show error, just proceed without the image
    assetsLoaded++;
    checkLoadingComplete();
}

function checkLoadingComplete() {
    if (assetsLoaded >= totalAssets && !loadingComplete) {
        loadingComplete = true;
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            startGame();
        }, 500);
    }
}

function showError(message) {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('errorBoundary').classList.remove('hidden');
    document.getElementById('errorBoundary').querySelector('p').textContent = message;
}

// Error boundary
window.addEventListener('error', function(e) {
    console.error('Game error:', e.error);
    showError('The castle encountered an unexpected error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('The castle systems are experiencing difficulties');
});

// Main game variables
const messagesEl = document.getElementById('messages');
const input = document.getElementById('userInput');
const keyButton = document.getElementById('keyButton');
const chatbox = document.getElementById('chatbox');

let stage = 0;
let isTyping = false;
let recent = [];
let userResponses = [];

// Utility functions
function setInput(en) {
    input.disabled = !en;
    if (en) {
        input.focus();
        chatbox.classList.remove('typing');
    } else {
        chatbox.classList.add('typing');
    }
}

function typeWriter(txt, cls = '') {
    return new Promise(res => {
        const span = document.createElement('span');
        if (cls) span.className = cls;
        messagesEl.appendChild(span);
        let i = 0;
        isTyping = true;
        setInput(false);
        
        // Play typing sound
        playSound(800, 0.1);
        
        const it = setInterval(() => {
            span.textContent = txt.slice(0, ++i);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            if (i === txt.length) {
                clearInterval(it);
                messagesEl.appendChild(document.createElement('br'));
                isTyping = false;
                setInput(true);
                
                // Play completion sound
                playSound(1200, 0.2);
                
                res();
            }
        }, 35);
    });
}

async function clerkSay(t) {
    await typeWriter('Clerk: ', 'nameClerk');
    await typeWriter(t);
}

async function youSay(t) {
    await typeWriter('You: ', 'nameYou');
    await typeWriter(t);
}

// Enhanced responses
const firstLines = ["What business brings you to the castle gates?", "State your purpose here, stranger.", "Why do you seek entry to Kafka's Castle?", "What do you hope to find within these walls?"];
const stage1Responses = ["I understand. But before you may enter, you must provide the access code.", "Interesting. However, the castle requires a code for entry.", "Your purpose is noted. Now, the access code, if you please.", "Very well. But the castle demands its code before you proceed."];
const stage2Responses = ["That code is incorrect. The castle's security is not so easily bypassed. Try once more to prove you belong.", "Wrong code. The walls are more discerning than that. One more attempt.", "Incorrect. The castle knows its own. Try again.", "That's not the right sequence. One final chance to prove yourself."];
const taunts = ["Why linger? The door is ajar—step through or step aside.", "More words? The castle devours them whole.", "Courage fades with every syllable you spill.", "Enter, unless your fear prefers these shadows.", "Mystery grows impatient. Will you cross the threshold?"];

// Game start
function startGame() {
    // Track game start
    if (window.gameAnalytics) {
        window.gameAnalytics.trackEvent('game_started', { timestamp: Date.now() });
    }
    
    // Start with random first message
    (async () => {
        await clerkSay(firstLines[Math.floor(Math.random() * firstLines.length)]);
    })();
}

function addRecent(x) {
    recent.push(x);
    if (recent.length > 4) recent.shift();
}

// Main input handler
input.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && input.value.trim() && !isTyping) {
        const txt = input.value.trim();
        input.value = '';
        
        // Track attempt
        if (window.gameAnalytics) {
            window.gameAnalytics.attempts++;
            window.gameAnalytics.trackEvent('user_input', { 
                attempt: window.gameAnalytics.attempts, 
                input: txt.substring(0, 10) + '...' 
            });
        }
        
        await youSay(txt);
        userResponses.push(txt);
        stage++;
        
        if (stage === 1) {
            await clerkSay(stage1Responses[Math.floor(Math.random() * stage1Responses.length)]);
        } else if (stage === 2) {
            await clerkSay(stage2Responses[Math.floor(Math.random() * stage2Responses.length)]);
        } else if (stage === 3) {
            await clerkSay("Very well. Take the key, if your hand won't tremble.");
            unlock();
        } else {
            let rep;
            do {
                rep = taunts[Math.floor(Math.random() * taunts.length)];
            } while (recent.includes(rep));
            recent.push(rep);
            if (recent.length > 3) recent.shift();
            await clerkSay(rep);
        }
    }
});

function unlock() {
    // Visual feedback
    keyButton.style.display = 'inline-block';
    keyButton.classList.add('glow');
    
    // Sound effect
    playSound(1500, 0.5, 'square');
    
    // Track completion
    if (window.gameAnalytics) {
        window.gameAnalytics.completionTime = Date.now() - window.gameAnalytics.startTime;
        window.gameAnalytics.trackEvent('game_completed', { 
            completionTime: window.gameAnalytics.completionTime,
            attempts: window.gameAnalytics.attempts 
        });
    }
    
    const go = () => {
        // Track navigation
        if (window.gameAnalytics) {
            window.gameAnalytics.trackEvent('stage2_entered', { 
                timeSpent: Date.now() - window.gameAnalytics.startTime 
            });
        }
        location.href = 'stage2.html';
    };
    
    keyButton.addEventListener('click', go);
    keyButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            go();
        }
    });
}

// Check if loading is already complete (for direct navigation)
if (document.readyState === 'complete') {
    checkLoadingComplete();
} else {
    window.addEventListener('load', checkLoadingComplete);
}
