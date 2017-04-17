import Expo, { Amplitude } from "expo";
import React, { Component } from "react";
import { DeviceEventEmitter } from "react-native";
import { Actions, ActionConst, Scene, Router } from "react-native-router-flux";
import data from "./data.generated";
import FilmPage from "./components/FilmPage";
import IntroPage from "./components/IntroPage";
import setupNotifications from "./utils/setupNotifications";
import setupAmplitude from "./utils/setupAmplitude";

function cacheImages(images) {
  return Promise.all(
    images.map(image => {
      if (typeof image === "string") {
        return Image.prefetch(image);
      } else {
        return Expo.Asset.fromModule(image).downloadAsync();
      }
    })
  );
}

const scenes = Actions.create(
  <Scene key="root" hideNavBar hideTabBar>
    <Scene
      key="intro"
      component={IntroPage}
      panHandlers={null}
      initial
      type={ActionConst.RESET}
    />
    <Scene
      key="film"
      component={FilmPage}
      panHandlers={null}
      type={ActionConst.PUSH}
    />
  </Scene>
);

const getSceneStyle = (
  /* NavigationSceneRendererProps */ props,
  computedProps
) => {
  const style = {
    flex: 1,
    backgroundColor: "#fff",
    shadowColor: null,
    shadowOffset: null,
    shadowOpacity: null,
    shadowRadius: null
  };
  if (computedProps.isActive) {
    style.marginTop = computedProps.hideNavBar ? 0 : 64;
    style.marginBottom = computedProps.hideTabBar ? 0 : 50;
  }
  return style;
};

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      isReady: false,
      notification: {}
    };
  }

  async componentWillMount() {
    await Promise.all([
      setupAmplitude(),
      setupNotifications(),
      cacheImages([require("./data/images/popcorn-guy-rtl-1080x1073.jpg")]),
      Expo.Font.loadAsync({
        "London Train": require("./data/fonts/london-train-regular.otf"),
        "Agenda Light": require("./data/fonts/AgendaLight.ttf"),
        "Agenda Bold": require("./data/fonts/AgendaBold.ttf"),
        "DIN Condensed Bold": require("./data/fonts/DIN Condensed Bold.ttf")
      })
    ]);

    this._notificationSubscription = DeviceEventEmitter.addListener(
      "Exponent.notification",
      this.handleNotification
    );

    this.setState({ isReady: true }, () => {
      Amplitude.logEvent("App loaded");
    });
  }
  componentDidMount() {
    if (this.props.exp && this.props.exp.notification) {
      this.handleNotification(this.props.exp.notification);
    }
  }
  handleNotification = notification => {
    this.setState({ notification: notification });
    const data = JSON.parse(notification.data);
    if (notification.origin === "selected" && data && data.film) {
      Amplitude.logEventWithProperties("Tapped film notification", {
        filmId: data.film.filmId
      });
      Actions.film({ notification: { ...notification, data } });
    }
  };

  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return <Router scenes={scenes} getSceneStyle={getSceneStyle} />;
  }
}
