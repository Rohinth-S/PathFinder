import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { UI } from '../../constants/colors';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function VerifiedBadge({ size = 'medium', showText = true }: VerifiedBadgeProps) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  const iconSize = isSmall ? 12 : isLarge ? 18 : 14;
  const fontSize = isSmall ? 9 : isLarge ? 12 : 10;
  
  return (
    <View style={styles.container}>
      <MaterialIcons name="verified" size={iconSize} color={UI.accent} />
      {showText && (
        <Text style={[styles.text, { fontSize }]}>
          VERIFIED
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64, 224, 208, 0.1)', // Subtle teal tint
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(64, 224, 208, 0.2)',
    alignSelf: 'flex-start',
    gap: 4,
  },
  text: {
    fontFamily: 'Manrope_700Bold',
    color: UI.accent,
    letterSpacing: 0.5,
  }
});
