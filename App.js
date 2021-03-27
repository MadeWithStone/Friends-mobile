import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, Text, View, Image } from "react-native"
import * as Linking from "expo-linking"
import * as Analytics from "expo-firebase-analytics"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SignIn } from "./Pages"
import config, { configHook } from "./config"
import SignUp from "./Pages/SignUp"
import Home from "./Pages/Home"
import Load from "./Load"
import PostView from "./Pages/Home/Feed/PostView"
import AddFriend from "./Pages/Home/Feed/AddFriend"
import FriendsList from "./Pages/Home/Profile/FriendsList"
import EditProfile from "./Pages/Home/Profile/EditProfile"
import Settings from "./Pages/Home/Profile/Settings"
import CreatePost from "./Pages/Home/Post/CreatePost"
import isAuthenticated from "./Firebase/isAuthenticated"
import { loadData } from "./Firebase/UserFunctions"
import User from "./Data/User"
import { firebase } from "./Firebase/config"
import { CachedImage } from "./Components"
import FriendsSplash from "./assets/Friends-splash.png"

const Stack = createStackNavigator()
const prefix = Linking.createURL("/")

const App = () => {
  const [linking, setLinking] = React.useState({
    prefixes: [prefix],
    config: {
      screens: {
        Loader: "/signin/:code",
      },
    },
  })

  const authenticated = isAuthenticated()

  const cHook = configHook()

  console.log("loader page loaded")
  return (
    <View style={{ flex: 1, backgroundColor: config.secondaryColor }}>
      <NavigationContainer
        linking={linking}
        theme={{ colors: { backgroundColor: "#000" } }}>
        {authenticated ? (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
            detachInactiveScreens={false}
            initialRouteName={"AuthLoader"}>
            <Stack.Screen name="AuthLoader" component={AuthLoader} />
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
                  backgroundColor: cHook.secondaryColor,
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
            <Stack.Screen
              name="CreatePost"
              component={CreatePost}
              options={({ route, navigation }) => ({
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
                    onPress={() => navigation.navigate("PostStack")}
                  />
                ),
                title: "Create Post",
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
              name="AddFriend"
              component={AddFriend}
              options={({ route, navigation }) => ({
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
                headerRight: () => (
                  <Btn
                    icon={
                      <Feather
                        name="user-plus"
                        size={30}
                        color={config.primaryColor}
                      />
                    }
                    type="clear"
                    onPress={() => navigation.navigate("AddFriend")}
                  />
                ),
                title: "Add Friend",
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
        ) : (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
            detachInactiveScreens={false}
            initialRouteName={"Loader"}>
            <Stack.Screen name="Loader" component={Loader} />
            <Stack.Screen name="Load" component={Load} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </View>
  )
}

export default App

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
      <Image
        source={require("./assets/Friends-splash.png")}
        style={{ width: "50%" }}
      />
      <StatusBar style={config.secondaryColor === "#000" ? "light" : "dark"} />
    </SafeAreaProvider>
  )
}

const AuthLoader = ({ navigation, route }) => {
  Analytics.setAnalyticsCollectionEnabled(false)
  config
    .init()
    .then(() => {
      console.log("loading app")
      // navigation.push(<Stack.Screen name="Load" component={Load} />)
      User.auth = firebase.auth().currentUser
      loadData(User.auth.uid).then((doc) => {
        // set current user data object to downloaded data
        User.data = doc.data()

        // save data
        User.setCurrentUser()

        // set up navigation and navigate to next screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Home",
                params: {
                  code: route.params ? route.params.code : "", // pass code to next screen if a friend code url was used
                  refresh: true,
                },
              },
            ],
          })
        )
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
      <Image
        source={require("./assets/Friends-splash.png")}
        style={{ width: "50%" }}
      />
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
