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
import { ScrollView } from "react-native-gesture-handler"
import { KeyboardAccessoryView } from "@flyerhq/react-native-keyboard-accessory-view"
import KeyboardListener from "react-native-keyboard-listener"

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
} from "../../../../Firebase/PostFunctions"
import User from "../../../../Data/User"
import config from "../../../../config"

/**
 * handles viewing of post after clicked in feed
 *
 * @class
 * @component
 */
const PostView = ({ route, navigation }) => {
  const { params } = route
  const dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  const scrollview = React.useRef()
  const safeArea = useSafeAreaInsets()

  const [keyboardOpen, setKeyboardOpen] = React.useState(false)
  const [comments, setComments] = React.useState([])
  const [commentInput, setCommentInput] = React.useState("")
  const [users, setUsers] = React.useState([])
  const [showChooser, setShowChooser] = React.useState(false)

  usePreventScreenCapture()

  const focused = useIsFocused()
  let listener

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
          />
          <Text style={{ ...styles.profileName }}>
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
    setComments(params.post.comments)
    getPost(params.post.id).then((post) => {
      params.post = post.data()
      setComments(params.post.comments)
    })
    listener = postReference(params.post.id).onSnapshot((doc) => {
      params.post = doc.data()
      if (params.post == undefined) {
        navigation.goBack()
      } else {
        setComments(params.post.comments)
      }
    })
  }, [])

  React.useEffect(() => {
    if (listener && !focused) {
      listener()
    }
  }, [focused])

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
      userID: User.data.id,
      comment: commentInput,
      date: new Date().toISOString(),
    })

    // set the comment input field to blank
    setCommentInput("")

    // run firebase function to add a new comment
    addComment(newComments, params.post.id)
  }

  /**
   * add a report to the current post
   */
  const reportPost = (type) => {
    // get list of reports
    let reports = [...params.post.reports]

    // make empty list if reports does not exist
    reports = reports || []

    // check if user has already reported
    if (reports.findIndex((x) => x.userID === User.data.id) == -1) {
      // add new report if not already reported
      reports.push({
        userID: User.data.id,
        report: type,
        date: new Date().toISOString(),
      })

      // run firebase function to update the post's reports
      updateReports(params.post.id, reports).then(() => {
        // close the report chooser
        setShowChooser(false)
      })
    } else {
      // if already reported close chooser
      setShowChooser(false)
    }
  }

  const date = new Date(params.post.date)
  const renderScrollable = (panHandlers) => (
    // Can be anything scrollable
    <ScrollView
      style={{ ...styles.scrollView, backgroundColor: config.secondaryColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: config.secondaryColor }}
      scrollEventThrottle={64}
      ref={scrollview}
      keyboardDismissMode="interactive"
      {...panHandlers}>
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
                  user={users.find((x) => x.id == obj.userID)}
                  key={obj.date}
                />
              )
            })}
        </View>
      </View>
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
    </ScrollView>
  )
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: config.secondaryColor }}
      edges={["bottom"]}>
      <KeyboardAccessoryView
        renderScrollable={renderScrollable}
        contentContainerStyle={{
          backgroundColor: config.secondaryColor,
        }}
        style={{ backgroundColor: config.secondaryColor }}>
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
      </KeyboardAccessoryView>
      <KeyboardListener
        onWillShow={() => {
          setKeyboardOpen(true)
        }}
        onWillHide={() => {
          setKeyboardOpen(false)
        }}
      />
    </SafeAreaView>
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
      <Text style={styles.textView}>
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
  scrollView: {
    flexShrink: 1,
    flexGrow: 1,
    height: "100%",
  },
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
