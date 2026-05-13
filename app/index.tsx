import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Screen from '../components/Screen';
import { colors } from '../constants/theme';

export default function WelcomeScreen() {
  return (
    <Screen backdropIntensity="strong" backdropVariant="splash">
      <View style={styles.container}>
        <View style={styles.mark}>
          <View style={styles.ring} />
          <View style={styles.innerFlame} />
        </View>

        <Text style={styles.kicker}>SELF CONFRONTATION</Text>

        <Text style={styles.title}>COVENANT</Text>

        <Text style={styles.copy}>
          Esta app es para quien quiere ser honesto consigo mismo.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.copySecondary}>
          This app is for those who want to be honest with themselves.
        </Text>

        <Pressable
          onPress={() => router.push('/language')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>ENTER THE RITUAL</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 76,
  },

  mark: {
    width: 154,
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 54,
  },

  ring: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.48)',
    shadowColor: colors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  innerFlame: {
    width: 10,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(216,140,58,0.68)',
    shadowColor: colors.accent,
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  kicker: {
    color: '#B9793A',
    fontSize: 10,
    letterSpacing: 7,
    marginBottom: 22,
  },

  title: {
    color: colors.text,
    fontSize: 54,
    fontWeight: '300',
    letterSpacing: 6,
    marginBottom: 28,
  },

  copy: {
    color: '#EFE1D0',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 26,
  },

  divider: {
    width: 62,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.5)',
    marginBottom: 26,
  },

  copySecondary: {
    color: colors.soft,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 58,
  },

  button: {
    width: '100%',
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.46)',
    backgroundColor: 'rgba(216,110,34,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 14,
    },
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  buttonText: {
    color: '#FFD1A0',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '700',
  },
});
