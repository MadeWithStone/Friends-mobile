import * as firebase from "firebase"
import "@firebase/auth"
import "@firebase/firestore"
import "@firebase/storage"

/**
 * @namespace Firebase
 */
const firebaseConfig = {
  apiKey: "AIzaSyDl_odT6tNrFx_dkGG2-JMapZChb4cn67U",
  authDomain: "friends-cloud-9d9cb.firebaseapp.com",
  projectId: "friends-cloud-9d9cb",
  storageBucket: "friends-cloud-9d9cb.appspot.com",
  messagingSenderId: "277712914892",
  appId: "1:277712914892:web:1f15d818e86cd2178ab569",
  measurementId: "G-DH69G4K2VN",
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export { firebase }
