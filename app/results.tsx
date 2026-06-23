import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ResultsPage() {
  return (
    <View style={styles.container}>
      <Text>Results Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
