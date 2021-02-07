import React from "react"
import { Text, Image, Dimensions, View, StyleSheet } from "react-native"
import { Icon } from "react-native-elements"
import { IconButton, ProfileImage } from "../../../../Components"
import Entypo from "@expo/vector-icons/Entypo"
import { Button as Btn } from "react-native-elements"
import config from "../../../../config"
import { KeyboardAvoidingView } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

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
  return (
    <View>
      <KeyboardAvoidingView>
        <ScrollView>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
})

export default PostView
