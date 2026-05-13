import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  intensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'splash' | 'language' | 'transition' | 'habits' | 'habit' | 'deeper';
};

const overlayOpacity = {
  subtle: 0.84,
  medium: 0.74,
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

export default function CovenantBackdrop({
  intensity = 'medium',
  variant = 'splash',
}: Props) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <ImageBackground
        source={sources[variant]}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageLayer}
      >
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030303',
  },

  image: {
    flex: 1,
  },

  imageLayer: {
    opacity: 0.92,
  },

  darkVeil: {
    ...StyleSheet.absoluteFillObject,
  },

  copperVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(216,110,34,0.08)',
  },

  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(0,0,0,0.36)',
  },

  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
});
