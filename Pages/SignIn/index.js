// Modules
import React from "react"
import { CommonActions } from "@react-navigation/native"
import * as SecureStore from "expo-secure-store"
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import config from "../../config"
import User from "../../Data/User"

// Data Functions
import { signIn, loadData, resetPassword } from "../../Firebase/UserFunctions"

// Components
import {
  Input,
  H1,
  Button,
  TextButton,
  DismissKeyboardView,
  LogoHorizontal,
} from "../../Components"

/**
 * Handles signing in UI for the app
 *
 * @component
 * @author Maxwell Stone
 */
class SignIn extends React.Component {
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
    // this.loadCredentials()
  }

  /**
   * saved user credentials for automatic sign in
   *
   * @method
   */
  loadCredentials = async () => {
    // get user credentials from local storage
    let savedData = await SecureStore.getItemAsync("credentials")
    try {
      // parse saved data (could fail if the object does not exist)
      savedData = JSON.parse(savedData)

      if (savedData !== null) {
        // set user credentials to state
        this.setState({ email: savedData.email, password: savedData.password })

        // run signin
        this.signIn()
      }
    } catch (error) {
      // log error if there is one
      console.warn(`error ${error}`)
    }
  }

  /**
   * handles text field input change
   * @method
   */
  onChangeText = (field, val) => {
    // update changed field with new value
    this.setState({ [field]: val })
  }

  /**
   * custom loading indicator
   * @method
   */
  load = async (loading) => {
    if (loading) {
      this.setState({ loading: true, title: "F" }, async () => {
        const t = "Friends"
        while (this.state.loading) {
          for (let i = 1; i < 8; i++) {
            const promises = []
            promises.push(
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const current = (this.state.title += t.substring(i, i + 1))
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

  /**
   * Uses input user data to authenticat a user with firebase
   * @method
   */
  signIn = () => {
    // turn on loading indicator
    this.setState({ spinning: true, loading: true })
    console.log("signing in user")
    // run firebase function with sign in info
    signIn(this.state.email, this.state.password)
      .then(async (d) => {
        // use authentication data to get user data
        this.handleSignedInUser(d)
      })
      .catch((err) => {
        // alert the user of a sign in issue
        alert(err)

        // stop loading indicator
        this.setState({ spinning: false, loading: false })
      })
  }

  /**
   * parse downloaded auth data
   * @method
   */
  handleSignedInUser = async (d) => {
    // set current user auth object to the downloaded auth data
    User.auth = d.user

    if (User.auth.emailVerified) {
      // set new sign in credentials to secure store
      await SecureStore.setItemAsync(
        "credentials",
        JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        })
      )

      // download user data from firestore
      this.downloadUserData()
    } else {
      // alert the user if their email is not verified
      alert("You Must Verify Your Email")

      // stop loading indicator
      this.setState({ spinning: false, loading: false })
    }
  }

  /**
   * download user data from firebase firestore
   * @method
   */
  downloadUserData = () => {
    // run firebase function to download firestore data for user
    loadData(User.auth.uid).then((doc) => {
      // set current user data object to downloaded data
      User.data = doc.data()

      // save data
      User.setCurrentUser()

      // set up navigation and navigate to next screen
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Home",
              params: {
                code: this.props.route.params
                  ? this.props.route.params.code
                  : "", // pass code to next screen if a friend code url was used
                refresh: true,
              },
            },
          ],
        })
      )

      // stop the spinner after half a second
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
  }

  /**
   * send password reset email to input email
   * @method
   */
  sendPasswordResetEmail() {
    // run firebase function to send password reset email
    resetPassword(this.state.email)
      .then(() => {
        // Email sent.
        alert("Pasword reset email sent")
      })
      .catch((error) => {
        // An error happened.
        alert(error)
      })
  }

  render() {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const disabled =
      this.state.password.length < 8 || !reg.test(this.state.email)
    return (
      <View style={{ width: `${100}%`, height: `${100}%` }}>
        
          <KeyboardAvoidingScrollView
          scrollEventThrottle={32}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                    placeholder="Password"
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
        </KeyboardAvoidingScrollView>
        <View
          style={{
            ...styles.footerContainer,
            backgroundColor: config.secondaryColor,
          }}>
          <View style={styles.footerContentContainer}>
            <View style={styles.signUpContainer}>
              <Text style={{ ...styles.text, color: config.textColor }}>
                Forgot password?
              </Text>
              <TextButton
                text="Reset Password"
                onPressAction={() => this.sendPasswordResetEmail()}
              />
            </View>
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
      </View>
    )
  }
}

export default SignIn

const styles = StyleSheet.create({
  mainContainer: {
    padding: 8,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyContainer: {
    width: `${100}%`,
    padding: 16,
    height: `${100}%`,
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
  signUpContainer: { flexDirection: "row", marginBottom: 16 },
  footerContentContainer: { flex: 1, alignItems: "center" },
  footerContainer: {
    flex: 0.15,
    justifyContent: "flex-end",
    alignItems: "center",
  },
})
