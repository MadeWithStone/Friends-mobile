import React from "react"
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  RefreshControl,
  Modal,
  TouchableOpacity,
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
  LogoHorizontal,
} from "../../../Components"
import { useIsFocused } from "@react-navigation/native"
import config from "../../../config"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import FeedObject from "./FeedObject"
import {
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"

import { StatusBar } from "expo-status-bar"
import AddFriend from "./AddFriend"
import User from "../../../Data/User"
import { getUsers } from "../../../Firebase/UserFunctions"
import { loadData } from "../../../Firebase/UserFunctions"
import { DatePickerIOS } from "react-native"
import { set } from "react-native-reanimated"
import PostView from "./PostView"

let users = []
let postList = []
let currentUser = ""

const Feed = ({ route, navigation }) => {
  const [posts, setPosts] = React.useState([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [showChooser, setShowChooser] = React.useState(false)
  const [currentPost, setCurrentPost] = React.useState(0)
  let focused = useIsFocused()

  let refInterval = 0

  React.useEffect(() => {
    autoRefresh()
  }, [focused])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <LogoHorizontal title={"Friends"} />,
      headerStyle: {
        backgroundColor: config.secondaryColor,
        shadowOffset: { height: 0, width: 0 },
      },
      headerTintColor: config.primaryColor,
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 30,
      },
    })
  }, [navigation, focused])

  React.useEffect(() => {
    console.log(
      "################ Navigation: " + JSON.stringify(navigation.state)
    )
  }, [navigation])

  const autoRefresh = () => {
    console.log("focused: " + focused)
    if (focused) {
      getData()
      if (!refInterval) {
        console.log("starting interval")
        refInterval = setInterval(() => updateData(), 40000)
      }
    } else {
      console.log("clearing interval")
      clearInterval(refInterval)
    }
  }

  const getData = () => {
    console.log("### running getData")
    User.loadCurrentUser().then(() => {
      console.log("### done loading user")
      User.getUpdatedData().then(() => {
        console.log("### done getData")
        //setPosts([])
        //postList = []
        users = []
        downloadUsers()
      })
    })
  }

  const updateData = () => {
    if (focused) {
      User.loadCurrentUser().then(() => {
        console.log("### done loading user")
        User.getUpdatedData().then(() => {
          console.log("### done getData")
          //setPosts([])
          //setPostList([])
          downloadUsers()
        })
      })
    }
  }

  const downloadPosts = async (pList) => {
    if (pList.length > 0) {
      getPosts(pList).then((result) => {
        let p = posts
        result.forEach((post) => {
          p.push(post.data())
        })
        console.log("### posts: " + JSON.stringify(p))
        let _users = users
        _users.push(User.data)
        p.sort((a, b) => {
          let dA = new Date(a.date)
          let dB = new Date(b.date)
          return dA <= dB
        })
        let cuttOff = new Date()
        cuttOff.setDate(cuttOff.getDate() - 1)
        p = p.filter((item, index) => {
          let d = new Date(item.date)
          return p.indexOf(item) === index && d >= cuttOff
        })
        setPosts(p)
        users = _users
        cleanOldPosts()
        setRefreshing(false)
      })
    } else {
      setRefreshing(false)
    }
  }

  const removeDups = (pList) => {
    return new Promise((resolve, reject) => {
      console.log("postList in remove dups: " + JSON.stringify(postList))
      let arr = pList
      console.log("### removing dups")
      let len = postList.length
      let i = 0
      while (i < len) {
        if (postList.indexOf(pList[i]) != -1) {
          arr.splice(i, 1)
        } else {
          i++
        }
      }
      console.log("postList in remove dups: " + JSON.stringify(postList))
      console.log("post list in remove dups: " + JSON.stringify(arr))
      resolve(arr)
    })
  }

  const downloadUsers = async () => {
    let userList = []
    if (User.data.friends) {
      User.data.friends.forEach((user) => userList.push(user.userID))
    }
    if (userList == null) {
      //downloadPosts()
    } else {
      let pList = [...postList]
      getUsers(userList).then(async (result) => {
        let u = []
        result.forEach((user) => {
          u.push(user.data())
          for (let i = 0; i < 2 && i < user.data().posts.length; i++) {
            pList.push(user.data().posts[i])
          }
        })
        let userPostsLength = User.data.posts ? User.data.posts.length : 0
        for (let i = 0; i < 2 && i < userPostsLength; i++) {
          pList.push(User.data.posts[i])
        }

        let arr1 = pList.filter((item, index) => pList.indexOf(item) === index) //removeDups(pList)
        let newUser = User.data.posts ? false : true
        if (!newUser) {
          postList.forEach((post) => {
            if (User.data.posts.findIndex((x) => x === post) === -1) {
              newUser = true
            }
            3
          })
        }
        let reset = arr1.length < postList.length || newUser
        console.log(
          "not reseting: " +
            (arr1.length < postList.length) +
            newUser +
            " " +
            arr1.length
        )
        if (reset) {
          console.log("reseting: " + (arr1.length < postList.length) + newUser)
          postList = []
          setPosts([])
        }
        arr = await removeDups(Object.assign(arr1))
        postList = [...arr, ...postList]
        users = u
        //setRefreshing(false)

        downloadPosts(arr)
      })
    }
  }

  const cleanOldPosts = () => {
    let p = posts
    let dict = []
    let people = []
    p.sort((a, b) => {
      let dB = new Date(a.date)
      let dA = new Date(b.date)
      return dA <= dB
    })
    for (let i = p.length - 1; i >= 0; i--) {
      console.log("reports json: " + JSON.stringify(p[i].reports))
      if (p[i].reports != null) {
        console.log("reports: " + p[i].reports.length)
      }
      if (p[i].reports != null && p[i].reports.length >= 5) {
        p.splice(i, 1)
      } else {
        let idx = people.indexOf(p[i].userID)
        if (idx == -1) {
          people.push(p[i].userID)
          dict.push(1)
        } else {
          if (dict[idx] >= 2) {
            p.splice(i, 1)
          } else dict[idx]++
        }
      }
    }
    p.sort((a, b) => {
      let dA = new Date(a.date)
      let dB = new Date(b.date)
      return dA <= dB
    })
    setPosts(p)
  }

  const _onRefresh = () => {
    setRefreshing(true)
    updateData()
  }

  const menu = (id) => {
    setCurrentPost(id)
    setShowChooser(true)
  }

  const reportPost = (type) => {
    let reports = posts.find((x) => x.id == currentPost)
    reports = reports.reports ? reports.reports : []
    if (reports.findIndex((x) => x.userID === User.data.id) == -1) {
      reports.push({
        userID: User.data.id,
        report: type,
        date: new Date().toISOString(),
      })
      updateReports(currentPost, reports).then(() => {
        getPost(currentPost).then((post) => {
          setPosts((pPosts) => {
            let prevPosts = [...pPosts]
            let idx = prevPosts.findIndex((x) => x.id === currentPost)
            prevPosts[idx] = post.data()
            return prevPosts
          })

          cleanOldPosts()
          setShowChooser(false)
        })
      })
    } else {
      setShowChooser(false)
    }
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
        {posts.length < 1 && (
          <Text style={styles.starterText}>
            Share your friend code to make friends
          </Text>
        )}
        {posts
          .filter((item, index) => posts.indexOf(item) === index)
          .map((post) => {
            return (
              <FeedObject
                post={post}
                user={users.find((x) => x.id == post.userID)}
                key={post.date}
                menuAction={() => menu(post.id)}
                onImagePress={() => {
                  navigation.navigate("Post", {
                    post: post,
                    user: users.find((x) => x.id == post.userID),
                    currentUser: User.data,
                  })
                }}
              />
            )
          })}
      </ScrollView>

      <OptionsModal
        showChooser={showChooser}
        setShowChooser={setShowChooser}
        reportAction={reportPost}
      />
      <StatusBar style="light" />
    </View>
  )
}

const OptionsModal = (props) => {
  const reportOptions = [
    "Report for Sexually Explicit Content",
    "Report for Copyright Infringement",
    "Report for Violation of Terms of Service",
    "Report for Violation of Privacy Policy",
  ]
  return (
    <Modal visible={props.showChooser} animationType="fade" transparent={true}>
      <View style={{ justifyContent: "flex-end", height: 100 + "%" }}>
        <View style={{ marginBottom: 100 }}>
          <View
            style={{
              margin: 8,
              borderRadius: 15,
            }}>
            {reportOptions.map((option, index) => {
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={1}
                  onPress={() => {
                    props.reportAction(index)
                  }}
                  style={{
                    ...styles.buttonContainer,
                    borderRadius: 0,
                    borderbottomColor: config.secondaryColor,

                    backgroundColor: config.primaryColor,
                    borderBottomWidth:
                      index != reportOptions.length - 1
                        ? StyleSheet.hairlineWidth
                        : 0,
                    borderBottomLeftRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderBottomRightRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderTopLeftRadius: index == 0 ? 10 : 0,
                    borderTopRightRadius: index == 0 ? 10 : 0,
                  }}>
                  <Text
                    style={{ ...styles.button, color: config.secondaryColor }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setShowChooser(false)}
            style={{
              ...styles.buttonContainer,
              backgroundColor: config.primaryColor,
              margin: 8,
            }}>
            <Text style={{ ...styles.button, color: config.secondaryColor }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export { OptionsModal }

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
      <Stack.Screen
        name="Post"
        component={PostView}
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
          title: "Post",
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

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
  },
  buttonContainer: {
    borderRadius: 10,
  },
  starterText: {
    color: config.primaryColor,
    fontSize: 17,
    width: "100%",
    textAlign: "center",
    marginTop: 30,
  },
})
