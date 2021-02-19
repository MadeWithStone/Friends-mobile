// Modules
import React from "react"
import * as ImagePicker from "expo-image-picker"
import User from "../../../Data/User"
import config from "../../../config"
import * as ImageManipulator from "expo-image-manipulator"

// Navigation
import { createStackNavigator } from "@react-navigation/stack"
import CreatePost from "./CreatePost"
import Feed from "../Feed"

// Hooks
import { useIsFocused } from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"

// Components
import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import { IconButton } from "../../../Components"
import { Button as Btn } from "react-native-elements"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"

/**
 * screen to choose or take pictures to post
 *
 * @class
 * @component
 */
const Post = (props) => {
  const [hasPermission, setHasPermission] = React.useState(false)
  const [pickerPermission, setPickerPermission] = React.useState(false)
  const [type, setType] = React.useState(Camera.Constants.Type.back)
  const [image, setImage] = React.useState("")
  const focused = useIsFocused()
  let camera
  const [dims, setDims] = React.useState({
    width: 0,
    height: 0,
  })

  usePreventScreenCapture()

  React.useEffect(() => {
    if (focused && hasPermission == false) {
      setUpPermisions()
    }
    if (focused) {
      setDims({
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      })
      if (User.data.posts && User.data.posts.length >= 6) {
        alert(
          "You have hit your post maximum. Please delete 1 or more posts to post a new one."
        )
      }
    }
  }, [focused])

  /**
   * sets up camera and picker permissions
   *
   * @method
   */
  const setUpPermisions = async () => {
    // use Camera module to request permissions to access the camera
    const { status } = await Camera.requestPermissionsAsync()

    // get the permission status of the image picker
    const {
      pickerStatus,
    } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    // update state with permissions
    setHasPermission(status === "granted")
    setPickerPermission(pickerStatus === "granted")
  }

  /**
   * take picture
   *
   * @method
   */
  const snap = async () => {
    // if we have a camera reference
    if (camera) {
      // take a photo
      let photo = await camera.takePictureAsync()

      // compress the photo
      compressImage(photo)
    }
  }

  /**
   * uses the ImageManipulator to compress the image
   *
   * @param {string} photo uri to the image
   */
  const compressImage = async (photo) => {
    // create options object
    let options = {
      originX: 0,
      originY: 0,
      width: photo.width,
      height: photo.height,
    }

    // if image is not square
    if (photo.width !== photo.height) {
      // find the intended width of square image
      let width = photo.width > photo.height ? photo.height : photo.width

      // find the y origin of the cropped image
      let originY =
        photo.width > photo.height ? 0 : photo.height / 2 - width / 2

      // find the x origin of the cropped image
      let originX = photo.width > photo.height ? photo.width / 2 - width / 2 : 0

      // update options object
      options = {
        originX: originX,
        originY: originY,
        width: width,
        height: width,
      }
    }

    // try to crop and compress the image
    try {
      // pass image and options into the ImageManipulator
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: options }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      )

      // update the image state
      setImage(manipResult.uri)

      // navigate to the CreatePost screen
      props.navigation.navigate("CreatePost", {
        image: manipResult.uri,
      })
    } catch (err) {
      // if error
      console.log("Post.compressImage: catch error: " + err)
    }
  }

  /**
   * show image picker
   *
   * @method
   */
  const pickImage = async () => {
    // try to pick the image
    try {
      // use ImagePicker module to get an image
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      // if picker was not cancelled
      if (!result.cancelled) {
        // compress the image
        compressImage(result)
      }
    } catch (err) {
      // if there was an error picking then alert the user
      alert("Enable camera roll permisions for Friends")
    }
  }

  return (
    <View style={styles.container}>
      {focused && hasPermission && dims !== {} && (
        <Camera
          style={styles.camera}
          type={type}
          ref={(ref) => {
            camera = ref
          }}>
          <View
            style={{
              width: dims.width - 16,
              height: dims.width - 16,
              borderColor: config.primaryColor,
              borderWidth: 2,
              marginTop: (dims.height - dims.width - 16) / 2 - 16,
              marginBottom: "auto",
              margin: 8,
              borderRadius: 5,
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                style={styles.library}
                source={{
                  uri:
                    "https://www.nationalgeographic.com/content/dam/photography/photos/000/000/6.ngsversion.1467942028599.adapt.1900.1.jpg",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...styles.round, backgroundColor: config.primaryColor }}
              onPress={snap}
            />
            <IconButton
              style={styles.button}
              onPressAction={() => {
                setType((t) => {
                  return t === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                })
              }}
              icon={
                <Ionicons
                  name="camera-reverse-outline"
                  size={45}
                  color={config.primaryColor}
                />
              }
            />
          </View>
        </Camera>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 35,
  },
  library: {
    width: 60,
    height: 60,
  },
  finder: {},
})

const Stack = createStackNavigator()
const PostPage = ({ navigation }) => {
  return (
    <Stack.Navigator
      options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
      <Stack.Screen
        name="PostStack"
        component={Post}
        options={{
          headerShown: false,
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
        name="CreatePost"
        component={CreatePost}
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
              onPress={() => navigation.navigate("PostStack")}
            />
          ),
          title: "Create Post",
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
        name="Feed"
        component={Feed}
        options={{ title: "Friends" }}
      />
    </Stack.Navigator>
  )
}

export default PostPage
