import { Platform, Text } from "react-native";
import React from "react";

export default class CustomText extends React.Component {
  render() {
    const { children, style, ...props } = this.props;
    return (
      <Text
        style={[{
          fontFamily: 'Agenda Light'
        }, style]}
        {...props}
        ref={this._receiveRef}
      >
        {children}
      </Text>
    );
  }
  _receiveRef = (native) => {
      this._native = native;
  }
  setNativeProps(...args) {
      return this._native.setNativeProps(...args);
  }
}
