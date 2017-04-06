import Expo from "expo";
import React, { Component } from "react";
import { DeviceEventEmitter } from "react-native";
import { Actions, ActionConst, Scene, Router } from "react-native-router-flux";
import data from "./data.generated";
import FilmPage from "./components/FilmPage";
import IntroPage from "./components/IntroPage";

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
    await Expo.Font.loadAsync({
      // Roboto: require("native-base/Fonts/Roboto.ttf"),
      // Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      "London Train": require("./data/fonts/london-train-regular.otf"),
      "Agenda Light": require("./data/fonts/AgendaLight.ttf"),
      "Agenda Bold": require("./data/fonts/AgendaBold.ttf")
    });

    this._notificationSubscription = DeviceEventEmitter.addListener(
      "Exponent.notification",
      this.handleNotification
    );

    this.setState({ isReady: true });
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
