import React from "react"
import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import { IconButton } from "../../../Components"
import { Button as Btn } from "react-native-elements"
import config from "../../../config"
import { createStackNavigator } from "@react-navigation/stack"
import CreatePost from "./CreatePost"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import * as ImageManipulator from "expo-image-manipulator"
import { useIsFocused } from "@react-navigation/native"

import Feed from "../Feed"

const Post = (props) => {
  const [hasPermission, setHasPermission] = React.useState(false)
  const [pickerPermission, setPickerPermission] = React.useState(false)
  const [type, setType] = React.useState(Camera.Constants.Type.back)
  const [image, setImage] = React.useState("")
  const focused = useIsFocused()
  let camera
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  React.useEffect(() => {
    if (focused && hasPermission == false) {
      setUpPermisions()
    }
  }, [focused])

  const setUpPermisions = async () => {
    const { status } = await Camera.requestPermissionsAsync()
    const {
      pickerStatus,
    } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    setHasPermission(status === "granted")
    setPickerPermission(pickerStatus === "granted")
  }

  const snap = async () => {
    if (camera) {
      let photo = await camera.takePictureAsync()
      console.log("image: " + photo.uri)
      compressImage(photo)
    }
  }

  const compressImage = async (photo) => {
    let options = {
      originX: 0,
      originY: 0,
      width: photo.width,
      height: photo.height,
    }
    if (photo.width !== photo.height) {
      let width = photo.width > photo.height ? photo.height : photo.width
      let originY =
        photo.width > photo.height ? 0 : photo.height / 2 - width / 2
      let originX = photo.width > photo.height ? photo.width / 2 - width / 2 : 0
      options = {
        originX: originX,
        originY: originY,
        width: width,
        height: width,
      }
    }

    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: options }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      )
      setImage(manipResult.uri)
      props.navigation.navigate("CreatePost", {
        image: manipResult.uri,
      })
    } catch (err) {
      console.log("err: " + err)
    }
  }

  const pickImage = async () => {
    if (pickerPermission) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      console.log(result)

      if (!result.cancelled) {
        compressImage(result)
      }
    } else {
      alert("Enable camera roll permisions for Friends")
    }
  }

  return (
    <View style={styles.container}>
      {focused && (
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
              marginTop: 50 + "%",
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
