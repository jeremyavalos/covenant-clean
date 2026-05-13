import {
  ReactNode,
  useEffect,
} from "react";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
  delay?: number;
};

export default function FadeIn({
  children,
  delay = 0,
}: Props) {

  const opacity =
    useSharedValue(0);

  const translateY =
    useSharedValue(18);

  useEffect(() => {

    opacity.value =
      withTiming(1, {
        duration: 1600,
        easing:
          Easing.out(
            Easing.cubic
          ),
      });

    translateY.value =
      withTiming(0, {
        duration: 1600,
        easing:
          Easing.out(
            Easing.cubic
          ),
      });

  }, []);

  const animatedStyle =
    useAnimatedStyle(() => {

      return {
        opacity:
          opacity.value,

        transform: [
          {
            translateY:
              translateY.value,
          },
        ],
      };

    });

  return (

    <Animated.View
      style={animatedStyle}
    >
      {children}
    </Animated.View>

  );

}