// Modules
import React from "react"

// Firebase Functions

// Hooks
import { useIsFocused, useScrollToTop } from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"

// Components
import { Text, Dimensions, View, StyleSheet } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler"
import { KeyboardAccessoryView } from "@flyerhq/react-native-keyboard-accessory-view"
import KeyboardListener from "react-native-keyboard-listener"
import KeyboardSpacer from "react-native-keyboard-spacer"

import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
  initialWindowMetrics,
} from "react-native-safe-area-context"
import {
  IconButton,
  ProfileImage,
  MultilineInput,
  CachedImage,
  OptionsModal,
} from "../../../../Components"
import {
  addComment,
  getCommentUsers,
  getPost,
  postReference,
  updateReports,
  deletePost as deletePostFunc,
} from "../../../../Firebase/PostFunctions"
import { updateUser } from "../../../../Firebase/UserFunctions"
import User from "../../../../Data/User"
import config from "../../../../config"
import { Keyboard } from "react-native"
import useUserData from "../../../../Firebase/useUserData"

/**
 * handles viewing of post after clicked in feed
 *
 * @class
 * @component
 */
const PostView = ({ route, navigation }) => {
  let { params } = route
  params = { ...params }
  const dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  const scrollview = React.useRef()
  const safeArea = useSafeAreaInsets()
  const userData = useUserData()

  const postOwner = params.user.id === userData.id

  const [keyboardOpen, setKeyboardOpen] = React.useState(false)
  const [comments, setComments] = React.useState([])
  const [commentInput, setCommentInput] = React.useState("")
  const [users, setUsers] = React.useState([])
  const [showChooser, setShowChooser] = React.useState(false)

  usePreventScreenCapture()

  const focused = useIsFocused()
  let listener

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true))
    Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false))

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow")
      Keyboard.removeListener("keyboardDidHide")
    }
  }, [])

  React.useLayoutEffect(() => {
    if (focused) {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: config.secondaryColor,
          shadowOffset: { height: 0, width: 0 },
        },
        headerTintColor: config.primaryColor,
      })
    }
  }, [focused])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.topView}>
          <ProfileImage
            image={params.user.profileImage ? params.user.profileImage : ""}
            name={`${params.user.firstName} ${params.user.lastName}`}
            id={params.user.id}
            size={40}
            style={{
              borderColor: config.primaryColor,
              borderWidth: userData.id === params.user.id ? 1 : 0,
              borderStyle: "solid",
              padding: userData.id === params.user.id ? 1 : 0,
              margin: "auto",
            }}
          />
          {params.post.reports &&
            userData.roles &&
            userData.roles.includes("moderator") && (
              <Text
                style={{
                  ...styles.profileName,
                  color: config.primaryColor,
                  marginRight: 8,
                }}>
                {params.post.reports.length}
              </Text>
            )}
          <Text style={{ ...styles.profileName, color: config.primaryColor }}>
            {params.user.firstName} {params.user.lastName}
          </Text>
        </View>
      ),
      headerRight: () => (
        <IconButton
          onPressAction={() => setShowChooser(true)}
          icon={
            <Entypo
              name="dots-three-vertical"
              size={20}
              color={config.primaryColor}
            />
          }
        />
      ),
    })
  }, [navigation])

  React.useEffect(() => {
    if (keyboardOpen) {
      scrollview.current.scrollToEnd({ animated: true })
    }
  }, [keyboardOpen, comments])

  React.useEffect(() => {
    scrollview.current.scrollToEnd({ animated: true })
  }, [comments])

  React.useEffect(() => {
    //setComments(params.post.comments)
    listener = postReference(params.post.id).onSnapshot((doc) => {
      let post = doc.data()
      if (params.post === undefined) {
        navigation.goBack()
      } else if (post) {
        setComments(post.comments)
      }
    })
    return () => {
      if (listener) {
        listener()
      }
    }
  }, [])

  React.useEffect(() => {
    getCommentUsers(comments).then((u) => {
      setUsers(u)
    })
  }, [comments])

  const inputChange = (data) => {
    if (data.substring(data.length - 1) !== "\n") {
      setCommentInput(data)
    }
  }

  /**
   * make a new comment on the post
   *
   * @method
   */
  const newComment = () => {
    // get list of comments
    const newComments = [...comments]

    // add new comment object
    newComments.push({
      userID: userData.id,
      comment: commentInput,
      date: new Date().toISOString(),
    })

    // set the comment input field to blank
    setCommentInput("")

    // run firebase function to add a new comment
    addComment(newComments, params.post.id)
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

    if (type == 0) {
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
  }

  const deletePost = () => {
    deletePostFunc(params.post.id).then(async () => {
      const posts = [...userData.posts]
      const idx = posts.findIndex((x) => x === params.post.id)
      posts.splice(idx, 1)
      await updateUser({ posts }, userData.id)
      setShowChooser(false)
      navigation.goBack()
    })
  }

  const date = new Date(params.post.date)
  /*const renderScrollable = (panHandlers) => (
    // Can be anything scrollable
    
  )*/
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: config.secondaryColor }}
        edges={["bottom"]}>
        <ScrollView
          style={{
            ...styles.scrollView,
            backgroundColor: config.secondaryColor,
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: config.secondaryColor }}
          scrollEventThrottle={64}
          ref={scrollview}
          keyboardDismissMode="none">
          <View>
            <CachedImage
              source={{
                uri: params.post.image,
              }}
              cacheKey={params.post.id}
              style={{ width: dims.width, height: dims.width }}
            />
            <View style={styles.descriptionView}>
              <Text style={{ ...styles.description, color: config.textColor }}>
                <Text style={styles.descriptionStart}>
                  {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
                </Text>{" "}
                - {params.post.description}
              </Text>
              {users.length > 0 &&
                comments.map((obj) => {
                  console.log(`user: ${JSON.stringify(users[0])}`)
                  return (
                    <CommentObj
                      comment={obj}
                      user={users.find((x) => x.id === obj.userID)}
                      key={obj.date}
                    />
                  )
                })}
            </View>
          </View>
          <OptionsModal
            showChooser={showChooser}
            setShowChooser={setShowChooser}
            reportAction={
              postOwner ||
              (userData.roles && userData.roles.includes("moderator"))
                ? deletePost
                : reportPost
            }
            reportOptions={
              postOwner
                ? ["Delete Post"]
                : [
                    "Report for Sexually Explicit Content",
                    "Report for Copyright Infringement",
                    "Report for Violation of Terms of Service",
                    "Report for Violation of Privacy Policy",
                  ]
            }
          />
        </ScrollView>
        <View
          style={{
            ...styles.inputView,
            backgroundColor: config.secondaryColor,
          }}>
          <MultilineInput
            style={{
              flexGrow: 1,
              marginRight: 8,
              flexShrink: 1,
              backgroundColor: config.secondaryColor,
            }}
            onChangeText={inputChange}
            placeholder="Comment"
            value={commentInput}
            submitAction={() => newComment()}
          />
          <MaterialIcons
            name="arrow-upward"
            size={30}
            color={config.primaryColor}
            placeHolder={"Comment"}
            onPress={() => newComment()}
          />
        </View>
      </SafeAreaView>
      <KeyboardSpacer topSpacing={-32} />
    </View>
  )
}

const CommentObj = (props) => {
  const { user } = props
  const { comment } = props
  const date = new Date(comment.date)
  return (
    <View style={styles.tView}>
      {user && (
        <ProfileImage
          image={user ? user.profileImage : ""}
          name={user ? `${user.firstName} ${user.lastName}` : ""}
          id={user.id}
          size={30}
        />
      )}
      <Text style={{ ...styles.textView, color: config.textColor }}>
        <Text
          style={{
            ...styles.pName,
            color: config.textColor,
            paddingRight: 8,
          }}>
          {user ? user.firstName : ""} {user ? user.lastName : ""}
        </Text>
        {` ${comment.comment}`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    borderBottomColor: "#707070",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  topView: {
    marginBottom: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  optionsBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 0,
    marginLeft: "auto",
  },
  descriptionView: {
    margin: 8,
    paddingBottom: 30,
  },
  description: {
    fontSize: 15,
  },
  descriptionStart: {
    fontWeight: "bold",
  },
  inputView: {
    display: "flex",
    flexDirection: "row",
    padding: 8,
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: 0,
    backgroundColor: config.secondaryColor,
  },
  input: {
    flexGrow: 1,
    marginRight: 8,
    flexShrink: 1,
    backgroundColor: config.secondaryColor,
  },
  container: {
    justifyContent: "flex-end",
    flexGrow: 1,
    margin: 16,
    backgroundColor: "red",
  },
  inner: {
    paddingBottom: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  scrollView: {},
  tView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  textView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    flexGrow: 1,
    flexShrink: 1,
    color: config.textColor,
  },
  img: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  profileImg: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 4,
  },
  profileName: {
    color: config.primaryColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  pName: {
    // color: config.primaryColor,
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
  },
})

export default PostView
