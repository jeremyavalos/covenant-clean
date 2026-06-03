import {
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import { Image, type ImageContentPosition } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  intensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'splash' | 'language' | 'transition' | 'habits' | 'habit' | 'deeper';
  habitSlug?: string | null;
};

const overlayOpacity = {
  subtle: 0.68,
  medium: 0.62,
  strong: 0.56,
};

const sources: Record<NonNullable<Props['variant']>, ImageSourcePropType> = {
  splash: require('../assets/images/covenant-ritual-bg.png'),
  language: require('../assets/images/covenant-language-bg.png'),
  transition: require('../assets/images/covenant-transition-bg.png'),
  habits: require('../assets/images/covenant-ritual-bg.png'),
  habit: require('../assets/images/covenant-habit-bg.png'),
  deeper: require('../assets/images/covenant-deeper-bg.png'),
};

const habitSources: Record<string, ImageSourcePropType> = {
  coldShower: require('../assets/images/habits/coldShower-bg.png'),
  exercise: require('../assets/images/habits/exercise-bg.png'),
  dominateMind: require('../assets/images/habits/dominateMind-bg.png'),
  mentalStrength: require('../assets/images/habits/mentalStrength-bg.png'),
  noVices: require('../assets/images/habits/noVices-bg.png'),
  writing: require('../assets/images/habits/writing-bg.png'),
  gratitude: require('../assets/images/habits/gratitude-bg.png'),
  silence: require('../assets/images/habits/silence-bg.png'),
  meditation: require('../assets/images/habits/meditation-bg.png'),
  discipline: require('../assets/images/habits/discipline-bg.png'),
};

const imageFocus: Record<NonNullable<Props['variant']>, ImageContentPosition> = {
  splash: { top: '45%', left: '50%' },
  language: { top: '48%', left: '50%' },
  transition: { top: '46%', left: '50%' },
  habits: { top: '45%', left: '50%' },
  habit: { top: '42%', left: '50%' },
  deeper: { top: '48%', left: '50%' },
};

export default function CovenantBackdrop({
  intensity = 'medium',
  variant = 'splash',
  habitSlug,
}: Props) {
  const source =
    habitSlug && habitSources[habitSlug]
      ? habitSources[habitSlug]
      : sources[variant];

  return (
    <View pointerEvents="none" style={styles.container}>
      <Image
        source={source}
        contentFit="contain"
        contentPosition={imageFocus[variant]}
        style={[StyleSheet.absoluteFill, styles.imageLayer]}
      />
      <LinearGradient
        colors={[
          'rgba(3,3,3,0.38)',
          'rgba(3,3,3,0.08)',
          'rgba(3,3,3,0.42)',
        ]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.darkVeil,
          {
            backgroundColor: `rgba(0,0,0,${overlayOpacity[intensity]})`,
          },
        ]}
      />
      <LinearGradient
        colors={[
          'rgba(216,140,58,0.18)',
          'rgba(216,140,58,0.035)',
          'rgba(22,10,4,0.34)',
        ]}
        start={{ x: 0.18, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.copperVeil}
      />
      <View style={styles.ambientHalo} />
      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0)']}
        style={styles.topVignette}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.bottomVignette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#040302',
  },

  imageLayer: {
    opacity: 0.88,
  },

  darkVeil: {
    ...StyleSheet.absoluteFillObject,
  },

  copperVeil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },

  ambientHalo: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(216,140,58,0.10)',
    opacity: 0.72,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.34,
    shadowRadius: 80,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },

  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 460,
  },
});
