# Kafka's Castle v8.2

A surreal, Kafkaesque chat-based puzzle game where players navigate bureaucratic labyrinths to unlock the castle's secrets.

## 🎮 Game Overview

Players must discover the correct access code (`PHC-CYBER-2025`) through conversation with a mysterious clerk, while navigating through records, hints, and bureaucratic dead ends.

## ✨ Enhanced Features

### 🚀 Performance & Loading Optimizations
- **Loading Screen**: Professional loading spinner with castle-themed messaging
- **Error Boundaries**: Graceful error handling with user-friendly recovery options
- **Asset Preloading**: Critical resources preloaded for faster initial load
- **Service Worker**: Offline functionality and caching for improved performance
- **PWA Support**: Web app manifest for mobile installation

### 🎵 Immersion & Feedback
- **Sound Effects**: Subtle audio feedback for typing, completion, and key unlocking
- **Visual Feedback**: 
  - Chatbox brightens as user approaches the solution
  - Typing indicators and focus states
  - Glowing key animation when unlocked
  - Pulse and glow animations for important elements
- **Progressive Background**: Background brightens as user gets closer to the solution

### ♿ Accessibility Improvements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility with focus indicators
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Reduced Motion**: Respects user preferences for motion sensitivity
- **Mobile Responsive**: Optimized for touch devices and small screens

### 🎯 User Experience Enhancements
- **Enhanced Chat System**: Dynamic, contextual responses that reference user input
- **Progressive Hint System**: 
  - Auto-hints that become more specific over time
  - On-demand hints available after 6 attempts
  - Subtle, discovery-based hint delivery
- **Record Log System**: 
  - Detailed bureaucratic records with status indicators
  - Individual record viewing with `view [record]` command
  - Redacted information and false flags
- **Exit System**: Varied responses for repeated exit attempts
- **Win Modal**: Enhanced completion screen with sharing capabilities

### 🔍 Puzzle & Gameplay
- **Red Herrings**: Bureaucratic dead ends and false clues
- **Technical Commands**: Realistic system command responses
- **Loop Detection**: Intensifying responses for repetitive behavior
- **Misdirection**: Psychological elements that challenge player assumptions
- **Strict Access Control**: Game becomes inaccessible after winning

### 📊 Analytics & Tracking
- **Comprehensive Analytics**: Track attempts, hints, records viewed, completion time
- **Event Tracking**: Detailed logging of user interactions and game progression
- **Performance Monitoring**: Load times and error tracking
- **User Behavior Analysis**: Input patterns and solution discovery methods

### 🛠 Technical Improvements
- **Error Handling**: Robust error boundaries and graceful degradation
- **Code Quality**: Modular functions, clear variable naming, comprehensive comments
- **Cross-browser Compatibility**: Works across modern browsers
- **Mobile Optimization**: Touch-friendly interface and responsive design

## 🎲 Game Mechanics

### Stage 1: The Gates
- Players must respond to the clerk's questions
- After 3 responses, the key appears
- Dynamic dialogue that references user input

### Stage 2: The Antechamber
- Timer-based challenge to find the access code
- Progressive hint system (auto + on-demand)
- Record log system with detailed entries
- Multiple interaction paths and dead ends

### The Solution
The correct access code is: `PHC-CYBER-2025`
- Format: Letters-Numbers-Letters (like record numbers)
- Hidden in plain sight through record system
- Requires understanding of bureaucratic patterns

## 🎨 Visual Design

- **Dark, atmospheric aesthetic** with gold accents
- **Kafkaesque typography** and minimalist interface
- **Smooth animations** and transitions
- **Responsive layout** that works on all devices
- **Accessibility-first** design principles

## 🚀 Installation & Deployment

1. **Local Development**:
   ```bash
   # Serve with any static file server
   python -m http.server 8000
   # or
   npx serve .
   ```

2. **Production Deployment**:
   - Upload all files to web server
   - Service worker will cache resources automatically
   - PWA features enable mobile installation

## 📱 PWA Features

- **Offline Support**: Game works without internet connection
- **Mobile Installation**: Can be installed as native app
- **Background Sync**: Automatic updates when online
- **Push Notifications**: Ready for future notification features

## 🔧 Customization

### Adding New Responses
Edit the response arrays in `script.js` and `stage2.js`:
- `firstLines`, `stage1Responses`, `stage2Responses`
- `filingClerkResponses`, `keyResponses`, etc.

### Modifying Hints
Update the `hints` array in `stage2.js` to adjust hint progression and content.

### Changing Records
Modify the `records` array in `stage2.js` to add new bureaucratic records.

## 🎯 Difficulty Settings

The game automatically adjusts difficulty through:
- **Progressive hint timing** (every 8→7→6 attempts)
- **Contextual responses** based on user behavior
- **Loop detection** for repetitive patterns
- **Misdirection** after 5+ attempts

## 📊 Analytics Events

Tracked events include:
- `game_started` / `stage2_started`
- `user_input` (with attempt count)
- `hint_given` / `hint_requested`
- `records_viewed`
- `game_completed` / `stage2_completed`
- `stage2_entered`

## 🔮 Future Enhancements

Potential additions:
- **Sound Effects Toggle**: User preference for audio
- **Difficulty Modes**: Easy/Medium/Hard settings
- **Achievement System**: Unlockable achievements
- **Leaderboards**: Global completion time rankings
- **Multiple Endings**: Different castle sections to explore
- **Voice Synthesis**: Text-to-speech for accessibility

## 🐛 Known Issues

- Audio context requires user interaction on some browsers
- Service worker requires HTTPS for full functionality
- Some older browsers may not support all PWA features

## 📄 License

This project is open source and available under the MIT License.

---

*"The castle's bureaucracy is eternal. Your patience is not."* 