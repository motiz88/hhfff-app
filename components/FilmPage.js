import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Linking,
  TouchableHighlight,
  Dimensions,
  StatusBar,
  NavigationExperimental,
  Navigator
} from "react-native";
import openMapAddress from "../utils/openMapAddress";
import { Tile, Grid, Row, Col, Button } from "react-native-elements";
import CustomText from "./CustomText";
import { Actions } from "react-native-router-flux";
import data from "../data.generated";
import PageContainer from "./PageContainer";
import Swiper from "react-native-swiper";
import { SimpleLineIcons, Foundation, MaterialIcons } from "@expo/vector-icons";

const InfoField = ({ label, children }) => (
  <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
    <View style={{ flex: 1 }}>
      <CustomText style={styles.infoFieldLabel}>{label}</CustomText>
    </View>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
);
const Trailer = ({ href }) => (
  <TouchableHighlight onPress={() => Linking.openURL(href)}>
    <CustomText style={styles.watchTrailer}>
      Watch trailer
    </CustomText>
  </TouchableHighlight>
);
const LocationLink = ({ location, children }) => (
  <TouchableHighlight onPress={() => openMapAddress(location)}>
    <View style={styles.iconTextWrapper}>
      <SimpleLineIcons name="location-pin" size={16} style={styles.infoIcon} />
      <CustomText style={styles.locationLink}>
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

  render() {
    const films = this.props.data.Films;
    const { filmId } = this.props;
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
    const { height, width } = this.state.layout;
    const showNext = () => Actions.film({ filmId: nextId });
    const showPrev = () =>
      Actions.film({ filmId: prevId, direction: "leftToRight" });
    return (
      <PageContainer ref={ref => {this._pageContainer = ref;}}>
        <View style={styles.container} onLayout={this.handleLayout}>
          {/*caption={date}*/}
          <Tile
            imageSrc={screenshotImage || require("../data/images/blank.png")}
            title={title.toUpperCase()}
            activeOpacity={1}
            width={width}
            featured
            titleStyle={[
              styles.headline,
              { fontSize: getTitleFontSize(title, { height, width }) },
              { backgroundColor: colors.highlight }
            ]}
            captionStyle={{
              fontSize: getCaptionFontSize(date, { height, width })
            }}
            imageContainerStyle={{
              borderWidth: 8,
              borderColor: colors.highlight
            }}
            overlayContainerStyle={{
              alignItems: "flex-end",
              justifyContent: "flex-end",
              paddingBottom: 0,
              paddingRight: 0,
              flex: 1
            }}
          />
          <CustomText style={styles.vitalStats}>
            {[year, country, running_time, certificate]
              .filter(Boolean)
              .join(" / ")}
          </CustomText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 8,
              backgroundColor: colors.highlight,
              padding: 4
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "flex-start"
              }}
            >
              {director
                ? <View style={[{ flex: 1 }, styles.iconTextWrapper]}>
                    <Image
                      source={require("../data/icons/clapperboard-white-1.png")}
                      style={styles.infoIconImage}
                      resizeMode="contain"
                    />
                    <CustomText style={styles.infoFieldValue}>
                      {director}
                    </CustomText>
                  </View>
                : null}
              {trailer
                ? <View style={[{ flex: 1 }, styles.iconTextWrapper]}>
                    <Foundation
                      name="play-video"
                      size={16}
                      style={styles.infoIcon}
                    />
                    <Trailer href={trailer} />
                  </View>
                : null}
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "flex-start"
              }}
            >
              <View style={[{ flex: 1 }, styles.iconTextWrapper]}>
                <MaterialIcons name="event" size={16} style={styles.infoIcon} />
                <CustomText style={styles.infoFieldValue}>
                  {date}, {time.start}
                </CustomText>
              </View>

              <LocationLink location={venue.location}>
                {venue.name}
              </LocationLink>
            </View>
          </View>

          <CustomText
            style={{
              margin: 8,
              fontSize: 20,
              fontFamily: "Agenda Light"
            }}
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
                source={otherImages[image]}
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

  resetScroll() {
    if (this._pageContainer) {
      this._pageContainer.resetScroll();
    }
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
    position: "absolute",
    bottom: 0,
    right: 0,
    fontSize: 32,
    textAlign: "center",
    backgroundColor: "#e59125",
    color: "white",
    // textShadowColor: "black",
    // textShadowOffset: { width: 0, height: -2 },
    // textShadowRadius: 3,
    opacity: 0.9,
    padding: 8,
    alignSelf: "flex-end"
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
  }

  handleMomentumScrollEnd = (e, swiperState) => {
    if (this._cardIndex !== swiperState.index && this._cardRefs[this._cardIndex]) {
      this._cardRefs[this._cardIndex].resetScroll();
    }
    this._cardIndex = swiperState.index;
  }

  render() {
    const films = this.props.data.Films;
    const { filmId } = this.props;
    const { width, height } = this.state.layout;
    return (
      <View style={{ flex: 1, marginTop: 0 }} onLayout={this.handleLayout}>
        <Swiper
          showsButtons={true}
          showsPagination={false}
          width={width}
          height={height}
          nextButton={<Text />}
          prevButton={<Text />}
          loadMinimal={true}
          loadMinimalSize={1}
          onScrollBeginDrag={this.handleScrollBeginDrag}
          onMomentumScrollEnd={this.handleMomentumScrollEnd}
        >
          {data.FilmsIndex.byStartTime.map((key, i) => (
            <SingleFilmPage filmId={key} key={key} ref={ref => {
              this._cardRefs[i] = ref;
            }} />
          ))}
        </Swiper>
      </View>
    );
  }

  componentWillMount() {
    StatusBar.setHidden(true);
    this._cardIndex = this.props.data.FilmsIndex.byStartTime.indexOf(this.props.filmId);
  }
}
