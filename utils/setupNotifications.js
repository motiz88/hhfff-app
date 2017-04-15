import data from "../data.generated";
import { AsyncStorage } from "react-native";
import Expo from "expo";
import { version } from "../package.json";
import moment from "moment";

const DEV = true;

async function setupNotifications() {
  const savedVersion = await AsyncStorage.getItem("notifications.savedVersion");
  if (savedVersion !== version || DEV) {
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
            vibrate: true,
            icon: require("../data/images/icon-white-on-alpha-96.png")
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
