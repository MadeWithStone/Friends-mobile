import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, Text, View } from "react-native"
import * as Linking from "expo-linking"
import * as Analytics from "expo-firebase-analytics"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SignIn } from "./Pages"
import config from "./config"
import SignUp from "./Pages/SignUp"
import Home from "./Pages/Home"
import Load from "./Load"
import PostView from "./Pages/Home/Feed/PostView"
import FriendsList from "./Pages/Home/Profile/FriendsList"
import EditProfile from "./Pages/Home/Profile/EditProfile"
import Settings from "./Pages/Home/Profile/Settings"

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
          <Stack.Screen
            name="PostView"
            component={PostView}
            options={({ navigation, route }) => ({
              headerLeft: () => (
                <Btn
                  icon={
                    <FontAwesome5
                      name="chevron-left"
                      size={30}
                      color={config.primaryColor}
                    />
                  }
                  type="clear"
                  onPress={() => navigation.goBack()}
                />
              ),
              title: "Post",
              headerStyle: {
                backgroundColor: config.secondaryColor,
                shadowOffset: { height: 0, width: 0 },
              },
              headerTintColor: config.primaryColor,
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
              },
              headerShown: true,
            })}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={({ navigation, route }) => ({
              title: "Edit Profile",
              headerStyle: {
                backgroundColor: config.secondaryColor,
                shadowOffset: { height: 0, width: 0 },
              },
              headerTintColor: config.primaryColor,
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
              },
              headerShown: true,
            })}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={({ navigation, route }) => ({
              headerLeft: () => (
                <Btn
                  onPress={() => {
                    navigation.goBack()
                  }}
                  icon={
                    <FontAwesome5
                      name="chevron-left"
                      size={30}
                      color={config.primaryColor}
                    />
                  }
                  type="clear"
                />
              ),
              title: "Settings",
              headerStyle: {
                backgroundColor: config.secondaryColor,
                shadowOffset: { height: 0, width: 0 },
              },
              headerTintColor: config.primaryColor,
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
              },
              headerShown: true,
            })}
          />
          <Stack.Screen
            name="YourFriends"
            component={FriendsList}
            options={({ navigation, route }) => ({
              headerLeft: () => (
                <Btn
                  onPress={() => {
                    navigation.goBack()
                  }}
                  icon={
                    <FontAwesome5
                      name="chevron-left"
                      size={30}
                      color={config.primaryColor}
                    />
                  }
                  type="clear"
                />
              ),
              title: "Your Friends",
              headerStyle: {
                backgroundColor: config.secondaryColor,
                shadowOffset: { height: 0, width: 0 },
              },
              headerTintColor: config.primaryColor,
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
              },
              headerShown: true,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

const Loader = ({ navigation, route }) => {
  Analytics.setAnalyticsCollectionEnabled(false)
  config
    .init()
    .then(() => {
      console.log("loading app")
      // navigation.push(<Stack.Screen name="Load" component={Load} />)
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
  return (
    <SafeAreaProvider>
      <StatusBar style={config.secondaryColor === "#000" ? "light" : "dark"} />
    </SafeAreaProvider>
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
