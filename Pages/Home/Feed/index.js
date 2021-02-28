// Modules
import React from "react"
import config from "../../../config"
import User from "../../../Data/User"
import FeedFunctions from "./feedFunctions"

// Contexts
import { createStackNavigator } from "@react-navigation/stack"

// Hooks
import { useIsFocused } from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"

// Data Functions
import {
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"
import { getUsers } from "../../../Firebase/UserFunctions"
import { loadData } from "../../../Firebase/UserFunctions"

// Navigation
import AddFriend from "./AddFriend"
import PostView from "./PostView"

// Components
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  RefreshControl,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native"
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
  OptionsModal,
} from "../../../Components"
import { StatusBar } from "expo-status-bar"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import FeedObject from "./FeedObject"

let users = {}
let postList = []
let currentUser = ""

/**
 * @name Feed
 *
 * @class
 * @component
 */
const Feed = ({ route, navigation }) => {
  // list of post objects
  const [posts, setPosts] = React.useState([])

  // determines whether refresh indicator should show
  const [refreshing, setRefreshing] = React.useState(false)

  // determines whether to show the report options chooser
  const [showChooser, setShowChooser] = React.useState(false)

  // currently selected post
  const [currentPost, setCurrentPost] = React.useState(0)

  // determines whether the post list is cleaned
  const [cleaned, setCleaned] = React.useState(false)

  // hook to determine whether the component is mounted
  let focused = useIsFocused()

  // hook to prevent screen capture when mounted
  usePreventScreenCapture()

  let refInterval = 0

  // Use Effects
  React.useEffect(() => {
    if (focused) {
      getData()
    }
  }, [focused])

  React.useEffect(() => {
    // console.log("route params: " + JSON.stringify(route.params))
    let code = route.params ? route.params.code : ""
    if (code !== "" && code) {
      navigation.navigate("AddFriend", { code: code })
    }
  }, [])

  React.useEffect(() => {
    if (focused) {
      let refresh = route.params ? route.params.refresh : false
      if (refresh) {
        console.log("refreshing data")
        setPosts([])
        postList = []
      }
    }
  }, [navigation])

  React.useEffect(() => {
    console.log("### posts cleaning: " + posts.length)
    if (posts.length > 1 && !cleaned) {
      FeedFunctions.cleanOldPosts(posts).then((cleanedPosts) => {
        setPosts(cleanedPosts)
        setCleaned(true)
      })
    }
  }, [posts])

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

  /**
   * get feed data
   */
  const getData = () => {
    // if component mounted
    if (focused) {
      // get updated user data from firestore
      User.getUpdatedData().then(() => {
        // reset the users list
        users = []

        // run download users and do not reset the posts
        runFunctions(false)

        // if still focused
        if (focused) {
          // call itself after 60 seconds
          setTimeout(() => {
            getData()
          }, 60000)
        }
      })
    }
  }

  /**
   * update feed data
   */
  const updateData = () => {
    console.log("running update data")

    // if component mounted
    if (focused) {
      // get updated user data from firestore
      User.getUpdatedData().then(() => {
        // reset the post list
        postList = []

        // reset the user list
        users = {}

        // download users and reset the posts
        runFunctions(true)
      })
    }
  }

  /**
   * runs the functions that get firestore data in the FeedFunctions class
   *
   * @param {boolean} refresh whether to refresh the data
   */
  const runFunctions = async (refresh) => {
    // get users and post list
    let { pList, u } = await FeedFunctions.downloadUsers([...postList], {
      data: User.data,
    })

    // set updated users
    users = u

    // get post data
    let postData = await FeedFunctions.downloadPosts(pList, postList)

    let removeIndexes = []
    postList.forEach((item, index) => {
      if (pList.find((x) => x.id === item) === -1) {
        removeIndexes.push(index)
      }
    })

    for (let i = removeIndexes.length - 1; i >= 0; i--) {
      postList.splice(removeIndexes[i], 1)
    }

    // update postList
    postList = [...postList, ...pList]

    // set new posts to state
    setPosts((old) => {
      let pCopy = !refresh ? [...old] : []
      // loop through pCopy backwards
      for (let i = pCopy.length - 1; i >= 0; i--) {
        // if post is not in new list of posts
        if (postList.findIndex((x) => x === pCopy[i].id) === -1) {
          // remove post
          pCopy.splice(i, 1)
        }
      }
      return [...pCopy, ...postData]
    })

    // clean new posts
    setCleaned(false)

    // stop refresh indicator
    setRefreshing(false)
  }

  /**
   * called when user pulls down on feed scroll view
   */
  const _onRefresh = () => {
    // set refresh indicator to true
    setRefreshing(true)

    // run update data
    updateData()
  }

  /**
   * shows report menu
   */
  const menu = (id) => {
    // set current post to selected post
    setCurrentPost(id)

    // show options menu
    setShowChooser(true)
  }

  /**
   * adds a report to the currently selected post
   *
   * @param {number} type optiens menu number
   */
  const reportPost = (type) => {
    // find current post in list of posts
    let reports = posts.find((x) => x.id == currentPost)

    // get reports array for post
    reports = reports.reports ? reports.reports : []

    // check if user has not already reported the post
    if (reports.findIndex((x) => x.userID === User.data.id) == -1) {
      // add new report
      reports.push({
        userID: User.data.id,
        report: type,
        date: new Date().toISOString(),
      })

      // run update reports firebase function
      updateReports(currentPost, reports).then(() => {
        // get updated post
        getPost(currentPost).then((post) => {
          // update posts with new post
          setPosts((pPosts) => {
            // get copy of posts array
            let prevPosts = [...pPosts]

            // find index of updated post
            let idx = prevPosts.findIndex((x) => x.id === currentPost)

            // update post
            prevPosts[idx] = post.data()

            // save results
            return prevPosts
          })

          // clean posts
          setCleaned(false)

          // close chooser
          setShowChooser(false)
        })
      })
    } else {
      // close chooser if already reported
      setShowChooser(false)
    }
  }

  let cuttOff = new Date()
  cuttOff.setDate(cuttOff.getDate() - 2)

  return (
    <View>
      <FlatList
        style={{
          width: 100 + "%",
          height: 100 + "%",
          backgroundColor: config.secondaryColor,
        }}
        showsVerticalScrollIndicator={false}
        horizontal={false}
        data={posts
          .filter((item, index) => {
            let date = new Date(item.date)
            return date >= cuttOff && posts.indexOf(item) === index
          })
          .sort((a, b) => {
            let dA = new Date(a.date)
            let dB = new Date(b.date)
            return dA <= dB
          })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={_onRefresh}
            tintColor={config.textColor}
          />
        }
        ListEmptyComponent={
          <Text style={{ ...styles.starterText, color: config.textColor }}>
            Share your{" "}
            <TextButton
              text="Friend Code"
              textStyle={{
                alignItems: "center",
                justifyContent: "center",
                marginBottom: -3,
                fontWeight: "bold",
              }}
              onPressAction={() => navigation.navigate("AddFriend")}
            />{" "}
            to make friends
          </Text>
        }
        renderItem={({ item, index, separators }) => {
          let post = item
          return (
            <FeedObject
              post={post}
              user={users[post.userID]}
              key={post.date}
              menuAction={() => menu(post.id)}
              onImagePress={() => {
                navigation.navigate("Post", {
                  post: post,
                  user: users[post.userID],
                  currentUser: User.data,
                })
              }}
            />
          )
        }}></FlatList>

      <OptionsModal
        showChooser={showChooser}
        setShowChooser={setShowChooser}
        reportAction={reportPost}
        reportOptions={[
          "Report for Sexually Explicit Content",
          "Report for Copyright Infringement",
          "Report for Violation of Terms of Service",
          "Report for Violation of Privacy Policy",
        ]}
      />
      <StatusBar style={config.secondaryColor === "#000" ? "light" : "dark"} />
    </View>
  )
}

const styles = StyleSheet.create({
  starterText: {
    fontSize: 17,
    width: "100%",
    textAlign: "center",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
})

const Stack = createStackNavigator()
const FeedPage = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
      <Stack.Screen
        name="FeedMain"
        component={Feed}
        initialParams={route.params}
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
