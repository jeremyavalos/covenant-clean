import {
  SafeAreaView,
  StatusBar,
  View,
} from "react-native";

import {
  ReactNode,
} from "react";

import {
  colors,
} from "../constants/theme";

import CovenantBackdrop from "./CovenantBackdrop";

type Props = {
  children: ReactNode;
  backdropIntensity?: "subtle" | "medium" | "strong";
  backdropVariant?: "splash" | "language" | "transition" | "habits" | "habit" | "deeper";
};

export default function Screen({
  children,
  backdropIntensity = "medium",
  backdropVariant = "splash",
}: Props) {

  const hour =
    new Date().getHours();

  const isNight =
    hour >= 19 ||
    hour <= 5;

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          isNight
            ? "#030303"
            : colors.background,
      }}
    >

      <StatusBar
        barStyle="light-content"
      />

      <View
        style={{
          flex: 1,
          backgroundColor:
            isNight

              ? "rgba(0,0,0,0.18)"

              : "transparent",
        }}
      >
        <CovenantBackdrop
          intensity={backdropIntensity}
          variant={backdropVariant}
        />

        {children}

      </View>

    </SafeAreaView>

  );

}
