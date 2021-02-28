import React, { Component } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
  Modal,
  TouchableOpacity,
  StatusBar,
} from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import config from "../../../config"
import User from "../../../Data/User"
import {
  Button,
  ProfileImage,
  SectionHeader,
  TextButton,
  CachedImage,
  IconButton,
  OptionsModal,
} from "../../../Components"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import {
  acceptFriendRequest,
  declineFriendRequest,
  getUsers,
  userReference,
  updateUser,
} from "../../../Firebase/UserFunctions"
import {
  getPosts,
  deletePost as deletePostFunc,
} from "../../../Firebase/PostFunctions"
import EditProfile from "./EditProfile"
import Settings from "./Settings"
import { useIsFocused } from "@react-navigation/native"
import FriendsList from "./FriendsList"
import { usePreventScreenCapture } from "expo-screen-capture"
import { DeviceEventEmitter } from "react-native"

let pList = []
const Profile = ({ navigation, route }) => {
  let [friendRequests, setFriendRequests] = React.useState([])
  let [usersList, setUsersList] = React.useState([])
  let [posts, setPosts] = React.useState([])
  let [refreshing, setRefreshing] = React.useState(false)
  let [showModel, setShowModel] = React.useState(false)
  let [currentPost, setCurrentPost] = React.useState("")

  let focused = useIsFocused()
  let listener

  usePreventScreenCapture()

  React.useEffect(() => {
    //console.log("running use effect")
  }, [])

  React.useEffect(() => {
    if (focused) {
      updateData()
      listener = userReference(User.data.id).onSnapshot((doc) => {
        //console.log("snap data: " + JSON.stringify(doc.data()))
        User.data = doc.data()
        getFriendRequests()
        getUserPosts()
      })
    } else if (listener) {
      listener()
    }
  }, [focused])

  getFriendRequests = () => {
    let freReqs =
      User.data.friendRequests != null ? User.data.friendRequests : []
    let uList = []
    freReqs.forEach((req) => uList.push(req.userID))
    getUsers(uList).then((res) => {
      //console.log("getting users")
      data = []
      res.forEach((r) => {
        data.push(r.data())
      })
      setUsersList(data)
      setFriendRequests(freReqs)
      console.log("Profile.getFriendRequests: badge count emitted")
      DeviceEventEmitter.emit("friendBadgeCount", {
        val: freReqs.length,
      })
      setRefreshing(false)
    })
  }

  getUserPosts = () => {
    let postList = User.data.posts != null ? User.data.posts : []
    //console.warn("getting posts")
    let equal = arraysEqual(postList, pList)
    /*console.log(
      "postList: " +
        JSON.stringify(postList) +
        "; \npList: " +
        JSON.stringify(pList) +
        "; Equal: " +
        equal
    )*/
    if (!equal) {
      pList = postList
      getPosts(postList).then((result) => {
        let p = []
        result.forEach((post) => {
          p.push(post.data())
        })
        setPosts(p)

        setRefreshing(false)
      })
    }
  }

  function arraysEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  friendRequestCallback = (accept, req) => {
    if (accept) {
      acceptFriendRequest(req.userID, friendRequests, User.data.friends)
        .then(() => {
          // complete
          alert(
            "Added " +
              users.find((x) => x.id === req.userID).firstName +
              " as a friend"
          )
          updateData()
        })
        .catch((err) => {
          console.warn(err)
        })
    } else {
      declineFriendRequest(req.userID, friendRequests)
        .then(() => {
          // complete
          updateData()
        })
        .catch((err) => {
          console.warn(err)
        })
    }
  }

  const updateData = () => {
    if (focused) {
      User.loadCurrentUser()
        .then((data) => {
          User.data = data
          User.getUpdatedData().then(() => {
            //console.log("### done getData")
            navigation.setOptions({
              title:
                User.data != null
                  ? User.data.firstName + " " + User.data.lastName
                  : "Profile",
              headerLeft: () => (
                <Btn
                  onPress={() => {
                    navigation.navigate("EditProfile", { user: User.data })
                  }}
                  icon={
                    <Feather
                      name="edit"
                      size={30}
                      color={config.primaryColor}
                    />
                  }
                  type="clear"
                />
              ),
            })
            getFriendRequests()
            getUserPosts()
          })
        })
        .catch((err) => {
          //console.log("err: " + err)
        })
    }
  }

  const _onRefresh = () => {
    setRefreshing(true)
    updateData()
  }

  const deletePost = () => {
    deletePostFunc(currentPost).then(() => {
      let posts = User.data.posts
      let idx = posts.findIndex((x) => x === currentPost)
      posts.splice(idx, 1)
      updateUser({ posts: posts }, User.data.id)
      setShowModel(false)
    })
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title:
        User.data != null
          ? User.data.firstName + " " + User.data.lastName
          : "Profile",
      headerLeft: () => (
        <Btn
          onPress={() => {
            navigation.navigate("EditProfile", {
              user: { data: User.data, auth: User.auth },
            })
          }}
          icon={<Feather name="edit" size={30} color={config.primaryColor} />}
          type="clear"
        />
      ),
    })
  }, [navigation])
  return (
    <KeyboardAvoidingScrollView
      scrollEventThrottle={32}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: config.secondaryColor }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
      }>
      {User.data != null && (
        <ProfileDataView user={{ data: User.data, auth: User.auth }} />
      )}
      <Button
        text="Friends"
        onPressAction={() => navigation.navigate("YourFriends")}
        style={{ margin: 8 }}
      />
      {friendRequests != null && friendRequests.length > 0 && (
        <FriendRequestView
          friendRequests={friendRequests}
          users={usersList}
          callback={friendRequestCallback}
        />
      )}
      <PostsView
        posts={posts ? posts : []}
        openModal={(id) => {
          setShowModel(true)
          setCurrentPost(id)
        }}
        navigation={navigation}
      />
      <PostOptionsModal
        showChooser={showModel}
        setShowChooser={setShowModel}
        action={deletePost}
      />
      {focused && (
        <StatusBar
          style={config.secondaryColor === "#000" ? "light" : "dark"}
          hidden={false}
        />
      )}
    </KeyboardAvoidingScrollView>
  )
}

const ProfileDataView = (props) => {
  return (
    <View style={dvStyles.container}>
      <ProfileImage
        image={props.user.data.profileImage}
        size={100}
        name={props.user.data.firstName + " " + props.user.data.lastName}
        id={props.user.data.id}
      />
      <Text style={{ ...dvStyles.text, color: config.textColor }}>
        {props.user.data.firstName + " " + props.user.data.lastName}
      </Text>
    </View>
  )
}

const FriendRequestView = (props) => {
  return (
    <View>
      <SectionHeader title={"Friend Requests"} />
      <View style={{ paddingTop: 4 }}></View>
      {props.users != null &&
        props.friendRequests.map((req) => (
          <FriendRequestObj
            request={req}
            user={props.users.find((x) => x.id === req.userID)}
            key={req.userID}
            callback={props.callback}
          />
        ))}
    </View>
  )
}

const FriendRequestObj = (props) => {
  return (
    <View>
      {props.user && (
        <View style={frStyles.requestOBJContainer}>
          <Text style={{ fontSize: 17, color: config.textColor }}>
            {props.user.firstName} {props.user.lastName}
          </Text>
          <View style={frStyles.buttonContainer}>
            <Button
              text={"Accept"}
              style={{ marginRight: 8 }}
              textStyle={{ fontSize: 17, fontWeight: "bold", padding: 6 }}
              onPressAction={() => props.callback(true, props.request)}
            />
            <TextButton
              text={"Decline"}
              textStyle={{ fontSize: 17, color: "gray", fontWeight: "bold" }}
              onPressAction={() => props.callback(false, props.request)}
            />
          </View>
        </View>
      )}
    </View>
  ) //return a friend request object with callback for accept and decline
}

const PostOptionsModal = (props) => {
  const reportOptions = ["Delete Post"]
  return (
    <OptionsModal
      reportOptions={reportOptions}
      showChooser={props.showChooser}
      reportAction={() => props.action()}
      setShowChooser={props.setShowChooser}
    />
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 10,
  },
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
  },
})

const frStyles = StyleSheet.create({
  requestOBJContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
})

const PostsView = (props) => {
  //console.log("posts: " + JSON.stringify(props.posts))
  return (
    <View style={{ marginTop: 8 }}>
      <SectionHeader title={"Posts"} />
      {props.posts != null && props.posts.length > 0 && (
        <View
          style={{
            float: "left",
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: -1,
          }}>
          {props.posts.map((post, index) => {
            return (
              <TouchableOpacity
                onPress={() => props.openModal(post.id)}
                key={post.id}
                activeOpacity={0.6}>
                <PostViewObj post={post} index={index} />
              </TouchableOpacity>
            )
          })}
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: 8,
        }}>
        <Text
          style={{
            color: config.textColor,
            fontSize: 17,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}>
          go to the
        </Text>
        <IconButton
          icon={
            <Feather
              name="plus-square"
              size={config.iconFocused}
              color={config.primaryColor}
              style={{
                alignSelf: "center",
              }}
            />
          }
          style={{
            margin: -4,
          }}
          onPressAction={() => props.navigation.navigate("Post")}
        />
        <Text
          style={{
            color: config.textColor,
            fontSize: 17,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}>
          tab to create a post
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: 8,
          marginTop: 0,
        }}>
        <Text
          style={{
            color: config.textColor,
            fontSize: 17,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}>
          purple posts are not viewable by other users
        </Text>
      </View>
      {props.posts.length >= 6 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            margin: 8,
            marginTop: 0,
          }}>
          <Text
            style={{
              color: config.primaryColor,
              fontSize: 17,
              fontWeight: "bold",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
            }}>
            You have hit your post maximum of 6
          </Text>
        </View>
      )}
    </View>
  )
}

const PostViewObj = (props) => {
  // initialize cuttof date object
  let cuttOff = new Date()

  // set cuttoff date to one day before the current date
  cuttOff.setDate(cuttOff.getDate() - 2)

  let currentDate = new Date(props.post.date)

  return (
    <View
      style={{
        backgroundColor: config.primaryColor,
        marginRight: props.index % 3 == 0 ? 1 : 0,
        marginLeft: (props.index + 1) % 3 == 0 ? 1 : 0,
        marginBottom: 1,
        opacity: currentDate <= cuttOff || props.index > 1 ? 0.8 : 1,
      }}>
      <CachedImage
        key={props.post.id}
        source={{ uri: props.post.image }}
        cacheKey={props.post.id}
        style={{
          width: Dimensions.get("window").width / 3 - 0.7,
          height: Dimensions.get("window").width / 3,

          opacity: currentDate <= cuttOff || props.index > 1 ? 0.5 : 1,
          borderColor: config.primaryColor,
          //borderWidth: currentDate > cuttOff && props.index <= 1 ? 3 : 0,
        }}
      />
    </View>
  )
}

const dvStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },
  text: {
    color: config.textColor,
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

const Stack = createStackNavigator()
const ProfilePage = ({ navigation }) => {
  return (
    <Stack.Navigator
      options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
      <Stack.Screen
        name="ProfileMain"
        component={Profile}
        options={{
          headerRight: () => (
            <Btn
              icon={
                <Feather
                  name="settings"
                  size={28}
                  color={config.primaryColor}
                />
              }
              type="clear"
              onPress={() => navigation.navigate("Settings")}
            />
          ),
          title: "Profile",
          headerStyle: {
            backgroundColor: config.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.primaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: "Edit Profile",
          headerStyle: {
            backgroundColor: config.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.primaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerLeft: () => (
            <Btn
              onPress={() => {
                navigation.goBack()
              }}
              icon={
                <FontAwesome5
                  name="chevron-left"
                  size={30}
                  color={config.primaryColor}
                />
              }
              type="clear"
            />
          ),
          title: "Settings",
          headerStyle: {
            backgroundColor: config.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.primaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
      <Stack.Screen
        name="YourFriends"
        component={FriendsList}
        options={{
          headerLeft: () => (
            <Btn
              onPress={() => {
                navigation.goBack()
              }}
              icon={
                <FontAwesome5
                  name="chevron-left"
                  size={30}
                  color={config.primaryColor}
                />
              }
              type="clear"
            />
          ),
          title: "Your Friends",
          headerStyle: {
            backgroundColor: config.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: config.primaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default ProfilePage
