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
import { UI, L } from '../../constants/colors';

const { width } = Dimensions.get('window');
const PARTICLE_COUNT = 30;

function Bubble({ index }: { index: number }) {
  const size = 15 + Math.random() * 45;
  const randomX = Math.random() * width;
  const startY = Math.random() * 1200; // Increased range to cover the whole screen and then some
  
  // Reverting to white bubbles as requested by user
  const color = '#FFFFFF';
  
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = 25000 + Math.random() * 20000;
    const delay = Math.random() * 5000;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(startY - 400 - Math.random() * 300, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        true
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20 + Math.random() * 30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-(20 + Math.random() * 30), { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Slightly higher opacity to be visible against tinted backgrounds
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: duration / 2, easing: Easing.ease }),
          withTiming(0.02, { duration: duration / 2, easing: Easing.ease })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: randomX,
          top: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          zIndex: 100,
        },
        animatedStyle,
      ]}
    />
  );
}

export function FloatingParticles() {
  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 100, elevation: 100 }} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Bubble key={i} index={i} />
      ))}
    </View>
  );
}
