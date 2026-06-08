import { Platform } from "react-native";

export const GUEST_PROGRESS_USER_KEY =
  "covenant_ios_guest";

export function isGuestModeAvailable() {
  return Platform.OS === "ios";
}

export function getGuestStorageKey() {
  return isGuestModeAvailable()
    ? GUEST_PROGRESS_USER_KEY
    : null;
}
