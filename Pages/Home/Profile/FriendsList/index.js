import React, { useEffect, useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { set } from "react-native-reanimated"
import { Button as Btn } from "react-native-elements"
import * as SecureStore from "expo-secure-store"
import { useIsFocused } from "@react-navigation/native"
import config from "../../../../config"
import { Button, ProfileImage, TextButton } from "../../../../Components"
import User from "../../../../Data/User"
import {
  signOut,
  acceptFriendRequest,
  declineFriendRequest,
  getUsers,
  userReference,
  updateUser,
  loadData as getUser,
} from "../../../../Firebase/UserFunctions"
import useUserData from "../../../../Firebase/useUserData"

const FriendsList = ({ route, navigation }) => {
  const [friends, setFriends] = React.useState([])
  const [fObj, setFOBJ] = React.useState([])

  const focused = useIsFocused()
  const userData = useUserData()

  let listener

  React.useEffect(() => {
    if (userData) {
      getFriends()
    }
  }, [focused, userData])

  React.useLayoutEffect(() => {
    navigation.setOptions({
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
    })
  }, [navigation])

  const getFriends = () => {
    const fre = userData.friends != null ? userData.friends : []
    const uList = []
    fre.forEach((req) => uList.push(req.userID))
    getUsers(uList).then((res) => {
      // console.log("getting users")
      data = []
      res.forEach((r) => {
        data.push(r.data())
      })
      setFriends(data)
    })
  }
  const removeFriend = (id) => {
    getUser(id).then((data) => {
      const f = data.data().friends
      const idx = f.findIndex((x) => x.userID === userData.id)
      f.splice(idx, 1)
      updateUser({ friends: f }, id).then(() => {
        const h = userData.friends
        const idx = h.findIndex((x) => x.userID === id)
        h.splice(idx, 1)
        updateUser({ friends: h }, userData.id).then(() => {})
      })
    })
  }
  return (
    <ScrollView
      contentContainerStyle={{ backgroundColor: config.secondaryColor }}
      style={{ backgroundColor: config.secondaryColor }}>
      <View>
        {friends != null &&
          friends.map((req) => (
            <FriendObj
              friend={req}
              key={req.id}
              removeFriend={() => removeFriend(req.id)}
            />
          ))}
      </View>
    </ScrollView>
  )
}

export default FriendsList

const FriendObj = (props) => (
  <View style={frStyles.requestOBJContainer}>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <ProfileImage
        image={props.friend ? props.friend.profileImage : ""}
        size={40}
        name={`${props.friend.firstName} ${props.friend.lastName}`}
        id={props.friend.id}
      />
      <Text style={{ fontSize: 17, color: config.textColor }}>
        {props.friend.firstName} {props.friend.lastName}
      </Text>
    </View>
    <View style={frStyles.buttonContainer}>
      <TextButton
        text={"Remove"}
        textStyle={{
          fontSize: 17,
          color: config.primaryColor,
          fontWeight: "bold",
        }}
        onPressAction={() => props.removeFriend()}
      />
    </View>
  </View>
) // return a friend request object with callback for accept and decline

const frStyles = StyleSheet.create({
  requestOBJContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
})
