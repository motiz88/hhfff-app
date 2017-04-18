import { connect } from "react-redux";
import React from "react";

export default function createRoutingLifecycle(Component) {
  return connect(state => ({ currentRoute: state.routing.currentRoute }))(
    class RoutingLifecycleWrapper extends React.Component {
      _emitRouteChange(currentRoute) {
        if (
          this._wrapped && typeof this._wrapped.handleRouteChange === "function"
        ) {
          this._wrapped.handleRouteChange(currentRoute);
        }
      }
      componentDidMount() {
        this._emitRouteChange(this.props.currentRoute);
      }
      componentWillReceiveProps(nextProps) {
        if (nextProps.currentRoute !== this.props.currentRoute) {
          this._emitRouteChange(nextProps.currentRoute);
        }
      }
      render() {
        const { currentRoute, children, ...props } = this.props;
        return (
          <Component {...props} ref={this._receiveRef}>
            {children}
          </Component>
        );
      }
      _receiveRef = instance => {
        this._wrapped = instance;
      };
      setNativeProps(...args) {
        return this._wrapped.setNativeProps(...args);
      }
    }
  );
}
