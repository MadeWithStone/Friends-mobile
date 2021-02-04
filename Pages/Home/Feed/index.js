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
import { useIsFocused } from "@react-navigation/native"
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
import { DatePickerIOS } from "react-native"
import { set } from "react-native-reanimated"

const Feed = (props) => {
  const [posts, setPosts] = React.useState([])
  const [postList, setPostList] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [refreshing, setRefreshing] = React.useState(false)
  let focused = useIsFocused()

  let user = new User()

  let refInterval

  React.useEffect(() => {
    console.warn("running refresh")
    if (focused) {
      getData()
    }
    //autoRefresh()
  }, [focused])

  const autoRefresh = () => {
    console.log("focused: " + focused)
    if (focused) {
      getData()
      if (!refInterval) {
        //refInterval = setInterval(() => updateData(), 30000)
      }
    } else {
      if (refInterval) {
        clearInterval(refInterval)
      }
    }
  }

  const getData = () => {
    console.log("### running getData")
    user.loadCurrentUser().then(() => {
      console.log("### done loading user")
      user.getUpdatedData().then(() => {
        console.log("### done getData")
        //setPosts([])
        setPostList([])
        setUsers([])
        downloadUsers()
      })
    })
  }

  const updateData = () => {
    user.getUpdatedData().then(() => {
      //setPosts([])
      setPostList([])
      downloadPosts()
    })
  }

  const downloadPosts = async () => {
    console.log("### downloading posts")

    let pList = postList
    console.log("postList: " + JSON.stringify(postList))

    console.log("### removing dups")

    if (postList.length > 0) {
      getPosts(postList).then((result) => {
        let p = posts
        result.forEach((post) => {
          p.push(post.data())
        })
        console.log("### posts: " + JSON.stringify(p))
        let _users = users
        _users.push(user.data)
        p.sort((a, b) => {
          let dA = new Date(a.date)
          let dB = new Date(b.date)
          return dA <= dB
        })
        setPosts(p)
        setUsers(_users)
        setRefreshing(false)
      })
    } else {
      setRefreshing(false)
    }
  }

  const removeDups = (pList) => {
    return new Promise((resolve, reject) => {
      let arr = pList
      console.log("### removing dups")
      let len = postList.length
      for (let i = 0; i < len; i++) {
        if (postList.indexOf(pList[i]) != -1) {
          arr.splice(i, 1)
        }
      }
      console.log("post list in remove dups: " + JSON.stringify(arr))
      resolve(arr)
    })
  }

  const downloadUsers = async () => {
    console.log("### downloading Users")
    setRefreshing(true)
    let userList = []
    user.data.friends.forEach((user) => userList.push(user.userID))
    if (userList == null) {
      //downloadPosts()
    } else {
      let pList = postList
      console.log("### getting users: " + JSON.stringify(userList))
      getUsers(userList).then(async (result) => {
        let u = []
        result.forEach((user) => {
          u.push(user.data())
          for (let i = 0; i < 2 && i < user.data().posts.length; i++) {
            pList.push(user.data().posts[i])
          }
        })
        console.log("### got users: " + JSON.stringify(pList))
        for (let i = 0; i < 2 && i < user.data.posts.length; i++) {
          pList.push(user.data.posts[i])
        }
        let arr = pList.filter((item, index) => pList.indexOf(item) === index) //removeDups(pList)
        arr = await removeDups(arr)
        setUsers(u)
        setPostList(arr)
        //setRefreshing(false)
        downloadPosts()
      })
    }
  }

  const _onRefresh = () => {
    updateData()
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
        }>
        {posts.map((post) => {
          return (
            <FeedObject
              post={post}
              user={users.find((x) => x.id == post.userID)}
              key={post.date}
            />
          )
        })}
      </ScrollView>

      <StatusBar style="light" />
    </View>
  )
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
