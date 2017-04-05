import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import { Grid, Row } from "react-native-elements";
import data from "../data.generated";

export default class PageContainer extends React.Component {
  render() {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        {this.props.children}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 0
  }
});
