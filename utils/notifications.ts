import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } =
    await Notifications.requestPermissionsAsync();

  return status === "granted";
}

export async function scheduleHabitReminder(
  title: string
) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Covenant",
      body: `¿Ya completaste "${title}" hoy?`,
    },

    trigger: {
      hour: 21,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    },
  });
}