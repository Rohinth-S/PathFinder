import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function AmbientGlow({ size, initialX, initialY, translateX, translateY, duration, delay, opacity }: any) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pan, {
          toValue: { x: translateX, y: translateY },
          duration: duration,
          useNativeDriver: true,
          delay: delay,
        }),
        Animated.timing(pan, {
          toValue: { x: 0, y: 0 },
          duration: duration,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pan, translateX, translateY, duration, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: initialY,
        left: initialX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity: opacity,
        transform: pan.getTranslateTransform(),
        // @ts-ignore - Web specific styling for massive soft blur
        filter: 'blur(120px)',
      }}
    />
  );
}

export default function AmbientBackground() {
  return (
    <View 
      style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        overflow: 'hidden', zIndex: 0, backgroundColor: '#000000' 
      }} 
      pointerEvents="none"
    >
      {/* 
        These three giant glowing orbs slowly drift around the screen,
        creating a premium, moody, shifting ambient light effect.
      */}
      <AmbientGlow 
        size={800} 
        initialX={-200} 
        initialY={-200} 
        translateX={300} 
        translateY={250} 
        duration={25000} 
        delay={0} 
        opacity={0.03} 
      />
      <AmbientGlow 
        size={600} 
        initialX={width - 300} 
        initialY={height / 2} 
        translateX={-400} 
        translateY={-300} 
        duration={35000} 
        delay={2000} 
        opacity={0.02} 
      />
      <AmbientGlow 
        size={1000} 
        initialX={width / 4} 
        initialY={height} 
        translateX={200} 
        translateY={-600} 
        duration={45000} 
        delay={4000} 
        opacity={0.015} 
      />

      {/* Subtle geometric grain overlay (using a tiny transparent repeating pattern to avoid pure black banding) */}
      <View 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.1,
          // @ts-ignore
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </View>
  );
}
