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
  DeviceEventEmitter,
} from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { useIsFocused } from "@react-navigation/native"
import { usePreventScreenCapture } from "expo-screen-capture"
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
import FriendsList from "./FriendsList"

let pList = []
const Profile = ({ navigation, route }) => {
  const [friendRequests, setFriendRequests] = React.useState([])
  const [usersList, setUsersList] = React.useState([])
  const [posts, setPosts] = React.useState([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [showModel, setShowModel] = React.useState(false)
  const [currentPost, setCurrentPost] = React.useState("")

  const focused = useIsFocused()
  let listener

  usePreventScreenCapture()

  React.useEffect(() => {
    // console.log("running use effect")
  }, [focused])

  React.useEffect(() => {
    if (focused) {
      updateData()
      listener = userReference(User.data.id).onSnapshot((doc) => {
        // console.log("snap data: " + JSON.stringify(doc.data()))
        User.data = doc.data()
        getFriendRequests()
        getUserPosts()
      })
    } else if (listener) {
      listener()
    }
  }, [focused])

  getFriendRequests = () => {
    const freReqs =
      User.data.friendRequests != null ? User.data.friendRequests : []
    const uList = []
    freReqs.forEach((req) => uList.push(req.userID))
    getUsers(uList).then((res) => {
      // console.log("getting users")
      data = []
      res.forEach((r) => {
        data.push(r.data())
      })
      setUsersList(data)
      setFriendRequests(freReqs)
      console.log("Profile.getFriendRequests: badge count emitted")
      /* DeviceEventEmitter.emit("friendBadgeCount", {
        val: freReqs.length,
      }) */
      setRefreshing(false)
    })
  }

  getUserPosts = () => {
    const postList = User.data.posts != null ? User.data.posts : []
    pList = postList
    console.log(`Profile.getUserPosts: postList: ${postList}`)
    getPosts(postList).then((result) => {
      const p = []
      result.forEach((post) => {
        p.push(post.data())
      })
      console.log(`Profile.getUserPosts: p: ${JSON.stringify(p)}`)
      setPosts(p)

      setRefreshing(false)
    })
  }

  friendRequestCallback = (accept, req) => {
    if (accept) {
      acceptFriendRequest(req.userID, friendRequests, User.data.friends)
        .then(() => {
          // complete
          alert(
            `Added ${
              users.find((x) => x.id === req.userID).firstName
            } as a friend`
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
      User.getUpdatedData().then(() => {
        // console.log("### done getData")
        navigation.setOptions({
          title:
            User.data != null
              ? `${User.data.firstName} ${User.data.lastName}`
              : "Profile",
          headerLeft: () => (
            <Btn
              onPress={() => {
                navigation.navigate("EditProfile", { user: User.data })
              }}
              icon={
                <Feather name="edit" size={30} color={config.primaryColor} />
              }
              type="clear"
            />
          ),
        })
        getFriendRequests()
        getUserPosts()
      })
    }
  }

  const _onRefresh = () => {
    setRefreshing(true)
    updateData()
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title:
        User.data != null
          ? `${User.data.firstName} ${User.data.lastName}`
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
        posts={posts || []}
        openModal={(post) => {
          navigation.navigate("PostView", {
            post,
            user: User.data,
            currentUser: User.data,
          })
        }}
        navigation={navigation}
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

const ProfileDataView = (props) => (
  <View style={dvStyles.container}>
    <ProfileImage
      image={props.user.data.profileImage}
      size={100}
      name={`${props.user.data.firstName} ${props.user.data.lastName}`}
      id={props.user.data.id}
    />
    <Text style={{ ...dvStyles.text, color: config.textColor }}>
      {`${props.user.data.firstName} ${props.user.data.lastName}`}
    </Text>
  </View>
)

const FriendRequestView = (props) => (
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

const FriendRequestObj = (props) => (
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
) // return a friend request object with callback for accept and decline

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

const PostsView = (props) => (
  // console.log("posts: " + JSON.stringify(props.posts))
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
        {props.posts
          .filter((item, index) => item)
          .map((post, index) => (
            <TouchableOpacity
              onPress={() => props.openModal(post)}
              key={post.id}
              activeOpacity={0.6}>
              <PostViewObj post={post} index={index} />
            </TouchableOpacity>
          ))}
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
          {"You have hit your post maximum of 6\nSelect posts to delete them"}
        </Text>
      </View>
    )}
  </View>
)

const PostViewObj = (props) => {
  // initialize cuttof date object
  const cuttOff = new Date()

  // set cuttoff date to one day before the current date
  cuttOff.setDate(cuttOff.getDate() - 2)

  const currentDate = new Date(props.post.date)

  return (
    <View
      style={{
        backgroundColor: config.primaryColor,
        marginRight: props.index % 3 === 0 ? 1 : 0,
        marginLeft: (props.index + 1) % 3 === 0 ? 1 : 0,
        marginBottom: 1,
        opacity: currentDate <= cuttOff || props.index > 1 ? 0.8 : 1,
      }}>
      <CachedImage
        key={props.post.id}
        source={{ uri: props.post.image }}
        cacheKey={props.post.id}
        style={{
          width:
            Dimensions.get("window").width / 3 -
            (props.index % 3 === 0 || (props.index + 1) % 3 === 0 ? 1.07 : 0.7),
          height: Dimensions.get("window").width / 3,

          opacity: currentDate <= cuttOff || props.index > 1 ? 0.5 : 1,
          borderColor: config.primaryColor,
          // borderWidth: currentDate > cuttOff && props.index <= 1 ? 3 : 0,
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
const ProfilePage = ({ navigation }) => (
  <Stack.Navigator
    options={{ headerStyle: { borderbottomColor: config.primaryColor } }}>
    <Stack.Screen
      name="ProfileMain"
      component={Profile}
      options={{
        headerRight: () => (
          <Btn
            icon={
              <Feather name="settings" size={28} color={config.primaryColor} />
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

export default ProfilePage
