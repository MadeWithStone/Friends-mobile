import React from "react"
import { TextInput, StyleSheet } from "react-native"
import config from "../config"

const Input = (props) => {
  return (
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
      placeholderTextColor={props.placeholderColor}
    />
  )
}

const MultilineInput = (props) => {
  return (
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
      multiline
      placeholderTextColor={props.placeholderColor}
      onSubmitEditing={props.submitAction ? props.submitAction : () => {}}
    />
  )
}

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
