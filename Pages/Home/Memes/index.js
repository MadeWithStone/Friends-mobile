// Modules
import React from "react"
import * as ScreenOrientation from "expo-screen-orientation"

// Contexts
import { createStackNavigator } from "@react-navigation/stack"

// Hooks
import { useIsFocused } from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"

// Data Functions
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
import { StatusBar } from "expo-status-bar"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import {
  getMemes,
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"
import { getUsers, loadData } from "../../../Firebase/UserFunctions"
import { getAllAnnouncements } from "../../../Firebase/AdminFunctions"

// Navigation
import PostView from "../Feed/PostView"

// Components
import {
  Input,
  H1,
  Button,
  TextButton,
  DismissKeyboardView,
  IconButton,
  LogoHorizontal,
  OptionsModal,
  H3,
} from "../../../Components"
import FeedFunctions from "../Feed/feedFunctions"
import User from "../../../Data/User"
import config, { configHook } from "../../../config"
import FeedObject from "../Feed/FeedObject"
import useUserData from "../../../Firebase/useUserData"

const users = {}
const postList = []
const currentUser = ""

/**
 * @name Memes
 *
 * @class
 * @component
 */
const Memes = ({ route, navigation }) => {
  // list of post objects
  const [posts, setPosts] = React.useState([])

  const [announcements, setAnnouncements] = React.useState([])

  // determines whether refresh indicator should show
  const [refreshing, setRefreshing] = React.useState(false)

  // determines whether to show the report options chooser
  const [showChooser, setShowChooser] = React.useState(false)

  // currently selected post
  const [currentPost, setCurrentPost] = React.useState(0)

  // determines whether the post list is cleaned
  const [cleaned, setCleaned] = React.useState(false)

  // hook to determine whether the component is mounted
  const focused = useIsFocused()

  const userData = useUserData()

  // hook to prevent screen capture when mounted
  usePreventScreenCapture()

  const refInterval = 0

  // Use Effects
  React.useEffect(() => {
    if (focused) {
      getData()
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  }, [focused])

  React.useEffect(() => {
    if (focused) {
      updateData()
    }
  }, [focused])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <LogoHorizontal title={"Memes"} />,
      headerStyle: {
        backgroundColor: config.secondaryColor,
        shadowOffset: { height: 0, width: 0 },
        borderBottomWidth: 0,
        shadowColor: "transparent",
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
      // reset the users list
      // users = []
      // run download users and do not reset the posts
      // runFunctions(false)
      /* // if still focused
      if (focused) {
        // call itself after 60 seconds
        setTimeout(() => {
          getData()
        }, 60000)
      } */
    }
  }

  /**
   * update feed data
   */
  const updateData = () => {
    setRefreshing(true)
    let minTime = new Date().getTime()
    minTime -= 1000 * 60 * 60 * 24 * 2
    console.log(`[Friends Memes] getting memes ${new Date().getTime()}`)
    getMemes(minTime).then((docs) => {
      console.log(`[Friends Memes.getMemes] docs: ${docs.length}`)
      setPosts(docs)
    })
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

  /**
   * adds a report to the currently selected post
   *
   * @param {number} type optiens menu number
   */
  const reportPost = (type) => {
    // find current post in list of posts
    let reports = posts.find((x) => x.id === currentPost)

    if (type === 0) {
      removeFriend(users[reports.userID].id)
    } else {
      // get reports array for post
      reports = reports.reports ? reports.reports : []

      // check if user has not already reported the post
      if (reports.findIndex((x) => x.userID === userData.id) === -1) {
        // add new report
        reports.push({
          userID: userData.id,
          report: type - 1,
          date: new Date().getTime(),
        })

        // run update reports firebase function
        updateReports(currentPost, reports).then(() => {
          // get updated post
          getPost(currentPost).then((post) => {
            // update posts with new post
            setPosts((pPosts) => {
              // get copy of posts array
              const prevPosts = [...pPosts]

              // find index of updated post
              const idx = prevPosts.findIndex((x) => x.id === currentPost)

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
  }

  const cuttOff = new Date()
  cuttOff.setDate(cuttOff.getDate() - 2)

  return (
    <View>
      <FlatList
        style={{
          width: `${100}%`,
          height: `${100}%`,
          backgroundColor: config.secondaryColor,
        }}
        showsVerticalScrollIndicator={false}
        horizontal={false}
        data={posts.sort((a, b) => {
          const dA = new Date(a.date)
          const dB = new Date(b.date)
          console.log(`[Friends Feed] Sorting Dates ${dA} < ${dB}`)
          return dB - dA
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={_onRefresh}
            tintColor={config.textColor}
          />
        }
        ListEmptyComponent={
          <View>
            <Text style={{ ...styles.starterText, color: config.textColor }}>
              Here's where you can see memes from the Friends community.
              Unfortunately there aren't any right now.
            </Text>
            <Text style={{ ...styles.starterText, color: config.textColor }}>
              Use "#meme" in your post description to add it to the memes page.
            </Text>
          </View>
        }
        renderItem={({ item, index, separators }) => {
          const post = item
          return (
            <FeedObject
              post={post}
              user={post.user}
              currentUser={userData}
              key={post.date}
              menuAction={() => menu(post.id)}
              index={index}
              onImagePress={() => {
                navigation.navigate("PostView", {
                  post,
                  user: post.user,
                  currentUser: userData,
                })
              }}
            />
          )
        }}></FlatList>

      <OptionsModal
        showChooser={showChooser}
        setShowChooser={setShowChooser}
        reportAction={reportPost}
        reportOptions={
          currentPost.userID === userData.id
            ? []
            : [
                "Block User",
                "Report for Sexually Explicit Content",
                "Report for Copyright Infringement",
                "Report for Violation of Terms of Service",
                "Report for Violation of Privacy Policy",
              ]
        }
      />
      <StatusBar style={config.secondaryColor === "#000" ? "light" : "dark"} />
    </View>
  )
}

const styles = StyleSheet.create({
  starterText: {
    fontSize: 17,
    textAlign: "center",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginRight: 16,
  },
})

const aStyles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    width: "100%",
    textAlign: "center",
  },
  announcement: {
    fontSize: 17,
    color: config.textColor,
    width: "100%",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
})

const Stack = createStackNavigator()
const MemesPage = ({ navigation, route }) => (
  <Stack.Navigator
    options={{
      headerStyle: {
        borderbottomColor: config.primaryColor,
        borderBottomWidth: 0,
      },
      cardStyle: { backgroundColor: config.secondaryColor },
    }}
    screenOptions={{
      animationEnabled: false,
    }}>
    <Stack.Screen
      name="MemeMain"
      component={Memes}
      options={{
        headerLeft: () => null,
        headerRight: () => null,
        title: `Friends`,
        headerStyle: {
          backgroundColor: config.secondaryColor,
          shadowOffset: { height: 0, width: 0 },
          borderBottomWidth: 0,
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

export default MemesPage
