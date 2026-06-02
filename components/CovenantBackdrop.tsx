import {
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import { Image, type ImageContentPosition } from 'expo-image';

type Props = {
  intensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'splash' | 'language' | 'transition' | 'habits' | 'habit' | 'deeper';
};

const overlayOpacity = {
  subtle: 0.8,
  medium: 0.7,
  strong: 0.6,
};

const sources: Record<NonNullable<Props['variant']>, ImageSourcePropType> = {
  splash: require('../assets/images/covenant-ritual-bg.png'),
  language: require('../assets/images/covenant-language-bg.png'),
  transition: require('../assets/images/covenant-transition-bg.png'),
  habits: require('../assets/images/covenant-ritual-bg.png'),
  habit: require('../assets/images/covenant-habit-bg.png'),
  deeper: require('../assets/images/covenant-deeper-bg.png'),
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
}: Props) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <Image
        source={sources[variant]}
        contentFit="cover"
        contentPosition={imageFocus[variant]}
        style={[StyleSheet.absoluteFill, styles.imageLayer]}
      />
      <View
        style={[
          styles.darkVeil,
          {
            backgroundColor: `rgba(0,0,0,${overlayOpacity[intensity]})`,
          },
        ]}
      />
      <View style={styles.copperVeil} />
      <View style={styles.topVignette} />
      <View style={styles.bottomVignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030303',
  },

  imageLayer: {
    opacity: 0.92,
  },

  darkVeil: {
    ...StyleSheet.absoluteFillObject,
  },

  copperVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(216,110,34,0.065)',
  },

  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },

  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
});
