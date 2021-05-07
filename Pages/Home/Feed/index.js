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
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"
import { getUsers, loadData } from "../../../Firebase/UserFunctions"
import { getAllAnnouncements } from "../../../Firebase/AdminFunctions"

// Navigation
import AddFriend from "./AddFriend"
import PostView from "./PostView"

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
import FeedFunctions from "./feedFunctions"
import User from "../../../Data/User"
import config, { configHook } from "../../../config"
import FeedObject from "./FeedObject"

let users = {}
let postList = []
const currentUser = ""

/**
 * @name Feed
 *
 * @class
 * @component
 */
const Feed = ({ route, navigation }) => {
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
      const refresh = route.params ? route.params.refresh : false
      if (refresh) {
        console.log("refreshing data")
        setPosts([])
        postList = []
      }
    }
  }, [navigation])

  React.useEffect(() => {
    console.log(`### posts cleaning: ${posts.length}`)
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

        /* // if still focused
        if (focused) {
          // call itself after 60 seconds
          setTimeout(() => {
            getData()
          }, 60000)
        } */
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
    getAllAnnouncements().then((snap) => {
      const data = []
      snap.forEach((doc) => data.push({ ...doc.data(), id: doc.id }))
      setAnnouncements(data)
    })

    // get users and post list
    const { pList, u } = await FeedFunctions.downloadUsers([...postList], {
      data: User.data,
    })

    // set updated users
    users = u

    // get post data
    const postData = await FeedFunctions.downloadPosts(pList, postList)

    const removeIndexes = []
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
      const pCopy = !refresh ? [...old] : []
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
    let reports = posts.find((x) => x.id === currentPost)

    // get reports array for post
    reports = reports.reports ? reports.reports : []

    // check if user has not already reported the post
    if (reports.findIndex((x) => x.userID === User.data.id) === -1) {
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
        data={posts
          .filter((item, index) => {
            if (item) {
              const date = new Date(item.date)
              return date >= cuttOff && posts.indexOf(item) === index
            }
            return false
          })
          .sort((a, b) => {
            const dA = new Date(a.date)
            const dB = new Date(b.date)
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
          <View>
            <Text style={{ ...styles.starterText, color: config.textColor }}>
              Here's where you can see your friends' posts. Unfortunately there
              aren't any right now.
            </Text>
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
          </View>
        }
        ListHeaderComponent={
          announcements && announcements.length > 0 ? (
            <AnnouncementList announcements={announcements} />
          ) : null
        }
        renderItem={({ item, index, separators }) => {
          const post = item
          return (
            <FeedObject
              post={post}
              user={users[post.userID]}
              key={post.date}
              menuAction={() => menu(post.id)}
              onImagePress={() => {
                navigation.navigate("PostView", {
                  post,
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
        reportOptions={
          currentPost.userID === User.data.id
            ? []
            : [
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
    width: "100%",
    textAlign: "center",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
})

const AnnouncementList = ({ announcements }) => {
  const cHook = configHook()
  return (
    <FlatList
      ListEmptyComponent={() => <Text>Announcements</Text>}
      /* ListHeaderComponent={() => (
        <H3
          text="Announcements"
          style={{ width: "100%", textAlign: "center", fontWeight: "bold" }}
        />
      )} */
      keyExtractor={(item) => item.id}
      data={announcements.sort((a, b) => {
        const d1 = new Date(a.date)
        const d2 = new Date(b.date)
        return d1 < d2
      })}
      style={{
        backgroundColor: cHook.secondaryColor,
        justifyContent: "center",
      }}
      /* ItemSeparatorComponent={() => (
        <View
          style={{
            width: "100%",
            backgroundColor: "gray",
            height: StyleSheet.hairlineWidth,
          }}
        />
      )} */
      renderItem={({ item }) => (
        <View style={aStyles.container}>
          <Text style={{ ...aStyles.title, color: config.primaryColor }}>
            {item.title}
          </Text>
          <Text style={{ ...aStyles.announcement, color: config.textColor }}>
            {item.announcement}
          </Text>
        </View>
      )}
    />
  )
}

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
const FeedPage = ({ navigation, route }) => {
  const [code, setCode] = React.useState(null)
  React.useEffect(() => {
    setCode(route.params.code)
  }, [])
  React.useEffect(() => {
    // console.log("route params: " + JSON.stringify(route.params))
    console.log(`feed code ${code}`)
    if (code) {
      console.log("navigating to add friend")
      setCode(null)
      navigation.navigate("AddFriend", { code })
    }
  }, [code])
  return (
    <Stack.Navigator
      options={{
        headerStyle: { borderbottomColor: config.primaryColor },
        cardStyle: { backgroundColor: config.secondaryColor },
      }}
      screenOptions={{
        animationEnabled: false,
      }}>
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
    </Stack.Navigator>
  )
}

export default FeedPage
