//import functions for getting cloud data
import {
  createEmailUser,
  signOut as signOutFunc,
  loadData,
} from "../Firebase/UserFunctions"
import { firebase } from "../Firebase/config"

import * as SecureStore from "expo-secure-store"

export default class User {
  constructor(userData) {
    this.userData = userData
  }

  static set data(data) {
    this.userData = data
  }

  static get data() {
    return this.userData
  }

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

  static async setCurrentUser() {
    console.log("current user data: " + this.data)
    await SecureStore.setItemAsync("currentUser", JSON.stringify(this.data))
    await SecureStore.setItemAsync("currentAuth", JSON.stringify(this.auth))
  }

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

  static signOut() {
    // sign out user and delete local data
  }
}
