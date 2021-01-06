import React from "react"
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native"
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
import { getPosts } from "../../../Firebase/PostFunctions"

import { StatusBar } from "expo-status-bar"
import AddFriend from "./AddFriend"
import User from "../../../Data/User"
import { getUsers } from "../../../Firebase/UserFunctions"
import { loadData } from "../../../Firebase/UserFunctions"

class Feed extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      postList: [],
      users: [],
      refreshing: false,
    }
    this.user = new User()
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    this.user.loadCurrentUser(() => {
      this.getUserUpdate()
    })
  }

  getUserUpdate = () => {
    let user = this.user
    loadData(user.auth.uid).then((doc) => {
      user.data = doc.data()
      user.setCurrentUser()
      this.user = user
      this.setState({ postList: [] })
      this.downloadUsers()
    })
  }

  downloadPosts = async () => {
    let postList = this.state.postList
    for (let i = 0; i < 2 && i < this.user.data.posts.length; i++) {
      postList.push(this.user.data.posts[i])
    }
    getPosts(postList).then((result) => {
      let p = []
      result.forEach((post) => {
        p.push(post.data())
      })
      console.log("posts: " + JSON.stringify(p))
      let _users = this.state.users
      _users.push(this.user.data)
      this.setState({ posts: p, users: _users, refreshing: false })
    })
  }

  downloadUsers = async () => {
    this.setState({ refreshing: true })
    let userList = this.user.data.friends
    if (userList == null) {
      this.downloadPosts()
    } else {
      let pList = this.state.postList
      getUsers(userList).then((result) => {
        let u = []
        result.forEach((user) => {
          u.push(user.data())
          pList.push(user.data().posts[0], user.data().posts[1])
        })
        this.setState({ users: u, postList: pList })
        this.downloadPosts()
      })
    }
  }

  _onRefresh = () => {
    this.getUserUpdate()
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
          horizontal={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }>
          {this.state.posts.map((post) => {
            return (
              <FeedObject
                post={post}
                user={this.state.users.find((x) => x.id == post.userID)}
                key={post.date}
              />
            )
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
                  color={config.primaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Friends",
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
                  color={config.primaryColor}
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
                  color={config.primaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("AddFriend")}
            />
          ),
          title: "Add Friend",
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

export default FeedPage

const styles = StyleSheet.create({})
