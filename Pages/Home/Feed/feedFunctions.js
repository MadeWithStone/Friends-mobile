import {
  getPost,
  getPosts,
  updateReports,
} from "../../../Firebase/PostFunctions"
import { getUsers, loadData } from "../../../Firebase/UserFunctions"

/**
 * functions for feed screen
 */
class FeedFunctions {
  /**
   * downloads user objects from list of friends
   *
   * @static
   * @async
   * @method
   * @param {array} postList postList
   * @param {object} User current user
   * @return {object} {pList, users}
   */
  static downloadUsers = async (postListParam, User) =>
    new Promise((resolve, reject) => {
      // initialize list of users
      postList = [...postListParam]
      const userList = []

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
        const pList = [...postList]

        // run firestore function to get user objects from list
        getUsers(userList).then(async (result) => {
          // initialize list of users
          const u = {}

          // loop through downloaded user objects
          result.forEach((user) => {
            // add user data to list of users
            const userData = user.data()
            u[userData.id] = userData

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
          const userPostsLength = User.data.posts ? User.data.posts.length : 0

          // loop through user posts
          for (let i = 0; i < 2 && i < userPostsLength; i++) {
            // add top two to pList
            pList.push(User.data.posts[i])
          }

          // filter pList to remove duplicate items
          const arr1 = pList.filter(
            (item, index) => pList.indexOf(item) === index
          ) // removeDups(pList)

          // determine if this is a new user
          const newUser = false

          // user newUser and post list length to determine whether to reset
          const reset = arr1.length < postList.length || newUser

          // if reset
          if (reset) {
            /* console.log(
              "reseting: " + (arr1.length < postList.length) + newUser
            ) */

            // reset postList
            postList = []

            // reset list of post objects
            setPosts([])
          }

          // remove posts that are already downloaded
          const arr = await this.removeDups(Object.assign(arr1), [...postList])

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

          // add new posts to postList
          postList = [...arr, ...postList]

          // add current user
          u[User.data.id] = User.data

          // resolve data
          resolve({ pList: arr, u })
        })
      }
    })

  /**
   * removes all instances of duplicate posts
   *
   * @static
   * @async
   * @method
   * @param {array} pList list of post ids
   * @param {array} postList list of current post ids
   * @return {array} list of new posts
   */
  static removeDups = (pList, postList) =>
    // create new asynchronous promise
    new Promise((resolve, reject) => {
      // console.log("postList in remove dups: " + JSON.stringify(postList))

      // initialize new array
      const arr = []
      // console.log("### removing dups")

      // get length of pList
      const len = pList.length

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

  /**
   * download post data from list of posts
   *
   * @static
   * @async
   * @method
   * @param {array} pList list of post ids
   * @param {boolean} refreshPosts determines whether to delete current posts
   * @param {array} postList list of current post ids
   * @return {array} list of post objects
   */
  static downloadPosts = async (pList, postList) =>
    new Promise((resolve, reject) => {
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
            const dA = new Date(a.date)
            const dB = new Date(b.date)
            return dA <= dB
          })

          // initialize cuttof date object
          const cuttOff = new Date()

          // set cuttoff date to one day before the current date
          cuttOff.setDate(cuttOff.getDate() - 2)

          // filter all the posts to make sure they are no later than the cuttoff date
          p = p.filter((item, index) => {
            const d = new Date(item.date)
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

          // reverse the direction of the removeIndexes list
          removeIndexes = removeIndexes.reverse()
          // loop through the indexes to remove
          for (let i = 0; i < removeIndexes.length; i++) {
            // remove the post at the current remove index
            p.splice(removeIndexes[i], 1)
          }

          // resolve data
          resolve(p)
        })
      } else {
        // stop the refresh indicator if no new posts
        resolve([])
      }
    })

  /**
   * removes duplicate instances of posts
   *
   * @param {array} pList list of post objects
   */
  static cleanOldPosts = (pList) =>
    new Promise((resolve, reject) => {
      // make copy of pList
      const p = [...pList]

      // initialize array
      const dict = []

      // initialize array
      const people = []

      // sort p into ascending order
      p.sort((a, b) => {
        const dB = new Date(a.date)
        const dA = new Date(b.date)
        return dA <= dB
      })

      // loop through p backwards
      for (let i = p.length - 1; i >= 0; i--) {
        // if post has 5 or more reports
        if (p[i].reports != null && p[i].reports.length >= 5) {
          // remove post
          p.splice(i, 1)
        } else {
          // find user in people array
          const idx = people.indexOf(p[i].userID)

          // user is not in people array
          if (idx == -1) {
            // add user to people array
            people.push(p[i].userID)

            // add a 1 to dict array
            dict.push(1)
          } else if (dict[idx] >= 2) {
            // if person has more than two posts
            // delete new posts
            p.splice(i, 1)
          } else dict[idx]++ // increment number of posts for person
        }
      }

      // sort in descending order again
      p.sort((a, b) => {
        const dA = new Date(a.date)
        const dB = new Date(b.date)
        return dA <= dB
      })

      // update post state
      resolve(p)
    })
}

export default FeedFunctions
