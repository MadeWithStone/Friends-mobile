import React from "react"
import { TextInput, StyleSheet } from "react-native"
import config from "../config"

/**
 * default text input
 *
 * @memberof Components
 * @prop {string} value text input value
 * @prop {string} placeholder text placeholder
 * @prop {function} onChangeText called when text changed
 * @prop {boolean} secure whether to use secure text entry
 * @prop {string} type keyboard input type
 * @prop {function} onFocus called when text input focused
 * @prop {function} onEndEditing called when editing ended
 * @prop {object} style style object
 */
const Input = (props) => (
  <TextInput
    onChangeText={(text) => props.onChangeText(text)}
    value={props.value}
    style={{
      ...styles.input,
      color: config.primaryColor,
      borderBottomColor: config.primaryColor,
      ...props.style,
    }}
    placeholder={props.placeholder}
    secureTextEntry={props.secure}
    keyboardType={props.type}
    onFocus={props.onFocus != null ? props.onFocus : () => {}}
    onEndEditing={props.onEndEditing != null ? props.onEndEditing : () => {}}
    placeholderTextColor={
      config.secondaryColor === "#000" ? "white" : "#C7C7CD "
    }
  />
)

/**
 * multiline text input
 *
 * @memberof Components
 * @prop {string} value text input value
 * @prop {string} placeholder text placeholder
 * @prop {function} onChangeText called when text changed
 * @prop {boolean} secure whether to use secure text entry
 * @prop {string} type keyboard input type
 * @prop {function} onEndEditing called when editing ended
 * @prop {function} submitAction called when submit key pressed
 * @prop {object} style style object
 */
const MultilineInput = (props) => (
  <TextInput
    onChangeText={(text) => props.onChangeText(text)}
    value={props.value}
    style={{
      ...styles.input,
      color: config.primaryColor,
      borderBottomColor: config.primaryColor,
      ...props.style,
    }}
    placeholder={props.placeholder}
    placeholderTextColor={
      config.secondaryColor === "#000" ? "#C7C7CD" : "#C7C7CD"
    }
    secureTextEntry={props.secure}
    keyboardType={props.type}
    multiline
    onSubmitEditing={props.submitAction ? props.submitAction : () => {}}
  />
)

export default Input
export { MultilineInput }

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 2,
    paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 2,
    fontSize: 17,
  },
})
