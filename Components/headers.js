import React from "react"
import { View, Text, StyleSheet } from "react-native"
import config from "../config"

const SectionHeader = (props) => {
  return (
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
}

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    width: 100 + "%",
    paddingBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    textAlign: "center",
    fontSize: 19,
  },
})

export { SectionHeader }
