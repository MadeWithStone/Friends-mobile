import React from "react"
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native"
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
import User from "../../Data/User"
import { signIn, loadData } from "../../Firebase/UserFunctions"
import { CommonActions } from "@react-navigation/native"

import * as SecureStore from "expo-secure-store"

export default class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      loading: false,
      title: "Friends",
      spinning: false,
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

  load = async (loading) => {
    if (loading) {
      this.setState({ loading: true, title: "F" }, async () => {
        let t = "Friends"
        while (this.state.loading) {
          for (let i = 1; i < 8; i++) {
            let promises = []
            promises.push(
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  let current = (this.state.title += t.substring(i, i + 1))
                  this.setState({ title: current })
                  resolve()
                }, 170)
              })
            )
            await Promise.all(promises)
          }
          this.setState({ title: "F" })
        }
      })
    }
  }

  signIn = () => {
    this.setState({ spinning: true, loading: true })
    signIn(this.state.email, this.state.password)
      .then(async (d) => {
        User.auth = d.user
        if (User.auth.emailVerified) {
          await SecureStore.setItemAsync(
            "credentials",
            JSON.stringify({
              email: this.state.email,
              password: this.state.password,
            })
          )
          loadData(User.auth.uid).then((doc) => {
            User.data = doc.data()
            User.setCurrentUser()
            this.props.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: "Home",
                    params: {
                      code: this.props.route.params
                        ? this.props.route.params.code
                        : "",
                      refresh: true,
                    },
                  },
                ],
              })
            )

            setTimeout(
              () =>
                this.setState({
                  spinning: false,
                  loading: false,
                  email: "",
                  password: "",
                }),
              500
            )
          })
        } else {
          alert("You Must Verify Your Email")
          this.setState({ spinning: false, loading: false })
        }
      })
      .catch((err) => {
        alert(err)
        this.setState({ spinning: false, loading: false })
      })
  }

  render() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let disabled = this.state.password.length < 8 || !reg.test(this.state.email)
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
              <View>
                <LogoHorizontal
                  size={63}
                  color={config.primaryColor}
                  title={this.state.title}
                  split
                />
              </View>
              {!this.state.spinning && (
                <View>
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
                </View>
              )}
              <Button
                text="Sign In"
                onPressAction={() => this.signIn()}
                disabled={disabled}
                spinning={this.state.spinning}
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
