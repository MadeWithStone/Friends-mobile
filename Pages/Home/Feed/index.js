import React from "react"
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native"
import { Button as Btn } from "react-native-elements"
import { createStackNavigator } from "@react-navigation/stack"
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler"
import {
  Input,
  H1,
  Button,
  TextButton,
  DismissKeyboardView,
  IconButton,
} from "../../../Components"
import config from "../../../config"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import FeedObject from "./FeedObject"

import { StatusBar } from "expo-status-bar"
import AddFriend from "./AddFriend"

class Feed extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [{ id: 1 }, { id: 2 }],
    }
  }

  render() {
    return (
      <View>
        <ScrollView
          style={{
            width: 100 + "%",
            height: 100 + "%",
            backgroundColor: config.secondaryColor,
          }}
          showsVerticalScrollIndicator={false}
          horizontal={false}>
          {this.state.posts.map((post) => {
            return <FeedObject post={post} key={post.id} />
          })}
        </ScrollView>

        <StatusBar style="light" />
      </View>
    )
  }
}

const Stack = createStackNavigator()
const FeedPage = ({ navigation }) => {
  return (
    <Stack.Navigator
      options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
      <Stack.Screen
        name="FeedMain"
        component={Feed}
        options={{
          headerLeft: () => null,
          headerRight: () => (
            <Btn
              icon={
                <Feather
                  name="user-plus"
                  size={30}
                  color={config.secondaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Friends",
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
      <Stack.Screen
        name="AddFriend"
        component={AddFriend}
        options={{
          headerLeft: () => (
            <Btn
              icon={
                <FontAwesome5
                  name="chevron-left"
                  size={30}
                  color={config.secondaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("FeedMain")}
            />
          ),
          headerRight: () => (
            <Btn
              icon={
                <Feather
                  name="user-plus"
                  size={30}
                  color={config.secondaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Add Friend",
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

export default FeedPage

const styles = StyleSheet.create({})
