import React from "react"
import { Text, Image, Dimensions, View, StyleSheet } from "react-native"
import { Icon } from "react-native-elements"
import {
  IconButton,
  ProfileImage,
  Input,
  MultilineInput,
  CachedImage,
} from "../../../../Components"
import Entypo from "@expo/vector-icons/Entypo"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Button as Btn } from "react-native-elements"
import config from "../../../../config"
import {
  KeyboardAvoidingView,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Button,
  Keyboard,
  InputAccessoryView,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { ScrollView } from "react-native-gesture-handler"
import { KeyboardAccessoryView } from "@flyerhq/react-native-keyboard-accessory-view"
import { GestureResponderHandlers } from "react-native"
import { SafeAreaView } from "react-native"
import KeyboardListener from "react-native-keyboard-listener"
import { useIsFocused, useScrollToTop } from "@react-navigation/native"
import {
  addComment,
  getCommentUsers,
  getPost,
  postReference,
  updateReports,
} from "../../../../Firebase/PostFunctions"
import User from "../../../../Data/User"
import { OptionsModal } from "../index"

const PostView = ({ route, navigation }) => {
  let params = route.params
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  let scrollview = React.useRef()

  const [keyboardOpen, setKeyboardOpen] = React.useState(false)
  const [comments, setComments] = React.useState([])
  const [commentInput, setCommentInput] = React.useState("")
  const [users, setUsers] = React.useState([])
  const [showChooser, setShowChooser] = React.useState(false)

  let focused = useIsFocused()
  let listener

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.topView}>
          <ProfileImage
            image={params.user.profileImage ? params.user.profileImage : ""}
            name={params.user.firstName + " " + params.user.lastName}
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
    setComments(params.post.comments)
    getPost(params.post.id).then((post) => {
      params.post = post.data()
      setComments(params.post.comments)
    })
    listener = postReference(params.post.id).onSnapshot((doc) => {
      params.post = doc.data()
      setComments(params.post.comments)
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

  const newComment = () => {
    let newComments = [...comments]
    newComments.push({
      userID: User.data.id,
      comment: commentInput,
      date: new Date().toISOString(),
    })
    setCommentInput("")
    addComment(newComments, params.post.id)
  }

  const reportPost = (type) => {
    let reports = params.post.reports
    reports = reports ? reports : []
    if (reports.findIndex((x) => x.userID === User.data.id) == -1) {
      reports.push({
        userID: User.data.id,
        report: type,
        date: new Date().toISOString(),
      })
      updateReports(params.post.id, reports).then(() => {
        setShowChooser(false)
      })
    } else {
      setShowChooser(false)
    }
  }

  let date = new Date(params.post.date)
  const renderScrollable = (panHandlers) => (
    // Can be anything scrollable
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: config.secondaryColor }}
      scrollEventThrottle={64}
      ref={scrollview}>
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
              console.log("user: " + JSON.stringify(users[0]))
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
      />
    </ScrollView>
  )
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAccessoryView
        renderScrollable={renderScrollable}
        spaceBetweenKeyboardAndAccessoryView={-75}
        contentOffsetKeyboardOpened={-40}
        contentOffsetKeyboardClosed={0}
        contentContainerStyle={{
          marginBottom: 0,
          backgroundColor: config.secondaryColor,
        }}
        style={{ backgroundColor: config.secondaryColor }}>
        <View style={styles.inputView}>
          <MultilineInput
            style={styles.input}
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
  let user = props.user
  let comment = props.comment
  let date = new Date(comment.date)
  return (
    <View style={styles.tView}>
      {user && (
        <ProfileImage
          image={user ? user.profileImage : ""}
          name={user ? user.firstName + " " + user.lastName : ""}
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
        {" " + comment.comment}
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
    backgroundColor: config.secondaryColor,
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
    //color: config.primaryColor,
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
  },
})

export default PostView
