import * as t from "./actionTypes";

const initialState = {
  currentRoute: null
};

export default function routingReducer(state = initialState, action) {
  switch (action.type) {
    case t.SET_ROUTING_STATE: {
      state = { ...state, currentRoute: getCurrent(action.payload) };
    }
  }
  return state;
}

// From react-native-router-flux Reducer.js
function getCurrent(state) {
  if (!state.children) {
    return state;
  }
  return getCurrent(state.children[state.index]);
}
