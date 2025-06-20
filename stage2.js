// Error handling and loading
let loadingComplete = false;
let assetsLoaded = 0;
const totalAssets = 1; // Only background.png needs to load

// Sound effects (optional)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let corridorSound = null;
let isCorridorPlaying = false;

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

// Corridor walking sound effect
function createCorridorSound() {
    try {
        // Create a subtle, atmospheric corridor sound
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate a subtle walking sound with distant echoes
        for (let i = 0; i < bufferSize; i++) {
            const time = i / audioContext.sampleRate;
            
            // Main walking sound (soft footsteps)
            const step = Math.sin(time * 80) * 0.02 * Math.exp(-time * 0.5);
            
            // Echo effect (distant footsteps)
            const echo = Math.sin((time - 0.3) * 60) * 0.01 * Math.exp(-(time - 0.3) * 0.3);
            
            // Ambient corridor atmosphere (very subtle)
            const ambient = (Math.random() - 0.5) * 0.005;
            
            // Combine all elements
            output[i] = step + echo + ambient;
        }
        
        return buffer;
    } catch (error) {
        console.log('Could not create corridor sound:', error);
        return null;
    }
}

function startCorridorSound() {
    if (isCorridorPlaying || !audioContext) return;
    
    try {
        const buffer = createCorridorSound();
        if (!buffer) return;
        
        corridorSound = audioContext.createBufferSource();
        corridorSound.buffer = buffer;
        corridorSound.loop = true;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime); // Very quiet
        
        corridorSound.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        corridorSound.start();
        isCorridorPlaying = true;
        
        console.log('Corridor sound started');
    } catch (error) {
        console.log('Could not start corridor sound:', error);
    }
}

function stopCorridorSound() {
    if (corridorSound && isCorridorPlaying) {
        try {
            corridorSound.stop();
            isCorridorPlaying = false;
            console.log('Corridor sound stopped');
        } catch (error) {
            console.log('Could not stop corridor sound:', error);
        }
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
            startStage2();
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
    console.error('Stage2 error:', e.error);
    showError('The antechamber encountered an unexpected error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('The antechamber systems are experiencing difficulties');
});

// Main game variables
const msgs = document.getElementById('messages');
const inp = document.getElementById('userInput');
const timer = document.getElementById('timer');
const exitBtn = document.getElementById('exitBtn');
const chatbox = document.getElementById('chatbox');

let modal;
let start = Date.now();
let attempts = 0;
let recent = [];
let inLoop = false;
let loopIntensity = 0;
let hintsEnabled = false;
let gameWon = false;
const correct = "PHC-CYBER-2025";

// Timer
let timerInterval;
function updateTimer() {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timer.textContent = (minutes > 0 ? String(minutes).padStart(2, '0') + ':' : '') + String(seconds).padStart(2, '0');
}

// Utility functions
let typing = false;
function setInp(enabled) {
    inp.disabled = !enabled;
    if (enabled) {
        inp.focus();
        chatbox.classList.remove('typing');
    } else {
        chatbox.classList.add('typing');
    }
}

function tw(txt, cls = '') {
    return new Promise(resolve => {
        const span = document.createElement('span');
        if (cls) span.className = cls;
        msgs.appendChild(span);
        let i = 0;
        typing = true;
        setInp(false);
        
        // Play typing sound
        playSound(800, 0.1);
        
        const interval = setInterval(() => {
            span.textContent = txt.slice(0, ++i);
            msgs.scrollTop = msgs.scrollHeight;
            if (i === txt.length) {
                clearInterval(interval);
                msgs.appendChild(document.createElement('br'));
                typing = false;
                setInp(true);
                
                // Play completion sound
                playSound(1200, 0.2);
                
                resolve();
            }
        }, 30);
    });
}

async function clerk(t) {
    await tw('Clerk: ', 'nameClerk');
    await tw(t);
}

async function you(t) {
    await tw('You: ', 'nameYou');
    await tw(t);
}

// Record system
const records = [
    { 
        id: 'PHC7823', 
        date: '2024-12-15 14:23', 
        status: 'escalated', 
        subject: 'Unauthorized access attempt',
        body: 'Subject attempted to access restricted area without proper clearance. Multiple failed authentication attempts detected. Case escalated to Security Division. Awaiting review by Department of Access Control. Standard procedure: 72-hour investigation period. Investigation ongoing.'
    },
    { 
        id: 'PHC9451', 
        date: '2024-12-14 09:47', 
        status: 'redacted', 
        subject: 'Classified document inquiry',
        body: 'Subject requested access to [REDACTED] documents. Documents contain [REDACTED] information regarding [REDACTED]. Access denied due to [REDACTED] clearance level. Case marked for [REDACTED] review. Further details [REDACTED] by order of [REDACTED]. CYBER security protocols were bypassed during this incident.'
    },
    { 
        id: 'PHC3367', 
        date: '2024-12-13 16:12', 
        status: 'pending', 
        subject: 'Security clearance review',
        body: 'Subject submitted clearance application. Background check in progress. References contacted. Previous employment verification pending. Medical evaluation scheduled. Psychological assessment required. Estimated completion: 30-45 business days. Status: Under Review. Note: Application will be processed in 2025 due to current backlog.'
    }
];

function showRecords() {
    // Track record viewing
    if (window.gameAnalytics) {
        window.gameAnalytics.recordsViewed++;
        window.gameAnalytics.trackEvent('records_viewed', { 
            count: window.gameAnalytics.recordsViewed 
        });
    }
    
    let recordText = 'RECORD LOG:\n';
    records.forEach(record => {
        recordText += `${record.id} | ${record.date} | <span class="status-${record.status}">${record.status.toUpperCase()}</span> | ${record.subject}\n`;
    });
    recordText += '\nTo view detailed record, type: "view [record number]" (e.g., "view PHC7823")\n';
    recordText += 'To speak with filing clerks directly, type: "speak to clerks" or "contact clerks"';
    return recordText;
}

function showRecordDetail(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) {
        return `Record ${recordId} not found. Please check the record number and try again.`;
    }
    
    let detailText = `RECORD DETAIL: ${record.id}\n`;
    detailText += `Date: ${record.date}\n`;
    detailText += `Status: <span class="status-${record.status}">${record.status.toUpperCase()}</span>\n`;
    detailText += `Subject: ${record.subject}\n`;
    detailText += `\nLOG BODY:\n${record.body}\n`;
    
    if (record.status === 'redacted') {
        detailText += '\nNOTE: This record contains redacted information as per security protocol.';
    }
    
    return detailText;
}

// Enhanced Kafkaesque responses
const filingClerkResponses = [
    "The filing clerks are... elsewhere. They've been filing for eternity.",
    "Clerks? We have clerks? I thought they were just shadows in the corridors.",
    "The filing system is... complicated. Even the clerks don't understand it.",
    "Clerks process records in ways that defy logic. Or perhaps they create the logic.",
    "Filing clerks are the castle's memory. Sometimes they remember too much.",
    "The clerks are processing your request. Processing. Processing. Processing.",
    "Clerk #247 has been assigned to your case. Clerk #247 is currently... unavailable.",
    "The filing system operates on principles unknown to mortal minds.",
    "Clerks are the gears of bureaucracy. Gears that turn without purpose.",
    "The clerks have filed your inquiry under 'Pending Eternal Review.'",
    "Direct communication with filing clerks requires Form 247-B. Form 247-B requires approval from the Department of Interdepartmental Communication. Approval process: ongoing.",
    "The filing clerks are available for consultation. Consultation fee: your sanity. Payment method: eternal processing.",
    "Clerk-to-visitor communication is regulated by Bureaucratic Decree #1337. Decree #1337: communication is forbidden.",
    "The filing clerks are processing your request to speak with filing clerks. Processing time: infinite.",
    "Direct clerk access requires clearance level 9. Your clearance level: pending. Pending status: eternal.",
    "The filing clerks maintain the record system. Records are the castle's memory. Memory is bureaucratic.",
    "Clerks process records according to the Bureaucratic Classification System. System: incomprehensible but mandatory.",
    "The filing clerks are currently reviewing record PHC7823. Review process: eternal.",
    "Clerk #1337 suggests consulting the record log. Record log contains all processed cases.",
    "The filing system contains records of all access attempts. Records are filed by date and status.",
    "Submit Form 247-B to request direct clerk access. Form 247-B is available from the Department of Bureaucratic Forms. Forms are processed in triplicate.",
    "Contact the Department of Access Control for clearance upgrades. Department of Access Control: permanently closed for renovations.",
    "Request clearance level upgrade through the Central Bureaucratic Authority. Authority: currently processing requests from 2020."
];

const keyResponses = [
    "The key is both literal and metaphorical. It opens doors that shouldn't exist.",
    "Keys here are more than metal. They're patterns, codes, sequences.",
    "Every key has a purpose. Some open doors, others open minds.",
    "The key you seek is hidden in plain sight. Or perhaps it's hiding you.",
    "Keys are like records - they only work if you know how to use them.",
    "The key is a formality. A bureaucratic necessity. A meaningless gesture.",
    "Keys are issued by the Department of Access Control. Applications take 3-5 business eternities.",
    "The key represents your clearance level. Your clearance level represents nothing.",
    "Keys are processed through the Central Bureaucratic Authority. Processing time: indefinite.",
    "The key is a symbol of authority. Authority is a symbol of nothing."
];

const castleInhabitantResponses = [
    "The castle has many inhabitants. Most are records. Some are memories.",
    "Inhabitants? We prefer 'permanent residents.' Though none of us chose to be here.",
    "The castle's population is... fluid. Numbers change when you're not looking.",
    "Inhabitants include clerks, records, shadows, and things that used to be people.",
    "We're all inhabitants of the castle's endless bureaucracy.",
    "The inhabitants are classified. Classification is classified.",
    "Population: indeterminate. Census: ongoing. Results: pending.",
    "Inhabitants are processed through the Department of Existence Verification.",
    "The castle's residents are bound by bureaucratic decree. Decree #247: existence is mandatory.",
    "Inhabitants are assigned identification numbers. Numbers are assigned randomly. Randomness is predetermined."
];

const purposeResponses = [
    "Purpose? The castle's purpose is to exist. Your purpose is to find your record.",
    "Purpose is a luxury we can't afford here. We process, we file, we wait.",
    "The castle serves many purposes. None of them make sense to outsiders.",
    "Purpose implies direction. The castle moves in circles, not lines.",
    "Your purpose is to understand that purpose is meaningless here.",
    "Purpose is determined by the Central Planning Committee. Committee meetings: ongoing.",
    "The castle's purpose is to process. Processing is its purpose. Purpose is processing.",
    "Purpose requires authorization. Authorization requires purpose. Circular logic is mandatory.",
    "Your purpose has been filed under 'General Inquiries.' Response time: never.",
    "Purpose is a bureaucratic construct. Constructs are filed in triplicate."
];

const recordResponses = [
    "Records are everything here. They're our history, our present, our future.",
    "A record is proof that something happened. Or that it didn't.",
    "Records are the castle's blood. They flow through endless corridors.",
    "Every action creates a record. Every record creates an action.",
    "Records are like memories, but more permanent. And less reliable.",
    "Records are processed through the Department of Eternal Documentation.",
    "Each record is assigned a unique identifier. Identifiers are not unique.",
    "Records are filed according to the Bureaucratic Classification System. System: incomprehensible.",
    "Records exist to prove existence. Existence exists to create records.",
    "Records are the foundation of our reality. Reality is a bureaucratic construct."
];

const technicalCommands = {
    'ping': "PING castle.local (127.0.0.1) - No response. The castle doesn't respond to pings.",
    'nslookup': "castle.local -> 127.0.0.1\nAuthoritative answer: The castle resolves to itself.",
    'traceroute': "Tracing route to castle.local...\n1. gateway (10.0.0.1) - 1ms\n2. castle.local (127.0.0.1) - Destination reached\nRoute: You are already inside.",
    'whoami': "Current user: visitor\nAccess level: restricted\nClearance: pending",
    'ls': "Directory listing denied. Insufficient privileges.",
    'cat': "File access denied. Records are classified.",
    'sudo': "Permission denied. The castle doesn't recognize your authority.",
    'ssh': "Connection refused. The castle doesn't accept external connections.",
    'netstat': "Active connections:\n127.0.0.1:8080 - castle.local:http\n127.0.0.1:22 - castle.local:ssh (filtered)",
    'top': "Process listing denied. System processes are confidential.",
    'ps': "Process status: processing. Processing status: processing.",
    'kill': "Termination request denied. Processes are eternal.",
    'chmod': "Permission modification denied. Permissions are immutable.",
    'rm': "Deletion denied. Nothing can be deleted in the castle.",
    'cp': "Copy operation failed. Originals are unique. Uniqueness is mandatory."
};

const hints = [
    "Records often begin with three letters—then a dash.",
    "The castle loves acronyms; perhaps start with PHC-?",
    "CYBER things nest in secure vaults.",
    "Years matter; the castle cannot forget 2025.",
    "The key follows a pattern: letters-numbers-letters.",
    "Think of it as a record number, not just a key.",
    "The format is familiar to those who work with records.",
    "Three parts, separated by dashes. Like a filing system.",
    "The key is a bureaucratic identifier. Identifiers follow patterns.",
    "Consider the year. Years are important to bureaucracies.",
    "Look at the record numbers. Notice the PHC prefix?",
    "Security systems often use CYBER terminology.",
    "What year appears in the castle's records?",
    "The key follows a similar but different pattern than the records.",
    "Combine the PHC prefix with a security term and a year."
];

const chatter = [
    "The corridors stretch on, digit by digit.",
    "Your silence echoes like empty hallways.",
    "Wrong turn. Perhaps consult the filing clerks?",
    "Every failed code adds another brick to the wall.",
    "Record misfiled. Clerk shrugs into the abyss.",
    "The castle's patience is infinite. Yours is not.",
    "Another wrong answer. The records grow thicker.",
    "The filing system grows more complex with each attempt.",
    "The castle is a maze of records, and you're lost.",
    "Processing your request. Processing. Processing.",
    "The bureaucracy is eternal. Your patience is finite.",
    "Another form to fill out. Another box to check.",
    "The system is working as designed. Design is incomprehensible.",
    "Your inquiry has been logged. Logging is eternal.",
    "The castle processes all requests. Processing never ends.",
    "Bureaucratic efficiency is 100%. Efficiency is meaningless.",
    "Your case has been assigned a number. Numbers are infinite.",
    "The castle never forgets. The castle never remembers.",
    "Procedure must be followed. Procedures are infinite.",
    "The castle operates on principles of bureaucratic necessity.",
    "The record system contains all answers. If you know where to look.",
    "Clerks maintain records of all access attempts. Records are filed systematically.",
    "The filing system is the castle's memory. Memory is accessible to those who ask.",
    "Records are processed through the Department of Eternal Documentation.",
    "The castle's records are filed according to the Bureaucratic Classification System.",
    "All access attempts are logged. Logs are maintained by the filing clerks.",
    "The record system operates on principles of bureaucratic transparency. Transparency: opaque."
];

const misdirect = [
    "You've already entered the correct key… haven't you?",
    "Some clerks say access was granted 3 prompts ago.",
    "It's odd you're still here. That's what the last applicant said too.",
    "Records show your clearance is already active. Or was that a glitch?",
    "There is no record of your record.",
    "Are you sure this isn't all part of the test?",
    "Some never leave. Some never arrived.",
    "Access denied. Or granted. We don't know anymore.",
    "What if you already won, but kept typing anyway?",
    "The system shows you've already been processed.",
    "Your clearance was approved yesterday. Or was it tomorrow?",
    "The records indicate you've already succeeded. Or failed.",
    "Access was granted in a parallel bureaucratic dimension.",
    "Your case was resolved before you arrived.",
    "The castle has already decided your fate. Fate is pending."
];

const loopResponses = [
    "The corridors loop back on themselves. You're going in circles.",
    "Round and round. The castle enjoys this game.",
    "You've been here before. You'll be here again.",
    "The loop tightens. Escape becomes harder.",
    "Circles within circles. The castle's favorite pattern.",
    "You're trapped in the castle's endless maze.",
    "The loop intensifies. Reality begins to blur.",
    "Round and round. The castle never gets tired.",
    "Stuck? Some choose to type 'exit' and abandon the pursuit...",
    "The bureaucratic loop is infinite. Infinity is finite.",
    "You're caught in the eternal processing cycle.",
    "The castle's logic is circular. Circles have no end.",
    "Reality loops back on itself. Self is reality.",
    "The maze has no exit. Exits are illusions.",
    "You're processing the same request eternally."
];

const exitResponses = [
    "Running away already?",
    "The exit door creaks open. But does it lead anywhere?",
    "Leaving so soon? The records will be incomplete.",
    "The coward's door awaits. But is it really an escape?",
    "Running from the castle? The castle runs from nothing.",
    "The exit beckons. But what lies beyond?",
    "Leaving the antechamber? The main chamber is worse.",
    "The door to freedom. Or is it another trap?",
    "Exit requests must be filed in triplicate.",
    "The exit is a bureaucratic construct. Constructs are eternal.",
    "Leaving requires authorization. Authorization requires leaving.",
    "The exit door leads to another antechamber.",
    "Freedom is a formality. Formalities are endless.",
    "The castle has no exits. Only entrances to other rooms.",
    "Exit is a state of mind. Mind is a state of castle."
];

// Stage 2 start
function startStage2() {
    // Track stage2 start
    if (window.gameAnalytics) {
        window.gameAnalytics.trackEvent('stage2_started', { timestamp: Date.now() });
    }
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
    
    // Start corridor sound after a short delay
    setTimeout(() => {
        startCorridorSound();
    }, 1000);
    
    // Start with new first message
    (async () => {
        await clerk("Before you go in, the officials require a key. It is a vital part of accessing your record...");
    })();
}

function addRecent(x) {
    recent.push(x);
    if (recent.length > 4) recent.shift();
}

// Brighten chatbox as user gets closer
function updateChatboxBrightness() {
    if (attempts >= 5) {
        chatbox.classList.add('brighten');
    }
}

// Auto hints with progressive system
setInterval(() => {
    if (!typing && !gameWon) {
        let hintInterval = 8; // Start with every 8 attempts
        
        if (attempts >= 12) {
            hintInterval = 6; // More frequent hints after 12 attempts
        } else if (attempts >= 8) {
            hintInterval = 7; // Medium frequency after 8 attempts
        }
        
        if (attempts >= 6 && attempts % hintInterval === 0 && !hintsEnabled) {
            hintsEnabled = true;
            let hintIndex;
            
            // Progressive hint selection
            if (attempts >= 15) {
                hintIndex = Math.floor(Math.random() * 5) + 10; // Most specific hints
            } else if (attempts >= 10) {
                hintIndex = Math.floor(Math.random() * 5) + 5; // Medium specific hints
            } else {
                hintIndex = Math.floor(Math.random() * 5); // General hints
            }
            
            const hint = hints[hintIndex];
            addRecent(hint);
            
            // Track hint usage
            if (window.gameAnalytics) {
                window.gameAnalytics.hintsUsed++;
                window.gameAnalytics.trackEvent('hint_given', { 
                    hintNumber: window.gameAnalytics.hintsUsed,
                    attempt: attempts 
                });
            }
            
            clerk(hint);
        }
    }
}, 20000);

// Exit hint - more frequent
setInterval(() => {
    if (!typing && attempts > 0 && attempts % 5 === 0 && !gameWon) {
        const hint = "Stuck? Some choose to type 'exit' and abandon the pursuit...";
        addRecent(hint);
        clerk(hint);
    }
}, 10000);

// Main input handler
inp.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && inp.value.trim() && !typing && !gameWon) {
        let txt = inp.value.trim();
        inp.value = '';
        attempts++;
        
        // Track attempt
        if (window.gameAnalytics) {
            window.gameAnalytics.attempts++;
            window.gameAnalytics.trackEvent('user_input', { 
                attempt: window.gameAnalytics.attempts, 
                input: txt.substring(0, 10) + '...' 
            });
        }
        
        await you(txt);
        txt = txt.toUpperCase();

        // Update chatbox brightness
        updateChatboxBrightness();

        // Check for win
        if (txt === correct) {
            await win();
            return;
        }

        // Check for exit commands
        if (/^EXIT$|^STOP$|^QUIT$/.test(txt)) {
            if (inLoop) {
                inLoop = false;
                loopIntensity = 0;
                await clerk("The loop breaks. Reality returns to normal.");
                return;
            }
        }

        // Check for bureaucratic dead ends
        if (/FORM 247-B|SUBMIT FORM|REQUEST FORM/.test(txt)) {
            await clerk("Form 247-B requires approval from the Department of Bureaucratic Forms. Department of Bureaucratic Forms: permanently closed due to bureaucratic restructuring.");
            return;
        }

        if (/DEPARTMENT OF ACCESS CONTROL|ACCESS CONTROL|CLEARANCE UPGRADE|UPGRADE CLEARANCE/.test(txt)) {
            await clerk("Department of Access Control is permanently closed for renovations. Renovations: ongoing since 2020. Estimated completion: never.");
            return;
        }

        if (/CENTRAL BUREAUCRATIC AUTHORITY|BUREAUCRATIC AUTHORITY|AUTHORITY/.test(txt)) {
            await clerk("Central Bureaucratic Authority is currently processing requests from 2020. Current processing queue: 47,892 requests ahead of yours.");
            return;
        }

        // Check for record requests (expanded)
        if (/RECORD|LOG|SHOW RECORDS|LIST RECORDS|WHAT RECORDS|RECORDS|FILES|DOCUMENTS|ACCESS LOG|SYSTEM LOG/.test(txt)) {
            await clerk(showRecords());
            return;
        }

        // Check for individual record viewing
        if (/^VIEW PHC\d{4}$/.test(txt)) {
            const recordId = txt.substring(5); // Extract the record number
            await clerk(showRecordDetail(recordId));
            return;
        }

        // Check for speaking with clerks directly
        if (/SPEAK TO CLERKS|CONTACT CLERKS|TALK TO CLERKS|CLERK ACCESS|ASK CLERKS|CLERK HELP/.test(txt)) {
            const response = filingClerkResponses[Math.floor(Math.random() * filingClerkResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for filing system questions
        if (/FILING SYSTEM|HOW RECORDS|WHERE RECORDS|RECORD SYSTEM|DOCUMENT SYSTEM/.test(txt)) {
            const responses = [
                "The filing system is accessible through the record log. Type 'record' or 'log' to view all records.",
                "Records are maintained by the filing clerks. All access attempts are logged and filed systematically.",
                "The record system contains all processed cases. Records are filed by date, status, and subject.",
                "The filing system operates on bureaucratic principles. All records are accessible to authorized personnel.",
                "Records are stored in the castle's memory. Memory is accessible through the record log command."
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for technical commands
        if (technicalCommands[txt.toLowerCase()]) {
            await clerk(technicalCommands[txt.toLowerCase()]);
            return;
        }

        // Check for filing clerk questions
        if (/FILING CLERK|CLERK/.test(txt)) {
            const response = filingClerkResponses[Math.floor(Math.random() * filingClerkResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for key questions
        if (/KEY|WHAT KEY/.test(txt)) {
            const response = keyResponses[Math.floor(Math.random() * keyResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for castle inhabitant questions
        if (/INHABITANT|WHO LIVES|LIVE HERE/.test(txt)) {
            const response = castleInhabitantResponses[Math.floor(Math.random() * castleInhabitantResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for purpose questions
        if (/PURPOSE|WHY|WHAT FOR/.test(txt)) {
            const response = purposeResponses[Math.floor(Math.random() * purposeResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for record questions
        if (/WHAT IS RECORD|RECORD IS/.test(txt)) {
            const response = recordResponses[Math.floor(Math.random() * recordResponses.length)];
            addRecent(response);
            await clerk(response);
            return;
        }

        // Check for hints
        if (/HINT|HELP|CLUE|GIVE ME/.test(txt)) {
            if (hintsEnabled) {
                const hint = hints[Math.floor(Math.random() * hints.length)];
                addRecent(hint);
                
                // Track hint request
                if (window.gameAnalytics) {
                    window.gameAnalytics.hintsUsed++;
                    window.gameAnalytics.trackEvent('hint_requested', { 
                        hintNumber: window.gameAnalytics.hintsUsed,
                        attempt: attempts 
                    });
                }
                
                await clerk(hint);
                return;
            } else {
                await clerk("Hints are not available yet. Keep trying.");
                return;
            }
        }

        // Check for RUSHEEN
        if (/RUSHEEN/.test(txt)) {
            const rusheenLines = [
                "Ah... you know the Architect. The Game Master watches closely.",
                "Rusheen smiles in the shadows.",
                "The Architect whispers: 'Keep going.'",
                "A hidden door rattles when you utter that name."
            ];
            const m = rusheenLines[Math.floor(Math.random() * rusheenLines.length)];
            addRecent(m);
            await clerk(m);
            return;
        }

        // Check for false flag record numbers
        if (/^PHC\d{4}$/.test(txt)) {
            const responses = [
                `Department of Lost Causes received record ${txt}. They deny existing.`,
                `Record ${txt} routed to Office 404. Expect no reply.`,
                `Clerk stamps ${txt} twice, then sets it ablaze.`,
                `System acknowledges record ${txt}. System also laughs.`
            ];
            const resp = responses[Math.floor(Math.random() * 4)];
            addRecent(resp);
            await clerk(resp);
            return;
        }

        // Loop detection and intensification
        if (attempts > 5 && Math.random() < 0.3) {
            inLoop = true;
            loopIntensity++;
            
            if (loopIntensity >= 3) {
                const loopResponse = loopResponses[Math.floor(Math.random() * loopResponses.length)];
                addRecent(loopResponse);
                await clerk(loopResponse);
                return;
            }
        }

        // Misdirection after 5 attempts
        if (attempts > 5 && Math.random() < 0.3) {
            let m;
            do {
                m = misdirect[Math.floor(Math.random() * misdirect.length)];
            } while (recent.includes(m));
            addRecent(m);
            await clerk(m);
            return;
        }

        // Default chatter
        let r;
        do {
            r = chatter[Math.floor(Math.random() * chatter.length)];
        } while (recent.includes(r));
        addRecent(r);
        await clerk(r);
    }
});

// Enhanced win function
async function win() {
    gameWon = true;
    inp.disabled = true;
    inp.placeholder = "Access granted";
    
    // Stop the timer
    clearInterval(timerInterval);
    
    // Stop corridor sound
    stopCorridorSound();
    
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = (minutes > 0 ? minutes + 'm ' : '') + seconds + 's';
    
    let msg = "Access granted. Welcome within.";
    
    // Try to get location info, but don't include it if it fails
    try {
        const data = await fetch('https://ipapi.co/json/').then(r => r.json());
        if (data.city && data.region) {
            msg += `\nWe see you are connecting from ${data.city}, ${data.region}.`;
        }
    } catch (error) {
        console.log('IP lookup failed:', error);
        // Don't include location info if lookup fails
    }
    
    await clerk(msg);
    
    // Track completion
    if (window.gameAnalytics) {
        window.gameAnalytics.completionTime = Date.now() - window.gameAnalytics.startTime;
        window.gameAnalytics.trackEvent('stage2_completed', { 
            completionTime: window.gameAnalytics.completionTime,
            attempts: window.gameAnalytics.attempts,
            hintsUsed: window.gameAnalytics.hintsUsed,
            recordsViewed: window.gameAnalytics.recordsViewed
        });
    }
    
    const html = `
        <div id="winModal">
            <div class="modalContent">
                <button class="closeBtn">&times;</button>
                <h2 class="gold">Congratulations</h2>
                <p>You unlocked the castle in <strong>${timeStr}</strong>.</p>
                <p>Perhaps now… you'll understand less than before.</p>
                <button class="shareBtn" onclick="shareResult('${timeStr}')">Share Result</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Close modal functionality
    const winModal = document.getElementById('winModal');
    const closeBtn = document.querySelector('.closeBtn');
    
    closeBtn.onclick = () => winModal.remove();
    winModal.onclick = (e) => {
        if (e.target === winModal) winModal.remove();
    };
}

// Share functionality
async function shareResult(timeStr) {
    const shareText = `I beat the castle in ${timeStr} - think you can do it faster?`;
    const shareBtn = document.querySelector('.shareBtn');
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: "Kafka's Castle",
                text: shareText,
                url: window.location.href
            });
        } else {
            await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        }
        
        shareBtn.textContent = "Link copied!";
        shareBtn.classList.add('copied');
        
        setTimeout(() => {
            shareBtn.textContent = "Share Result";
            shareBtn.classList.remove('copied');
        }, 5000);
    } catch (error) {
        console.log('Share failed:', error);
    }
}

// Enhanced exit modal
function openExit() {
    if (modal) {
        modal.classList.remove('hidden');
        return;
    }
    
    const exitResponse = exitResponses[Math.floor(Math.random() * exitResponses.length)];
    
    const html = `
        <div class="modalOverlay" id="exitModal">
            <div class="modalBox">
                <h3 class="gold">Coward's Door</h3>
                <p>${exitResponse}</p>
                <div>
                    <button id="yesQuit">Yes</button>
                    <button id="noStay">No</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('exitModal');
    
    document.getElementById('yesQuit').onclick = () => location.href = 'index.html';
    document.getElementById('noStay').onclick = () => {
        document.getElementById('exitModal').remove();
        modal = null; // Reset modal so it can be opened again
    };
}

exitBtn.addEventListener('click', openExit);

// Check if loading is already complete (for direct navigation)
if (document.readyState === 'complete') {
    checkLoadingComplete();
} else {
    window.addEventListener('load', checkLoadingComplete);
}
