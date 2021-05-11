import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { FlatList, Text, View, StyleSheet, StatusBar } from "react-native"
import { Button as Btn } from "react-native-elements"
import Feather from "@expo/vector-icons/Feather"
import { useIsFocused } from "@react-navigation/native"
import config, { configHook } from "../../../config"
import useUserData from "../../../Firebase/useUserData"
import { H3, IconButton, Input, MultilineInput } from "../../../Components"
import {
  createAnnouncement,
  announcementsRef,
  editAnnouncement,
} from "../../../Firebase/AdminFunctions"

const Admin = ({ navigation, route }) => {
  const cHook = configHook()
  const userData = useUserData()
  const focused = useIsFocused()
  const [announcements, setAnnouncements] = React.useState([])

  let listener

  React.useEffect(() => {
    listener = announcementsRef.onSnapshot((snapshot) => {
      const data = []
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id })
      })
      console.log(JSON.stringify(data))
      setAnnouncements(data)
    })
    return () => {
      listener()
    }
  }, [])
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Admin",
      headerRight: () => (
        <Btn
          icon={<Feather name="user" size={30} color={config.primaryColor} />}
          type="clear"
          onPress={() => navigation.navigate("EditUser")}
        />
      ),
      headerStyle: {
        backgroundColor: config.secondaryColor,
      },
    })
  }, [navigation, focused])
  return (
    <FlatList
      ListEmptyComponent={() => <Text>Admin Page</Text>}
      ListHeaderComponent={CreateAnnouncementInput}
      keyExtractor={(item) => item.id}
      data={announcements.sort((a, b) => {
        const d1 = new Date(a.date)
        const d2 = new Date(b.date)
        return d1 < d2
      })}
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
      renderItem={({ item }) => <Announcement item={item} />}
    />
  )
}

const Announcement = ({ item }) => {
  const [editing, setEditing] = React.useState(false)
  const [title, setTitle] = React.useState(item.title)
  const [announcement, setAnnouncement] = React.useState(item.announcement)
  const changeVisibility = () => {
    editAnnouncement({ visible: !item.visible }, item.id)
  }
  const saveChanges = () => {
    editAnnouncement({ title, announcement }, item.id)
  }
  return (
    <View
      style={{ ...aStyles.container, backgroundColor: config.secondaryColor }}>
      {!editing ? (
        <Text style={{ ...aStyles.title, color: config.primaryColor }}>
          {item.title}
        </Text>
      ) : (
        <Input
          placeholder="Announcement Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
      )}
      {!editing ? (
        <Text style={{ ...aStyles.announcement, color: config.primaryColor }}>
          {item.announcement}
        </Text>
      ) : (
        <MultilineInput
          placeholder="Announcement"
          value={announcement}
          onChangeText={(text) => setAnnouncement(text)}
          style={{
            marginTop: 8,
            borderBottomWidth: 0,
            minHeight: 100,
          }}
        />
      )}

      <View style={aStyles.buttonContainer}>
        {!editing && (
          <Btn
            onPress={() => {
              changeVisibility()
            }}
            icon={
              <Feather
                name={item.visible ? "eye" : "eye-off"}
                size={30}
                color={config.primaryColor}
              />
            }
            type="clear"
            style={styles.icon}
          />
        )}
        <Btn
          onPress={() => {
            if (editing) {
              saveChanges()
            }
            setEditing((prev) => !prev)
          }}
          icon={
            <Feather
              name={editing ? "check" : "edit"}
              size={30}
              color={config.primaryColor}
            />
          }
          type="clear"
          style={styles.icon}
        />
      </View>
    </View>
  )
}

const aStyles = StyleSheet.create({
  container: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  announcement: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
})

const CreateAnnouncementInput = (props) => {
  const cHook = configHook()
  const [title, setTitle] = React.useState("")
  const [announcement, setAnouncement] = React.useState("")
  const postAnnouncement = () => {
    const date = new Date()
    const announcementData = {
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
    <View>
      <View
        style={{
          ...styles.createAnnouncementView,
          backgroundColor: config.secondaryColor,
        }}>
        <View style={styles.titleInputView}>
          <H3 text="Create Announcement" />

          <Btn
            onPress={() => {
              postAnnouncement()
            }}
            icon={<Feather name="plus" size={30} color={config.primaryColor} />}
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
      <View
        style={{
          width: "100%",
          backgroundColor: "gray",
          height: StyleSheet.hairlineWidth,
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
