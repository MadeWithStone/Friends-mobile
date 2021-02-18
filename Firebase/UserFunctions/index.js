import { firebase } from "../config"

/**
 * creates a firebase authentication email user
 *
 * @memberof Firebase
 * @async
 * @param {string} email user email
 * @param {string} password user password
 */
const createEmailUser = (email, password) => {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
}

/**
 * set user firestore data
 *
 * @memberof Firebase
 * @async
 * @param {string} uid user id
 * @param {object} data user data object
 */
const setUserData = (uid, data) => {
  data.id = uid
  const usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).set(data)
}
/**
 * signin user using email and password
 *
 * @memberof Firebase
 * @async
 * @param {string} email user email
 * @param {string} password user password
 */
const signIn = async (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

/**
 * sign out user
 *
 * @memberof Firebase
 * @async
 */
const signOut = () => {
  return firebase.auth().signOut()
}

/**
 * send email verification email
 *
 * @memberof Firebase
 */
const verifyEmail = () => {
  firebase.auth().currentUser.sendEmailVerification({
    url: "https://friendsmobile.org/redirect.html",
  }) // pass in {url: 'url'} to set redirect url
}

/**
 * send password reset email
 *
 * @memberof Firebase
 * @async
 * @param {string} email user email
 */
const resetPassword = (email) => {
  return firebase.auth().sendPasswordResetEmail(email) // pass in {url: 'url'} to set redirect url
}

/**
 * update current users's list of posts
 *
 * @memberof Firebase
 * @async
 * @param {array} postList
 */
const updateUserPosts = (postList) => {
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ posts: postList })
}

/**
 * accept friend request
 *
 * @memberof Firebase
 * @async
 * @param {string} userID user id of person who sent request
 * @param {array} friendRequests list of current user's friend requests
 * @param {array} _friends list of current user's friends
 */
const acceptFriendRequest = async (userID, friendRequests, _friends) => {
  let reqID = friendRequests.findIndex((x) => x.userID === userID)
  //console.log("reqID: " + reqID)
  let request = friendRequests[reqID]
  //console.log("request: " + JSON.stringify(request))
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

/**
 * decline friend request
 *
 * @memberof Firebase
 * @async
 * @param {string} userID user id of person who sent request
 * @param {array} friendRequests list of current user's friend requests
 */
const declineFriendRequest = (userID, friendRequests) => {
  let reqID = friendRequests.findIndex((x) => x.userID === userID)
  friendRequests.splice(reqID, 1)
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ friendRequests: friendRequests })
}

/**
 * get firestore data for user
 *
 * @memberof Firebase
 * @async
 * @param {string} uid user's id
 */
const loadData = async (uid) => {
  // fetch data from database
  return firebase.firestore().collection("users").doc(uid).get()
}

/**
 * get user objects from list of user ids
 *
 * @memberof Firebase
 * @async
 * @param {array} userList list of user ids (strings)
 */
const getUsers = async (userList) => {
  return new Promise(async (resolve, reject) => {
    let userPromises = []
    userList.forEach((user) => {
      //console.log("adding getUser promise")
      userPromises.push(loadData(user))
    })
    //console.log("awaiting promises")
    let res = await Promise.all(userPromises)
    //console.log("got users in getUsers")
    resolve(res)
  })
}

/**
 * get firestore reference for user id
 *
 * @memberof Firebase
 * @async
 * @param {string} id id of user
 */
const userReference = (id) => {
  const usersRef = firebase.firestore().collection("users")
  return usersRef.doc(id)
}

/**
 * finds user with friend code
 *
 * @memberof Firebase
 * @async
 * @param {string} code friend code
 */
const findUserWithFriendCode = async (code) => {
  let usersRef = firebase.firestore().collection("users")
  return usersRef.where("friendCode", "==", code).get()
}

/**
 * update user
 *
 * @memberof Firebase
 * @async
 * @param {object} data data to update user with
 * @param {string} uid id of user to update
 */
const updateUser = async (data, uid) => {
  let usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).update(data)
}

/**
 * send friend request to user
 *
 * @memberof Firebase
 * @async
 * @param {object} user user object of user to send request to
 */
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
  userReference,
  resetPassword,
}
