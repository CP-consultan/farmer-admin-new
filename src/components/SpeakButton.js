import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { Feather } from '@expo/vector-icons';

const SpeakButton = ({ text, language = 'ur', style }) => {
  const speak = () => {
    if (!text) return;

    Speech.stop();

    const speakWithFallback = (lang) => {
      Speech.speak(text, {
        language: lang,
        pitch: 1,
        rate: 0.9,
        onError: (error) => {
          console.warn(`Speech failed for ${lang}:`, error);
          if (lang === 'ur') {
            speakWithFallback('en');
          } else {
            Alert.alert('Sorry', 'Text‑to‑speech is not available for this text on your device.');
          }
        },
      });
    };

    speakWithFallback('ur');
  };

  return (
    <TouchableOpacity onPress={speak} style={[styles.button, style]}>
      <Feather name="volume-2" size={20} color="#2d6a4f" />
      <Text style={styles.text}>Listen</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SpeakButton;
