import { View } from "react-native";

import { colors } from "../constants/theme";

export default function Divider() {
  return (
    <View
      style={{
        width: 60,
        height: 1,
        backgroundColor:
          colors.divider,
      }}
    />
  );
}