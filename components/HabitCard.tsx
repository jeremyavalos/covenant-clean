import {
  Text,
  View,
} from "react-native";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  colors,
} from "../constants/theme";

type Props = {
  title: string;

  subtitle: string;

  completed?: boolean;
};

export default function HabitCard({
  title,
  subtitle,
  completed,
}: Props) {

  return (

    <LinearGradient
      colors={
        completed
          ? [
              "#15110B",
              "#0B0B0B",
            ]
          : [
              "#121212",
              "#0A0A0A",
            ]
      }

      start={{
        x: 0,
        y: 0,
      }}

      end={{
        x: 1,
        y: 1,
      }}

      style={{
        borderRadius: 32,

        padding: 30,

        marginBottom: 22,

        borderWidth: 1,

        borderColor:
          completed
            ? colors.accent
            : colors.divider,
      }}
    >

      <View
        style={{
          flexDirection: "row",

          justifyContent:
            "space-between",

          alignItems: "center",
        }}
      >

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={{
              color:
                colors.text,

              fontSize: 28,

              fontWeight: "300",

              marginBottom: 12,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color:
                colors.soft,

              fontSize: 17,

              lineHeight: 30,
            }}
          >
            {subtitle}
          </Text>

        </View>

        <View
          style={{
            width: 34,

            height: 34,

            borderRadius: 17,

            justifyContent:
              "center",

            alignItems:
              "center",

            marginLeft: 24,

            backgroundColor:
              completed
                ? colors.accent
                : "transparent",

            borderWidth: 1,

            borderColor:
              completed
                ? colors.accent
                : colors.muted,
          }}
        >

          {completed && (

            <Text
              style={{
                color: "#000",

                fontWeight: "700",
              }}
            >
              ✓
            </Text>

          )}

        </View>

      </View>

    </LinearGradient>

  );
}