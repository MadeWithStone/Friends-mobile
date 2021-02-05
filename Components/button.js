import React, { Component } from "react"
import { Text, StyleSheet, Image } from "react-native"
import {
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native-gesture-handler"
import { Button as Btn } from "react-native-elements"
import config from "../config"
import { ActivityIndicator } from "react-native-paper"

const Button = (props) => {
  let btnContStyle = props.disabled
    ? styles.buttonContainerDisabled
    : styles.buttonContainer
  return (
    <TouchableWithoutFeedback
      onPress={
        props.onPressAction
          ? !props.disabled
            ? props.onPressAction
            : () => {}
          : () => {}
      }
      style={{
        ...btnContStyle,
        backgroundColor: !props.disabled ? config.primaryColor : "gray",
        ...props.style,
      }}>
      {!props.spinning && (
        <Text
          style={{
            ...styles.button,
            color: config.secondaryColor,
            ...props.textStyle,
          }}>
          {props.text}
        </Text>
      )}

      {props.spinning && (
        <ActivityIndicator
          style={{ ...styles.activityIndicator }}
          size="small"
          color={config.secondaryColor}
        />
      )}
    </TouchableWithoutFeedback>
  )
}

const TextButton = (props) => {
  return (
    <TouchableWithoutFeedback
      onPress={props.onPressAction ? props.onPressAction : () => {}}>
      <Text
        style={{
          ...styles.textButton,
          color: config.primaryColor,
          ...props.textStyle,
        }}>
        {props.text}
      </Text>
    </TouchableWithoutFeedback>
  )
}

const IconButton = (props) => {
  return (
    <Btn
      icon={props.icon}
      type="clear"
      style={props.style}
      onPress={props.onPressAction}
    />
  )
}

class CancelButton extends Component {
  render() {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: this.props.disabled ? "gray" : config.primaryColor,
          ...styles.container,
          ...this.props.style,
        }}
        onPress={!this.props.disabled ? this.props.callback : () => {}}>
        <Text
          style={{
            ...styles.text,
            color: config.secondaryColor,
            ...this.props.textStyle,
          }}>
          {this.props.title}
        </Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
  },
  buttonContainer: {
    borderRadius: 10,
  },
  buttonContainerDisabled: {
    borderRadius: 10,
    backgroundColor: "#707070",
  },
  textButton: {
    fontSize: 17,
  },
  container: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
    padding: 8,
    borderRadius: 10,
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
  },
  activityIndicator: {
    padding: 8,
  },
})

export default Button
export { TextButton, IconButton, CancelButton }
