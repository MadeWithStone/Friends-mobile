import React, { Component } from "react"
import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import config from "../../../config"
import User from "../../../Data/User"
import {
  Button,
  ProfileImage,
  SectionHeader,
  TextButton,
} from "../../../Components"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import {
  acceptFriendRequest,
  declineFriendRequest,
  getUsers,
} from "../../../Firebase/UserFunctions"
import { getPosts } from "../../../Firebase/PostFunctions"

const Profile = ({ navigation, route }) => {
  let [user, setUser] = React.useState({})
  let [friendRequests, setFriendRequests] = React.useState([])
  let [usersList, setUsersList] = React.useState([])
  let [posts, setPosts] = React.useState([])

  React.useEffect(() => {
    let u = new User()
    console.log("running use effect")
    u.loadCurrentUser()
      .then((data) => {
        setUser(data)
        navigation.setOptions({
          title:
            data.data != null
              ? data.data.firstName + " " + data.data.lastName
              : "Profile",
        })
        getFriendRequests()
        getUserPosts()
      })
      .catch((err) => {
        console.log("err: " + err)
      })
  }, [])

  getFriendRequests = () => {
    let freReqs =
      user.data.friendRequests != null ? user.data.friendRequests : []
    let uList = []
    freReqs.forEach((req) => uList.push(req.userID))
    getUsers(uList).then((res) => {
      console.log("getting users")
      data = []
      res.forEach((r) => {
        data.push(r.data())
      })
      setUsersList(data)
      setFriendRequests(freReqs)
    })
  }

  getUserPosts = () => {
    let postList = user.data.posts != null ? user.data.posts : []
    console.warn("getting posts")
    getPosts(postList).then((result) => {
      let p = []
      result.forEach((post) => {
        p.push(post.data())
      })
      setPosts(p)
    })
  }

  friendRequestCallback = (accept, req) => {
    if (accept) {
      acceptFriendRequest(req.userID, friendRequests, user.data.friends)
        .then(() => {
          // complete
        })
        .catch((err) => {
          console.warn(err)
        })
    } else {
      declineFriendRequest(req.userID, friendRequests)
        .then(() => {
          // complete
        })
        .catch((err) => {
          console.warn(err)
        })
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title:
        user.data != null
          ? user.data.firstName + " " + user.data.lastName
          : "Profile",
      headerLeft: () => (
        <Btn
          onPress={() => {}}
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
      style={{ backgroundColor: config.secondaryColor }}>
      {user.data != null && <ProfileDataView user={user} />}
      {friendRequests != null && friendRequests.length > 0 && (
        <FriendRequestView
          friendRequests={friendRequests}
          users={usersList}
          callback={friendRequestCallback}
        />
      )}
      {posts != null && posts.length > 0 && <PostsView posts={posts} />}
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
      />
      <Text style={dvStyles.text}>
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
  console.log("posts: " + JSON.stringify(props.posts))
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
        {props.posts.map((post, index) => (
          <PostViewObj post={post} key={post.id} index={index} />
        ))}
      </View>
    </View>
  )
}

const PostViewObj = (props) => {
  return (
    <Image
      key={props.post.id}
      source={{ uri: props.post.image }}
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
              onPress={() => navigation.navigate("AddFriend")}
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
    </Stack.Navigator>
  )
}

export default ProfilePage
