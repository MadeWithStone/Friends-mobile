import React from "react"
import { View, Text, StyleSheet } from "react-native"
import config from "../config"

/**
 * section header with bottom border
 *
 * @memberof Components
 * @prop {string} title text title
 */
const SectionHeader = (props) => (
  <View
    style={{
      ...styles.sectionHeaderContainer,
      borderBottomColor: config.primaryColor,
    }}>
    <Text style={{ ...styles.sectionHeaderText, color: config.primaryColor }}>
      {props.title}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    width: `${100}%`,
    paddingBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    textAlign: "center",
    fontSize: 19,
  },
})

export { SectionHeader }
