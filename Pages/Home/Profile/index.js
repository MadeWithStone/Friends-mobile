import React, { Component } from "react"
import { View, Text, StyleSheet } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import config from "../../../config"
import User from "../../../Data/User"

const Profile = ({ navigation, route }) => {
  let user = new User()
  user.loadCurrentUser(() => {
    navigation.setOptions({
      title:
        user.data != null
          ? user.data.firstName + " " + user.data.lastName
          : "Profile",
    })
  })
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title:
        user.data != null
          ? user.data.firstName + " " + user.data.lastName
          : "Profile",
      headerLeft: () => (
        <Btn
          onPress={() => {}}
          icon={<Feather name="edit" size={30} color={config.secondaryColor} />}
          type="clear"
        />
      ),
    })
  }, [navigation])
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  )
}

const Stack = createStackNavigator()
const ProfilePage = ({ navigation }) => {
  return (
    <Stack.Navigator
      options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
      <Stack.Screen
        name="ProfileMain"
        component={Profile}
        options={{
          headerRight: () => (
            <Btn
              icon={
                <Feather
                  name="settings"
                  size={30}
                  color={config.secondaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Profile",
          headerStyle: {
            backgroundColor: config.primaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.secondaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default ProfilePage
