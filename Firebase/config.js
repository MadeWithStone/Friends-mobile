import * as firebase from "firebase"
import "@firebase/auth"
import "@firebase/firestore"
import "@firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDl_odT6tNrFx_dkGG2-JMapZChb4cn67U",
  authDomain: "friends-cloud-9d9cb.firebaseapp.com",
  databaseURL: "https://your-database-name.firebaseio.com",
  projectId: "friends-cloud-9d9cb",
  storageBucket: "friends-cloud-9d9cb.appspot.com",
  messagingSenderId: "277712914892",
  appId: "1:277712914892:ios:be9094bf9053044e8ab569",
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export { firebase }
