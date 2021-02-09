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

const Stack = createStackNavigator()

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }
  async componentDidMount() {}
  render() {
    console.log("loader page loaded")
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
          initialRouteName="Loader">
          <Stack.Screen name="Loader" component={Loader} />
          <Stack.Screen name="Load" component={Load} />
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
      navigation.navigate("Load")
    })
    .catch((err) => {
      console.warn(err)
    })
  React.useEffect(() => {
    console.log("running use effect")
  }, [navigation])
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
