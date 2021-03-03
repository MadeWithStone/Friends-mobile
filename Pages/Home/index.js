import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native"
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"

import Ionicons from "@expo/vector-icons/Ionicons"
import Fontisto from "@expo/vector-icons/Fontisto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Feather from "@expo/vector-icons/Feather"
import { StyleSheet, Text, View, DeviceEventEmitter } from "react-native"
import config from "../../config"
import Feed from "./Feed"
import Post from "./Post"
import Profile from "./Profile"
import { usePreventScreenCapture } from "expo-screen-capture"
import * as ScreenOrientation from "expo-screen-orientation"

const Tab = createMaterialBottomTabNavigator()
/**
 * home tab navigator
 *
 * @component
 */
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      friendRequestCount: 0,
      barLocation: "bottom",
    }
  }
  componentDidMount() {
    console.log("home params: " + JSON.stringify(this.props.route.params))
    //ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    DeviceEventEmitter.addListener(
      "friendBadgeCount",
      this.updateBadgeCount.bind(this)
    )
    ScreenOrientation.addOrientationChangeListener((data) => {
      console.log(
        "Home.motionListener: orientation: " + data.orientationInfo.orientation
      )
      this.updateOrientaiton(data.orientationInfo.orientation)
    })
  }

  updateBadgeCount(c) {
    this.setState({ friendRequestCount: c.val })
    console.log("Home.updateBadgeCount: update: " + c.val)
  }

  updateOrientaiton = (val) => {
    if (val == 1 || val == 3) {
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
    console.log("Home.getTabBarVisibility: routeName: " + routeName)
    if (routeName === "Post") {
      return false
    }

    return true
  }

  render() {
    return (
      <Tab.Navigator
        activeColor={config.primaryColor}
        inactiveColor={"gray"}
        barStyle={{ backgroundColor: config.secondaryColor, height: 80 }}
        size={40}
        shifting
        labeled={false}
        backBehavior="none"
        tabBarPosition={this.state.barLocation}
        swipeEnabled
        tabBarOptions={{
          showIcon: true,
          activeTintColor: config.primaryColor,
          inactiveTintColor: "gray",
          pressOpacity: 1,
          indicatorStyle: {
            backgroundColor: config.primaryColor,
          },
          indicatorContainerStyle: {
            zIndex: 1,
          },
          tabStyle: {
            backgroundColor: config.secondaryColor,
            zIndex: 0,
          },
        }}
        options={({ route }) => ({
          tabBarVisible: this.getTabBarVisibility(route),
        })}
        /*screenOptions={({ route }) => ({
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
        })}*/
        initialRouteName={"Feed"}>
        <Tab.Screen
          name="Post"
          component={Post}
          options={({ route }) => ({
            title: "",
            tabBarIcon: ({ focused, color }) => {
              return (
                <Feather
                  name={"plus-square"}
                  size={focused ? config.iconFocused : config.icon}
                  color={color}
                />
              )
            },
            tabBarVisible: this.getTabBarVisibility(route),
          })}
        />
        <Tab.Screen
          name="Feed"
          component={Feed}
          initialParams={{
            code: this.props.route.params ? this.props.route.params.code : "",
            refresh: this.props.route.params
              ? this.props.route.params.refresh
              : false,
          }}
          options={{
            title: "",
            tabBarIcon: ({ focused, color }) => {
              return (
                <Feather
                  name={"users"}
                  size={focused ? config.iconFocused : config.icon}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ title: "" }}
          options={{
            title: "",
            tabBarIcon: ({ focused, color }) => {
              return (
                <View style={styles.badgeIconView}>
                  {this.state.friendRequestCount > 0 && (
                    <Text
                      style={{
                        ...styles.badge,
                        color: color,
                        fontWeight: "bold",
                      }}>
                      {this.state.friendRequestCount}
                    </Text>
                  )}
                  <Feather
                    name={"user"}
                    size={focused ? config.iconFocused : config.icon}
                    color={color}
                  />
                </View>
              )
            },
          }}
        />
      </Tab.Navigator>
    )
  }
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
