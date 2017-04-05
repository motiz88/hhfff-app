import { Linking } from "react-native";

export default function openMapAddress (location) {
    return Linking.openURL('http://maps.apple.com/?address=' + encodeURIComponent(location));
}