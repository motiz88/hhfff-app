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
  Navigator,
  Platform
} from "react-native";
import { Tile } from "react-native-elements";
import CustomText from "./CustomText";
import { Actions } from "react-native-router-flux";
import data from "../data.generated";
import PageContainer from "./PageContainer";
import Swiper from "react-native-swiper";
import { SimpleLineIcons, Foundation, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";

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

const FilmstripHoleSize = {
  width: 15,
  height: 6,
  outerWidth: 15 * 1.5
};

class FilmstripHole extends React.Component {
  render() {
    const { width, height, outerWidth } = FilmstripHoleSize;
    return (
      <View
        style={[
          {
            height: height,
            width: width,
            backgroundColor: "white",
            marginRight: outerWidth - width,
            marginTop: 1.5 * height,
            marginBottom: 1.5 * height,
            borderRadius: Math.min(height, width) / 4,
            borderTopColor: "rgba(0,0,0,0.5)",
            borderTopWidth: 1,
            borderRightColor: "rgba(0,0,0,0.5)",
            borderRightWidth: 1,
            borderBottomColor: "rgba(128,128,128,0.5)",
            borderBottomWidth: 1,
            borderLeftColor: "rgba(128,128,128,0.5)",
            borderLeftWidth: 1
          }
        ]}
      >
        {}
      </View>
    );
  }
}
class FilmstripHoles extends React.Component {
  render() {
    const { outerWidth: w } = FilmstripHoleSize;
    const { width, style } = this.props;
    const holes = [];
    const n = Math.ceil(width / w);
    for (let i = 0; i < n; ++i) {
      holes.push(<FilmstripHole key={i} />);
    }
    return (
      <View
        style={[
          {
            flexDirection: "row"
          },
          style
        ]}
      >
        {holes}
      </View>
    );
  }
}

class FilmstripBackground extends React.Component {
  _receiveRef = (native) => {
      this._native = native;
  }
  setNativeProps(...args) {
      return this._native.setNativeProps(...args);
  }
  render() {
    const { children, style, width, ...props } = this.props;
    return (
      <View
        ref={this._receiveRef}
        style={[
          {
            backgroundColor: "#39bc99",
            opacity: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          },
          style
        ]}
      >
        <FilmstripHoles
          width={width}
          style={{ top: 0, position: "absolute" }}
        />
        {children}
        <FilmstripHoles
          width={width}
          style={{ bottom: 0, position: "absolute" }}
        />
      </View>
    );
  }
}

class FilmstripButton extends React.Component {
  render() {
    const { children, onPress, width, ...props } = this.props;
    return (
      <TouchableHighlight onPress={onPress}>
        <FilmstripBackground {...props} width={width} style={{ height: 90 }}>
          <View>
            {children}
          </View>
        </FilmstripBackground>
      </TouchableHighlight>
    );
  }
}

class LogoLine extends React.Component {
  static defaultProps = {
    sizeRatio: 1,
    marginTopRatio: 0,
    marginBottomRatio: 1,
    rotateLeftDeg: 0
  };

  state = { layout: { width: 0, height: 0 } };

  handleLayout = event =>
    this.setState({
      layout: {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      }
    });

  render() {
    const {
      style,
      children,
      parentLayout,
      sizeRatio,
      marginBottomRatio,
      marginTopRatio,
      rotateLeftDeg,
      ...props
    } = this.props;

    const { width, height } = this.state.layout;

    return (
      <CustomText
        onLayout={this.handleLayout}
        {...props}
        style={[
          {
            backgroundColor: "rgba(0,0,0,0)",
            fontFamily: "London Train",
            fontSize: sizeRatio * 58 / 666 * parentLayout.height,
            textAlign: "right",
            marginBottom: marginBottomRatio * -35 / 666 * parentLayout.height,
            marginTop: marginTopRatio * -10 / 666 * parentLayout.height,
            transform: rotateLeftDeg
              ? [
                  { translateX: width / 2 },
                  { translateY: height / 2 },
                  { rotate: "-" + rotateLeftDeg + "deg" },
                  { translateY: -height / 2 },
                  { translateX: -width / 2 }
                ]
              : []
          },
          style
        ]}
      >
        {children}
      </CustomText>
    );
  }
}

export default class IntroPage extends React.Component {
  static defaultProps = {
    data
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
    const now = moment.now();
    const { data } = this.props;
    const nextFilmId = data.FilmsIndex.byStartTime.find(
      filmId =>
        moment(data.Films[filmId].exactStartTime).isSameOrAfter(now) ||
        (data.Films[filmId].approxEndTime &&
          moment(data.Films[filmId].approxEndTime).isSameOrAfter(now))
    ) || data.FilmsIndex.byStartTime[0];
    const { width, height } = this.state.layout;
    const popcornGuySize = { width: 1080, height: 1073 };
    const popcornGuyAspect = popcornGuySize.width / popcornGuySize.height;
    const popcornGuyAdjustedSize = {
      width: Math.min(popcornGuySize.width, height / popcornGuyAspect, width),
      height: Math.min(popcornGuySize.height, width * popcornGuyAspect, height)
    };
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <StatusBar hidden={true} />
        <Image
          source={require("../data/images/popcorn-guy-rtl-1080x1073.png")}
          style={{
            height: popcornGuyAdjustedSize.height,
            width: popcornGuyAdjustedSize.width,
            position: "absolute",
            bottom: 0,
            left: 0,
            transform: [{ scaleX: -1 }]
          }}
        />
        <View style={[styles.festivalTitle]}>
          <LogoLine
            parentLayout={this.state.layout}
            style={{ color: "#ef3f2d" }}
            sizeRatio={1.1}
            marginBottomRatio={1.2}
          >
            HERNE HILL
          </LogoLine>
          <LogoLine
            parentLayout={this.state.layout}
            style={{ color: "#da9f3d", zIndex: 1 }}
            rotateLeftDeg={5}
            sizeRatio={1}
            marginBottomRatio={0.5}
          >
            FREE
          </LogoLine>
          <LogoLine
            parentLayout={this.state.layout}
            style={{ color: "#4a5aa8" }}
            marginTopRatio={0.5}
            sizeRatio={1.1}
          >
            FILM
          </LogoLine>
          <LogoLine
            parentLayout={this.state.layout}
            style={{ color: "#231f20" }}
            marginTopRatio={1.2}
          >
            FESTIVAL
          </LogoLine>
          <LogoLine
            parentLayout={this.state.layout}
            style={{ color: "#39bc99" }}
            marginTopRatio={-1}
          >
            2017
          </LogoLine>
        </View>
        <View style={[styles.buttonsArea]}>
          <FilmstripButton
            width={width}
            onPress={() =>
              Actions.film({
                filmId: nextFilmId,
                direction: "horizontal",
                duration: 600
              })}
          >
            <CustomText style={styles.filmstripButtonText}>
              {"See what's on".toUpperCase()}
            </CustomText>
          </FilmstripButton>
        </View>
      </View>
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
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "stretch",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  festivalTitle: {
    flex: 1
  },
  buttonsArea: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 0
  },
  filmstrip: {
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 4
  },
  filmstripButtonText: {
    color: "white",
    fontSize: 48,
    fontFamily: "DIN Condensed Bold",
    marginTop: Platform.select({ios: 20, android: 0})
  }
});
