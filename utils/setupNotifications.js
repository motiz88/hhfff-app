import data from "../data.generated";
import { AsyncStorage } from "react-native";
import Expo from "expo";
import { version } from "../package.json";
import moment from "moment";

const DEV = false;
const ALWAYS_RESCHEDULE = true;

async function setupNotifications() {
  const savedVersion = await AsyncStorage.getItem("notifications.savedVersion");
  if (savedVersion !== version || ALWAYS_RESCHEDULE || DEV) {
    const { status } = await Expo.Permissions.askAsync(
      Expo.Permissions.REMOTE_NOTIFICATIONS
    );
    if (status !== "granted") {
      return;
    }
    await Expo.Notifications.cancelAllScheduledNotificationsAsync();
    await Promise.all(
      data.FilmsIndex.byStartTime.map(async (filmId, i) => {
        const film = data.Films[filmId];
        const {
          title,
          director,
          year,
          country,
          certificate,
          running_time,
          date,
          venue,
          time,
          trailer,
          descriptionPlain,
          images,
          colors,
          exactStartTime,
          notification: notificationData
        } = film;
        if (!exactStartTime) {
          return;
        }
        let notificationTime = moment(exactStartTime).set({
          hour: 9,
          minute: 0,
          second: 0
        });
        if (notificationTime.isAfter(exactStartTime)) {
          notificationTime.subtract(1, "day");
        }
        const notification = {
          title: ((notificationData && notificationData.title) || title) +
            (venue.is_outdoor ? " (Outdoor screening)" : ""),
          body: `${time.start} at ${venue.name}`,
          data: JSON.stringify({
            film: {
              filmId
            }
          }),
          android: {
            color: colors.highlight,
            vibrate: true
          }
        };
        await Expo.Notifications.scheduleLocalNotificationAsync(notification, {
          time: notificationTime.toDate()
        });
        if (DEV && i === 5) {
          await Expo.Notifications.scheduleLocalNotificationAsync(
            notification,
            { time: moment().add(30, "seconds").toDate() }
          );
        }
      })
    );
    await AsyncStorage.setItem("notifications.savedVersion", version);
  }
}

export default setupNotifications;
