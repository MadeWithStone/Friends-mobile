import { firebase } from "../config"

const uploadImage = (image, postID) => {
  let uid = firebase.auth().currentUser.uid
  let reference = firebase
    .storage()
    .ref()
    .child(uid + "/" + postID + ".jpg")
  return uriToBlob(image).then((blob) => {
    return reference.put(blob)
  })
}

uriToBlob = (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      // return the blob
      resolve(xhr.response)
    }

    xhr.onerror = function () {
      // something went wrong
      reject(new Error("uriToBlob failed"))
    }
    // this helps us get a blob
    xhr.responseType = "blob"
    xhr.open("GET", uri, true)

    xhr.send(null)
  })
}

export { uploadImage }
