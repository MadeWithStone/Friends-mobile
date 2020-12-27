import React from "react"
import { TextInput, StyleSheet } from "react-native"
import config from "../config"

const Input = (props) => {
  return (
    <TextInput
      onChangeText={(text) => props.onChangeText(text)}
      value={props.value}
      style={{ ...styles.input, ...props.style }}
      placeholder={props.placeholder}
      secureTextEntry={props.secure}
      keyboardType={props.type}
    />
  )
}

export default Input

const styles = StyleSheet.create({
  input: {
    borderBottomColor: config.primaryColor,
    borderBottomWidth: 2,
    color: config.primaryColor,
    paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 2,
    fontSize: 17,
  },
})
