// modules
import * as SecureStore from "expo-secure-store"
import { firebase } from "../Firebase/config"

//import functions for getting cloud data
import {
  createEmailUser,
  signOut as signOutFunc,
  loadData,
} from "../Firebase/UserFunctions"

/**
 * current user
 *
 * @class
 */
class User {
  constructor(userData) {
    this.userData = userData
  }

  /**
   * set user data
   *
   * @method
   * @param {object} data user data
   */
  static set data(data) {
    this.userData = data
  }

  /**
   * get user data
   *
   * @method
   */
  static get data() {
    return this.userData
  }

  /**
   * set auth data
   *
   * @method
   * @param {object} auth auth data
   */
  static set auth(auth) {
    console.log("setting auth")
    this.authData = auth
  }

  static get auth() {
    return this.authData
  }

  static async signIn(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  }

  /**
   * sign out user
   *
   * @static
   */
  static signOut() {
    return new Promise(async (resolve, reject) => {
      this.data = null
      console.log("deleted userdata")
      await SecureStore.deleteItemAsync("currentAuth")
      this.auth = null
      console.log("deleted authdata")
      await SecureStore.deleteItemAsync("credentials")
      await signOutFunc()
      console.log("signed out")
      resolve()
    })
  }

  /**
   * save current user data to secure store
   *
   * @static
   * @method
   */
  static async setCurrentUser() {
    console.log("current user data: " + this.data)
    await SecureStore.setItemAsync("currentUser", JSON.stringify(this.data))
    await SecureStore.setItemAsync("currentAuth", JSON.stringify(this.auth))
  }

  /**
   * load current user data from secure store
   *
   * @static
   * @async
   * @param {function} callback called after data loaded
   */
  static async loadCurrentUser(callback) {
    return new Promise(async (resolve, reject) => {
      let savedData = await SecureStore.getItemAsync("currentUser")
      try {
        savedData = JSON.parse(savedData)
        this.userData = savedData
        if (callback != null) {
          callback()
        }
      } catch (error) {
        console.log("error " + error)
      }
      let authData = await SecureStore.getItemAsync("currentAuth")
      try {
        authData = JSON.parse(authData)
        this.authData = authData
        if (callback != null) {
          callback()
        }
      } catch (error) {
        console.log("error " + error)
      }
      resolve(this)
    })
  }

  /**
   * load current user data from firebase
   *
   * @static
   * @async
   */
  static async getUpdatedData() {
    return new Promise((resolve, reject) => {
      loadData(this.auth.uid)
        .then((doc) => {
          this.data = doc.data()
          this.setCurrentUser()
          resolve()
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * generate new friend code
   *
   * @static
   */
  static generateFriendCode() {
    let date = new Date()
    let ms = date.getTime()
    let code = []
    for (let i = 0; i < 7; i++) {
      code[i] = Math.round(ms % 100)
      ms /= 100
    }
    let lookUP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    lookUP = lookUP.split("")
    for (let i = 0; i < code.length; i++) {
      code[i] = lookUP[code[i] % 35]
    }
    code = code.join("")
    console.log("new friend code: " + code)
    return code
  }
}

export default User
