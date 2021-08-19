import React, { useState, useEffect } from "react"
import { userReference } from "./UserFunctions"
import User from "../Data/User"
import {} from "./PostFunctions"
import isAuthenticated from "./isAuthenticated"

const useUserData = () => {
  const [data, setData] = useState(User.data)
  const [auth, init] = isAuthenticated()
  let listener

  useEffect(() => {
    if (init && auth) {
      listener = userReference(User.data.id).onSnapshot((doc) => {
        // console.log("snap data: " + JSON.stringify(doc.data()))
        if (doc.data()) {
          User.data = doc.data()
          setData({...doc.data(), id: doc.id})
        }
        
      })
      return () => {
        listener()
      }
    } else {
      if (listener) {
        listener()
      }
    }
    
  }, [auth, init])

  return data
}

export default useUserData
