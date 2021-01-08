import React from "react"
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import {
  Input,
  H1,
  Button,
  TextButton,
  DismissKeyboardView,
} from "../../Components"
import config from "../../config"
import User from "../../Data/User"
import { signIn, loadData } from "../../Firebase/UserFunctions"

import * as SecureStore from "expo-secure-store"

export default class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
    }
  }

  async componentDidMount() {
    let savedData = await SecureStore.getItemAsync("credentials")
    try {
      savedData = JSON.parse(savedData)
      this.setState({ email: savedData.email, password: savedData.password })
      this.signIn()
    } catch (error) {
      console.log("error " + error)
    }
  }

  onChangeText = (field, val) => {
    this.setState({ [field]: val })
  }

  signIn = () => {
    let user = new User()
    signIn(this.state.email, this.state.password).then(async (d) => {
      user.auth = d.user
      if (user.auth.emailVerified) {
        await SecureStore.setItemAsync(
          "credentials",
          JSON.stringify({
            email: this.state.email,
            password: this.state.password,
          })
        )
        loadData(user.auth.uid).then((doc) => {
          user.data = doc.data()
          user.setCurrentUser()
          this.props.navigation.navigate("Home")
        })
      } else {
        alert("You Must Verify Your Email")
      }
    })
  }

  render() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let disabled =
      this.state.password.length <= 8 || !reg.test(this.state.email)
    return (
      <View style={{ width: 100 + "%", height: 100 + "%" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          style={{
            ...styles.mainContainer,
            backgroundColor: config.secondaryColor,
          }}>
          <DismissKeyboardView style={styles.bodyContainer}>
            <View>
              <H1 text="Friends" />
              <Input
                style={styles.input}
                value={this.state.email}
                onChangeText={(text) => this.onChangeText("email", text)}
                placeholder="Email"
                type="email-address"
              />
              <Input
                style={styles.input}
                value={this.state.password}
                onChangeText={(text) => this.onChangeText("password", text)}
                placeholder="Pasword"
                secure
              />
              <Button
                text="Sign In"
                onPressAction={() => this.signIn()}
                disabled={disabled}
              />
            </View>
          </DismissKeyboardView>
        </KeyboardAvoidingView>
        <View
          style={{
            ...styles.footerContainer,
            backgroundColor: config.secondaryColor,
          }}>
          <View style={styles.signUpContainer}>
            <Text style={{ ...styles.text, color: config.textColor }}>
              Don't have an account?
            </Text>
            <TextButton
              text="Sign Up"
              onPressAction={() => this.props.navigation.navigate("SignUp")}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 8,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyContainer: {
    width: 100 + "%",
    padding: 16,
    height: 100 + "%",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    marginBottom: 16,
  },
  text: {
    fontSize: 17,
    marginRight: 4,
  },
  signUpContainer: { flex: 1, flexDirection: "row" },
  footerContainer: {
    flex: 0.1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
})
