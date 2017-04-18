import { createStore, combineReducers } from "redux";
import reducer from "./rootReducer";

export default function configureStore() {
  return createStore(reducer);
}
