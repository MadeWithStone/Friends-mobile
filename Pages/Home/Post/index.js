// Modules
import React from "react"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import * as ScreenOrientation from "expo-screen-orientation"
import { DeviceMotion } from "expo-sensors"

// Navigation
import { createStackNavigator } from "@react-navigation/stack"

// Hooks
import {
  getFocusedRouteNameFromRoute,
  useIsFocused,
} from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"

// Components
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Modal,
  Animated,
  Easing,
} from "react-native"
import GestureRecognizer, { swipeDirections } from "react-native-swipe-gestures"
import {
  PanGestureHandler,
  State,
  TouchableOpacity,
} from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import { Button as Btn } from "react-native-elements"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import Slider from "@react-native-community/slider"
import { IconButton } from "../../../Components"
import Feed from "../Feed"
import CreatePost from "./CreatePost"
import config from "../../../config"
import User from "../../../Data/User"
import { set } from "react-native-reanimated"
import useUserData from "../../../Firebase/useUserData"

let maxVY = 0
let maxVT = 0

/**
 * screen to choose or take pictures to post
 *
 * @class
 */
const Post = ({ route, navigation }) => {
  const [hasPermission, setHasPermission] = React.useState(false)
  const [pickerPermission, setPickerPermission] = React.useState(false)
  const [type, setType] = React.useState(Camera.Constants.Type.back)
  const [image, setImage] = React.useState("")
  const [zoom, setZoom] = React.useState(0)
  const [focusDepth, setFocusDepth] = React.useState(0)
  const [orientation, setOrientation] = React.useState(1)
  const [rotation, setRotation] = React.useState(1)
  const [y, setY] = React.useState(0)
  const [modalOs, setModalOs] = React.useState(["portrait"])

  const focused = useIsFocused()
  const userData = useUserData()
  let camera
  const [dims, setDims] = React.useState({
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  })
  const rangeMin = { x: (dims.hight / dims.width) * 0.6, y: 0.6 }

  const heightAnim = React.useRef(new Animated.Value(0)).current
  const [panHandlerState, setPanHandlerState] = React.useState(
    State.UNDETERMINED
  )

  usePreventScreenCapture()

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: y,
      duration: 100,
      useNativeDriver: true,
    }).start(({ finished, value }) => {
      if (finished) {
        console.log("0")
      }
    })
  }, [y])

  React.useEffect(() => {
    heightAnim.addListener(({ value }) => {
      //console.log(`maxVY: ${maxVY}; maxVT: ${maxVT}`)
      console.log("value: " + value)
      if (value <= -2 * dims.width + 100) {
        maxVT = 0
        maxVY = 0
        navigation.goBack()
        console.log("exiting")
      }
    })
  }, [])

  React.useEffect(() => {
    if (panHandlerState === State.END) {
      setY(0)
      if (maxVY < -800 || maxVT < -200) {
        maxVT = 0
        maxVY = 0
        //navigation.jumpTo("Feed")
        //console.log("exiting")
        setY(-2 * dims.width)
      } else {
        setY(0)
        maxVT = 0
        maxVY = 0
      }
    }
  }, [panHandlerState])

  React.useEffect(() => {
    if (focused) {
      setModalOs(["portrait", "landscape"])
      ScreenOrientation.unlockAsync().then(() => {
        DeviceMotion.addListener((data) => {
          // setOrientation(data.orientation)

          const map = { 0: 1, 90: 2, 180: 3, "-90": 4 }
          const newOrientation = map[String(data.orientation)]
          const newDimensions = {
            width: Dimensions.get("screen").width,
            height: Dimensions.get("screen").height,
          }
          setOrientation((prev) => {
            if (
              newOrientation === 1 &&
              newDimensions.width > newDimensions.height
            ) {
              return prev
            }
            return newOrientation
          })
          setDims(newDimensions)
          /* console.log(
            `Post.deviceMotionListener.listener: orientation updated: ${data.orientation}`
          ) */
        })
        ScreenOrientation.getOrientationLockAsync().then((o) => {
          console.log(
            `Post.startOrientationListener: unlocked: ${JSON.stringify(o)}`
          )
        })
      })
      ScreenOrientation.addOrientationChangeListener((data) => {
        setOrientation(data.orientationInfo.orientation)
      })
    } else {
      removeOrientationListeners()
    }
  }, [focused])

  const removeOrientationListeners = () => {
    ScreenOrientation.removeOrientationChangeListeners()
    // DeviceMotion.removeAllListeners()
  }

  React.useEffect(() => {
    // switchOrientation(orientation)
    if (focused) {
      setDims({
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
      })
      setY(0)
      maxVT = 0
      maxVY = 0
    }
  }, [orientation, focused])

  React.useEffect(() => {
    if (focused && hasPermission === false) {
      setUpPermisions()
    }
    if (focused) {
      if (userData.posts && userData.posts.length >= 6) {
        alert(
          "You have hit your post maximum. Please delete 1 or more posts to post a new one."
        )
        navigation.navigate("Profile")
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
      const photo = await camera.takePictureAsync()

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

      const width = photo.width > photo.height ? photo.height : photo.width

      // find the y origin of the cropped image
      const originY =
        photo.width > photo.height ? 0 : photo.height / 2 - width / 2

      // find the x origin of the cropped image
      const originX =
        photo.width > photo.height ? photo.width / 2 - width / 2 : 0

      // update options object
      options = {
        originX,
        originY,
        width,
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
      console.log(
        `Post.compressImage: photoDimensions: width: ${manipResult.width} height: ${manipResult.height}`
      )
      // navigate to the CreatePost screen
      setModalOs(["portait"])
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).then(() => {
        navigation.navigate("CreatePost", {
          image: manipResult.uri,
        })
      })
    } catch (err) {
      // if error
      console.log(`Post.compressImage: catch error: ${err}`)
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        color: config.primaryColor,
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

  const buildStyles = StyleSheet.create({
    viewUp: {
      width: dims.width - 16,
      height: dims.width - 16,
      borderColor: config.primaryColor,
      borderWidth: 2,
      marginTop: (dims.height - dims.width - 16) / 2 - 16,

      marginBottom: "auto",
      borderRadius: 5,
      margin: 8,
      // backgroundColor: "blue",
    },
    viewRight: {
      borderColor: config.primaryColor,
      borderWidth: 2,

      marginLeft: (dims.width - dims.height - 16) / 2 - 16,
      // marginRight: "auto",
      margin: 8,
      borderRadius: 5,
      // backgroundColor: "blue",
    },
  })

  const onGestureEvent = (e) => {
    const { nativeEvent } = e
    if (nativeEvent.translationX < 0) {
      maxVY = nativeEvent.velocityX
      maxVT = nativeEvent.translationX
      setY(nativeEvent.translationX)
      //console.log("y: " + y)
    }
  }
  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: "transparent",
      }}>
      <View
        style={{ ...StyleSheet.absoluteFill, backgroundColor: "transparent" }}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={({ nativeEvent }) =>
            setPanHandlerState(nativeEvent.state)
          }>
          <Animated.View
            style={{
              ...StyleSheet.absoluteFill,
              height: dims.height,
              transform: [
                {
                  translateX: heightAnim.interpolate({
                    inputRange: [-1000, 0],
                    outputRange: [-500, 0],
                  }),
                },
              ],
              backgroundColor: "#000",
            }}>
            <View
              style={{
                ...StyleSheet.absoluteFill,
                borderRadius: 44,
                overflow: "hidden",
              }}>
              {focused && hasPermission && dims !== {} && (
                <Camera
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  type={type}
                  zoom={zoom}
                  focusDepth={focusDepth}
                  useCamera2Api
                  ref={(ref) => {
                    camera = ref
                  }}>
                  <GestureRecognizer
                    style={{
                      flexDirection:
                        orientation === 1 ||
                        orientation === 3 ||
                        orientation === 0
                          ? "column"
                          : "row",
                      // backgroundColor: "red",
                      width: dims.width,
                      height: dims.height,
                    }}
                    onSwipeLeft={(state) => console.log("left")}
                    onSwipeRight={(state) => console.log("right")}>
                    <View
                      style={
                        orientation === 1 ||
                        orientation === 3 ||
                        orientation === 0
                          ? {
                              position: "absolute",
                              width: dims.width,
                              height: 50,
                              top: 30,
                              flexDirection: "row",
                              alignItems: "flex-start",
                              zIndex: 10,
                            }
                          : {
                              position: "absolute",
                              width: 50,
                              height: dims.height,
                              left: 30,
                              flexDirection: "column",
                              alignItems: "flex-end",
                              zIndex: 10,
                            }
                      }>
                      <IconButton
                        icon={
                          <Feather
                            name="x"
                            size={36}
                            color={config.primaryColor}
                          />
                        }
                        onPressAction={() => navigation.goBack()}
                      />
                    </View>
                    {dims.height !== 0 && dims.width !== 0 && (
                      <View
                        style={
                          orientation === 1 ||
                          orientation === 3 ||
                          orientation === 0 ||
                          orientation === 0
                            ? {
                                width: dims.width - 16,
                                height: dims.width - 16,
                                borderColor: config.primaryColor,
                                borderWidth: 2,
                                marginTop: (dims.height - dims.width + 16) / 2,

                                marginBottom: "auto",
                                borderRadius: 5,
                                margin: 8,
                                // backgroundColor: "blue",
                              }
                            : {
                                width: dims.height - 16,
                                height: dims.height - 16,
                                borderColor: config.primaryColor,
                                borderWidth: 2,

                                marginLeft: (dims.width - dims.height + 16) / 2,
                                marginRight: "auto",
                                margin: 8,
                                borderRadius: 5,
                              }
                        }
                      />
                    )}
                    <View
                      style={{
                        ...StyleSheet.absoluteFill,
                        justifyContent: "flex-end",
                        flexDirection:
                          orientation === 1 ||
                          orientation === 3 ||
                          orientation === 0
                            ? "column"
                            : "row",

                        position: "absolute",
                      }}>
                      <View
                        style={
                          orientation === 1 ||
                          orientation === 3 ||
                          orientation === 0
                            ? styles.buttonContainerUp
                            : styles.buttonContainerLeft
                        }>
                        <Slider
                          style={{
                            width:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? dims.width - 64
                                : dims.height - 64,
                            height: 30,
                            transform: [
                              {
                                rotate:
                                  orientation === 1 ||
                                  orientation === 3 ||
                                  orientation === 0
                                    ? "0deg"
                                    : "-90deg",
                              },
                              {
                                translateX:
                                  orientation === 1 ||
                                  orientation === 3 ||
                                  orientation === 0
                                    ? 0
                                    : (-1 * dims.height) / 2,
                              },
                            ],
                            alignSelf:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? "center"
                                : "flex-end",
                          }}
                          minimumValue={0}
                          maximumValue={0.5}
                          minimumTrackTintColor={config.primaryColor}
                          maximumTrackTintColor="transparent"
                          thumbTintColor={config.primaryColor}
                          value={zoom}
                          onValueChange={(val) => setZoom(val)}
                        />
                        <View
                          style={{
                            flexDirection:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? "row"
                                : "column-reverse",
                            alignSelf:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? "center"
                                : "center",
                            justifyContent:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? "space-around"
                                : "space-around",
                            width:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? dims.width - 16
                                : 70,
                            height:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? 70
                                : dims.height - 16,
                            margin: 8,
                            transform:
                              orientation === 1 ||
                              orientation === 3 ||
                              orientation === 0
                                ? []
                                : [{ translateY: -16 }],
                          }}>
                          <IconButton
                            style={styles.button}
                            onPressAction={pickImage}
                            icon={
                              <Ionicons
                                name="ios-images-outline"
                                size={45}
                                color={config.primaryColor}
                              />
                            }
                          />
                          <TouchableOpacity
                            style={{
                              ...styles.round,
                              backgroundColor: config.primaryColor,
                            }}
                            onPress={snap}
                          />
                          <IconButton
                            style={styles.button}
                            onPressAction={() => {
                              setType((t) =>
                                t === Camera.Constants.Type.back
                                  ? Camera.Constants.Type.front
                                  : Camera.Constants.Type.back
                              )
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
                      </View>
                    </View>
                  </GestureRecognizer>
                </Camera>
              )}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
      {focused && (
        <StatusBar
          style={config.secondaryColor === "#000" ? "light" : "dark"}
          hidden
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  buttonContainerUp: {
    flex: 0.2,
    justifyContent: "space-around",
    backgroundColor: "transparent",
    alignItems: "flex-end",
    alignSelf: "center",
    padding: 20,
  },
  buttonContainerLeft: {
    flex: 0.2,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  button: {
    // flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
    width: 60,
    justifyContent: "center",
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
const PostPage = ({ route, navigation }) => {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      // Prevent default behavior
      e.preventDefault()
      setVisible(true)
      // Do something manually
      // ...
    })

    return unsubscribe
  }, [navigation])
  const focused = useIsFocused()
  return (
    <Modal visible={visible} transparent={true}>
      {/*<Stack.Navigator
        options={{ headerStyle: { borderbottomColor: config.primaryColor } }}
        initialRouteName="PostStack">
        <Stack.Screen
          name="PostStack"
          component={Post}
          options={{
            headerShown: false,
            tabBarVisible: false,
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
          options={({ route, navigation }) => ({
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
            headerShown: true,
          })}
        />
        </Stack.Navigator>*/}
    </Modal>
  )
}

export default Post
