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
      {posts != null && posts.length > 0 && (
        <PostsView
          posts={posts}
          openModal={(id) => {
            setShowModel(true)
            setCurrentPost(id)
          }}
        />
      )}
      <PostOptionsModal
        showChooser={showModel}
        setShowChooser={setShowModel}
        action={deletePost}
      />
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
  ) //return a friend request object with callback for accept and decline
}

const PostOptionsModal = (props) => {
  const reportOptions = ["Delete Post"]
  return (
    <Modal visible={props.showChooser} animationType="fade" transparent={true}>
      <View style={{ justifyContent: "flex-end", height: 100 + "%" }}>
        <View style={{ marginBottom: 100 }}>
          <View
            style={{
              margin: 8,
              borderRadius: 15,
            }}>
            {reportOptions.map((option, index) => {
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={1}
                  onPress={() => {
                    props.action()
                  }}
                  style={{
                    ...styles.buttonContainer,
                    borderRadius: 0,
                    borderbottomColor: config.secondaryColor,

                    backgroundColor: config.primaryColor,
                    borderBottomWidth:
                      index != reportOptions.length - 1
                        ? StyleSheet.hairlineWidth
                        : 0,
                    borderBottomLeftRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderBottomRightRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderTopLeftRadius: index == 0 ? 10 : 0,
                    borderTopRightRadius: index == 0 ? 10 : 0,
                  }}>
                  <Text
                    style={{ ...styles.button, color: config.secondaryColor }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setShowChooser(false)}
            style={{
              ...styles.buttonContainer,
              backgroundColor: config.primaryColor,
              margin: 8,
            }}>
            <Text style={{ ...styles.button, color: config.secondaryColor }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
              key={post.id}>
              <PostViewObj post={post} index={index} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const PostViewObj = (props) => {
  return (
    <CachedImage
      key={props.post.id}
      source={{ uri: props.post.image }}
      cacheKey={props.post.id}
      style={{
        width: Dimensions.get("window").width / 3 - 0.7,
        height: Dimensions.get("window").width / 3,
        marginRight: props.index % 3 == 0 ? 1 : 0,
        marginLeft: (props.index + 1) % 3 == 0 ? 1 : 0,
        marginBottom: 1,
        opacity: props.index > 1 ? 0.4 : 1,
        borderColor: config.primaryColor,
        borderWidth: props.index <= 1 ? 1 : 0,
      }}
    />
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
