import React from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import config from "../config"

const LogoHorizontal = (props) => {
  return (
    <View
      style={{
        ...styles.sectionHeaderContainer,
        borderBottomColor: config.primaryColor,
      }}>
      <Text style={{ ...styles.sectionHeaderText, color: config.primaryColor }}>
        {props.title}
      </Text>
      <Image
        source={require("../assets/Friends-splash.png")}
        style={styles.image}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    paddingBottom: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderText: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
  },
  image: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 10,
  },
})

export { LogoHorizontal }
