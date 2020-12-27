import { firebase } from "../config"

const createEmailUser = (email, password) => {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
}

const setUserData = (uid, data) => {
  const usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).set(data)
}

const signIn = async (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

const verifyEmail = () => {
  firebase.auth().currentUser.sendEmailVerification()
}

export { createEmailUser, signIn, setUserData, verifyEmail }
