import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Button as B,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Feather from "react-native-vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Button as Btn } from "react-native-elements"
import config from "../../../../config"
import { KeyboardAvoidingView } from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import {
  Button,
  Input,
  ProfileImage,
  TextButton,
  IconButton,
} from "../../../../Components"
import User from "../../../../Data/User"
import { ScreenStackHeaderConfig } from "react-native-screens"
import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"

const EditProfile = ({ navigation, route }) => {
  console.log("props: " + JSON.stringify(route))
  let [user, setUser] = useState(null)
  let [image, setImage] = useState("")
  let [firstName, setFirstName] = useState("")
  let [lastName, setLastName] = useState("")
  let [showChooser, setShowChooser] = useState(false)
  let [showCamera, setShowCamera] = useState(false)
  let [camType, setCamType] = useState(Camera.Constants.Type.back)
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  let camera = {}
  React.useEffect(() => {
    let u = new User()
    console.log("running use effect")
    u.loadCurrentUser()
      .then((data) => {
        setUser(data)
        setImage(data.data.image)
        setFirstName(data.data.firstName)
        setLastName(data.data.lastName)
      })
      .catch((err) => {
        console.log("err: " + err)
      })
  }, [])
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Btn
          onPress={() => {
            navigation.goBack()
          }}
          icon={
            <FontAwesome5
              name="chevron-left"
              size={30}
              color={config.primaryColor}
            />
          }
          type="clear"
        />
      ),
      headerRight: () => (
        <Btn
          onPress={() => {
            navigation.goBack()
          }}
          icon={<Feather name="check" size={30} color={config.primaryColor} />}
          type="clear"
        />
      ),
    })
  }, [navigation])
  const snap = async () => {
    try {
      if (camera) {
        let photo = await camera.takePictureAsync()
        compressImage(photo)
      }
    } catch (err) {
      console.warn(err)
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
      setNewImage(manipResult.uri)
    } catch (err) {
      console.log("err: " + err)
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    console.log(result)

    if (!result.cancelled) {
      this.compressImage(result)
    }
  }
  return (
    <KeyboardAvoidingScrollView
      containerStyle={{ backgroundColor: config.secondaryColor }}>
      <Modal visible={showChooser} animationType="fade" transparent={true}>
        <View style={{ justifyContent: "flex-end", height: 100 + "%" }}>
          <View>
            <View
              style={{
                margin: 8,
                borderRadius: 15,
              }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowCamera(true)}
                style={{
                  ...styles.buttonContainer,
                  borderRadius: 0,
                  borderbottomColor: config.secondaryColor,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}>
                <Text style={{ ...styles.button }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowChooser(false)}
                style={{
                  ...styles.buttonContainer,
                  borderRadius: 0,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                }}>
                <Text style={{ ...styles.button }}>Pick From Library</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowChooser(false)}
              style={{ ...styles.buttonContainer, margin: 8 }}>
              <Text style={{ ...styles.button }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showCamera}>
        <Camera
          style={styles.camera}
          type={camType}
          ref={(ref) => {
            camera = ref
          }}>
          <View
            style={{
              width: dims.width - 16,
              height: dims.width - 16,
              borderColor: config.primaryColor,
              borderWidth: 2,
              marginTop: dims.height / 2 - dims.width / 2 - 32,
              marginBottom: "auto",
              margin: 8,
              borderRadius: 5,
            }}
          />
          <View style={styles.roundButtonContainer}>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.round} onPress={() => snap()} />
            <IconButton
              style={styles.button}
              onPressAction={() => {
                setCamType((type) =>
                  type === Camera.Constants.Type.back
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
        </Camera>
      </Modal>
      {user != null && (
        <View style={{}}>
          <View
            style={{
              borderBottomColor: config.primaryColor,
              borderBottomWidth: StyleSheet.hairlineWidth,
              padding: 16,
              alignItems: "center",
              marginBottom: 8,
            }}>
            <ProfileImage
              image={image}
              size={120}
              name={user.data.firstName + " " + user.data.lastName}
              style={{ alignSelf: "center" }}
            />

            <TouchableOpacity
              onPress={() => {
                console.warn("setting show chooser")
                try {
                  setShowChooser(true)
                } catch (err) {
                  console.warn(err)
                }
                console.log(showChooser)
              }}>
              <Text style={{ ...styles.textButton }}>Choose Profile Image</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderBottomColor: config.primaryColor,
              borderBottomWidth: StyleSheet.hairlineWidth,
              padding: 16,
              alignItems: "center",
              marginBottom: 8,
            }}>
            <Input
              placeholder="First Name"
              style={{ width: 100 + "%" }}
              placeholderColor={config.primaryColor}
              value={firstName}
              onChangeText={(d) => setFirstName(d)}
            />
            <Input
              placeholder="Last Name"
              style={{ width: 100 + "%" }}
              placeholderColor={config.primaryColor}
              value={lastName}
              onChangeText={(d) => setLastName(d)}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingScrollView>
  )
}

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
    color: config.secondaryColor,
  },
  buttonContainer: {
    borderRadius: 10,
    backgroundColor: config.primaryColor,
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  roundButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "center",
    margin: 20,
    justifyContent: "space-around",
    width: 100 + "%",
  },
  round: {
    width: 70,
    height: 70,
    backgroundColor: config.primaryColor,
    borderRadius: 35,
  },
  cancelBtn: {
    color: config.primaryColor,
    textAlign: "center",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    color: config.primaryColor,
    fontSize: 17,
  },
})

export default EditProfile
