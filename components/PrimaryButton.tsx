import {
    Text,
    TouchableOpacity,
} from "react-native";

import { colors } from "../constants/theme";

type Props = {
  title: string;

  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor:
          colors.accent,

        paddingVertical: 18,

        borderRadius: 18,

        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#000",

          fontSize: 16,

          fontWeight: "600",

          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}