const colors = {
  background: "#050505",

  card: "#0D0D0D",

  text: "#FFFFFF",

  muted: "#9A9A9A",

  soft: "#B8B8B8",

  divider: "#1A1A1A",

  accent: "#D88C3A",

  accentSoft: "#A86A2A",

  success: "#3FAF62",
};

const Colors = {
  light: {
    text: "#111111",
    background: "#FFFFFF",
    tint: colors.accent,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: colors.accent,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.accent,
    icon: colors.soft,
    tabIconDefault: colors.muted,
    tabIconSelected: colors.accent,
  },
};

export { Colors, colors };
