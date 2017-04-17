This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

For more information and basic instructions, see [the latest Create React Native App guide](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

## How to update film content

Edit [`films.yml`](https://github.com/motiz88/hhfff-app/blob/master/data/films.yml), compile the data (`npm run data`) and rebuild the app.

## Analytics setup

We use [BlackBox](https://github.com/StackExchange/blackbox) to securely store the app's [Amplitude](https://amplitude.com/) key in this repo. If you cannot decrypt the Amplitude key you will need to create a dummy `amplitude-key.json` in the root of the repo [(example)](https://github.com/motiz88/hhfff-app/blob/master/amplitude-key.json.example); the app will then build with analytics disabled.
