import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { UI } from '../../constants/colors';

const { width } = Dimensions.get('window');
const PARTICLE_COUNT = 40;
const CHARACTERS = ['0', '1', 'f(x)', '+', '{ }', '()', '/>', '42', '∑', '∞', 'const', '=>', 'import', 'export'];

function Particle({ index }: { index: number }) {
  const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const randomX = Math.random() * width;
  const startY = Math.random() * 800;
  const isOrange = Math.random() > 0.85; // 15% orange
  const fontSize = 10 + Math.random() * 14;
  
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = 20000 + Math.random() * 15000;
    const delay = Math.random() * 5000;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(startY - 150 - Math.random() * 100, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(isOrange ? 0.20 : 0.08, { duration: duration / 2, easing: Easing.ease }),
          withTiming(0, { duration: duration / 2, easing: Easing.ease })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          left: randomX,
          top: 0,
          color: isOrange ? UI.accent : '#FFFFFF',
          fontSize,
          fontFamily: 'JetBrainsMono_700Bold',
          zIndex: 0,
        },
        animatedStyle,
      ]}
    >
      {randomChar}
    </Animated.Text>
  );
}

export function FloatingParticles() {
  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
}
