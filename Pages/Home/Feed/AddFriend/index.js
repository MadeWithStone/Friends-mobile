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

const AddFriend = ({ navigation, route }) => {
  const [friendCode, setFriendCode] = React.useState("")
  const [addBtnDis, setAddBtnDis] = React.useState(true)
  const [currentUserFC, setCurrentUserFC] = React.useState("")
  const [scan, setScan] = React.useState(false)
  const [showCode, setShowCode] = React.useState(true)
  const [share, setShare] = React.useState(false)

  const heightAnim = React.useRef(new Animated.Value(100)).current

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: showCode ? 100 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start()
  }, [showCode])

  usePreventScreenCapture()

  React.useEffect(() => {
    setCurrentFC()
  }, [])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Btn
          onPress={() => {
            setShare(true)
          }}
          icon={<Feather name="share" size={30} color={config.primaryColor} />}
          type="clear"
        />
      ),
    })
  }, [])

  const setCurrentFC = () => {
    setCurrentUserFC(User.data.friendCode)
    onChangeText(route.params ? route.params.code : "", "friendCode")
  }

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

  const resetFriendCode = () => {
    const newFriendCode = User.generateFriendCode()
    updateUser({ friendCode: newFriendCode }, User.data.id).then(() => {
      User.data.friendCode = newFriendCode
      setCurrentUserFC(newFriendCode)
    })
  }

  const onChangeText = (e, name) => {
    const d = e.toUpperCase()
    const states = {
      friendCode: setFriendCode,
      addBtnDis: setAddBtnDis,
      currentUserFC: setCurrentUserFC,
      scan: setScan,
      showCode: setShowCode,
    }
    states[name](d)
    console.log(
      `AddFriend.onChangeText: ${d} not ${User.data.friendCode}: ${
        d !== User.data.friendCode.toUpperCase()
      }`
    )
    if (d.length === 7 && d !== User.data.friendCode.toUpperCase()) {
      setAddBtnDis(false)
    } else {
      setAddBtnDis(true)
    }
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
                  if (request.userID === take.user.data.id) {
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

  React.useEffect(() => {
    if (share) {
      shareFriendCode()
    }
  }, [share])

  const shareFriendCode = async () => {
    const url = `https://friendsmobile.org/friendRedirect.html?code=${currentUserFC}`
    try {
      const result = await Share.share({
        url,
        message: `Add me on Friends - Private Network. My code is ${currentUserFC}.`,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
      setShare(false)
    } catch (error) {
      alert(error.message)
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
                  text="Add"
                  disabled={addBtnDis}
                  style={{ flex: 1, height: 50 }}
                  onPressAction={() => sendRequest()}
                />
              </View>
              <Button text="Scan Friend Code" onPressAction={scanFriendCode} />
            </View>
            {showCode && (
              <View
                style={{
                  alignItems: "center",
                }}>
                <QRCode
                  value={
                    currentUserFC !== null && currentUserFC !== ""
                      ? currentUserFC
                      : "0"
                  }
                  size={300}
                  backgroundColor="transparent"
                  color={config.primaryColor}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      ...styles.codeText,
                      color: config.primaryColor,
                    }}>
                    {currentUserFC}
                  </Text>
                  <IconButton
                    onPressAction={() => resetFriendCode()}
                    icon={
                      <Feather
                        name="refresh-cw"
                        size={30}
                        color={config.primaryColor}
                      />
                    }
                  />
                </View>
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

export default AddFriend

const styles = StyleSheet.create({
  code: { margin: 16 },
  mainView: {
    padding: 16,
  },
  contentView: {
    justifyContent: "center",
  },
  codeText: {
    fontSize: 17,
    marginBottom: 4,
    fontWeight: "bold",
  },
  verifyView: {
    flexDirection: "row",
    marginBottom: 8,
  },
  addView: {
    marginBottom: 50,
  },
})
