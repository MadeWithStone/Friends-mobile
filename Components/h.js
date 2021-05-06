import React from "react"
import { Text, StyleSheet } from "react-native"
import config from "../config"

/**
 * level 1 header
 *
 * @memberof Components
 * @prop {string} text title text
 * @prop {object} style style object
 */
const H1 = (props) => (
  <Text style={{ ...styles.h1, color: config.primaryColor, ...props.style }}>
    {props.text}
  </Text>
)

/**
 * level 3 header
 *
 * @memberof Components
 * @prop {string} text title text
 * @prop {object} style style object
 */
const H3 = (props) => (
  <Text style={{ ...styles.h3, color: config.primaryColor, ...props.style }}>
    {props.text}
  </Text>
)

const styles = StyleSheet.create({
  h1: {
    fontSize: 70,
  },
  h3: {
    fontSize: 25,
  },
})

export { H1, H3 }
