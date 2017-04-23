import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
  TouchableHighlight,
  Dimensions,
  StatusBar,
  NavigationExperimental,
  Navigator,
  Animated,
  Easing
} from "react-native";
import openMapAddress from "../utils/openMapAddress";
import CustomText from "./CustomText";
import { Actions } from "react-native-router-flux";
import data from "../data.generated";
import PageContainer from "./PageContainer";
import Swiper from "react-native-swiper";
import {
  SimpleLineIcons,
  Foundation,
  MaterialIcons,
  FontAwesome,
  Entypo
} from "@expo/vector-icons";
import Expo, { Amplitude } from "expo";
import createRoutingLifecycle from "../state/routing/createRoutingLifecycle";
import getResponsiveFontSize from "../utils/getResponsiveFontSize";

const InfoField = ({ label, children }) => (
  <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
    <View style={{ flex: 1 }}>
      <CustomText style={styles.infoFieldLabel}>{label}</CustomText>
    </View>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
);
const Trailer = ({ href, backgroundColor, onPress, fontSize, ...props }) => (
  <TouchableHighlight
    onPress={() => {
      if (onPress) {
        onPress();
      }
      Linking.openURL(href);
    }}
    {...props}
  >
    <View style={[styles.iconTextWrapper, { backgroundColor }]}>
      <Foundation
        name="play-video"
        size={16}
        style={[styles.infoIcon, styles.watchTrailerIcon]}
      />
      <CustomText style={[styles.watchTrailer, { fontSize }]}>
        Watch trailer
      </CustomText>
    </View>
  </TouchableHighlight>
);
const LocationLink = ({
  location,
  children,
  backgroundColor,
  textStyle,
  onPress,
  ...props
}) => (
  <TouchableHighlight
    onPress={() => {
      if (onPress) {
        onPress();
      }
      openMapAddress(location);
    }}
    {...props}
  >
    <View style={[styles.iconTextWrapper, { backgroundColor }]}>
      <SimpleLineIcons name="location-pin" size={16} style={styles.infoIcon} />
      <CustomText
        style={[styles.locationLink, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {children}
      </CustomText>
    </View>
  </TouchableHighlight>
);

class SingleFilmPage extends React.Component {
  static defaultProps = {
    data,
    filmId: data.FilmsIndex.byStartTime[0]
  };

  state = {
    layout: Dimensions.get("window")
  };

  handleLayout = event =>
    this.setState({
      layout: {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      }
    });

  _titleAnimationProgress = new Animated.Value(0);

  render() {
    const films = this.props.data.Films;
    const { filmId, outerLayout } = this.props;
    const film = films[filmId];
    const filmIndex = this.props.data.FilmsIndex.byStartTime.indexOf(filmId);
    const prevId = this.props.data.FilmsIndex.byStartTime[filmIndex - 1];
    const nextId = this.props.data.FilmsIndex.byStartTime[filmIndex + 1];

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
      colors
    } = film;

    const { screenshot: screenshotImage, ...otherImages } = images || {};
    const { height, width } = outerLayout || this.state.layout;
    const showNext = () => Actions.film({ filmId: nextId });
    const showPrev = () =>
      Actions.film({ filmId: prevId, direction: "leftToRight" });

    const tileWidth = width;
    const tileHeight = Math.round(Math.min(tileWidth * 0.8, height / 2));

    const infoItemWidth = (width - 8 * 2) / 2;
    const infoTextWidth = infoItemWidth - (16 + 4);

    const screenshotScaleFactor = !screenshotImage
      ? 1
      : Math.max(
          tileWidth / screenshotImage.metadata.width,
          tileHeight / screenshotImage.metadata.height
        );

    const screenshotWidth = !screenshotImage
      ? undefined
      : screenshotScaleFactor * screenshotImage.metadata.width;
    const screenshotHeight = !screenshotImage
      ? undefined
      : screenshotScaleFactor * screenshotImage.metadata.height;

    const infoFieldFontSize = getResponsiveFontSize(
      "infoField",
      20,
      outerLayout,
      { height: 667, width: 375 },
      15
    );

    const smallInfoFieldFontSize = Math.round(18 * infoFieldFontSize / 20);

    const infoFieldPadding = Math.round(8 * infoFieldFontSize / 20);

    const vitalStatsFontSize = Math.round(16 * infoFieldFontSize / 20);

    return (
      <PageContainer
        scrollTrackInfo={{ filmId }}
        ref={ref => {
          this._pageContainer = ref;
        }}
      >
        <View style={styles.container} onLayout={this.handleLayout}>
          <View
            style={{
              height: tileHeight,
              width: tileWidth,
              borderWidth: 0,
              borderColor: colors.highlight,
              overflow: "hidden",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              padding: 8
            }}
          >
            <Image
              source={
                (screenshotImage && screenshotImage.source) ||
                  require("../data/images/blank.png")
              }
              style={{
                overflow: "visible",
                position: "absolute",
                top: tileHeight / 4 - screenshotHeight / 4,
                left: tileWidth / 2 - screenshotWidth / 2,
                width: screenshotWidth,
                height: screenshotHeight
              }}
            />
            <View
              style={{
                height: tileHeight,
                width: tileWidth,
                borderWidth: 8,
                borderColor: colors.highlight,
                overflow: "hidden",
                position: "absolute"
              }}
            />
            <Animated.Text
              textBreakStrategy="balanced"
              style={[
                styles.headline,
                {
                  fontSize: getResponsiveFontSize(
                    title,
                    36,
                    {
                      height: tileHeight,
                      width: tileWidth
                    },
                    { height: 216, width: 414 }
                  )
                },
                {
                  flexGrow: 0,
                  backgroundColor: colors.highlight,
                  right: this._titleAnimationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-100%", "0%"]
                  }),
                  opacity: this._titleAnimationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.9]
                  }),
                  maxWidth: 3 * tileWidth / 4
                }
              ]}
            >
              {title.toUpperCase()}
            </Animated.Text>
          </View>
          <CustomText
            style={[styles.vitalStats, { fontSize: vitalStatsFontSize }]}
          >
            {[year, country, running_time, certificate]
              .filter(Boolean)
              .join(" / ")}
          </CustomText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              backgroundColor: colors.highlight,
              padding: infoFieldPadding,
              justifyContent: "flex-end"
            }}
          >
            {director
              ? <View
                  style={[
                    { flex: 0, flexBasis: infoItemWidth },
                    styles.iconTextWrapper
                  ]}
                >
                  <Image
                    source={require("../data/icons/clapperboard-white-1.png")}
                    style={styles.infoIconImage}
                    resizeMode="contain"
                  />
                  <CustomText
                    style={[
                      styles.infoFieldValue,
                      { fontSize: infoFieldFontSize },
                      director.indexOf(",") !== -1
                        ? {
                            fontSize: smallInfoFieldFontSize
                          }
                        : null
                    ]}
                  >
                    {director.replace(/,\s*/g, "\n")}
                  </CustomText>
                </View>
              : null}

            <View
              style={[
                { flex: 0, flexBasis: infoItemWidth },
                styles.iconTextWrapper
              ]}
            >
              <MaterialIcons name="event" size={16} style={styles.infoIcon} />
              <CustomText
                style={[styles.infoFieldValue, { fontSize: infoFieldFontSize }]}
              >
                {date}, {time.start}
              </CustomText>
            </View>

            {trailer
              ? <Trailer
                  onPress={() => {
                    Amplitude.logEventWithProperties("Watch trailer", {
                      filmId
                    });
                  }}
                  href={trailer}
                  style={{ flex: 0, flexBasis: infoItemWidth }}
                  backgroundColor={colors.highlight}
                  fontSize={infoFieldFontSize}
                />
              : null}

            <LocationLink
              onPress={() => {
                Amplitude.logEventWithProperties("Tap location", {
                  filmId
                });
              }}
              location={venue.location}
              style={{ flex: 0, flexBasis: infoItemWidth }}
              textStyle={{ width: infoTextWidth, fontSize: infoFieldFontSize }}
              backgroundColor={colors.highlight}
            >
              {venue.name}
            </LocationLink>
            {venue.is_outdoor
              ? <View
                  style={[
                    { flex: 0, flexBasis: infoItemWidth },
                    styles.iconTextWrapper
                  ]}
                >
                  <FontAwesome
                    style={[styles.infoIcon, styles.outdoorIcon]}
                    size={16}
                    name="cloud"
                  />
                  <CustomText
                    style={[
                      styles.locationLink,
                      { fontSize: infoFieldFontSize }
                    ]}
                  >
                    Outdoor screening
                  </CustomText>
                </View>
              : null}
          </View>

          <CustomText
            style={{
              margin: 8,
              fontSize: infoFieldFontSize,
              fontFamily: "Agenda Light",
              backgroundColor: "#39bc99"
            }}
            selectable
          >
            {descriptionPlain}
          </CustomText>

          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 16,
              marginTop: 8,
              flex: 1
            }}
          >
            {Object.keys(otherImages).map(key => {
              const image = otherImages[key];
              const aspect = image.metadata.width / image.metadata.height;
              const adjusted = {
                width: width - 2 * 8,
                height: (width - 2 * 8) / aspect
              };

              return (
                <Image
                  source={otherImages[key].source}
                  key={key}
                  style={{ ...adjusted, flex: 1 }}
                />
              );
            })}
          </View>
        </View>
      </PageContainer>
    );
  }

  componentWillMount() {
    this._pageContainer = null;
  }

  handleHide() {
    if (this._pageContainer) {
      this._pageContainer.resetScroll();
    }
    this._titleAnimationProgress.setValue(0);
  }

  handleShow() {
    this._titleAnimationProgress.setValue(0);
    Animated.timing(this._titleAnimationProgress, {
      toValue: 1,
      duration: 250
    }).start();
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#39bc99",
    flexDirection: "column",
    alignItems: "stretch"
  },
  title: {
    fontSize: 19,
    fontWeight: "bold"
  },
  headline: {
    fontFamily: "Agenda Bold",
    fontSize: 32,
    textAlign: "center",
    backgroundColor: "#e59125",
    color: "white",
    opacity: 0.9,
    padding: 8
  },
  infoFieldLabel: {
    fontSize: 18,
    color: "white"
  },
  infoFieldValue: {
    fontSize: 20,
    color: "white"
  },
  watchTrailer: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8
  },
  locationLink: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8
  },
  iconTextWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    color: "white",
    marginRight: 4,
    marginTop: 8,
    marginBottom: 8
  },
  watchTrailerIcon: {
    marginRight: 6,
    marginLeft: 1
  },
  infoIconImage: {
    height: 16,
    width: 16,
    marginRight: 4,
    marginTop: 8,
    marginBottom: 8
  },
  vitalStats: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 6,
    marginRight: 8,
    marginTop: 2
  },
  outdoorIcon: {
    marginLeft: -1
  },
  navButton: {
    color: "rgba(255, 255, 255, 0.8)"
  }
});

class FilmsPage extends React.Component {
  static defaultProps = {
    data,
    filmId: data.FilmsIndex.byStartTime[0]
  };

  state = {
    layout: Dimensions.get("window")
  };

  _cardRefs = [];

  handleLayout = event =>
    this.setState({
      layout: {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      }
    });

  handleScrollBeginDrag = (e, swiperState) => {
    this._cardIndex = swiperState.index;
  };

  handleMomentumScrollEnd = (e, swiperState) => {
    if (this._cardIndex === swiperState.index) {
      return;
    }
    this.handleHideIndex(this._cardIndex);
    this._cardIndex = swiperState.index;
    this.handleShowIndex(this._cardIndex);
  };

  handleHideIndex(cardIndex) {
    if (this._cardRefs[cardIndex]) {
      this._cardRefs[cardIndex].handleHide();
    }
  }

  handleShowIndex(cardIndex) {
    if (this._cardRefs[cardIndex]) {
      this._cardRefs[cardIndex].handleShow();
    }
    if (
      cardIndex > this._initialCardIndex &&
      cardIndex === this.props.data.FilmsIndex.byStartTime.length - 1 &&
      !this._loggedScrollToEnd
    ) {
      Amplitude.logEvent("Scrolled to last film");
      this._loggedScrollToEnd = true;
      this._loggedScrollNext = true;
    }
    if (cardIndex > this._initialCardIndex && !this._loggedScrollNext) {
      Amplitude.logEvent("Scrolled right");
      this._loggedScrollNext = true;
    }
    if (
      cardIndex < this._initialCardIndex &&
      cardIndex === 0 &&
      !this._loggedScrollToStart
    ) {
      Amplitude.logEvent("Scrolled to first film");
      this._loggedScrollToStart = true;
      this._loggedScrollPrev = true;
    }
    if (cardIndex < this._initialCardIndex && !this._loggedScrollPrev) {
      Amplitude.logEvent("Scrolled left");
      this._loggedScrollPrev = true;
    }
  }

  get filmId() {
    const { filmId, notification } = this.props;
    if (notification) {
      return notification.data.film.filmId;
    }
    return filmId;
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (
      nextProps.notification &&
      nextProps.notification !== this.props.notification
    ) {
      const { filmId } = nextProps.notification.data.film;
      this._swiper.scrollBy(
        this.props.data.FilmsIndex.byStartTime.indexOf(filmId),
        false
      );
    }
  }

  handleRouteChange(currentRoute) {
    if (currentRoute.sceneKey === "film") {
      this.handleShowIndex(this._cardIndex);
    }
  }

  render() {
    const films = this.props.data.Films;
    const { filmId } = this;
    const { width, height } = this.state.layout;
    return (
      <View style={{ flex: 1, marginTop: 0 }} onLayout={this.handleLayout}>
        <Swiper
          showsButtons={true}
          showsPagination={false}
          width={width}
          height={height}
          loadMinimal={true}
          loadMinimalSize={1}
          onScrollBeginDrag={this.handleScrollBeginDrag}
          onMomentumScrollEnd={this.handleMomentumScrollEnd}
          loop={false}
          index={this._cardIndex}
          ref={ref => {
            this._swiper = ref;
          }}
          buttonWrapperStyle={{}}
          nextButton={
            <Entypo
              size={25}
              name="chevron-thin-right"
              style={styles.navButton}
            />
          }
          prevButton={
            <Entypo
              size={25}
              name="chevron-thin-left"
              style={styles.navButton}
            />
          }
        >
          {data.FilmsIndex.byStartTime.map((key, i) => (
            <SingleFilmPage
              outerLayout={this.state.layout}
              filmId={key}
              key={key}
              ref={ref => {
                this._cardRefs[i] = ref;
              }}
            />
          ))}
        </Swiper>
      </View>
    );
  }

  componentWillMount() {
    StatusBar.setHidden(true);
    const { filmId } = this;
    this._cardIndex = this.props.data.FilmsIndex.byStartTime.indexOf(filmId);
    this._initialCardIndex = this._cardIndex;
  }
}

export default createRoutingLifecycle(FilmsPage);
