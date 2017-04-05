import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import { Grid, Row } from "react-native-elements";
import data from "../data.generated";

export default class PageContainer extends React.Component {
  render() {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled' ref={ref => {this._scrollView = ref;}}>
        {this.props.children}
      </ScrollView>
    );
  }
  componentWillUnmount() {
    this._scrollView = null;
  }
  resetScroll() {
    if (this._scrollView) {
      this._scrollView.scrollTo({y: 0, animated: false});
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 0
  }
});
