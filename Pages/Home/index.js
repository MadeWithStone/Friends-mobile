import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"

import Ionicons from "@expo/vector-icons/Ionicons"
import Fontisto from "@expo/vector-icons/Fontisto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Feather from "@expo/vector-icons/Feather"
import { StyleSheet, Text, View } from "react-native"
import config from "../../config"
import Feed from "./Feed"
import Post from "./Post"
import Profile from "./Profile"

const Tab = createMaterialBottomTabNavigator()

export default class Home extends React.Component {
  render() {
    return (
      <Tab.Navigator
        activeColor={config.primaryColor}
        inactiveColor={"gray"}
        barStyle={{ backgroundColor: config.secondaryColor }}
        size={40}
        shifting
        backBehavior="none"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            let icon
            let s = 24
            if (route.name === "Feed") {
              iconName = "users"
              icon = <Feather name={iconName} size={s} color={color} />
            } else if (route.name === "Post") {
              iconName = "plus-square"
              icon = <Feather name={iconName} size={s} color={color} />
            } else if (route.name === "Profile") {
              iconName = "user"
              icon = <Feather name={iconName} size={s} color={color} />
            }

            // You can return any component that you like here!
            return icon
          },
        })}
        initialRouteName="Feed">
        <Tab.Screen name="Post" component={Post} options={{ title: "" }} />
        <Tab.Screen name="Feed" component={Feed} options={{ title: "" }} />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ title: "" }}
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
