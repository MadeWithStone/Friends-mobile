import { firebase } from "../config"
import { getUsers } from "../UserFunctions"
import User from "../../Data/User"

const announcementsRef = firebase.firestore().collection("announcements")

const createAnnouncement = (data) => {
  if (User.data.roles && User.data.roles.includes("admin")) {
    return firebase.firestore().collection("announcements").add(data)
  }
  return new Promise((resolve, reject) => {
    reject()
  })
}
const editAnnouncement = (data, announceID) => {
  if (User.data.roles && User.data.roles.includes("admin")) {
    const date = new Date()
    return firebase
      .firestore()
      .collection("announcements")
      .doc(announceID)
      .update(data)
  }
  return new Promise((resolve, reject) => {
    reject()
  })
}
const getAnnouncement = (announceID) => {
  if (User.data.roles && User.data.roles.includes("admin")) {
    return firebase
      .firestore()
      .collection("announcements")
      .doc(announceID)
      .get()
  }
  return new Promise((resolve, reject) => {
    reject()
  })
}
const getAllAnnouncements = (data) => {
  if (User.data.roles && User.data.roles.includes("admin")) {
    return firebase.firestore().collection("announcements").get()
  }
  return new Promise((resolve, reject) => {
    reject()
  })
}

const getAnnouncementsListener = () =>
  firebase.firestore().collection("announcements")

export {
  createAnnouncement,
  editAnnouncement,
  getAnnouncement,
  getAllAnnouncements,
  getAnnouncementsListener,
  announcementsRef,
}
