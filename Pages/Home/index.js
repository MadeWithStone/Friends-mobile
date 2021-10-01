import { TouchableOpacity } from "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Ionicons from "@expo/vector-icons/Ionicons"
import Fontisto from "@expo/vector-icons/Fontisto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Feather from "@expo/vector-icons/Feather"
import { StyleSheet, Text, View, DeviceEventEmitter, Modal } from "react-native"
import { usePreventScreenCapture } from "expo-screen-capture"
import * as ScreenOrientation from "expo-screen-orientation"
import {
  SafeAreaInsetsContext,
  initialWindowMetrics,
} from "react-native-safe-area-context"
import config from "../../config"
import Feed from "./Feed"
import Post from "./Post"
import Profile from "./Profile"
import User from "../../Data/User"

import { ProfileImage } from "../../Components"

import useUserData from "../../Firebase/useUserData"
import Admin from "./Admin"
import ModerationPage from "./Moderation"
import MemesPage from "./Memes"

const Tab = createMaterialTopTabNavigator()
/**
 * home tab navigator
 *
 * @component
 */
const Home = ({ route, navigation }) => {
  const userData = useUserData()

  React.useEffect(() => {
    console.log(`home params: ${JSON.stringify(route.params)}`)
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    ScreenOrientation.addOrientationChangeListener((data) => {
      console.log(
        `Home.motionListener: orientation: ${data.orientationInfo.orientation}`
      )
      this.updateOrientaiton(data.orientationInfo.orientation)
    })
  }, [])

  const updateBadgeCount = (c) => {
    setFriendRequestCount(c.val)
    console.log(`Home.updateBadgeCount: update: ${c.val}`)
  }

  updateOrientaiton = (val) => {
    if (val === 1 || val === 3) {
      this.setState({ barLocation: "bottom" })
      console.log("Home.updateOrientation: barLocation: bottom")
      this.forceUpdate()
    } else {
      this.setState({ barLocation: "right" })
      this.forceUpdate()
    }
  }

  getTabBarVisibility = (route) => {
    const routeName = route.name ? route.name : ""
    if (routeName === "Post") {
      return false
    }

    return true
  }
  const [visible, setVisible] = React.useState(false)

  return (
    <Tab.Navigator
      activeColor={config.primaryColor}
      inactiveColor={"gray"}
      sceneContainerStyle={{ backgroundColor: "#000" }}
      barStyle={{
        backgroundColor: config.secondaryColor,
        height: 40,
        marginBottom: 16 + initialWindowMetrics.insets.bottom,
      }}
      swipeEnabled={false}
      size={40}
      shifting
      labeled={false}
      showLabel
      backBehavior="none"
      tabBarPosition={"bottom"}
      tabBarOptions={{
        showIcon: true,
        showLabel: false,
        activeTintColor: config.primaryColor,
        inactiveTintColor: "gray",
        pressOpacity: 0.5,
        indicatorStyle: {
          backgroundColor: config.primaryColor,
          marginBottom: 38,
          height: 2,
        },
        indicatorContainerStyle: {
          zIndex: 1,
          marginBottom: initialWindowMetrics.insets.bottom + 16,
          justifyContent: "space-around",
        },
        tabStyle: {
          backgroundColor: config.secondaryColor,
          zIndex: 0,
          height: 40,
          marginBottom: 16 + initialWindowMetrics.insets.bottom,
        },
        style: { backgroundColor: config.secondaryColor },
        labelStyle: {
          textTransform: "capitalize",
        },
        allowFontScaling: true,
      }}
      /* screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            let icon
            let s = 20
            let ps = [s, s, s]
            if (route.name === "Feed") {
              iconName = "users"
              icon = <Feather name={iconName} size={ps[0]} color={color} />
            } else if (route.name === "Post") {
              iconName = "plus-square"
              icon = <Feather name={iconName} size={ps[1]} color={color} />
            } else if (route.name === "Profile") {
              iconName = "user"
              icon = <Feather name={iconName} size={ps[2]} color={color} />
            }

            // You can return any component that you like here!
            return icon
          },
        })} */
      initialRouteName={"Feed"}>
      <Tab.Screen
        component={Post}
        name="PostTab"
        options={({ route }) => ({
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Feather
              name={"plus-square"}
              size={focused ? config.iconFocused : config.icon}
              color={color}
            />
          ),
          showLabel: ({ focused }) => focused,
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.navigate("Post")
          },
        })}
      />
      <Tab.Screen
        name="Feed"
        component={Feed}
        initialParams={{
          code: route.params ? route.params.code : "",
          refresh: route.params ? route.params.refresh : false,
        }}
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <View style={{ width: "100%" }}>
              <Feather
                name={"users"}
                size={focused ? config.iconFocused : config.icon}
                color={color}
              />
            </View>
          ),
          indicatorStyle: {
            backgroundColor: config.primaryColor,
            width: "50%",
            marginLeft: 20,
          },
          showLabel: true,
        }}
      />
      <Tab.Screen
        name="Memes"
        component={MemesPage}
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <View style={{ width: "100%" }}>
              <Feather
                name={"hash"}
                size={focused ? config.iconFocused : config.icon}
                color={color}
              />
            </View>
          ),
          indicatorStyle: {
            backgroundColor: config.primaryColor,
            width: "50%",
            marginLeft: 20,
          },
          showLabel: true,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "",
          badge: userData.friendRequests ? userData.friendRequests.length : 0,
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.badgeIconView}>
              {userData.friendRequests && userData.friendRequests.length > 0 && (
                <Text
                  style={{
                    ...styles.badge,
                    color,
                    fontWeight: "bold",
                  }}>
                  {userData.friendRequests ? userData.friendRequests.length : 0}
                </Text>
              )}
              <ProfileImage
                image={userData.profileImage}
                size={focused ? config.iconFocused : config.icon}
                name={`${userData.firstName} ${userData.lastName}`}
                id={userData.id}
                style={{
                  borderColor: config.primaryColor,
                  borderWidth: focused ? 1 : 0,
                  borderStyle: "solid",
                  padding: focused ? 1 : 0,
                  margin: "auto",
                }}
              />
            </View>
          ),
        }}
      />
      {userData.roles &&
        userData.roles.findIndex((x) => x === "moderator") !== -1 && (
          <Tab.Screen
            name="Moderation"
            component={ModerationPage}
            options={{
              title: "Mod",
              tabBarIcon: ({ focused, color }) => (
                <Feather
                  name={"flag"}
                  size={focused ? config.iconFocused : config.icon}
                  color={color}
                  style={{
                    transform: [{ rotateY: focused ? "180deg" : "0deg" }],
                  }}
                />
              ),
            }}
          />
        )}
      {userData.roles && userData.roles.findIndex((x) => x === "admin") !== -1 && (
        <Tab.Screen
          name="Admin"
          component={Admin}
          options={{
            title: "Admin",
            tabBarIcon: ({ focused, color }) => (
              <Feather
                name={"sliders"}
                size={focused ? config.iconFocused : config.icon}
                color={color}
                style={{ transform: [{ rotate: focused ? "180deg" : "0deg" }] }}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  )
}
export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconView: {},
  badge: {
    color: "#fff",
    position: "absolute",
    zIndex: 10,
    top: -10,
    right: -10,
    padding: 1,
  },
})
