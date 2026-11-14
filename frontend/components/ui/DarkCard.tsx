import React from 'react';
import { View, ViewStyle } from 'react-native';
import { UI } from '../../constants/colors';

type DarkCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Navy/dark-surface card for emphasis sections — AI insights, key metrics.
 * Uses surfaceInverse bg with onDark text colors.
 */
export function DarkCard({ children, style }: DarkCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: UI.surfaceInverse,
          borderRadius: 16,
          padding: 20,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
