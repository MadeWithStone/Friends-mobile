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
  KeyboardAvoidingView,
} from "react-native"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Button as Btn } from "react-native-elements"

import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { ScreenStackHeaderConfig } from "react-native-screens"
import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"
import User from "../../../../Data/User"
import config from "../../../../config"
import {
  Button,
  Input,
  ProfileImage,
  TextButton,
  IconButton,
} from "../../../../Components"
import {
  removeProfileImage,
  updateUser,
} from "../../../../Firebase/UserFunctions"
import { uploadImage } from "../../../../Firebase/PostFunctions"
import useUserData from "../../../../Firebase/useUserData"

const EditProfile = ({ navigation, route }) => {
  const [image, setImage] = useState("")
  const [_img, setImg] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showChooser, setShowChooser] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [camType, setCamType] = useState(Camera.Constants.Type.back)
  const [saveData, setSaveData] = useState(false)
  const dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  let camera = {}
  const userData = useUserData()

  const updateImage = (img) => {
    setImage(img)
  }
  React.useEffect(() => {
    setImage(userData.profileImage)
    setFirstName(userData.firstName)
    setLastName(userData.lastName)
  }, [])
  React.useEffect(() => {
    console.log(`updated image: ${image}`)
  }, [image])
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
            setSaveData(true)
          }}
          icon={<Feather name="check" size={30} color={config.primaryColor} />}
          type="clear"
        />
      ),
    })
  }, [navigation, firstName, lastName, image])

  React.useEffect(() => {
    if (saveData) {
      saveEdits()
    }
  }, [saveData])
  const snap = async () => {
    try {
      if (camera) {
        const photo = await camera.takePictureAsync()
        setShowCamera(false)
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
      const width = photo.width > photo.height ? photo.height : photo.width
      const originY =
        photo.width > photo.height ? 0 : photo.height / 2 - width / 2
      const originX =
        photo.width > photo.height ? photo.width / 2 - width / 2 : 0
      options = {
        originX,
        originY,
        width,
        height: width,
      }
    }

    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: options }],
        { compress: 0.05, format: ImageManipulator.SaveFormat.JPEG }
      )
      const { uri } = manipResult
      setImage(uri)
    } catch (err) {
      console.log(`err: ${err}`)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    console.log(result)
    setShowChooser(false)
    if (!result.cancelled) {
      compressImage(result)
    }
  }

  const removePhoto = async () => {
    setImage("")
    setShowChooser(false)
  }

  const saveEdits = async () => {
    console.log(`firstname: ${firstName}`)
    if (firstName.length <= 0) {
      alert("You must enter a first name")
    } else if (userData != null) {
      let imgURL = userData.profileImage
      if (image !== null && image.length > 0 && image !== imgURL) {
        imgURL = await uploadUserImg()
      } else if (image === "" && imgURL !== image) {
        imgURL = ""
        await removeProfileImage(userData.id)
      }
      setImage(imgURL)
      console.log(`firstname: ${firstName}`)
      const newData = {
        firstName: firstName.valueOf(),
        lastName: lastName.valueOf(),
        profileImage: imgURL.valueOf(),
      }

      console.log(`new data: ${JSON.stringify(newData)}`)
      updateUser(newData, userData.id).then(async () => {
        navigation.goBack()
      })
    }
  }
  const uploadUserImg = async () => {
    let imgUrl = ""
    console.log("uploading image")
    // updateProgressText("Uploading Image")
    const uploadUri =
      Platform.OS === "ios" ? image.replace("file://", "") : image
    return new Promise((resolve, reject) => {
      uploadImage(
        uploadUri,
        userData.id,
        (snapshot) => {
          /* setProgress(
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 0.5
          ) */
          console.log(
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes)
          )
        },
        async (url) => {
          imgUrl = url
          resolve(imgUrl)
          // wait for data to upload
          // setProgress(0.51)
          // updateProgressText("Uploading Post Data")
        }
      )
    }) // wait for image to upload
  }
  return (
    <KeyboardAvoidingScrollView
      containerStyle={{ backgroundColor: config.secondaryColor }}>
      <Modal visible={showChooser} animationType="fade" transparent={true}>
        <View style={{ justifyContent: "flex-end", height: `${100}%` }}>
          <View style={{ marginBottom: 100 }}>
            <View
              style={{
                margin: 8,
                borderRadius: 15,
              }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setShowChooser(false)
                  setShowCamera(true)
                  console.log("camera opening")
                }}
                style={{
                  ...styles.buttonContainer,
                  borderRadius: 0,
                  borderbottomColor: config.secondaryColor,

                  backgroundColor: config.primaryColor,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}>
                <Text
                  style={{ ...styles.button, color: config.secondaryColor }}>
                  Take Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  pickImage()
                }}
                style={{
                  ...styles.buttonContainer,

                  borderbottomColor: config.secondaryColor,

                  backgroundColor: config.primaryColor,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderRadius: 0,
                }}>
                <Text
                  style={{ ...styles.button, color: config.secondaryColor }}>
                  Pick From Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  removePhoto()
                }}
                style={{
                  ...styles.buttonContainer,

                  backgroundColor: config.primaryColor,
                  borderRadius: 0,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                }}>
                <Text
                  style={{ ...styles.button, color: config.secondaryColor }}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowChooser(false)}
              style={{
                ...styles.buttonContainer,
                backgroundColor: config.primaryColor,
                margin: 8,
              }}>
              <Text style={{ ...styles.button, color: config.secondaryColor }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showCamera} transparent={false}>
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
              marginTop: dims.height / 2 - dims.width / 2 - 16 + 35,
              marginBottom: "auto",
              margin: 8,
              borderRadius: (dims.width - 16) / 2,
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
      {User !== null && (
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
              name={`${firstName} ${lastName}`}
              style={{ alignSelf: "center" }}
              id={image}
              noCache
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
              <Text
                style={{
                  ...styles.textButton,
                  color: config.primaryColor,
                  textAlign: "center",
                }}>
                Choose Profile Image
              </Text>
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
              style={{ width: `${100}%` }}
              placeholderColor={config.primaryColor}
              value={firstName}
              onChangeText={(d) => {
                setFirstName(d)

                console.log(`updating first name${firstName}`)
              }}
            />
            <Input
              placeholder="Last Name"
              style={{ width: `${100}%`, marginTop: 8 }}
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
  },
  buttonContainer: {
    borderRadius: 10,
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
    width: `${100}%`,
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
