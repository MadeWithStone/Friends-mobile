import React, { useState, useEffect } from "react"
import { userReference } from "./UserFunctions"
import User from "../Data/User"
import {} from "./PostFunctions"

const useUserData = () => {
  const [data, setData] = useEffect({})
  let listener

  useEffect(() => {
    listener = userReference(User.data.id).onSnapshot((doc) => {
      // console.log("snap data: " + JSON.stringify(doc.data()))
      User.data = doc.data()
      setData(doc.data())
    })
    return () => {
      listener()
    }
  })

  return data
}

export default useUserData
