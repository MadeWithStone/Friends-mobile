import React from "react"
import { View, Text, StyleSheet } from "react-native"
import config from "../../../../config"
import { WebView } from "react-native-webview"
import QRCode from "react-native-qrcode-svg"
import { ScrollView } from "react-native-gesture-handler"
import { Button, Input } from "../../../../Components"

export default class AddFriend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      friendCode: "",
      addBtnDis: true,
    }
  }

  onChangeText = (e, name) => {
    this.setState({ [name]: e })
    if (e.length >= 4) {
      this.setState({ addBtnDis: false })
    } else {
      this.setState({ addBtnDis: true })
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
                />
                <Button
                  text="Add"
                  disabled={this.state.addBtnDis}
                  style={{ flex: 1 }}
                />
              </View>
              <Button text="Scan Friend Code" />
            </View>
            <Text style={styles.codeText}>TestCode</Text>
            <QRCode
              value={"TestCode"}
              size={300}
              backgroundColor="transparent"
              color={config.primaryColor}
            />
          </View>
        </View>
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
