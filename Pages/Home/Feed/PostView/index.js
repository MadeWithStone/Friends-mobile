import React from "react"
import { Text, Image, Dimensions, View, StyleSheet } from "react-native"
import { Icon } from "react-native-elements"
import { IconButton, ProfileImage, Input } from "../../../../Components"
import Entypo from "@expo/vector-icons/Entypo"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Button as Btn } from "react-native-elements"
import config from "../../../../config"
import {
  KeyboardAvoidingView,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Button,
  Keyboard,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import { ScrollView } from "react-native-gesture-handler"
import { KeyboardAccessoryView } from "@flyerhq/react-native-keyboard-accessory-view"
import { GestureResponderHandlers } from "react-native"
import { SafeAreaView } from "react-native"

const PostView = ({ route, navigation }) => {
  let params = route.params
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.topView}>
          <ProfileImage
            image={params.user.profileImage}
            name={params.user.firstName + " " + params.user.lastName}
            size={40}
          />
          <Text style={{ ...styles.profileName }}>
            {params.user.firstName} {params.user.lastName}
          </Text>
        </View>
      ),
      headerRight: () => (
        <IconButton
          icon={
            <Entypo
              name="dots-three-vertical"
              size={20}
              color={config.primaryColor}
            />
          }
        />
      ),
    })
  }, [navigation])

  let date = new Date(params.post.date)
  const renderScrollable = (panHandlers) => (
    // Can be anything scrollable
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View>
        <Image
          source={{
            uri: params.post.image,
          }}
          style={{ width: dims.width, height: dims.width }}
        />
        <View style={styles.descriptionView}>
          <Text style={{ ...styles.description, color: config.textColor }}>
            <Text style={styles.descriptionStart}>
              {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
            </Text>{" "}
            - {params.post.description}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAccessoryView
        renderScrollable={renderScrollable}
        spaceBetweenKeyboardAndAccessoryView={-75}
        contentOffsetKeyboardOpened={-40}
        contentOffsetKeyboardClosed={30}
        contentContainerStyle={{ margin: 0 }}
        style={{ backgroundColor: config.secondaryColor }}>
        <View style={styles.inputView}>
          <Input style={styles.input} onChangeText={() => {}} />
          <MaterialIcons
            name="arrow-upward"
            size={30}
            color={config.primaryColor}
            placeHolder={"Comment"}
          />
        </View>
      </KeyboardAccessoryView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainView: {
    borderBottomColor: "#707070",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topView: {
    marginBottom: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  profileImg: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 4,
  },
  profileName: {
    color: config.primaryColor,
    fontSize: 30,
    fontWeight: "bold",
  },
  optionsBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 0,
    marginLeft: "auto",
  },
  descriptionView: {
    margin: 8,
  },
  description: {
    fontSize: 15,
  },
  descriptionStart: {
    fontWeight: "bold",
  },
  inputView: {
    display: "flex",
    flexDirection: "row",
    padding: 8,
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: 0,
  },
  input: {
    flexGrow: 1,
    marginRight: 8,
  },
  container: {
    justifyContent: "flex-end",
    flexGrow: 1,
    margin: 16,
    backgroundColor: "red",
  },
  inner: {
    paddingBottom: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  scrollView: {
    flexShrink: 1,
    flexGrow: 1,
    height: "100%",
  },
})

export default PostView
