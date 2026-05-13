import {
  View,
} from "react-native";

export default function BackgroundGlow() {

  return (

    <>

      <View
        style={{
          position: "absolute",

          width: 300,

          height: 300,

          borderRadius: 200,

          backgroundColor:
            "rgba(216,140,58,0.06)",

          top: -100,

          right: -80,
        }}
      />

      <View
        style={{
          position: "absolute",

          width: 240,

          height: 240,

          borderRadius: 200,

          backgroundColor:
            "rgba(255,255,255,0.03)",

          bottom: 100,

          left: -100,
        }}
      />

    </>

  );

}