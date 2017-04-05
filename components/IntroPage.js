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

class FilmstripButton extends React.Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <TouchableHighlight {...props}>
        <View style={styles.filmstrip}>
          {children}
        </View>
      </TouchableHighlight>
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
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <StatusBar hidden={true} />
        <View style={[styles.festivalTitle]}>
          <CustomText
            style={{
              fontFamily: "London Train",
              fontSize: 58 / 666 * this.state.layout.height,
              textAlign: "right"
            }}
          >
            {"HERNE HILL\nFREE\nFILM\nFESTIVAL\n2017"}
          </CustomText>
          <CustomText>
            (Popcorn guy here)
          </CustomText>
        </View>
        <View style={[styles.buttonsArea]}>
          <FilmstripButton
            onPress={() =>
              Actions.film({
                filmId: nextFilmId,
                direction: "horizontal",
                duration: 600
              })}
          >
            <CustomText style={styles.filmstripButtonText}>
              {"See what's on >".toUpperCase()}
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
    borderWidth: 1,
    flex: 1
  },
  buttonsArea: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 24
  },
  filmstrip: {
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 4
  },
  filmstripButtonText: {
    fontSize: 32
  }
});
