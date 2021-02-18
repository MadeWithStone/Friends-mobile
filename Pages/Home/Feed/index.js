// Modules
import React from "react"
import config from "../../../config"
import User from "../../../Data/User"

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

let users = []
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
    console.log("### posts useEffect: " + posts.length)
    if (posts.length > 1 && !cleaned) {
      cleanOldPosts(posts)
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
        downloadUsers(false)

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
        users = []

        // download users and reset the posts
        downloadUsers(true)
      })
    }
  }

  /**
   * download post data from list of posts
   *
   * @param {array} pList list of post ids
   * @param {boolean} refreshPosts determines whether to delete current posts
   */
  const downloadPosts = async (pList, refreshPosts) => {
    // if there are posts to download
    if (pList.length > 0) {
      console.log("Post List: " + pList)
      console.log("### posts: " + pList.length)

      // run firebase function to get posts from list
      getPosts(pList).then((result) => {
        // initalize list of post objects
        let p = []

        // loop through posts
        result.forEach((post) => {
          // append each post's data to the list of post objects
          p.push(post.data())
        })

        // create a copy of the list of downloaded user objects
        let _users = [...users]

        // add the current user to the list of user objects
        _users.push(User.data)

        // sort the list of posts in date descending order
        p.sort((a, b) => {
          let dA = new Date(a.date)
          let dB = new Date(b.date)
          return dA <= dB
        })

        // initialize cuttof date object
        let cuttOff = new Date()

        // set cuttoff date to one day before the current date
        cuttOff.setDate(cuttOff.getDate() - 1)

        // filter all the posts to make sure they are no later than the cuttoff date
        p = p.filter((item, index) => {
          let d = new Date(item.date)
          return p.indexOf(item) === index && d >= cuttOff
        })

        // list of post indexes to remove
        let removeIndexes = []

        // loop through each post
        p.forEach((post, index) => {
          // remove post if it is a duplicate
          if (postList.findIndex((x) => x === post.id) === -1) {
            // add index to list of indexes to remove
            removeIndexes.push(index)
          }
        })

        // reverse the direction of the removeIndexes list
        removeIndexes = removeIndexes.reverse()

        // loop through the indexes to remove
        for (let i = 0; i < removeIndexes.length; i++) {
          // remove the post at the current remove index
          p.splice(removeIndexes[i], 1)
        }

        console.log("### posts: " + posts.length + " " + [...p].length)

        // add new posts to the posts state
        setPosts((old) => {
          let pAdd = refreshPosts ? [] : old
          return [...p, ...pAdd]
        })

        console.log("### posts: " + posts.length + " " + [...p].length)

        // set the users to the updated users
        users = _users

        // set cleaned to false calling the cleaned useEffect hook
        setCleaned(false)

        // stop the refresh indicator
        setRefreshing(false)
      })
    } else {
      // stop the refresh indicator if no new posts
      setRefreshing(false)
    }
  }

  /**
   * removes all instances of duplicate posts
   *
   * @async
   * @param {array} pList list of post ids
   */
  const removeDups = (pList) => {
    // create new asynchronous promise
    return new Promise((resolve, reject) => {
      // console.log("postList in remove dups: " + JSON.stringify(postList))

      // initialize new array
      let arr = []
      // console.log("### removing dups")

      // get length of pList
      let len = pList.length

      // initialize index
      let i = 0

      // loop through pList
      while (i < len) {
        // check if the post is in the list of current posts
        if (postList.indexOf(pList[i]) == -1) {
          // if it isnt add it the list of new posts
          arr.push(pList[i])
        }

        // increment index
        i++
      }

      console.log("postList in remove dups: " + JSON.stringify(postList))
      console.log("post list in remove dups: " + JSON.stringify(arr))

      // resolve promise with list of new posts
      resolve(arr)
    })
  }

  /**
   * downloads user objects from list of friends
   *
   * @param {boolean} refresh determines whether to reset the post data
   */
  const downloadUsers = async (refresh) => {
    // initialize list of users
    let userList = []

    // if the current user has friends
    if (User.data.friends) {
      // add the friends to the list of users
      User.data.friends.forEach((user) => userList.push(user.userID))
    }

    // if there are no users to download
    if (userList == null) {
      // stop refreshing indicator
      setRefreshing(false)
    } else {
      // get copy of postList
      let pList = [...postList]

      // run firestore function to get user objects from list
      getUsers(userList).then(async (result) => {
        // initialize list of users
        let u = []

        // loop through downloaded user objects
        result.forEach((user) => {
          // add user data to list of users
          u.push(user.data())

          // get the latest two posts from the current user and add them to pList
          for (let i = 0; i < 2 && i < user.data().posts.length; i++) {
            // add post to pList
            pList.push(user.data().posts[i])
          }
        })

        // get length of current user's list of posts
        let userPostsLength = User.data.posts ? User.data.posts.length : 0

        // loop through user posts
        for (let i = 0; i < 2 && i < userPostsLength; i++) {
          // add top two to pList
          pList.push(User.data.posts[i])
        }

        // filter pList to remove duplicate items
        let arr1 = pList.filter((item, index) => pList.indexOf(item) === index) //removeDups(pList)

        // determine if this is a new user
        let newUser = User.data.posts ? false : false

        // user newUser and post list length to determine whether to reset
        let reset = arr1.length < postList.length || newUser

        // if reset
        if (reset) {
          console.log("reseting: " + (arr1.length < postList.length) + newUser)

          // reset postList
          postList = []

          // reset list of post objects
          setPosts([])
        }

        console.log("arr1: " + JSON.stringify(arr1))

        // remove posts that are already downloaded
        let arr = await removeDups(Object.assign(arr1))

        // initialize list of indexes to remove
        let removeIndexes = []

        // loop through postList
        postList.forEach((post, index) => {
          // if post is not in new list of posts
          if (arr1.findIndex((x) => x === post) === -1) {
            // add post index to list of posts to remove
            removeIndexes.push(index)
          }
        })

        // reverse list of remove indexes
        removeIndexes = removeIndexes.reverse()

        // loop through remove indexes
        for (let i = 0; i < removeIndexes.length; i++) {
          // remove posts
          postList.splice(removeIndexes[i], 1)
        }

        console.log("remove indexes: " + JSON.stringify(removeIndexes))

        // add new posts to postList
        postList = [...arr, ...postList]

        // update users with new list of users
        users = u

        console.log("user set: " + JSON.stringify(userList))

        // download new posts
        downloadPosts(arr, refresh)
      })
    }
  }

  /**
   * removes duplicate instances of posts
   *
   * @param {array} pList list of post objects
   */
  const cleanOldPosts = (pList) => {
    // make copy of pList
    let p = [...pList]

    // initialize array
    let dict = []

    // initialize array
    let people = []

    // set cleaned to true
    setCleaned(true)

    // sort p into ascending order
    p.sort((a, b) => {
      let dB = new Date(a.date)
      let dA = new Date(b.date)
      return dA <= dB
    })

    // loop through p backwards
    for (let i = p.length - 1; i >= 0; i--) {
      // if post has 5 or more reports
      if (p[i].reports != null && p[i].reports.length >= 5) {
        // remove post
        p.splice(i, 1)
      } else {
        // find user in people array
        let idx = people.indexOf(p[i].userID)

        // user is not in people array
        if (idx == -1) {
          // add user to people array
          people.push(p[i].userID)

          // add a 1 to dict array
          dict.push(1)
        } else {
          // if person has more than two posts
          if (dict[idx] >= 2) {
            // delete new posts
            p.splice(i, 1)
          } else dict[idx]++ // increment number of posts for person
        }
      }
    }

    // sort in descending order again
    p.sort((a, b) => {
      let dA = new Date(a.date)
      let dB = new Date(b.date)
      return dA <= dB
    })

    // update post state
    setPosts(p)
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
            refreshing={refreshing}
            onRefresh={_onRefresh}
            tintColor={config.textColor}
          />
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
        reportOptions={[
          "Report for Sexually Explicit Content",
          "Report for Copyright Infringement",
          "Report for Violation of Terms of Service",
          "Report for Violation of Privacy Policy",
        ]}
      />
      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  starterText: {
    color: config.primaryColor,
    fontSize: 17,
    width: "100%",
    textAlign: "center",
    marginTop: 30,
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
