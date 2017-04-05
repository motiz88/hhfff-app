import React from "react";
import { View } from "react-native";
import FilmPage from "./FilmPage";
import data from "../data.generated";
import PageContainer from "./PageContainer";

export default class Welcome extends React.Component {
  static defaultProps = {
    data
  };

  render() {
    const films = this.props.data.Films;
    return (
        <PageContainer>
            <View>
                {Object.keys(films).map(key => <FilmPage filmId={key} key={key} />)}
            </View>
        </PageContainer>
    );
  }
}
