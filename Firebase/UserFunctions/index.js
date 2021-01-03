import { firebase } from "../config"

const createEmailUser = (email, password) => {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
}

const setUserData = (uid, data) => {
  data.id = uid
  const usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).set(data)
}

const signIn = async (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

const verifyEmail = () => {
  firebase.auth().currentUser.sendEmailVerification()
}

const updateUserPosts = (postList) => {
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ posts: postList })
}

const loadData = async (uid) => {
  // fetch data from database
  return firebase.firestore().collection("users").doc(uid).get()
}

const getUsers = async (userList) => {
  let userPromises = []
  userList.forEach((user) => {
    console.log("adding promise")
    userPromises.push(loadData(user))
  })
  return Promise.all(userPromises)
}

const findUserWithFriendCode = async (code) => {
  let usersRef = firebase.firestore().collection("users")
  return usersRef.where("friendCode", "==", code).get()
}

const updateUser = async (data, uid) => {
  let usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).update(data)
}

const sendFriendRequest = async (user) => {
  let _friendRequests = user.data.friendRequests
  if (_friendRequests == null) {
    _friendRequests = []
  }
  let date = new Date()
  _friendRequests.push({
    userID: firebase.auth().currentUser.uid,
    date: date.toISOString(),
  })
  return updateUser({ friendRequests: _friendRequests }, user.data.id)
}

export {
  createEmailUser,
  signIn,
  setUserData,
  verifyEmail,
  updateUserPosts,
  loadData,
  getUsers,
  updateUser,
  sendFriendRequest,
  findUserWithFriendCode,
}
