import React, { forwardRef } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  scaleTo?: number;
  hapticFeedback?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const PressableScale = forwardRef<any, PressableScaleProps>(
  (
    {
      scaleTo = 0.96,
      hapticFeedback = true,
      hapticStyle = Haptics.ImpactFeedbackStyle.Light,
      children,
      style,
      containerStyle,
      onPressIn,
      onPressOut,
      onPress,
      ...rest
    },
    ref
  ) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = (e: any) => {
      scale.value = withSpring(scaleTo, {
        mass: 0.5,
        damping: 12,
        stiffness: 150,
      });
      if (hapticFeedback) {
        Haptics.impactAsync(hapticStyle);
      }
      onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
      scale.value = withSpring(1, {
        mass: 0.5,
        damping: 12,
        stiffness: 150,
      });
      onPressOut?.(e);
    };

    return (
      <AnimatedPressable
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[containerStyle, animatedStyle, style]}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }
);
