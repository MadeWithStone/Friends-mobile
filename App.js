import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { CommonActions, NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, Text, View, Image, Linking } from "react-native"
// import * as Linking from "expo-linking"
import * as Analytics from "expo-firebase-analytics"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SignIn } from "./Pages"
import config, { configHook } from "./config"
import SignUp from "./Pages/SignUp"
import Home from "./Pages/Home"
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
import { CachedImage, LogoHorizontal } from "./Components"
import FriendsSplash from "./assets/Friends-splash.png"
import Post from "./Pages/Home/Post"
import EditUser from "./Pages/Home/Admin/EditUser"

const Stack = createStackNavigator()
const prefix = "friends:///" /// Linking.createURL("/")
const titleText = "Friends"

const App = () => {
  const [linking, setLinking] = React.useState({
    prefixes: [prefix],
    config: {
      screens: {
        Home: "/FriendCode/:code",
      },
    },
  })
  const [authenticated, init] = isAuthenticated()

  const [showMain, setShowMain] = React.useState(false)
  const [showSignIn, setShowSignIn] = React.useState(false)

  const [code, setCode] = React.useState(null)
  const [len, setLen] = React.useState(titleText.length - 1)

  /**
   * download user data from firebase firestore
   * @method
   */
  const downloadUserData = () => {
    // run firebase function to download firestore data for user
    loadData(authenticated.uid).then((doc) => {
      // set current user data object to downloaded data
      User.data = doc.data()

      setShowMain(true)
    })
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLen((prev) => {
        let newVal = prev + 1
        if (newVal > titleText.length) newVal = 0
        return newVal
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    config
      .init()
      .then(() => {
        console.log("loading app")
        if (init) {
          if (authenticated && authenticated.emailVerified) {
            setShowSignIn(false)
            User.auth = authenticated
            config.changed()
            downloadUserData()
            Analytics.setAnalyticsCollectionEnabled(false)
          } else {
            console.log(
              "[Friends SignIn] not authenticated or email not verified"
            )
            setShowMain(false)
            setShowSignIn(true)
          }
        }
      })
      .catch((err) => {
        console.warn(err)
      })
  }, [authenticated, init])

  React.useEffect(() => {
    console.log("loading url")
    Linking.getInitialURL().then((url) => {
      console.log("getting url")
      if (url) {
        const { path, queryParams } = Linking.parse(url)
        console.log(`used url ${JSON.stringify(queryParams)}`)
        if (queryParams.code) {
          setCode(queryParams.code)
        }
      }
    })
  }, [])

  const cHook = configHook()

  return (
    <View style={{ flex: 1, backgroundColor: config.secondaryColor }}>
      <NavigationContainer
        linking={linking}
        theme={{ colors: { backgroundColor: "#000" } }}>
        {!init ||
          (!showMain && !showSignIn && (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <LogoHorizontal
                title={titleText.substring(0, len)}
                style={{ width: "100%", margin: 16 }}
              />
            </View>
          ))}
        {showMain && init && (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
            detachInactiveScreens={false}
            initialRouteName={"Home"}>
            <Stack.Screen
              name="Home"
              component={Home}
              initialParams={{ refresh: true, code }}
            />
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
                    onPress={() => navigation.navigate("Post")}
                  />
                ),
                title: "Create Post",
                headerStyle: {
                  backgroundColor: config.secondaryColor,
                  shadowOffset: { height: 0, width: 0 },

                  shadowColor: "transparent",
                },
                headerTintColor: config.primaryColor,
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 30,
                },
                headerShown: true,
                gestureDirection: "horizontal-inverted",
              })}
            />
            <Stack.Screen
              name="Post"
              component={Post}
              options={({ route, navigation }) => ({
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
                headerShown: false,
                gestureDirection: "horizontal-inverted",
                gestureEnabled: false,
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
                    onPress={() => navigation.goBack("Home")}
                  />
                ),
                title: "Add Friend",
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
              name="EditUser"
              component={EditUser}
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
                title: "Edit User",
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
        )}
        {showSignIn && init && (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
            detachInactiveScreens={false}
            initialRouteName={"SignIn"}>
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
      /* navigation.navigate("SignIn", {
        code: route.params ? route.params.code : "",
      }) */
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
