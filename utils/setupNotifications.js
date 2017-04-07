import data from "../data.generated";
import { AsyncStorage } from "react-native";
import Expo from "expo";
import { version } from "../package.json";
import moment from "moment";

async function setupNotifications() {
  const savedVersion = await AsyncStorage.getItem("notifications.savedVersion");
  if (savedVersion !== version) {
    await Expo.Notifications.cancelAllScheduledNotificationsAsync();
    await Promise.all(
      data.FilmsIndex.byStartTime.map(async filmId => {
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
          exactStartTime
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
        return await Expo.Notifications.scheduleLocalNotificationAsync(
          {
            title: title + (venue.is_outdoor ? " (Outdoor screening)" : ""),
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
          },
          { time: notificationTime.unix() }
        );
      })
    );
    await AsyncStorage.setItem("notifications.savedVersion", version);
  }
}

export default setupNotifications;
