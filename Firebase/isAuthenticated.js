import React from "react"
import { firebase } from "./config"

const authAPI = firebase.auth()

const isAuthenticated = () => {
  const [a, setAuth] = React.useState(authAPI.currentUser !== null)

  React.useEffect(() => {
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      if (user) {
        setAuth(true)
      } else {
        setAuth(false)
      }
    })
    return () => unsubscribe()
  }, [])

  return a
}

export default isAuthenticated
