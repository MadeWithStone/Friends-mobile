import React, { Component } from "react"
import { StyleSheet, View, Text } from "react-native"
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
    return (
      <View style={styles.container}>
        <NameView initials={initials} />
      </View>
    )
  }
}

const imageView = ({ props }) => {
  return <Text>Hello World</Text>
}

const NameView = (props) => {
  return (
    <View style={styles.circleView}>
      <Text style={styles.initialText}>{props.initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  circleView: {
    width: 100 + "%",
    height: 100 + "%",
    borderRadius: 15,
    backgroundColor: config.primaryColor,
  },
  initialText: {
    justifyContent: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    height: 100 + "%",
    color: config.secondaryColor,
  },
})
