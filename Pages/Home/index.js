import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Ionicons from "@expo/vector-icons/Ionicons"
import Fontisto from "@expo/vector-icons/Fontisto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Feather from "@expo/vector-icons/Feather"
import { StyleSheet, Text, View } from "react-native"
import config from "../../config"
import Feed from "./Feed"
import Post from "./Post"
import Profile from "./Profile"

const Tab = createBottomTabNavigator()

export default class Home extends React.Component {
  render() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            let icon
            if (route.name === "Feed") {
              iconName = "users"
              icon = <Feather name={iconName} size={size} color={color} />
            } else if (route.name === "Post") {
              iconName = "plus-square"
              icon = <Feather name={iconName} size={size} color={color} />
            } else if (route.name === "Profile") {
              iconName = "user"
              icon = <Feather name={iconName} size={size} color={color} />
            }

            // You can return any component that you like here!
            return icon
          },
        })}
        tabBarOptions={{
          activeTintColor: config.primaryColor,
          inactiveTintColor: "gray",
          style: {
            backgroundColor: config.secondaryColor,
            borderTopColor: "#202020",
          },
        }}
        initialRouteName="Feed">
        <Tab.Screen name="Post" component={Post} options={{ title: "Post" }} />
        <Tab.Screen
          name="Feed"
          component={Feed}
          options={{ title: "Friends" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ title: "Profile" }}
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
