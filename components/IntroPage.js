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
  Animated,
  Easing
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
import getResponsiveFontSize from "../utils/getResponsiveFontSize";
import path from "path";

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
    const {
      children,
      onPress,
      width,
      height,
      parentHeight,
      ...props
    } = this.props;
    return (
      <TouchableHighlight
        onPress={onPress}
        hitSlop={{ top: Math.max(0, (parentHeight || 0) - height + 1) }}
      >
        <FilmstripBackground {...props} width={width} style={{ height }}>
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
    data,
    defaultSponsor: 0
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
  _popcornGuyOpacityProgress = new Animated.Value(0);
  _sponsorFadeProgress = new Animated.Value(0);
  _sponsorGlobalProgress = new Animated.Value(0);

  state = {
    layout: Dimensions.get("window"),
    sponsorIn: null,
    sponsorOut: null,
    sponsorImpressions: {}
  };

  async triggerSponsorCycle() {
    this._sponsorFadeProgress.setValue(0);
    await new Promise(resolve =>
      Animated.timing(this._sponsorFadeProgress, {
        delay: 1000,
        duration: 1000,
        toValue: 1
      }).start(resolve)
    );
    this.setState(
      state => ({
        sponsorOut: state.sponsorIn,
        sponsorIn: (state.sponsorIn + 1) % this.props.data.Sponsors.length
      }),
      () => {
        if (this.state.showSponsors) {
          this.triggerSponsorCycle();
        }
      }
    );
  }

  addSponsorImpression(index = this.state.sponsorOut) {
    let { filename } = this.props.data.Sponsors[this.state.sponsorOut].metadata;
    filename = path.basename(filename, path.extname(filename));

    const { sponsorImpressions } = this.state;
    this.setState(
      {
        sponsorImpressions: {
          ...sponsorImpressions,
          [filename]: (sponsorImpressions[filename] || 0) + 1
        }
      },
      () => {
        if (this.state.sponsorImpressions[filename] === 1) {
          Amplitude.logEventWithProperties("Sponsor logo impression", {
            logo: filename
          });
        }
      }
    );
  }

  resetSponsorImpressions() {
    const prev = this.state.sponsorImpressions;
    this.setState({
      sponsorImpressions: {}
    });
    return prev;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showSponsors !== this.state.showSponsors) {
      if (this.state.showSponsors) {
        this.triggerSponsorCycle();
      }
    }
    if (
      this.state.showSponsors && prevState.sponsorOut !== this.state.sponsorOut
    ) {
      this.addSponsorImpression(this.state.sponsorOut);
    }
  }

  handleLayout = event =>
    this.setState({
      layout: {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      }
    });

  handleSeeWhatsOnClick = () => {
    Amplitude.logEvent("Tapped See What's On");
    this._getReverseAnimation().start(() => {
      this.setState({ showSponsors: false }, () => {
        this.resetSponsorImpressions();
        const now = moment.now();
        const { data } = this.props;
        const nextFilmId =
          data.FilmsIndex.byStartTime.find(
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
    });
  };

  render() {
    const { width, height } = this.state.layout;
    const popcornGuySize = { width: 1080, height: 1073 };
    const popcornGuyAspect = popcornGuySize.width / popcornGuySize.height;
    const popcornGuyTargetWidth = 0.75 * width;
    const popcornGuyAdjustedSize = {
      width: Math.min(
        popcornGuyTargetWidth,
        popcornGuySize.width,
        height / popcornGuyAspect,
        width
      ),
      height: Math.min(
        popcornGuySize.height,
        popcornGuyTargetWidth * popcornGuyAspect,
        width * popcornGuyAspect,
        height
      )
    };
    const sponsorSizeCaps = {
      width: Math.min(150, 0.3 * width),
      height: Math.min(80, 0.2 * height)
    };
    const sponsorSizes = this.props.data.Sponsors.map((sponsor, i) => {
      const { height, width } = sponsor.metadata;
      const aspect = width / height;
      return {
        width: Math.min(
          width,
          sponsorSizeCaps.width,
          sponsorSizeCaps.height * aspect
        ),
        height: Math.min(
          height,
          sponsorSizeCaps.width / aspect,
          sponsorSizeCaps.height
        )
      };
    });
    const sponsorMaxExtents = {
      height: Math.max(...sponsorSizes.map(size => size.height)),
      width: Math.max(...sponsorSizes.map(size => size.width))
    };
    const seeWhatsOnHeight = Math.max(75, height / 6);
    const seeWhatsOnFontSize = getResponsiveFontSize(
      "See what's on".toUpperCase(),
      Math.min(seeWhatsOnHeight - 2 * (2.5 * FilmstripHoleSize.height)),
      { height: seeWhatsOnHeight, width },
      { height: 90, width: 500 },
      16
    );
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <StatusBar hidden={true} />
        <Animated.Image
          source={require("../data/images/popcorn-guy-rtl-1080x1073.jpg")}
          style={{
            height: popcornGuyAdjustedSize.height,
            width: popcornGuyAdjustedSize.width,
            position: "absolute",
            top: 1 +
              Math.max(
                0,
                height - popcornGuyAdjustedSize.height - seeWhatsOnHeight
              ),
            left: 0,
            transform: [{ scaleX: -1 }],
            opacity: this._popcornGuyOpacityProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.9]
            })
          }}
        />
        <View style={[styles.festivalTitle]}>
          {this._logoLines.map(({ text, ...childProps }, i) => (
            <LogoLine key={i} parentLayout={this.state.layout} {...childProps}>
              {text}
            </LogoLine>
          ))}
          <Animated.View
            style={{
              position: "absolute",
              ...sponsorMaxExtents,
              bottom: 4,
              right: 4
            }}
          >
            {this.props.data.Sponsors.map((sponsor, i) => {
              const { height, width } = sponsorSizes[i];
              let opacity;
              if (i === this.state.sponsorIn) {
                opacity = this._sponsorFadeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.9]
                });
              } else if (i === this.state.sponsorOut) {
                opacity = this._sponsorFadeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 0]
                });
              } else {
                opacity = 0;
              }
              if (opacity) {
                opacity = Animated.multiply(
                  this._sponsorGlobalProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0]
                  }),
                  opacity
                );
              }
              return (
                <Animated.Image
                  key={i}
                  resizeMode="stretch"
                  source={sponsor.source}
                  style={{
                    opacity,
                    position: "absolute",
                    top: sponsorMaxExtents.height / 2 - height / 2,
                    right: sponsorMaxExtents.width / 2 - width / 2,
                    height,
                    width,
                    transform: [
                      {
                        translateY: this._sponsorGlobalProgress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [
                            sponsorMaxExtents.height + 4,
                            0,
                            -sponsorMaxExtents.height
                          ]
                        })
                      },
                      {
                        scaleX: this._sponsorGlobalProgress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.01, 1, 0.01]
                        })
                      },
                      {
                        scaleY: this._sponsorGlobalProgress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.01, 1, 0.01]
                        })
                      }
                    ]
                  }}
                />
              );
            })}
          </Animated.View>
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
          <FilmstripButton
            parentHeight={height}
            width={width}
            height={seeWhatsOnHeight}
            onPress={this.handleSeeWhatsOnClick}
          >
            <CustomText
              style={[
                styles.filmstripButtonText,
                {
                  fontSize: seeWhatsOnFontSize,
                  position: "relative",
                  transform: [
                    {
                      translateY: Platform.select({
                        ios: 0.5 * seeWhatsOnFontSize * 0.45,
                        android: 0
                      })
                    }
                  ]
                }
              ]}
            >
              {"See what's on".toUpperCase()}
            </CustomText>
          </FilmstripButton>
        </Animated.View>
      </View>
    );
  }

  componentWillMount() {
    this._pageContainer = null;
    this.setState({
      sponsorImpressions: {},
      sponsorIn: ((this.props.defaultSponsor || 0) + 1) %
        this.props.data.Sponsors.length,
      sponsorOut: (this.props.defaultSponsor || 0) %
        this.props.data.Sponsors.length
    });
  }

  componentDidMount() {
    this.addSponsorImpression(this.state.sponsorOut);
  }

  _getStaggeredAnims({ toValue = 1 } = {}) {
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

  _getPopcornGuyAnim({ toValue = 1 } = {}) {
    // return Animated.spring(this._popcornGuyOpacityProgress, {
    //   toValue,
    //   tension: 40,
    //   friction: 50
    // });
    return Animated.timing(this._popcornGuyOpacityProgress, {
      toValue
    });
  }

  _getSponsorGlobalAnim({ toValue = 1 } = {}) {
    return Animated.spring(this._sponsorGlobalProgress, {
      toValue,
      tension: 1,
      friction: 8
    });
  }

  _getForwardAnimation() {
    this._sponsorGlobalProgress.setValue(0);
    return Animated.sequence([
      Animated.stagger(300, this._getStaggeredAnims({ toValue: 1 })),
      this._getPopcornGuyAnim({ toValue: 1 }),
      this._getSponsorGlobalAnim({ toValue: 0.5 })
    ]);
  }

  _getReverseAnimation() {
    return Animated.parallel([
      this._getSponsorGlobalAnim({ toValue: 1 }),
      Animated.sequence([
        this._getPopcornGuyAnim({ toValue: 0 }),
        Animated.stagger(300, this._getStaggeredAnims({ toValue: 0 }).reverse())
      ])
    ]);
  }

  handleRouteChange(currentRoute) {
    if (currentRoute.sceneKey === "intro") {
      this._getForwardAnimation().start(() =>
        this.setState({
          showSponsors: true
        })
      );
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
    paddingTop: 0,
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
    fontFamily: "DIN Condensed Bold"
  }
});

export default createRoutingLifecycle(IntroPage);
