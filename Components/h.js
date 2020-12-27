import React from "react"
import { Text, StyleSheet } from "react-native"
import config from "../config"

const H1 = (props) => {
  return <Text style={{ ...styles.h1, ...props.style }}>{props.text}</Text>
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 70,
    color: config.primaryColor,
  },
})

export { H1 }
