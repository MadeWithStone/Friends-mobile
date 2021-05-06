import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { FlatList, Text, View, StyleSheet } from "react-native"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import { configHook } from "../../../config"
import useUserData from "../../../Firebase/useUserData"
import { H3, IconButton, Input, MultilineInput } from "../../../Components"
import {
  createAnnouncement,
  announcementsRef,
} from "../../../Firebase/AdminFunctions"

const Admin = ({ navigation, route }) => {
  const cHook = configHook()
  const userData = useUserData()
  const [announcements, setAnnouncements] = React.useState([])

  let listener

  React.useEffect(() => {
    announcementsRef.onSnapshot((snapshot) => {
      console.log(snapshot)
    })
    return () => {
      // listener()
    }
  }, [])
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Admin",
      headerRight: () => (
        <Btn
          onPress={() => {
            navigation.navigate("EditProfile", {
              user: { data: userData, auth: User.auth },
            })
          }}
          icon={<Feather name="plus" size={30} color={cHook.primaryColor} />}
          type="clear"
        />
      ),
      headerStyle: {
        backgroundColor: cHook.secondaryColor,
      },
    })
  }, [navigation])
  return (
    <FlatList
      ListEmptyComponent={() => <Text>Admin Page</Text>}
      ListHeaderComponent={CreateAnnouncementInput}
      data={announcements}
      renderItem={(announcement) => <Text>{announcement.title}</Text>}
    />
  )
}

const CreateAnnouncementInput = (props) => {
  const cHook = configHook()
  const [title, setTitle] = React.useState("")
  const [announcement, setAnouncement] = React.useState("")
  const postAnnouncement = () => {
    const date = new Date()
    announcementData = {
      title,
      announcement,
      date: date.toISOString(),
      topic: "general",
      visible: true,
    }
    createAnnouncement(announcementData)
      .then(() => {
        setTitle("")
        setAnouncement("")
      })
      .catch((err) => {
        alert(err)
      })
  }
  return (
    <View style={styles.createAnnouncementView}>
      <View style={styles.titleInputView}>
        <H3 text="Create Announcement" />

        <Btn
          onPress={() => {
            postAnnouncement()
          }}
          icon={<Feather name="plus" size={30} color={cHook.primaryColor} />}
          type="clear"
          style={styles.icon}
        />
      </View>
      <Input
        placeholder="Announcement Title"
        style={{ flexGrow: 1, paddingBottom: 2 }}
        onChangeText={(text) => setTitle(text)}
        value={title}
      />
      <MultilineInput
        placeholder="Announcement"
        onChangeText={(text) => setAnouncement(text)}
        value={announcement}
        style={{
          marginTop: 8,
          borderBottomWidth: 0,
          minHeight: 100,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  createAnnouncementView: {
    width: "100%",
    padding: 8,
  },
  titleInputView: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
})

const Stack = createStackNavigator()

const AdminPage = ({ navigation, route }) => {
  const cHook = configHook()
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={Admin}
        name="AdminPage"
        options={{
          title: "Admin",
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

export default AdminPage
