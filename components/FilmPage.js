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
  FontAwesome
} from "@expo/vector-icons";
import Expo from "expo";

const InfoField = ({ label, children }) => (
  <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
    <View style={{ flex: 1 }}>
      <CustomText style={styles.infoFieldLabel}>{label}</CustomText>
    </View>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
);
const Trailer = ({ href, backgroundColor, ...props }) => (
  <TouchableHighlight onPress={() => Linking.openURL(href)} {...props}>
    <View style={[styles.iconTextWrapper, { backgroundColor }]}>
      <Foundation
        name="play-video"
        size={16}
        style={[styles.infoIcon, styles.watchTrailerIcon]}
      />
      <CustomText style={[styles.watchTrailer]}>
        Watch trailer
      </CustomText>
    </View>
  </TouchableHighlight>
);
const LocationLink = (
  { location, children, backgroundColor, textStyle, ...props }
) => (
  <TouchableHighlight onPress={() => openMapAddress(location)} {...props}>
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
function getTitleFontSize(
  text: string,
  layout: { height: number, width: number }
) {
  const { height, width } = layout;
  return Math.round(Math.min(32, height / Math.sqrt(text.length)));
}
function getCaptionFontSize(
  text: string,
  layout: { height: number, width: number }
) {
  const { height, width } = layout;
  return Math.round(
    Math.min(
      1 / 2 * getTitleFontSize(text, layout),
      height / Math.sqrt(text.length)
    )
  );
}
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
          screenshotImage.metadata.width / tileWidth,
          screenshotImage.metadata.height / tileHeight,
          tileWidth / screenshotImage.metadata.width,
          tileHeight / screenshotImage.metadata.height
        );

    const screenshotWidth = !screenshotImage
      ? undefined
      : screenshotScaleFactor * screenshotImage.metadata.width;
    const screenshotHeight = !screenshotImage
      ? undefined
      : screenshotScaleFactor * screenshotImage.metadata.height;

    return (
      <PageContainer
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
              style={[
                styles.headline,
                { fontSize: getTitleFontSize(title, { height, width }) },
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
          <CustomText style={styles.vitalStats}>
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
              padding: 8,
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
                      director.indexOf(",") !== -1
                        ? {
                            fontSize: 18
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
              <CustomText style={styles.infoFieldValue}>
                {date}, {time.start}
              </CustomText>
            </View>

            {trailer
              ? <Trailer
                  href={trailer}
                  style={{ flex: 0, flexBasis: infoItemWidth }}
                  backgroundColor={colors.highlight}
                />
              : null}

            <LocationLink
              location={venue.location}
              style={{ flex: 0, flexBasis: infoItemWidth }}
              textStyle={{ width: infoTextWidth }}
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
                  <CustomText style={styles.locationLink}>
                    Outdoor screening
                  </CustomText>
                </View>
              : null}
          </View>

          <CustomText
            style={{
              margin: 8,
              fontSize: 20,
              fontFamily: "Agenda Light"
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
            {Object.keys(otherImages).map(image => (
              <Image
                source={otherImages[image].source}
                key={image}
                style={{ width: width - 2 * 8, flex: 1 }}
                resizeMode="contain"
              />
            ))}
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
  }
});

export default class FilmsPage extends React.Component {
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
    if (this._cardRefs[this._cardIndex]) {
      this._cardRefs[this._cardIndex].handleHide();
    }
    this._cardIndex = swiperState.index;
    if (this._cardRefs[this._cardIndex]) {
      this._cardRefs[this._cardIndex].handleShow();
    }
  };

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

  render() {
    const films = this.props.data.Films;
    const { filmId } = this;
    const { width, height } = this.state.layout;
    return (
      <View style={{ flex: 1, marginTop: 0 }} onLayout={this.handleLayout}>
        <Swiper
          showsButtons={false}
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
    this._cardIndex = this.props.data.FilmsIndex.byStartTime.indexOf(
      filmId
    );
  }

  componentDidMount() {
    if (this._cardRefs[this._cardIndex]) {
      this._cardRefs[this._cardIndex].handleShow();
    }
  }
}
