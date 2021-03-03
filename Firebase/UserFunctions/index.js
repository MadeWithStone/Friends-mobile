import { firebase } from "../config"

/**
 * creates a firebase authentication email user
 *
 * @memberof Firebase
 * @async
 * @param {string} email user email
 * @param {string} password user password
 */
const createEmailUser = (email, password) =>
  firebase.auth().createUserWithEmailAndPassword(email, password)

/**
 * set user firestore data
 *
 * @memberof Firebase
 * @async
 * @param {string} uid user id
 * @param {object} data user data object
 */
const setUserData = (uid, dataParam) => {
  const data = { ...dataParam, id: uid }
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
const signIn = async (email, password) =>
  firebase.auth().signInWithEmailAndPassword(email, password)

/**
 * sign out user
 *
 * @memberof Firebase
 * @async
 */
const signOut = () => firebase.auth().signOut()

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
const resetPassword = (email) => firebase.auth().sendPasswordResetEmail(email) // pass in {url: 'url'} to set redirect url

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
  const reqID = friendRequests.findIndex((x) => x.userID === userID)
  // console.log("reqID: " + reqID)
  const request = friendRequests[reqID]
  // console.log("request: " + JSON.stringify(request))
  friendRequests.splice(reqID, 1)
  const date = new Date()
  const friends = _friends != null ? _friends : []
  friends.push({ userID, date: date.toISOString() })
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  const updatePromises = []
  updatePromises.push(
    doc.update({
      friends,
      friendRequests,
    })
  )
  const friendData = await loadData(request.userID)
  const friendFriends =
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
  const reqID = friendRequests.findIndex((x) => x.userID === userID)
  friendRequests.splice(reqID, 1)
  const usersRef = firebase.firestore().collection("users")
  const doc = usersRef.doc(firebase.auth().currentUser.uid)
  return doc.update({ friendRequests })
}

/**
 * get firestore data for user
 *
 * @memberof Firebase
 * @async
 * @param {string} uid user's id
 */
const loadData = async (uid) =>
  // fetch data from database
  firebase.firestore().collection("users").doc(uid).get()

/**
 * get user objects from list of user ids
 *
 * @memberof Firebase
 * @async
 * @param {array} userList list of user ids (strings)
 */
const getUsers = (userList) =>
  new Promise((resolve, reject) => {
    const userPromises = []
    userList.forEach((user) => {
      // console.log("adding getUser promise")
      userPromises.push(loadData(user))
    })
    // console.log("awaiting promises")
    Promise.all(userPromises).then((res) => resolve(res))
  })

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
  const usersRef = firebase.firestore().collection("users")
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
  const usersRef = firebase.firestore().collection("users")
  return usersRef.doc(uid).update(data)
}

const removeProfileImage = async (uid) => {
  const reference = firebase.storage().ref().child(`${uid}/${uid}.jpg`)
  return reference.delete()
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
  const date = new Date()
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
  removeProfileImage,
}
