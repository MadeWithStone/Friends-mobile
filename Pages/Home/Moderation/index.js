import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { FlatList, Text, View, StyleSheet, StatusBar } from "react-native"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import { useIsFocused } from "@react-navigation/native"
import config, { configHook } from "../../../config"
import useUserData from "../../../Firebase/useUserData"
import { H3, IconButton, Input, MultilineInput } from "../../../Components"
import { postsReference } from "../../../Firebase/PostFunctions"
import { getUsers } from "../../../Firebase/UserFunctions"
import FeedObject from "../Feed/FeedObject"

const Moderation = ({ navigation, route }) => {
  const cHook = configHook()
  const userData = useUserData()
  const focused = useIsFocused()
  const [posts, setPosts] = React.useState([])
  const [injectedPosts, setInjectedPosts] = React.useState([])

  let listener

  React.useEffect(() => {
    listener = postsReference.orderBy("reports").onSnapshot((snapshot) => {
      const data = []
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id })
      })
      console.log(`there are ${data.length} reported posts`)
      setPosts(data)
    })
    return () => {
      listener()
    }
  }, [])

  React.useEffect(() => {
    if (posts && posts.length > 0) {
      const userList = posts.map((post) => post.userID)
      getUsers(userList).then((users) => {
        const data = posts.map((post, idx) => ({
          ...post,
          user: users[idx].data(),
        }))
        setInjectedPosts(data)
      })
    }
  }, [posts])
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Moderation",
      headerRight: () => {},
      headerStyle: {
        backgroundColor: config.secondaryColor,
        shadowOffset: { height: 0, width: 0 },
      },
      headerTintColor: config.primaryColor,
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 30,
      },
    })
  }, [navigation, focused])
  return (
    <FlatList
      ListEmptyComponent={() => <Text>Admin Page</Text>}
      keyExtractor={(item) => item.id}
      data={injectedPosts.sort((a, b) => a.reports.length >= b.reports.length)}
      ListFooterComponent={
        <StatusBar
          style={config.secondaryColor === "#000" ? "light" : "dark"}
        />
      }
      style={{ backgroundColor: config.secondaryColor }}
      ItemSeparatorComponent={() => (
        <View
          style={{
            width: "100%",
            backgroundColor: "gray",
            height: StyleSheet.hairlineWidth,
          }}
        />
      )}
      renderItem={({ item }) => (
        <FeedObject
          post={item}
          user={item.user}
          key={item.id}
          menuAction={() => {}}
          onImagePress={() => {
            navigation.navigate("PostView", {
              post: item,
              user: item.user,
              currentUser: { ...userData },
            })
          }}
        />
      )}
    />
  )
}

const Stack = createStackNavigator()

const ModerationPage = ({ navigation, route }) => {
  const cHook = configHook()
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={Moderation}
        name="ModerationPage"
        options={{
          title: "Moderation",
          headerStyle: {
            backgroundColor: cHook.secondaryColor,
            shadowOffset: { height: 0, width: 0 },
          },
          headerTintColor: cHook.primaryColor,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default ModerationPage
