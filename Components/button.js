import React, { Component } from "react"
import { Text, StyleSheet, Image } from "react-native"
import {
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native-gesture-handler"
import { Button as Btn } from "react-native-elements"
import { ActivityIndicator } from "react-native-paper"
import config from "../config"

/**
 * filled button
 *
 * @memberof Components
 * @component
 * @prop {string} text title text
 * @prop {function} onPressAction called when pressed
 * @prop {boolean} disabled determines whether the button can be pressed
 * @prop {boolean} spinning determines whether the loading spinner is spinning
 */
const Button = (props) => {
  const btnContStyle = props.disabled
    ? styles.buttonContainerDisabled
    : styles.buttonContainer
  return (
    <TouchableWithoutFeedback
      onPress={
        props.onPressAction && !props.disabled ? props.onPressAction : () => {}
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

/**
 * clickable text
 *
 * @memberof Components
 * @component
 * @prop {string} text title text
 * @prop {function} onPressAction called when pressed
 */
const TextButton = (props) => (
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

/**
 * clickable icon
 *
 * @memberof Components
 * @component
 * @prop {object} icon react native vector icon
 * @prop {function} onPressAction called when pressed
 * @prop {object} style custom style object
 */
const IconButton = (props) => (
  <Btn
    icon={props.icon}
    type="clear"
    style={props.style}
    onPress={props.onPressAction}
  />
)

/**
 * cancel button
 *
 * @memberof Components
 * @component
 * @method
 * @prop {string} title title text
 * @prop {function} callback called when pressed
 * @prop {boolean} disabled determines whether the button can be pressed
 * @prop {object} style custom style object
 * @prop {object} textStyle custom text style object
 */
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
