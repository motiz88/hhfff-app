import { Linking } from "react-native";

export default function openMapAddress (location) {
    return Linking.openURL('geo:0,0?q=' + encodeURIComponent(location));
}