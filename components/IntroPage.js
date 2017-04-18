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
  Platform,
  Animated
} from "react-native";
import CustomText from "./CustomText";
import { Actions } from "react-native-router-flux";
import data from "../data.generated";
import PageContainer from "./PageContainer";
import Swiper from "react-native-swiper";
import { SimpleLineIcons, Foundation, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { Amplitude } from "expo";
import createRoutingLifecycle from "../state/routing/createRoutingLifecycle";

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
  _receiveRef = native => {
    this._native = native;
  };
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

const referenceHeight = 666;

const AnimatedCustomText = Animated.createAnimatedComponent(CustomText);

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
      animationProgress,
      ...props
    } = this.props;

    const { width, height } = this.state.layout;

    const heightFactor = parentLayout.height / referenceHeight;

    return (
      <AnimatedCustomText
        onLayout={this.handleLayout}
        {...props}
        style={[
          {
            backgroundColor: "rgba(0,0,0,0)",
            fontFamily: "London Train",
            fontSize: sizeRatio * 58 * heightFactor,
            textAlign: "right",
            marginBottom: -marginBottomRatio * 35 * heightFactor,
            marginTop: marginTopRatio * -10 * heightFactor,
            transform: rotateLeftDeg
              ? [
                  { translateX: width / 2 },
                  { translateY: height / 2 },
                  { rotate: "-" + rotateLeftDeg + "deg" },
                  { translateY: -height / 2 },
                  { translateX: -width / 2 }
                ]
              : [],
            textShadowColor: "white",
            textShadowOffset: { height: -2, width: -1 },
            textShadowRadius: 2,
            right: animationProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ["-100%", "0%"]
            })
          },
          style
        ]}
      >
        {children}
      </AnimatedCustomText>
    );
  }
}

class IntroPage extends React.Component {
  static defaultProps = {
    data
  };

  _logoLines = [
    {
      style: { color: "#ef3f2d" },
      sizeRatio: 1.1,
      marginBottomRatio: 1.2,

      text: "HERNE HILL"
    },
    {
      style: { color: "#da9f3d", zIndex: 1 },
      rotateLeftDeg: 5,
      sizeRatio: 1,
      marginBottomRatio: 0.5,

      text: "FREE"
    },
    {
      style: { color: "#4a5aa8" },
      marginTopRatio: 0.5,
      sizeRatio: 1.1,

      text: "FILM"
    },
    {
      style: { color: "#231f20" },
      marginTopRatio: 1.2,

      text: "FESTIVAL"
    },
    {
      style: { color: "#39bc99" },
      marginTopRatio: -1,
      text: "2017"
    }
  ].map(elem => ({ ...elem, animationProgress: new Animated.Value(0) }));

  _seeWhatsOnAnimationProgress = new Animated.Value(0);

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

  handleSeeWhatsOnClick = () => {
    Amplitude.logEvent("Tapped See What's On");
    Animated.stagger(
      300,
      this._getAnimsSequence({ toValue: 0 }).reverse()
    ).start(() => {
      const now = moment.now();
      const { data } = this.props;
      const nextFilmId = data.FilmsIndex.byStartTime.find(
        filmId =>
          moment(data.Films[filmId].exactStartTime).isSameOrAfter(now) ||
          (data.Films[filmId].approxEndTime &&
            moment(data.Films[filmId].approxEndTime).isSameOrAfter(now))
      ) || data.FilmsIndex.byStartTime[0];
      Actions.film({
        filmId: nextFilmId,
        direction: "horizontal",
        duration: 300
      });
    });
  };

  render() {
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
          source={require("../data/images/popcorn-guy-rtl-1080x1073.jpg")}
          style={{
            height: popcornGuyAdjustedSize.height,
            width: popcornGuyAdjustedSize.width,
            position: "absolute",
            bottom: -1,
            left: 0,
            transform: [{ scaleX: -1 }]
          }}
        />
        <View style={[styles.festivalTitle]}>
          {this._logoLines.map(({ text, ...childProps }, i) => (
            <LogoLine key={i} parentLayout={this.state.layout} {...childProps}>
              {text}
            </LogoLine>
          ))}
        </View>
        <Animated.View
          style={[
            styles.buttonsArea,
            {
              bottom: this._seeWhatsOnAnimationProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["-100%", "0%"]
              })
            }
          ]}
        >
          <FilmstripButton width={width} onPress={this.handleSeeWhatsOnClick}>
            <CustomText style={styles.filmstripButtonText}>
              {"See what's on".toUpperCase()}
            </CustomText>
          </FilmstripButton>
        </Animated.View>
      </View>
    );
  }

  componentWillMount() {
    this._pageContainer = null;
  }

  _getAnimsSequence({ toValue = 1 } = {}) {
    const logoAnims = this._logoLines.map(line => line.animationProgress);
    return [
      ...logoAnims.map(anim => Animated.spring(anim, { toValue })),
      Animated.spring(this._seeWhatsOnAnimationProgress, {
        toValue,
        tension: 40,
        friction: 10
      })
    ];
  }

  handleRouteChange(currentRoute) {
    if (currentRoute.sceneKey === "intro") {
      Animated.stagger(300, this._getAnimsSequence()).start();
    }
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
    marginTop: Platform.select({ ios: 20, android: 0 })
  }
});

export default createRoutingLifecycle(IntroPage);
