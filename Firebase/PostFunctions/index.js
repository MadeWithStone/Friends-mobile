import { firebase } from "../config"
import { getUsers } from "../UserFunctions"
import User from "../../Data/User"

/**
 * upload image to firebase storage and track download
 *
 * @memberof Firebase
 * @method
 * @param {string} image uri to local image
 * @param {string} postID post id to use as id
 * @param {function} stateUpdate function to call with upload progress updates
 * @param {function} complete function to call when upload is complete
 */
const uploadImage = (image, postID, stateUpdate, complete) => {
  uriToBlob(image).then((blob) => {
    const { uid } = firebase.auth().currentUser
    const reference = firebase
      .storage()
      .ref()
      .child(`${uid}/${postID}.jpg`)
      .put(blob)
    reference.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        stateUpdate(snapshot)
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            // console.log("user does not have permission")
            break

          case "storage/canceled":
            // User canceled the upload
            // console.log("upload canceled")
            break

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            // console.log("unkown error")
            break
          default:
            console.log("all good")
        }
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        reference.snapshot.ref.getDownloadURL().then((downloadURL) => {
          // console.log("File available at", downloadURL)
          complete(downloadURL)
        })
      }
    )
  })
}

/**
 * convert image to blob for uploading
 *
 * @memberof Firebase
 * @method
 * @param {string} uri uri to local image
 */
uriToBlob = (uri) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = () => {
      // return the blob
      resolve(xhr.response)
    }

    xhr.onerror = () => {
      // something went wrong
      reject(new Error("uriToBlob failed"))
    }
    // this helps us get a blob
    xhr.responseType = "blob"
    xhr.open("GET", uri, true)

    xhr.send(null)
  })

/**
 * create post in firestore
 *
 * @memberof Firebase
 * @async
 * @param {object} data object containing post data
 * @param {string} postID post id to use
 */
const createPostData = (dataParam, postID) => {
  data = { userID: firebase.auth().currentUser.uid, id: postID, ...dataParam }
  // console.log("description: " + data.description)
  const postsRef = firebase.firestore().collection("posts")
  return postsRef.doc(postID).set(data)
}

/**
 * get post data
 *
 * @memberof Firebase
 * @async
 * @param {string} postID
 */
const getPost = (postID) => {
  const postsRef = firebase.firestore().collection("posts")
  return postsRef.doc(postID).get()
}

/**
 * gets post objects from list of post ids
 *
 * @memberof Firebase
 * @async
 * @param {array} postList
 */
const getPosts = async (postList) => {
  const postPromises = []
  postList.forEach((post) => {
    // console.log("adding getPost promise")
    postPromises.push(getPost(post))
  })
  return Promise.all(postPromises)
}

/**
 * get users for array of comments
 *
 * @memberof Firebase
 * @async
 * @param {array} comments array of comments from a post
 */
const getCommentUsers = async (comments) =>
  new Promise((resolve, reject) => {
    const userList = []
    comments.forEach((comment) => userList.push(comment.userID))
    getUsers(userList).then((users) => {
      const u = []
      users.forEach((user) => {
        u.push(user.data())
      })
      // console.log("comment users: " + JSON.stringify(u[0]))
      resolve(u)
    })
  })

/**
 * get post reference for post id
 *
 * @memberof Firebase
 * @param {string} id
 */
const postReference = (id) => {
  const postsRef = firebase.firestore().collection("posts")
  return postsRef.doc(id)
}

const postsReference = firebase.firestore().collection("posts")

/**
 * update post comments
 *
 * @memberof Firebase
 * @async
 * @param {array} comments array of comment objects to update the post with
 * @param {string} postID id of post to update
 */
const addComment = async (comments, postID) => {
  const postRef = firebase.firestore().collection("posts").doc(postID)
  return postRef.update({ comments })
}

/**
 * update post reports
 *
 * @memberof Firebase
 * @async
 * @param {string} postID id of post to update
 * @param {array} reports arra of report objects to update the post with
 */
const updateReports = async (postID, reports) => {
  const postRef = firebase.firestore().collection("posts").doc(postID)
  return postRef.update({ reports })
}

/**
 * delete post
 *
 * @memberof Firebase
 * @async
 * @param {string} postID id of post to delet
 */
const deletePost = async (postID) => {
  const postRef = firebase.firestore().collection("posts").doc(postID)
  const deleted = await deleteImage(User.data.id, postID)
  return postRef.delete()
}

const deleteImage = async (uid, postID) => {
  const reference = firebase.storage().ref().child(`${uid}/${postID}.jpg`)
  return reference.delete()
}

export {
  uploadImage,
  createPostData,
  getPosts,
  getPost,
  getCommentUsers,
  addComment,
  postReference,
  updateReports,
  deletePost,
  postsReference,
}
