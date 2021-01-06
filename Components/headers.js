import React from "react"
import { View, Text, StyleSheet } from "react-native"
import config from "../config"

const SectionHeader = (props) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{props.title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    width: 100 + "%",
    paddingBottom: 2,
    borderBottomColor: config.primaryColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    color: config.primaryColor,
    textAlign: "center",
    fontSize: 19,
  },
})

export { SectionHeader }
