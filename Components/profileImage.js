import React, { PureComponent } from "react"
import { StyleSheet, View, Text, Image } from "react-native"
import config from "../config"
import CachedImage from "./CachedImage"

/**
 * profile image view
 *
 * @method
 * @memberof Components
 * @prop {string} name user name
 * @prop {string} image image uri
 * @prop {number} size size of profile image
 * @prop {string} id identifier
 * @prop {boolean} noCache determines whether to use caching or not
 */
class ProfileImage extends PureComponent {
  render() {
    const { name } = this.props
    const words = name.split(" ")
    let initials = ""
    words.forEach((word) => {
      initials += word.charAt(0)
    })
    const useImage = this.props.image != null && this.props.image.length > 0
    return (
      <View
        style={{
          ...styles.container,
          width: this.props.size != null ? this.props.size : 40,
          height: this.props.size != null ? this.props.size : 40,
          borderRadius: this.props.size != null ? this.props.size / 2 : 20,
        }}
        key={this.props.image + this.props.name}>
        {useImage && !this.props.noCache && (
          <CachedImageView
            image={this.props.image}
            id={this.props.id}
            radius={this.props.size != null ? this.props.size / 2 : 20}
            key={this.props.image + this.props.name}
          />
        )}
        {useImage && this.props.noCache && (
          <ImageView
            image={this.props.image}
            id={this.props.id}
            radius={this.props.size != null ? this.props.size / 2 : 20}
            key={this.props.image + this.props.name}
          />
        )}
        {!useImage && (
          <NameView
            initials={initials}
            name={name}
            radius={this.props.size != null ? this.props.size / 2 : 20}
            key={this.props.image + this.props.name}
          />
        )}
      </View>
    )
  }
}

const CachedImageView = (props) => (
  <CachedImage
    source={{ uri: props.image ? props.image : "" }}
    cacheKey={props.id ? props.id + props.image : ""}
    style={{ ...styles.circleView, borderRadius: props.radius }}
  />
)

const ImageView = (props) => (
  <Image
    source={{ uri: props.image ? props.image : "" }}
    style={{ ...styles.circleView, borderRadius: props.radius }}
  />
)

const NameView = (props) => (
  <View
    style={{
      ...styles.circleView,
      backgroundColor: stringToHslColor(props.name, 80, 80),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: props.radius,
    }}
    key={props.image + props.name}>
    <Text style={{ ...styles.initialText, fontSize: props.radius * 0.9 }}>
      {props.initials}
    </Text>
  </View>
)

/* eslint no-bitwise: 0 */
const stringToHslColor = (str, s, l) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = hash % 360
  return hslToHex(h, s, l)
}

const hslToHex = (h, s, lParam) => {
  l = lParam / 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0") // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export default ProfileImage

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  circleView: {
    width: `${100}%`,
    height: `${100}%`,
  },
  initialText: {
    color: config.secondaryColor,
    textAlign: "center",
    fontWeight: "bold",
  },
})
