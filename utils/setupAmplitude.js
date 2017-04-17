import amplitudeKey from "../amplitude-key";

async function setupAmplitude() {
  if (!amplitudeKey) {
    return;
  }
  Expo.Amplitude.initialize(amplitudeKey);
}

export default setupAmplitude;
