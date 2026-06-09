import AsyncStorage from "@react-native-async-storage/async-storage";

const MANUAL_PRO_ACCESS_KEY = "manualProAccess";

const ACCESS_CODES = new Set([
  "COVENANT-777-ALPHA",
  "COVENANT-777-LUX",
  "COVENANT-777-VITA",
  "COVENANT-777-IGNIS",
  "COVENANT-777-NOX",
  "COVENANT-777-AURUM",
  "COVENANT-777-SOL",
  "COVENANT-777-ARC",
  "COVENANT-777-VERITAS",
  "COVENANT-777-PAX",
]);

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function hasManualProAccess() {
  return (await AsyncStorage.getItem(MANUAL_PRO_ACCESS_KEY)) === "true";
}

export async function redeemManualProAccessCode(code: string) {
  if (await hasManualProAccess()) {
    return "already-unlocked" as const;
  }

  if (!ACCESS_CODES.has(normalizeCode(code))) {
    return "invalid" as const;
  }

  await AsyncStorage.setItem(MANUAL_PRO_ACCESS_KEY, "true");
  return "accepted" as const;
}
