import React from "react"
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native"
import { CheckBox } from "react-native-elements"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import {
  Input,
  H1,
  Button,
  TextButton,
  DismissKeyboardView,
  LogoHorizontal,
} from "../../Components"
import config from "../../config"

import * as SecureStore from "expo-secure-store"

import User from "../../Data/User"
import {
  createEmailUser,
  setUserData,
  verifyEmail,
} from "../../Firebase/UserFunctions"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import * as Linking from "expo-linking"

import KeyboardListener from "react-native-keyboard-listener"

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      spinning: false,
      title: "Friends",
      tos: false,
      ageVerification: false,
      keyboardOpen: false,
    }
  }

  async componentDidMount() {
    await ScreenCapture.preventScreenCaptureAsync()
  }

  onChangeText = (field, val) => {
    this.setState({ [field]: val })
  }

  signUp = () => {
    this.setState({ spinning: true })
    const userData = {
      email: this.state.email,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      friendCode: User.generateFriendCode(),
    }
    createEmailUser(userData.email, this.state.password)
      .then(async (resData) => {
        verifyEmail()
        setUserData(resData.user.uid, userData).then(async () => {
          this.setState({ spinning: false })
          await SecureStore.setItemAsync(
            "credentials",
            JSON.stringify({
              email: this.state.email,
              password: this.state.password,
            })
          )
          alert("Please Verifiy Your Email Through The Link Sent To You")
          this.props.navigation.goBack()
        })
      })
      .catch((err) => {
        alert(err)
        this.setState({ spinning: false })
      })
  }

  render() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let disabled =
      this.state.confirmPassword !== this.state.password ||
      this.state.password.length < 8 ||
      this.state.firstName.length <= 1 ||
      !reg.test(this.state.email) ||
      !this.state.tos ||
      !this.state.ageVerification
    let problemMessage = ""
    let problem = false
    if (this.state.firstName.length <= 1) {
      problemMessage = "Please enter your first name"
      problem = true
    } else if (!reg.test(this.state.email)) {
      problemMessage = "Please enter your email"
      problem = true
    } else if (this.state.password.length < 8) {
      problemMessage = "Password must be atleast 8 characters"
      problem = true
    } else if (this.state.confirmPassword !== this.state.password) {
      problemMessage = "Passwords do not match"
      problem = true
    } else if (!this.state.ageVerification) {
      problemMessage = "Please verify your age"
      problem = true
    } else if (!this.state.tos) {
      problemMessage = "Please agree to the Terms of Service and Privacy Policy"
      problem = true
    }
    return (
      <View style={{ width: 100 + "%", height: 100 + "%" }}>
        <KeyboardAvoidingScrollView
          scrollEventThrottle={32}
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "100%" }}
          containerStyle={{ backgroundColor: config.secondaryColor }}
          contentContainerStyle={{
            width: "100%",
            height: !this.state.keyboardOpen ? "100%" : "auto",
            backgroundColor: config.secondaryColor,
            justifyContent: "center",
          }}>
          <DismissKeyboardView style={styles.bodyContainer}>
            <View>
              <LogoHorizontal
                size={63}
                color={config.primaryColor}
                title={this.state.title}
                split
              />
              {!this.state.spinning && (
                <View>
                  <Input
                    style={styles.input}
                    value={this.state.firstName}
                    onChangeText={(text) =>
                      this.onChangeText("firstName", text)
                    }
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
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      checked={this.state.ageVerification}
                      onPress={() =>
                        this.setState({
                          ageVerification: !this.state.ageVerification,
                        })
                      }
                      style={styles.checkbox}
                      checkedColor={config.primaryColor}
                      containerStyle={styles.checkbox}
                    />
                    <Text style={styles.label}>
                      By checking this box you verify you are 13 years of age or
                      older
                    </Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      checked={this.state.tos}
                      onPress={() => this.setState({ tos: !this.state.tos })}
                      style={styles.checkbox}
                      checkedColor={config.primaryColor}
                      containerStyle={styles.checkbox}
                    />
                    <Text style={styles.label}>
                      By checking this box you agree to the{" "}
                      <TextButton
                        text="Terms of Use"
                        onPressAction={() =>
                          Linking.openURL(
                            "https://friendsmobile.org/TermsOfUse.pdf"
                          )
                        }
                        textStyle={{
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: -3,
                        }}
                      />{" "}
                      and{" "}
                      <TextButton
                        text="Privacy Policy"
                        textStyle={{
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: -3,
                        }}
                        onPressAction={() =>
                          Linking.openURL(
                            "https://friendsmobile.org/PrivacyPolicy.pdf"
                          )
                        }
                      />
                    </Text>
                  </View>
                  {problem && (
                    <Text style={styles.problemText}>{problemMessage}</Text>
                  )}
                </View>
              )}
              <Button
                text="Sign Up"
                disabled={disabled}
                onPressAction={() => this.signUp()}
                spinning={this.state.spinning}
              />
            </View>
          </DismissKeyboardView>
        </KeyboardAvoidingScrollView>
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
        <KeyboardListener
          onWillShow={() => {
            this.setState({ keyboardOpen: true })
          }}
          onWillHide={() => {
            this.setState({ keyboardOpen: false })
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    margin: 8,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  bodyContainer: {
    margin: 32,
  },
  input: {
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
  problemText: {
    width: 100 + "%",
    fontSize: 17,
    color: config.primaryColor,
    textAlign: "center",
    marginBottom: 16,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    padding: 0,
    margin: 0,
  },
  label: {
    marginBottom: 16,
    flexShrink: 1,
    fontSize: 17,
    alignItems: "center",
    justifyContent: "center",
    color: config.textColor,
    flexDirection: "row",
    flex: 1,
  },
})
