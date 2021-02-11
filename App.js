import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, Text, View } from "react-native"
import { SignIn } from "./Pages"
import config from "./config"
import SignUp from "./Pages/SignUp"
import Home from "./Pages/Home"
import Load from "./Load"
import * as Linking from "expo-linking"

const Stack = createStackNavigator()
const prefix = Linking.createURL("/")

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.linking = {
      prefixes: [prefix],
      config: {
        screens: {
          Loader: "/signin/:code",
        },
      },
    }
  }
  async componentDidMount() {}
  render() {
    console.log("loader page loaded")
    return (
      <NavigationContainer linking={this.linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
          initialRouteName="Loader">
          <Stack.Screen name="Loader" component={Loader} />
          <Stack.Screen name="Load" component={Load} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

const Loader = ({ navigation, route }) => {
  config
    .init()
    .then(() => {
      console.log("loading app")
      //navigation.push(<Stack.Screen name="Load" component={Load} />)
      navigation.navigate("SignIn", {
        code: route.params ? route.params.code : "",
      })
    })
    .catch((err) => {
      console.warn(err)
    })
  React.useEffect(() => {
    console.log("running use effect")
  }, [navigation])
  return <View></View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
