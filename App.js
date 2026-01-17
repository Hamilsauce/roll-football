import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { GameState } from './GameState';
import { executePassPlay, executeRunPlay } from './GameLogic';

export default function App() {
  const [gameState, setGameState] = useState(new GameState());
  const [lastOutcome, setLastOutcome] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingValue, setRollingValue] = useState(null);
  
  // Animation values
  const dieScale = useRef(new Animated.Value(1)).current;
  const dieRotation = useRef(new Animated.Value(0)).current;
  const outcomeOpacity = useRef(new Animated.Value(0)).current;
  const outcomeScale = useRef(new Animated.Value(0.5)).current;
  const buttonShake = useRef(new Animated.Value(0)).current;
  
  // Sound effects (we'll create simple beeps using system sounds)
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  }, []);

  const playSound = async (type) => {
    try {
      // Sound system - in production, load actual sound files from assets
      // For now, this is a placeholder that won't cause errors
      // To add sounds: place .mp3/.wav files in assets/sounds/ and load them here
      // Example: const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/touchdown.mp3'));
      
      // Placeholder - actual sound loading would go here
      // The animation provides visual feedback instead
    } catch (error) {
      // Silently fail if audio doesn't work - animations provide feedback
    }
  };

  const animateDiceRoll = (callback) => {
    // Start rolling animation
    setRollingValue('?');
    
    // Create rolling animation
    const rollAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(dieScale, {
            toValue: 1.3,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dieScale, {
            toValue: 1,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(dieRotation, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 5 }
    );

    rollAnimation.start();
    
    // Show random numbers while rolling
    const rollInterval = setInterval(() => {
      setRollingValue(Math.floor(Math.random() * 20) + 1);
    }, 100);

    // After animation, show result
    setTimeout(() => {
      clearInterval(rollInterval);
      rollAnimation.stop();
      dieRotation.setValue(0);
      
      // Show final result with pop animation
      Animated.parallel([
        Animated.spring(dieScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(outcomeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(outcomeScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      callback();
    }, 1000);
  };

  const handlePlay = (playType) => {
    if (isRolling || gameState.gameOver) return;
    
    setIsRolling(true);
    outcomeOpacity.setValue(0);
    outcomeScale.setValue(0.5);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonShake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
    
    animateDiceRoll(() => {
      let outcome;
      if (playType === 'PASS') {
        outcome = executePassPlay();
      } else {
        outcome = executeRunPlay();
      }

      setRollingValue(outcome.roll);

      // Play appropriate sound
      if (outcome.type === 'TOUCHDOWN' || outcome.type === 'FUMBLE_TD' || outcome.type === 'INTERCEPTION_TD') {
        playSound('touchdown');
      } else if (outcome.type === 'INTERCEPTION' || outcome.type === 'FUMBLE') {
        playSound('turnover');
      } else if (outcome.yards > 0) {
        playSound('gain');
      } else {
        playSound('incomplete');
      }

      const newGameState = new GameState();
      Object.assign(newGameState, gameState);
      newGameState.processPlayOutcome(outcome);
      
      setLastOutcome(outcome);
      setGameState(newGameState);
      setIsRolling(false);
    });
  };

  const resetGame = () => {
    setGameState(new GameState());
    setLastOutcome(null);
    setRollingValue(null);
    setIsRolling(false);
    outcomeOpacity.setValue(0);
    outcomeScale.setValue(0.5);
    dieScale.setValue(1);
    dieRotation.setValue(0);
  };

  const spinInterpolate = dieRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={[styles.scoreColumn, gameState.currentOffense === 1 && styles.activeOffense]}>
          <Text style={styles.playerLabel}>Player 1</Text>
          <Text style={styles.score}>{gameState.player1Score}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
        </View>
        <View style={[styles.scoreColumn, gameState.currentOffense === 2 && styles.activeOffense]}>
          <Text style={styles.playerLabel}>Player 2</Text>
          <Text style={styles.score}>{gameState.player2Score}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Field Position and Down Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>
            {gameState.getCurrentOffenseName()} on Offense
          </Text>
          <Text style={styles.infoText}>
            {gameState.getFieldPositionString()}
          </Text>
          <Text style={styles.infoText}>
            {gameState.down} & {gameState.yardsToGo}
          </Text>
        </View>

        {/* Last Play Outcome */}
        {(lastOutcome || isRolling) && (
          <Animated.View 
            style={[
              styles.outcomeContainer,
              {
                opacity: isRolling ? 1 : outcomeOpacity,
                transform: [
                  { scale: isRolling ? 1 : outcomeScale }
                ]
              }
            ]}
          >
            <View style={styles.dieResult}>
              <Text style={styles.dieLabel}>Roll:</Text>
              <Animated.View
                style={[
                  styles.dieContainer,
                  {
                    transform: [
                      { scale: dieScale },
                      { rotate: spinInterpolate }
                    ]
                  }
                ]}
              >
                <Text style={styles.dieValue}>
                  {rollingValue !== null ? rollingValue : (lastOutcome?.roll || '?')}
                </Text>
              </Animated.View>
            </View>
            {lastOutcome && (
              <>
                <Text style={[
                  styles.outcomeDescription,
                  lastOutcome.type === 'TOUCHDOWN' && styles.touchdownText,
                  lastOutcome.type === 'INTERCEPTION_TD' && styles.turnoverText,
                  lastOutcome.type === 'FUMBLE_TD' && styles.turnoverText,
                ]}>
                  {lastOutcome.description}
                </Text>
                {lastOutcome.yards > 0 && (
                  <Text style={styles.yardsText}>
                    +{lastOutcome.yards} yards
                  </Text>
                )}
                {lastOutcome.points !== 0 && (
                  <Text style={[
                    styles.pointsText,
                    lastOutcome.points > 0 ? styles.pointsPositive : styles.pointsNegative
                  ]}>
                    {lastOutcome.points > 0 ? '+' : ''}{lastOutcome.points} points
                  </Text>
                )}
              </>
            )}
            {isRolling && !lastOutcome && (
              <Text style={styles.rollingText}>Rolling...</Text>
            )}
          </Animated.View>
        )}

        {/* Play Selection */}
        {!gameState.gameOver && (
          <View style={styles.playSelection}>
            <Text style={styles.selectPlayText}>Select a Play:</Text>
            <View style={styles.buttonRow}>
              <Animated.View
                style={{
                  transform: [{ translateX: buttonShake }]
                }}
              >
                <TouchableOpacity
                  style={[styles.playButton, styles.passButton, isRolling && styles.buttonDisabled]}
                  onPress={() => handlePlay('PASS')}
                  disabled={isRolling}
                >
                  <Text style={styles.playButtonText}>PASS</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View
                style={{
                  transform: [{ translateX: buttonShake }]
                }}
              >
                <TouchableOpacity
                  style={[styles.playButton, styles.runButton, isRolling && styles.buttonDisabled]}
                  onPress={() => handlePlay('RUN')}
                  disabled={isRolling}
                >
                  <Text style={styles.playButtonText}>RUN</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        )}

        {/* Game History */}
        {gameState.gameHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Plays</Text>
            {gameState.gameHistory.slice(-5).reverse().map((play, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  P{play.offense} - {play.playType}: Roll {play.roll} - {play.outcome.description}
                  {play.outcome.yards > 0 && ` (+${play.outcome.yards} yds)`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2d6a4f',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#081c15',
  },
  scoreColumn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  activeOffense: {
    backgroundColor: '#40916c',
    borderWidth: 2,
    borderColor: '#ffd60a',
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  vsContainer: {
    paddingHorizontal: 15,
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gameInfo: {
    backgroundColor: '#2d6a4f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginVertical: 3,
  },
  outcomeContainer: {
    backgroundColor: '#40916c',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd60a',
  },
  dieResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  dieLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 10,
    fontWeight: '600',
  },
  dieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd60a',
    backgroundColor: '#081c15',
    width: 60,
    height: 60,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ffffff',
    lineHeight: 60,
  },
  outcomeDescription: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  yardsText: {
    fontSize: 18,
    color: '#d4e09b',
    marginTop: 5,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  pointsPositive: {
    color: '#52b788',
  },
  pointsNegative: {
    color: '#e63946',
  },
  touchdownText: {
    fontSize: 28,
    color: '#ffd60a',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  turnoverText: {
    fontSize: 24,
    color: '#e63946',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rollingText: {
    fontSize: 20,
    color: '#ffffff',
    fontStyle: 'italic',
    marginTop: 10,
  },
  playSelection: {
    marginBottom: 20,
  },
  selectPlayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  playButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#1e6091',
  },
  runButton: {
    backgroundColor: '#9d4edd',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  historyContainer: {
    backgroundColor: '#2d6a4f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  historyItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#40916c',
  },
  historyText: {
    fontSize: 14,
    color: '#d4e09b',
  },
  resetButton: {
    backgroundColor: '#d00000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
