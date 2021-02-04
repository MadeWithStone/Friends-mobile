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

const signOut = () => {
  return firebase.auth().signOut()
}

const verifyEmail = () => {
  firebase.auth().currentUser.sendEmailVerification()
}

const updateUserPosts = (postList) => {
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ posts: postList })
}

const acceptFriendRequest = async (userID, friendRequests, _friends) => {
  let reqID = friendRequests.findIndex((x) => x.userID === userID)
  console.log("reqID: " + reqID)
  let request = friendRequests[reqID]
  console.log("request: " + JSON.stringify(request))
  friendRequests.splice(reqID, 1)
  let date = new Date()
  let friends = _friends != null ? _friends : []
  friends.push({ userID: userID, date: date.toISOString() })
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  let updatePromises = []
  updatePromises.push(
    doc.update({
      friends: friends,
      friendRequests: friendRequests,
    })
  )
  let friendData = await loadData(request.userID)
  let friendFriends =
    friendData.data().friends != null ? friendData.data().friends : []
  friendFriends.push({
    userID: firebase.auth().currentUser.uid,
    date: date.toISOString(),
  })
  const friend = usersRef.doc(request.userID)

  updatePromises.push(friend.update({ friends: friendFriends }))
  return Promise.all(updatePromises)
}

const declineFriendRequest = (userID, friendRequests) => {
  let reqID = friendRequests.findIndex((x) => x.userID === userID)
  friendRequests.splice(reqID, 1)
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ friendRequests: friendRequests })
}

const loadData = async (uid) => {
  // fetch data from database
  return firebase.firestore().collection("users").doc(uid).get()
}

const getUsers = async (userList) => {
  return new Promise(async (resolve, reject) => {
    let userPromises = []
    userList.forEach((user) => {
      console.log("adding getUser promise")
      userPromises.push(loadData(user))
    })
    console.log("awaiting promises")
    let res = await Promise.all(userPromises)
    console.log("got users in getUsers")
    resolve(res)
  })
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
  acceptFriendRequest,
  declineFriendRequest,
  signOut,
}
