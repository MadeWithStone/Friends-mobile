import React, { useState } from "react"
import {
  Alert,
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Button,
  TouchableHighlight,
  ActivityIndicator,
  KeyboardAvoidingView,
  SegmentedControlIOSComponent,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import { Button as Btn } from "react-native-elements"
import { ProgressBar, Colors } from "react-native-paper"
import uuid from "react-native-uuid"
import { usePreventScreenCapture } from "expo-screen-capture"
import { useIsFocused } from "@react-navigation/native"
import * as ScreenOrientation from "expo-screen-orientation"
import { SafeAreaView } from "react-native-safe-area-context"
import { uploadImage, createPostData } from "../../../../Firebase/PostFunctions"
import {
  updateUserPosts,
  userReference,
} from "../../../../Firebase/UserFunctions"
import User from "../../../../Data/User"
import FeedPage from "../../Feed"

import config from "../../../../config"
import { IconButton, MultilineInput } from "../../../../Components"

const _this = null
let desc = ""
export default function HomeScreen({ navigation, route }) {
  const [posting, post] = useState(false)
  const [image, setImage] = useState(route.params.image)
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState(0)
  const [progressText, updateProgressText] = useState("")
  let scroll = null
  const maxChars = 140
  const [dims, setDims] = React.useState({
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  })

  usePreventScreenCapture()
  const focused = useIsFocused()

  React.useEffect(() => {
    if (focused && User.data.posts && User.data.posts.length >= 6) {
      alert(
        "You have reached your post maximum of 6. Please go to your profile and delete posts."
      )
      navigation.goBack()
    }
    if (focused) {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).then(() => {
        setDims({
          width: Dimensions.get("screen").width,
          height: Dimensions.get("screen").height,
        })
      })
    }
  }, [focused])

  const onChangeText = (text) => {
    if (text.split("").length < maxChars) {
      setDescription(text)
      desc = text
    }
  }

  const uploadPost = async () => {
    console.warn(`description: ${desc}`)
    post(true)
    const postID = uuid.v1()
    let imgUrl = ""
    updateProgressText("Uploading Image")
    const uploadUri =
      Platform.OS === "ios" ? image.replace("file://", "") : image
    const task = uploadImage(
      uploadUri,
      postID,
      (snapshot) => {
        setProgress(
          Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 0.5
        )
      },
      async (url) => {
        imgUrl = url
        // wait for data to upload
        setProgress(0.51)
        updateProgressText("Uploading Post Data")
        const date = new Date()
        const postData = {
          image: imgUrl,
          date: date.toISOString(),
          comments: [],
        }
        postData.description = desc
        const createPost = await createPostData(postData, postID)
        setProgress(0.8)
        updateProgressText("Sharing with Friends")
        let postList = User.data.posts

        if (postList == null) {
          postList = [postID]
        } else {
          postList.unshift(postID)
        }
        const updatePostsResult = await updateUserPosts(postList)
        setProgress(1)
        setTimeout(() => {
          post(false)
          navigation.navigate("FeedMain")
        }, 100)
        // send back to main screen
        console.log(`url: ${url}`)
      }
    ) // wait for image to upload
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Btn
          onPress={() => {
            uploadPost()
          }}
          icon={
            <Feather name="plus-square" size={30} color={config.primaryColor} />
          }
          type="clear"
        />
      ),
    })
  }, [navigation, post])
  const d = description
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: config.secondaryColor }}
      edges={["bottom"]}>
      <KeyboardAvoidingScrollView
        style={{ ...styles.container, backgroundColor: config.secondaryColor }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        cont
        stickyFooter={
          <Text
            style={{
              padding: 8,
              color: config.primaryColor,
              fontSize: 17,
              backgroundColor: config.secondaryColor,
              fontWeight: "bold",
              textAlign: "center",
            }}>
            Posts are only viewable within two days of posting.
          </Text>
        }
        innerRef={(ref) => {
          scroll = ref
        }}>
        <Modal animationType="fade" transparent={true} visible={posting}>
          <View
            style={{ ...styles.modal, backgroundColor: config.secondaryColor }}>
            <View
              style={{
                ...styles.modalTitle,
                backgroundColor: config.primaryColor,
              }}>
              <Text
                style={{
                  ...styles.modalTitleText,
                  color: config.secondaryColor,
                }}>
                Posting...
              </Text>
              <ActivityIndicator
                animating={true}
                color={config.secondaryColor}
              />
            </View>
            <View>
              <Text style={{ ...styles.statusText, color: config.textColor }}>
                {progressText}
              </Text>
              <ProgressBar
                color={config.primaryColor}
                progress={progress}
                style={{ marginLeft: 8, marginRight: 8, marginBottom: 16 }}
              />
            </View>
          </View>
        </Modal>
        <View>
          <View>
            {dims && (
              <Image
                source={{ uri: image }}
                style={{
                  width: dims.width > dims.height ? dims.height : dims.width,
                  height: dims.width > dims.height ? dims.height : dims.width,
                }}
              />
            )}
            <Text style={{ padding: 8, color: config.textColor }}>
              {maxChars - d.split("").length}
            </Text>
            <MultilineInput
              placeholder={"Description"}
              onChangeText={(text) => onChangeText(text)}
              value={d}
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                paddingBottom: 4,
                borderBottomWidth: 0,
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    paddingTop: 0,
  },
  modal: {
    marginTop: 100,
    marginBottom: 100,
    marginLeft: 50,
    marginRight: 50,
    borderRadius: 15,
  },
  modalTitle: {
    padding: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  modalTitleText: {
    fontSize: 17,
    textAlign: "center",
    paddingRight: 4,
  },
  statusText: {
    padding: 16,
    textAlign: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "center",
    margin: 20,
    justifyContent: "space-around",
    width: `${100}%`,
  },
  button: {
    // flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
    width: 60,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  round: {
    width: 70,
    height: 70,
    backgroundColor: "#ffffff",
    borderRadius: 35,
  },
  library: {
    width: 60,
    height: 60,
  },
  finder: {},
})
