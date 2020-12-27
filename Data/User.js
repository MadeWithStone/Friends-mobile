//import functions for getting cloud data
import { createEmailUser } from "../Firebase/UserFunctions"
import { firebase } from "../Firebase/config"

import * as SecureStore from "expo-secure-store"

export default class User {
  constructor(userData) {
    this.userData = userData
  }

  set data(data) {
    this.userData = data
  }

  get data() {
    return this.userData
  }

  set auth(auth) {
    console.log("setting auth")
    this.authData = auth
  }

  get auth() {
    return this.authData
  }

  async signIn(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  }

  async loadData() {
    // fetch data from database
    return firebase.firestore().collection("users").doc(this.auth.uid).get()
  }

  signOut() {
    // sign out user and delete local data
  }
}
