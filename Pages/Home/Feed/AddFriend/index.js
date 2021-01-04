import React from "react"
import { View, Text, StyleSheet } from "react-native"
import config from "../../../../config"
import { WebView } from "react-native-webview"
import QRCode from "react-native-qrcode-svg"
import { ScrollView } from "react-native-gesture-handler"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Button, Input, CancelButton } from "../../../../Components"
import User from "../../../../Data/User"
import {
  findUserWithFriendCode,
  sendFriendRequest,
} from "../../../../Firebase/UserFunctions"

export default class AddFriend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      friendCode: "",
      addBtnDis: true,
      currentUserFC: "",
      scan: false,
    }
    this.user = new User()
  }

  componentDidMount() {
    this.user.loadCurrentUser(() => {
      this.setCurrentFC()
    })
  }

  setCurrentFC = () => {
    this.setState({ currentUserFC: this.user.data.friendCode })
  }

  scanFriendCode = () => {
    this.setState({ scan: true })
  }

  handleCodeScanned = ({ type, data }) => {
    this.setState({ showCamera: false, friendCode: data })
  }

  onChangeText = (e, name) => {
    let d = e.toUpperCase()
    if (d.length <= 7) {
      this.setState({ [name]: d })
    }
    if (d.length == 7 && d != this.state.currentUserFC) {
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
              let friend = new User(userData)
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
      <ScrollView
        style={styles.mainView}
        contentContainerStyle={styles.scrollView}>
        <View>
          <View style={styles.code}>
            <View style={styles.addView}>
              <View style={styles.verifyView}>
                <Input
                  placeholder="Friend Code"
                  style={{ flex: 8, marginRight: 4 }}
                  onChangeText={(text) => this.onChangeText(text, "friendCode")}
                  value={this.state.friendCode}
                />
                <Button
                  text="Add"
                  disabled={this.state.addBtnDis}
                  style={{ flex: 1 }}
                  onPressAction={() => this.sendRequest()}
                />
              </View>
              <Button
                text="Scan Friend Code"
                onPressAction={this.scanFriendCode}
              />
            </View>
            <Text style={styles.codeText}>{this.state.currentUserFC}</Text>
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
          </View>
        </View>
        {this.state.scan && (
          <BarCodeScanner
            onBarCodeScanned={this.handleCodeScanned}
            style={StyleSheet.absoluteFill}>
            <CancelButton
              title={"Cancel"}
              callback={() => this.setState({ scan: false })}
              style={{ alignSelf: "flex-end", margin: 16 }}
            />
          </BarCodeScanner>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  code: {
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    marginTop: 20 + "%",
    marginBottom: "auto",
  },
  mainView: {
    width: 100 + "%",
    height: 100 + "%",
    backgroundColor: config.secondaryColor,
  },
  scrollView: {
    justifyContent: "center",
  },
  codeText: {
    textAlign: "center",
    alignSelf: "center",
    width: 100 + "%",
    color: config.primaryColor,
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
