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

import * as SecureStore from "expo-secure-store"

import User from "../../Data/User"
import {
  createEmailUser,
  setUserData,
  verifyEmail,
} from "../../Firebase/UserFunctions"

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      loading: false,
    }
  }

  onChangeText = (field, val) => {
    this.setState({ [field]: val })
  }

  signUp = () => {
    this.setState({ loading: true })
    const userData = {
      email: this.state.email,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      friendCode: User.generateFriendCode(),
    }
    createEmailUser(userData.email, this.state.password)
      .then((resData) => {
        verifyEmail()
        setUserData(resData.user.uid, userData).then(() => {
          this.setState({ loading: false })
          SecureStore.setItemAsync(
            "credentials",
            JSON.stringify({
              email: userData.email,
              password: this.state.password,
            })
          )
          alert("Please Verifiy Your Email Through The Link Sent To You")
        })
      })
      .catch((err) => {
        //alert(err)
      })
  }

  render() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let disabled =
      this.state.confirmPassword !== this.state.password ||
      this.state.password.length < 8 ||
      this.state.firstName.length <= 1 ||
      !reg.test(this.state.email)
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
                value={this.state.firstName}
                onChangeText={(text) => this.onChangeText("firstName", text)}
                placeholder="First Name"
              />
              <Input
                style={styles.input}
                value={this.state.lastName}
                onChangeText={(text) => this.onChangeText("lastName", text)}
                placeholder="Last Name"
              />
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
              <Input
                style={styles.input}
                value={this.state.confirmPassword}
                onChangeText={(text) =>
                  this.onChangeText("confirmPassword", text)
                }
                placeholder="Confirm Pasword"
                secure
              />
              <Button
                text="Sign Up"
                disabled={disabled}
                onPressAction={() => this.signUp()}
              />
              {this.state.loading && <Text>Loading...</Text>}
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
              Already have an account?
            </Text>
            <TextButton
              text="Sign In"
              onPressAction={() => this.props.navigation.navigate("SignIn")}
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
