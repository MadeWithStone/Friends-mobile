import React from "react"
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import config from "../../../../config"
import { WebView } from "react-native-webview"
import QRCode from "react-native-qrcode-svg"
import { ScrollView } from "react-native-gesture-handler"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Button, Input, CancelButton, IconButton } from "../../../../Components"
import User from "../../../../Data/User"
import Feather from "@expo/vector-icons/Feather"
import {
  findUserWithFriendCode,
  sendFriendRequest,
  updateUser,
} from "../../../../Firebase/UserFunctions"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { KeyboardAvoidingView } from "react-native"
import { ceil } from "react-native-reanimated"

export default class AddFriend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      friendCode: "",
      addBtnDis: true,
      currentUserFC: "",
      scan: false,
      showCode: true,
    }
  }

  componentDidMount() {
    this.setCurrentFC()
    this.setState({ friendCode: this.props.route.params.code })
  }

  setCurrentFC = () => {
    this.setState({ currentUserFC: User.data.friendCode })
  }

  scanFriendCode = () => {
    this.setState({ scan: true })
  }

  handleCodeScanned = ({ type, data }) => {
    this.setState({ scan: false })
    this.onChangeText(data, "friendCode")
  }

  resetFriendCode = () => {
    let newFriendCode = User.generateFriendCode()
    updateUser({ friendCode: newFriendCode }, User.data.id).then(() => {
      User.data.friendCode = newFriendCode
      this.setState({ currentUserFC: newFriendCode })
    })
  }

  onChangeText = (e, name) => {
    let d = e.toUpperCase()
    if (d.length <= 7) {
      this.setState({ [name]: d })
    }
    if (d.length == 7 && d != this.state.currentUserFC.toUpperCase()) {
      this.setState({ addBtnDis: false })
    } else {
      this.setState({ addBtnDis: true })
    }
  }

  sendRequest = () => {
    let take = this
    if (this.state.friendCode.length == 7) {
      //find user
      console.log("finding user")
      findUserWithFriendCode(this.state.friendCode)
        .then((querySnapshot) => {
          let count = 0
          querySnapshot.forEach(function (doc) {
            if (count == 0) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => ", doc.data())
              let userData = doc.data()
              let friend = { data: userData }
              let alreadyRequested = false
              if (
                friend.data.friendRequests != null &&
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
      //send request
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          style={{
            ...StyleSheet.absoluteFill,
            ...styles.contentView,
            backgroundColor: config.secondaryColor,
          }}>
          <View styles={styles.mainView}>
            <View style={styles.code} onPress={() => Keyboard.dismiss()}>
              <View style={styles.addView}>
                <View style={styles.verifyView}>
                  <Input
                    placeholder="Friend Code"
                    style={{ flex: 8, marginRight: 4, height: 40 }}
                    onChangeText={(text) =>
                      this.onChangeText(text, "friendCode")
                    }
                    value={this.state.friendCode}
                    onFocus={() => this.setState({ showCode: false })}
                    onEndEditing={() => this.setState({ showCode: true })}
                  />
                  <Button
                    text="Add"
                    disabled={this.state.addBtnDis}
                    style={{ flex: 1, height: 50 }}
                    onPressAction={() => this.sendRequest()}
                  />
                </View>
                <Button
                  text="Scan Friend Code"
                  onPressAction={this.scanFriendCode}
                />
              </View>
              {this.state.showCode && (
                <View style={{ alignItems: "center" }}>
                  <QRCode
                    value={
                      this.state.currentUserFC != null &&
                      this.state.currentUserFC != ""
                        ? this.state.currentUserFC
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
                      {this.state.currentUserFC}
                    </Text>
                    <IconButton
                      onPressAction={() => this.resetFriendCode()}
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
            </View>
          </View>
          {this.state.scan && (
            <BarCodeScanner
              onBarCodeScanned={this.handleCodeScanned}
              style={StyleSheet.absoluteFill}>
              <CancelButton
                title={"Cancel"}
                callback={() => this.setState({ scan: false })}
                style={{
                  alignSelf: "flex-end",
                  margin: 16,
                }}
              />
            </BarCodeScanner>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    )
  }
}

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
