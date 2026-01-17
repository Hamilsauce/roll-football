# Roll Football Game

A turn-based, roll-based mobile football game built with React Native and Expo.

## Game Rules

### PASS Play (20-sided die)
- **1**: Interception Touchdown (6 points for opponent)
- **2-3**: Interception (possession changes)
- **4-9**: Pass Incomplete
- **10-11**: Pass Complete (2 Yards)
- **12-14**: Pass Complete (5 Yards)
- **15-17**: Pass Complete (10 Yards)
- **18**: Pass Complete (20 Yards)
- **19**: Pass Complete (30 Yards)
- **20**: Touchdown! (6 points)

### RUN Play (20-sided die)
- **1**: Fumble Return for Touchdown (6 points for opponent)
- **2**: Fumble (possession changes)
- **3-6**: No Gain
- **7-8**: 2 Yard Gain
- **9-10**: 5 Yard Gain
- **11-14**: 10 Yard Gain
- **15-16**: 15 Yard Gain
- **17-18**: 20 Yard Gain
- **19**: 25 Yard Gain
- **20**: Touchdown! (6 points)

## Features

- Turn-based gameplay with automatic possession switching
- Score tracking for both players
- Field position tracking
- Down and distance management
- Game history logging
- **Animated dice rolling** with visual feedback
- **Sound effects system** (ready for audio files)
- Visual outcome animations
- Color-coded results (green for positive, red for negative)
- Clean, football-themed UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Generate placeholder assets:
```bash
./generate-placeholders.sh
```
Or manually create placeholder images as described in `assets/README.md`

3. Start the Expo development server:
```bash
npm start
```

4. Run on your device:
   - Install the Expo Go app on your mobile device
   - Scan the QR code with your camera (iOS) or the Expo Go app (Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## QR Code Troubleshooting

If the QR code doesn't open the app on your phone, it usually means the phone
can't reach your dev server on the local network. Try one of these:

- Use a tunnel (works on restrictive networks):
```bash
npm run start:tunnel
```
- Force LAN mode if the QR code defaulted to something else:
```bash
npm run start:lan
```
- Make sure your phone and computer are on the same Wi-Fi network

## Project Structure

- `App.js` - Main game component and UI
- `GameState.js` - Game state management class
- `GameLogic.js` - Play execution logic and rules
- `package.json` - Dependencies and scripts

## Adding Sound Effects

1. Place sound effect files in `assets/sounds/` directory:
   - `touchdown.mp3` - Touchdown sound
   - `turnover.mp3` - Interception/fumble sound
   - `gain.mp3` - Positive yardage sound
   - `incomplete.mp3` - Incomplete/no gain sound

2. Update `App.js` `playSound()` function to load actual sound files:
```javascript
const { sound } = await Audio.Sound.createAsync(
  require('./assets/sounds/touchdown.mp3')
);
await sound.playAsync();
```

## Future Enhancements

- Online multiplayer support
- More detailed field visualization
- Play calling strategies
- Game statistics
- Customizable rules
- Animations and sound effects
