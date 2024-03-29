import React from "react"
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Share,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Modal,
  LayoutAnimation,
  StatusBar,
} from "react-native"
import { WebView } from "react-native-webview"
import QRCode from "react-native-qrcode-svg"
import { ScrollView } from "react-native-gesture-handler"
import { BarCodeScanner } from "expo-barcode-scanner"
import Feather from "@expo/vector-icons/Feather"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"

import { ceil, Easing, set } from "react-native-reanimated"
import { Button as Btn } from "react-native-elements"
import * as Linking from "expo-linking"
import { usePreventScreenCapture } from "expo-screen-capture"
import {
  SafeAreaView,
  useSafeAreaFrame,
  initialWindowMetrics,
} from "react-native-safe-area-context"
import {
  findUserWithFriendCode,
  sendFriendRequest,
  updateUser,
} from "../../../../Firebase/UserFunctions"
import User from "../../../../Data/User"
import { Button, Input, CancelButton, IconButton } from "../../../../Components"
import config from "../../../../config"
import useUserData from "../../../../Firebase/useUserData"

const EditUser = ({ navigation, route }) => {
  const [friendCode, setFriendCode] = React.useState("")
  const [addBtnDis, setAddBtnDis] = React.useState(true)
  const [scan, setScan] = React.useState(false)
  const [showCode, setShowCode] = React.useState(true)
  const [share, setShare] = React.useState(false)
  const [roles, setRoles] = React.useState([])
  const [user, setUser] = React.useState({})

  const heightAnim = React.useRef(new Animated.Value(100)).current

  const userData = useUserData()

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: showCode ? 100 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start()
  }, [showCode])

  usePreventScreenCapture()

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {},
    })
  }, [])

  const scanFriendCode = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(300, "easeInEaseOut", "opacity")
    )
    setScan(true)
  }

  const handleCodeScanned = ({ type, data }) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, "easeInEaseOut", "opacity")
    )
    setScan(false)
    onChangeText(data, "friendCode")
  }

  const getUser = () => {
    if (friendCode.length === 7) {
      findUserWithFriendCode(friendCode)
        .then((querySnapshot) => {
          let count = 0
          querySnapshot.forEach((doc) => {
            console.log(`doc ${count}`)
            if (count === 0) {
              const user = { ...doc.data(), id: doc.id }
              setUser(user)
              setRoles(user.roles ? user.roles : [])
              console.log(`Roles: ${user.roles}`)
            }
            count++
          })
        })
        .catch((err) => {
          console.warn(err)
        })
    }
  }

  const onChangeText = (e, name) => {
    const d = e.toUpperCase()
    const states = {
      friendCode: setFriendCode,
      addBtnDis: setAddBtnDis,
      scan: setScan,
      showCode: setShowCode,
    }
    states[name](d)
    console.log(
      `AddFriend.onChangeText: ${d} not ${userData.friendCode}: ${
        d !== userData.friendCode.toUpperCase()
      }`
    )
    if (d.length === 7) {
      setAddBtnDis(false)
    } else {
      setAddBtnDis(true)
    }
  }

  const adminAction = (action) => {
    if (roles.includes(action)) {
      var r = roles.filter((role) => role != action)
    } else {
      var r = [...roles]
      r.push(action)
    }
    updateUser({ roles: r }, user.id).then(() => getUser())
  }

  const sendRequest = () => {
    const take = this
    if (friendCode.length === 7) {
      // find user
      console.log("finding user")
      findUserWithFriendCode(friendCode)
        .then((querySnapshot) => {
          let count = 0
          querySnapshot.forEach((doc) => {
            if (count === 0) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => ", doc.data())
              const userData = doc.data()
              const friend = { data: userData }
              let alreadyRequested = false
              if (
                friend.data.friendRequests !== null &&
                friend.data.friendRequests.length > 0
              ) {
                friend.data.friendRequests.forEach((request) => {
                  if (request.userID === take.userData.id) {
                    alreadyRequested = true
                  }
                })
              }
              if (!alreadyRequested) {
                sendFriendRequest(friend)
                  .then((res) => {
                    console.log("request sent")
                    alert("Friend Request Sent")
                  })
                  .catch((err) => {
                    console.warn(err)
                  })
              } else {
                alert("Friend Already Requested")
              }
              count++
            }
          })
        })
        .catch((err) => {
          console.warn(err)
        })
      // send request
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={{
          ...StyleSheet.absoluteFill,
          ...styles.contentView,
          backgroundColor: config.secondaryColor,
        }}>
        <View styles={styles.mainView}>
          <SafeAreaView
            style={styles.code}
            onPress={() => Keyboard.dismiss()}
            edges={["top", "bottom"]}>
            <View style={styles.addView}>
              <Button text="Scan Friend Code" onPressAction={scanFriendCode} />
              <View style={styles.verifyView}>
                <Input
                  placeholder="Friend Code"
                  style={{ flex: 8, marginRight: 4, height: 40 }}
                  onChangeText={(text) => onChangeText(text, "friendCode")}
                  value={friendCode}
                  onFocus={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.create(300, "easeInEaseOut", "opacity")
                    )
                    setShowCode(false)
                  }}
                  onEndEditing={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.create(300, "easeInEaseOut", "opacity")
                    )
                    setShowCode(true)
                  }}
                />
                <Button
                  text="Load"
                  disabled={addBtnDis}
                  style={{ flex: 1, height: 50 }}
                  onPressAction={() => getUser()}
                />
              </View>
            </View>
            {user && user.id && (
              <View style={styles.buttonView}>
                <Button
                  text="Suspend"
                  style={styles.button}
                  onPressAction={() => sendRequest()}
                />
                <Button
                  text="Moderator"
                  style={{
                    ...styles.button,
                    backgroundColor: roles.includes("moderator")
                      ? "gray"
                      : config.primaryColor,
                  }}
                  onPressAction={() => adminAction("moderator")}
                />
                <Button
                  text="Admin"
                  style={{
                    ...styles.button,
                    backgroundColor: roles.includes("admin")
                      ? "gray"
                      : config.primaryColor,
                  }}
                  onPressAction={() => adminAction("admin")}
                />
              </View>
            )}
          </SafeAreaView>
        </View>
        {scan && (
          <Modal>
            <BarCodeScanner
              onBarCodeScanned={handleCodeScanned}
              style={StyleSheet.absoluteFill}>
              <CancelButton
                title={"Cancel"}
                callback={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.create(200, "easeInEaseOut", "opacity")
                  )
                  setScan(false)
                }}
                style={{
                  alignSelf: "flex-end",
                  margin: 32,
                }}
              />
            </BarCodeScanner>
          </Modal>
        )}
        <StatusBar hidden={scan} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default EditUser

const styles = StyleSheet.create({
  code: { margin: 16 },
  mainView: {
    padding: 16,
  },
  contentView: {
    // justifyContent: "center",
  },
  codeText: {
    fontSize: 17,
    marginBottom: 4,
    fontWeight: "bold",
  },
  verifyView: {
    flexDirection: "row",
    marginTop: 8,
  },
  addView: { marginBottom: 8 },
  button: { flexGrow: 1, width: "100%", alignSelf: "stretch" },
  buttonView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
})
