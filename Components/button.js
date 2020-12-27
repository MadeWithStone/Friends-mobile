import React from "react"
import { Text, StyleSheet, Image } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { Button as Btn } from "react-native-elements"
import config from "../config"

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
      style={{ ...btnContStyle, ...props.style }}>
      <Text
        style={{
          ...styles.button,
          ...props.textStyle,
        }}>
        {props.text}
      </Text>
    </TouchableWithoutFeedback>
  )
}

const TextButton = (props) => {
  return (
    <TouchableWithoutFeedback
      onPress={props.onPressAction ? props.onPressAction : () => {}}>
      <Text style={{ ...styles.textButton, ...props.textStyle }}>
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

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
    color: config.secondaryColor,
  },
  buttonContainer: {
    borderRadius: 10,
    backgroundColor: config.primaryColor,
  },
  buttonContainerDisabled: {
    borderRadius: 10,
    backgroundColor: "#707070",
  },
  textButton: {
    color: config.primaryColor,
    fontSize: 17,
  },
})

export default Button
export { TextButton, IconButton }
