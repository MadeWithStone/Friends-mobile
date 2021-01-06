import React, { Component } from "react"
import { View, Text, StyleSheet } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import config from "../../../config"
import User from "../../../Data/User"
import { ProfileImage } from "../../../Components"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"

const Profile = ({ navigation, route }) => {
  let [user, setUser] = React.useState({})
  React.useEffect(() => {
    let u = new User()
    u.loadCurrentUser()
      .then((data) => {
        setUser(data)
        navigation.setOptions({
          title:
            user.data != null
              ? user.data.firstName + " " + user.data.lastName
              : "Profile",
        })
      })
      .catch((err) => {
        console.log("err: " + err)
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
          icon={<Feather name="edit" size={30} color={config.primaryColor} />}
          type="clear"
        />
      ),
    })
  }, [navigation])
  return (
    <KeyboardAvoidingScrollView
      style={{ backgroundColor: config.secondaryColor }}>
      {user.data != null && <ProfileDataView user={user} />}
    </KeyboardAvoidingScrollView>
  )
}

const ProfileDataView = (props) => {
  return (
    <View style={dvStyles.container}>
      <ProfileImage
        image={props.user.data.profileImage}
        size={100}
        name={props.user.data.firstName + " " + props.user.data.lastName}
      />
      <Text style={dvStyles.text}>
        {props.user.data.firstName + " " + props.user.data.lastName}
      </Text>
    </View>
  )
}

const dvStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },
  text: {
    color: config.textColor,
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

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
                  size={28}
                  color={config.primaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Profile",
          headerStyle: {
            backgroundColor: config.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.primaryColor,
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
