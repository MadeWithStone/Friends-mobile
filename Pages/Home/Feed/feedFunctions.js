import { resolveConfig } from "prettier"
import {
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"
import { getUsers } from "../../../Firebase/UserFunctions"
import { loadData } from "../../../Firebase/UserFunctions"

/**
 * functions for feed screen
 */
class FeedFunctions {
  /**
   * downloads user objects from list of friends
   *
   * @param {array} postList postList
   * @param {object} User current user
   */
  static downloadUsers = async (postList, User) => {
    return new Promise((resolve, reject) => {
      // initialize list of users
      let userList = []
      console.log(User)
      // if the current user has friends
      if (User.data.friends) {
        // add the friends to the list of users
        User.data.friends.forEach((user) => userList.push(user.userID))
      }

      // if there are no users to download
      if (userList == null) {
        // end function
        reject()
      } else {
        // get copy of postList
        let pList = [...postList]

        // run firestore function to get user objects from list
        getUsers(userList).then(async (result) => {
          // initialize list of users
          let u = []

          // loop through downloaded user objects
          result.forEach((user) => {
            // add user data to list of users
            u.push(user.data())

            // get the latest two posts from the current user and add them to pList
            for (
              let i = 0;
              i < 2 && user.data().posts && i < user.data().posts.length;
              i++
            ) {
              // add post to pList
              pList.push(user.data().posts[i])
            }
          })

          // get length of current user's list of posts
          let userPostsLength = User.data.posts ? User.data.posts.length : 0

          // loop through user posts
          for (let i = 0; i < 2 && i < userPostsLength; i++) {
            // add top two to pList
            pList.push(User.data.posts[i])
          }

          // filter pList to remove duplicate items
          let arr1 = pList.filter(
            (item, index) => pList.indexOf(item) === index
          ) //removeDups(pList)

          // determine if this is a new user
          let newUser = User.data.posts ? false : false

          // user newUser and post list length to determine whether to reset
          let reset = arr1.length < postList.length || newUser

          // if reset
          if (reset) {
            /*console.log(
              "reseting: " + (arr1.length < postList.length) + newUser
            )*/

            // reset postList
            postList = []

            // reset list of post objects
            setPosts([])
          }

          // remove posts that are already downloaded
          let arr = await this.removeDups(Object.assign(arr1), [...postList])

          // initialize list of indexes to remove
          let removeIndexes = []

          // loop through postList
          postList.forEach((post, index) => {
            // if post is not in new list of posts
            if (arr1.findIndex((x) => x === post) === -1) {
              // add post index to list of posts to remove
              removeIndexes.push(index)
            }
          })

          // reverse list of remove indexes
          removeIndexes = removeIndexes.reverse()

          // loop through remove indexes
          for (let i = 0; i < removeIndexes.length; i++) {
            // remove posts
            postList.splice(removeIndexes[i], 1)
          }

          //console.log("remove indexes: " + JSON.stringify(removeIndexes))

          // add new posts to postList
          postList = [...arr, ...postList]

          //console.log("user set: " + JSON.stringify(userList))

          console.log([arr, u])
          // resolve data
          resolve([arr, u])
        })
      }
    })
  }

  /**
   * removes all instances of duplicate posts
   *
   * @async
   * @param {array} pList list of post ids
   */
  static removeDups = (pList, postList) => {
    // create new asynchronous promise
    return new Promise((resolve, reject) => {
      // console.log("postList in remove dups: " + JSON.stringify(postList))

      // initialize new array
      let arr = []
      // console.log("### removing dups")

      // get length of pList
      let len = pList.length

      // initialize index
      let i = 0

      // loop through pList
      while (i < len) {
        // check if the post is in the list of current posts
        if (postList.indexOf(pList[i]) == -1) {
          // if it isnt add it the list of new posts
          arr.push(pList[i])
        }

        // increment index
        i++
      }

      // resolve promise with list of new posts
      resolve(arr)
    })
  }

  /**
   * download post data from list of posts
   *
   * @param {array} pList list of post ids
   * @param {boolean} refreshPosts determines whether to delete current posts
   */
  static downloadPosts = async (pList, refreshPosts, postList) => {
    return new Promise((resolve, reject) => {
      // if there are posts to download
      if (pList.length > 0) {
        // run firebase function to get posts from list
        getPosts(pList).then((result) => {
          // initalize list of post objects
          let p = []

          // loop through posts
          result.forEach((post) => {
            // append each post's data to the list of post objects
            p.push(post.data())
          })

          // sort the list of posts in date descending order
          p.sort((a, b) => {
            let dA = new Date(a.date)
            let dB = new Date(b.date)
            return dA <= dB
          })

          // initialize cuttof date object
          let cuttOff = new Date()

          // set cuttoff date to one day before the current date
          cuttOff.setDate(cuttOff.getDate() - 1)

          // filter all the posts to make sure they are no later than the cuttoff date
          p = p.filter((item, index) => {
            let d = new Date(item.date)
            return p.indexOf(item) === index && d >= cuttOff
          })

          // list of post indexes to remove
          let removeIndexes = []

          // loop through each post
          p.forEach((post, index) => {
            // remove post if it is a duplicate
            if (postList.findIndex((x) => x === post.id) !== -1) {
              // add index to list of indexes to remove
              removeIndexes.push(index)
            }
          })

          console.log("### posts: " + [...p])
          // reverse the direction of the removeIndexes list
          removeIndexes = removeIndexes.reverse()
          // loop through the indexes to remove
          for (let i = 0; i < removeIndexes.length; i++) {
            // remove the post at the current remove index
            p.splice(removeIndexes[i], 1)
          }

          resolve(refreshPosts ? [] : [...p])
          /*// add new posts to the posts state
              setPosts((old) => {
                let pAdd = refreshPosts ? [] : old
                return [...p, ...pAdd]
              })
      
              console.log("### posts: " + posts.length + " " + [...p].length)
      
              // set cleaned to false calling the cleaned useEffect hook
              setCleaned(false)
      
              // stop the refresh indicator
              setRefreshing(false)*/
        })
      } else {
        // stop the refresh indicator if no new posts
        // setRefreshing(false)
        resolve([])
      }
    })
  }
}

export default FeedFunctions
