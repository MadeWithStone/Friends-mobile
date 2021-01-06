import React, { Component } from "react"
import { StyleSheet, View, Text, Image } from "react-native"
import config from "../config"

export default class ProfileImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      image: this.props.image,
      name: this.props.name,
    }
  }

  render() {
    let name = this.props.name
    let words = name.split(" ")
    let initials = ""
    words.forEach((word) => {
      initials += word.charAt(0)
    })
    let useImage = this.state.image != null && this.state.image.length > 0
    return (
      <View
        style={{
          ...styles.container,
          width: this.props.size != null ? this.props.size : 40,
          height: this.props.size != null ? this.props.size : 40,
          borderRadius: this.props.size != null ? this.props.size / 2 : 20,
        }}>
        {useImage && (
          <ImageView
            image={this.state.image}
            radius={this.props.size != null ? this.props.size / 2 : 20}
          />
        )}
        {!useImage && (
          <NameView
            initials={initials}
            name={name}
            radius={this.props.size != null ? this.props.size / 2 : 20}
          />
        )}
      </View>
    )
  }
}

const ImageView = (props) => {
  return (
    <Image
      source={{ uri: props.image }}
      style={{ ...styles.circleView, borderRadius: props.radius }}
    />
  )
}

const NameView = (props) => {
  return (
    <View
      style={{
        ...styles.circleView,
        backgroundColor: stringToHslColor(props.name, 80, 80),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: props.radius,
      }}>
      <Text style={{ ...styles.initialText, fontSize: props.radius * 0.9 }}>
        {props.initials}
      </Text>
    </View>
  )
}

const stringToHslColor = (str, s, l) => {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  var h = hash % 360
  return hslToHex(h, s, l)
}

const hslToHex = (h, s, l) => {
  l /= 100
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

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  circleView: {
    width: 100 + "%",
    height: 100 + "%",
  },
  initialText: {
    color: config.secondaryColor,
    textAlign: "center",
    fontWeight: "bold",
  },
})
