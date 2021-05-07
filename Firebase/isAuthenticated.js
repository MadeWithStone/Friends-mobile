import React from "react"
import { firebase } from "./config"

const authAPI = firebase.auth()

const isAuthenticated = () => {
  const [a, setAuth] = React.useState(
    authAPI.currentUser !== null ? authAPI.currentUser : null
  )
  const [init, setInit] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      setInit(true)
      setAuth(user)
      if (a && !user) {
        setInit(false)
      }
    })
    return () => unsubscribe()
  }, [])

  return [a, init]
}

export default isAuthenticated
