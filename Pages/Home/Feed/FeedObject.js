// Modules
import React from "react"

// Components
import {
  Text,
  Dimensions,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Feather } from "@expo/vector-icons"
import { IconButton, ProfileImage, CachedImage } from "../../../Components"
import config from "../../../config"
import User from "../../../Data/User"

/**
 * Feed list component
 *
 * @prop {object} post post object
 * @prop {object} user post user
 * @prop {funciton} menuAction called when 3 dots pressed
 * @prop {function} onImagePress called when image pressed
 */
class FeedObject extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.dims = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    }
  }

  render() {
    const date = new Date(this.props.post.date)
    const user = this.props.user ? this.props.user : {}
    const { currentUser } = this.props
    return (
      <View
        style={{ ...styles.mainView, backroundColor: config.secondaryColor }}>
        <View style={styles.topView}>
          <ProfileImage
            image={user.profileImage}
            name={`${user.firstName} ${user.lastName}`}
            size={40}
            id={user.id}
            noCache={false}
            style={{
              borderColor: config.primaryColor,
              borderWidth: currentUser.id === user.id ? 1 : 0,
              borderStyle: "solid",
              padding: currentUser.id === user.id ? 1 : 0,
              margin: "auto",
            }}
          />
          {this.props.post.reports &&
            currentUser.roles &&
            currentUser.roles.includes("moderator") && (
              <Text
                style={{
                  ...styles.profileName,
                  color: config.primaryColor,
                  marginRight: 8,
                }}>
                {this.props.post.reports.length}
              </Text>
            )}
          <Text style={{ ...styles.profileName, color: config.textColor }}>
            {user.firstName} {user.lastName}
          </Text>

          <View style={styles.optionsBtn}>
            <IconButton
              icon={
                <Entypo
                  name="dots-three-vertical"
                  size={20}
                  color={config.primaryColor}
                />
              }
              onPressAction={() => this.props.menuAction(this.props.post.id)}
            />
          </View>
        </View>
        <TouchableWithoutFeedback onPress={this.props.onImagePress}>
          <CachedImage
            source={{
              uri: this.props.post.image,
            }}
            cacheKey={this.props.post.id}
            style={{ width: this.dims.width, height: this.dims.width }}
          />
        </TouchableWithoutFeedback>
        <View style={styles.descriptionView}>
          <Text style={{ ...styles.description, color: config.textColor }}>
            <Text style={styles.descriptionStart}>
              {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
            </Text>{" "}
            - {this.props.post.description}
          </Text>
          <TouchableWithoutFeedback onPress={this.props.onImagePress}>
            <Feather
              name="message-circle"
              size={24}
              style={{
                marginLeft: 8,
              }}
              color={
                this.props.post.comments && this.props.post.comments.length > 0
                  ? config.primaryColor
                  : config.textColor
              }
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    borderBottomColor: "#707070",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topView: {
    margin: 8,
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
    // color: config.primaryColor,
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    display: "flex",
    fontSize: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionStart: {
    fontWeight: "bold",
  },
})

export default FeedObject
