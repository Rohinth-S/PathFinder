import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';

function FloatingStar({ initialX, initialY, size, delay, duration }: any) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    // Floating motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, // float up
          duration: duration,
          useNativeDriver: true,
          delay: delay,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glowing motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9, // bright glow
          duration: duration * 0.8,
          useNativeDriver: true,
          delay: delay,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.1, // dim out
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, glowAnim, delay, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: initialY,
        left: initialX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        opacity: glowAnim,
        transform: [{ translateY: floatAnim }],
        // React Native shadows
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        // @ts-ignore - Web specific outer glow
        boxShadow: '0px 0px 8px 1px rgba(255,255,255,0.7)',
      }}
    />
  );
}

export default function Starfield({ count = 40 }: { count?: number }) {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    // Generate stars on client to ensure random values match after hydration
    const newStars = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1, // 1px to 3px
      delay: Math.random() * 4000,
      duration: Math.random() * 3000 + 4000, // 4s to 7s
    }));
    setStars(newStars);
  }, [count]);

  return (
    <View 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }} 
      pointerEvents="none"
    >
      {stars.map((s) => (
        <FloatingStar key={s.id} initialX={s.x} initialY={s.y} size={s.size} delay={s.delay} duration={s.duration} />
      ))}
    </View>
  );
}
