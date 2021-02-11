import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Ionicons from "@expo/vector-icons/Ionicons"
import Fontisto from "@expo/vector-icons/Fontisto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Feather from "@expo/vector-icons/Feather"
import { StyleSheet, Text, View } from "react-native"
import config from "../../config"
import Feed from "./Feed"
import Post from "./Post"
import Profile from "./Profile"

const Tab = createMaterialTopTabNavigator()

export default class Home extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    console.log("home params: " + JSON.stringify(this.props.route.params))
  }
  render() {
    return (
      <Tab.Navigator
        activeColor={config.primaryColor}
        inactiveColor={"gray"}
        barStyle={{ backgroundColor: config.secondaryColor }}
        size={40}
        shifting
        labeled={false}
        backBehavior="none"
        tabBarPosition="bottom"
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
        initialRouteName="Feed">
        <Tab.Screen
          name="Post"
          component={Post}
          options={{
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
          }}
        />
        <Tab.Screen
          name="Feed"
          component={Feed}
          initialParams={{
            code: this.props.route.params ? this.props.route.params.code : "",
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
                <Feather
                  name={"user"}
                  size={focused ? config.iconFocused : config.icon}
                  color={color}
                />
              )
            },
          }}
        />
      </Tab.Navigator>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
