import amplitudeKey from "../amplitude-key";
import { Amplitude } from "expo";

async function setupAmplitude() {
  if (!amplitudeKey) {
    return;
  }
  Amplitude.initialize(amplitudeKey);
}

export default setupAmplitude;
