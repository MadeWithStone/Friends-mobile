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
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import Ionicons from "@expo/vector-icons/Ionicons"
import { IconButton, MultilineInput } from "../../../../Components"
import Feather from "@expo/vector-icons/Feather"
import config from "../../../../config"
import { Button as Btn } from "react-native-elements"
import { ProgressBar, Colors } from "react-native-paper"
import { uploadImage, createPostData } from "../../../../Firebase/PostFunctions"
import { updateUserPosts } from "../../../../Firebase/UserFunctions"
import uuid from "react-native-uuid"
import User from "../../../../Data/User"
import FeedPage from "../../Feed"
let _this = null

export default function HomeScreen({ navigation, route }) {
  const [posting, post] = useState(false)
  let [image, setImage] = useState(route.params.image)
  let [description, setDescription] = useState("")
  let [progress, setProgress] = useState(0)
  let [progressText, updateProgressText] = useState("")
  let scroll = null
  let maxChars = 140
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  let user = new User()
  user.loadCurrentUser()

  const onChangeText = (text) => {
    if (text.split("").length < maxChars) {
      setDescription(text)
    }
  }

  const uploadPost = async () => {
    post(true)
    let postID = uuid.v1()
    let imgUrl = ""
    let descript = description
    updateProgressText("Uploading Image")
    const uploadUri =
      Platform.OS === "ios"
        ? image.replace("file://", "")
        : image.replace("file:", "")
    try {
      let file = new FileReader()
      file.readAsDataURL(uploadUri)
    } catch (err) {
      console.error(err)
    }
    let task = uploadImage(
      uploadUri,
      postID,
      function (snapshot) {
        setProgress(
          Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 0.5
        )
      },
      async function (url) {
        imgUrl = url
        //wait for data to upload
        setProgress(0.51)
        updateProgressText("Uploading Post Data")
        let date = new Date()
        let postData = {
          image: imgUrl,
          date: date.toISOString(),
          comments: [],
        }
        postData.description = description
        let createPost = await createPostData(postData, postID)
        setProgress(0.8)
        updateProgressText("Sharing with Friends")
        let postList = user.data.posts

        if (postList == null) {
          postList = [postID]
        } else {
          postList.unshift(postID)
        }
        let updatePostsResult = await updateUserPosts(postList)
        setProgress(1)
        setTimeout(() => {
          post(false)
          navigation.popToTop()
        }, 100)
        //send back to main screen
        console.log("url: " + url)
      }
    ) //wait for image to upload
  }

  const _scrollToInput = (reactNode) => {
    // Add a 'scroll' ref to your ScrollView
    scroll.props.scrollToFocusedInput(reactNode)
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Btn
          onPress={() => uploadPost()}
          icon={
            <Feather
              name="plus-square"
              size={30}
              color={config.secondaryColor}
            />
          }
          type="clear"
        />
      ),
    })
  }, [navigation, post])

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      innerRef={(ref) => {
        scroll = ref
      }}>
      <Modal animationType="fade" transparent={true} visible={posting}>
        <View style={styles.modal}>
          <View style={styles.modalTitle}>
            <Text style={styles.modalTitleText}>Posting...</Text>
            <ActivityIndicator animating={true} color={config.secondaryColor} />
          </View>
          <View>
            <Text style={styles.statusText}>{progressText}</Text>
            <ProgressBar
              color={config.primaryColor}
              progress={progress}
              style={{ marginLeft: 8, marginRight: 8, marginBottom: 16 }}
            />
          </View>
        </View>
      </Modal>
      <Image
        source={{ uri: image }}
        style={{ width: dims.width, height: dims.width }}
      />
      <Text style={{ padding: 8, color: config.textColor }}>
        {maxChars - description.split("").length}
      </Text>
      <MultilineInput
        placeholder={"Description"}
        onChangeText={(text) => onChangeText(text)}
        value={description}
        style={{
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 4,
          borderBottomWidth: 0,
          color: config.textColor,
        }}
        onFocus={(event) => {
          // `bind` the function if you're using ES6 classes
          this._scrollToInput(ReactNative.findNodeHandle(event.target))
        }}
      />
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.secondaryColor,
    width: 100 + "%",
    height: 100 + "%",
    margin: 0,
  },
  modal: {
    marginTop: 100,
    marginBottom: 100,
    marginLeft: 50,
    marginRight: 50,
    backgroundColor: config.secondaryColor,
    borderRadius: 15,
  },
  modalTitle: {
    backgroundColor: config.primaryColor,
    padding: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  modalTitleText: {
    color: config.secondaryColor,
    fontSize: 17,
    textAlign: "center",
    paddingRight: 4,
  },
  statusText: {
    padding: 16,
    textAlign: "center",
    color: config.textColor,
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
    width: 100 + "%",
  },
  button: {
    //flex: 0.1,
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
