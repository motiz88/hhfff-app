import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import data from "../data.generated";
import { Amplitude } from "expo";

export default class PageContainer extends React.Component {
  state = {
    scrolledToBottom: false
  };

  anyScrollWaypointsLeft() {
    return !this.state.scrolledToBottom;
  }

  render() {
    const { scrollTrackInfo } = this.props;
    const trackScrolling = !!scrollTrackInfo && this.anyScrollWaypointsLeft();
    return (
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        ref={ref => {
          this._scrollView = ref;
        }}
        onScroll={trackScrolling ? this.handleScroll : undefined}
        scrollEventThrottle={1000}
      >
        {this.props.children}
      </ScrollView>
    );
  }
  componentWillUnmount() {
    this._scrollView = null;
  }
  resetScroll() {
    if (this._scrollView) {
      this._scrollView.scrollTo({ y: 0, animated: false });
    }
  }
  handleScroll = e => {
    const {
      contentInset,
      contentOffset,
      contentSize,
      layoutMeasurement
    } = e.nativeEvent;

    const scrollPct =
      contentOffset.y / (contentSize.height - layoutMeasurement.height);
    if (scrollPct > 0.98 && !this.state.scrolledToBottom) {
      this.setState({
        scrolledToBottom: true
      });
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.scrolledToBottom !== this.state.scrolledToBottom) {
      if (this.state.scrolledToBottom) {
        Amplitude.logEventWithProperties(
          "Scrolled to bottom",
          this.props.scrollTrackInfo || {}
        );
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 0
  }
});
