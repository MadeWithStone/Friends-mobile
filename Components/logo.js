import React from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import config from "../config"
import Feather from "@expo/vector-icons/Feather"
import Svg, { Path, Circle } from "react-native-svg"

/**
 * horizontal logo
 *
 * @memberof Components
 * @prop {string} title title text
 * @prop {number} size size value
 * @prop {boolean} split whether to split or center the text and logo
 */
const LogoHorizontal = (props) => {
  return (
    <View
      style={{
        ...styles.sectionHeaderContainer,
        borderBottomColor: config.primaryColor,
        justifyContent: props.split ? "space-between" : "center",
      }}>
      <Text
        style={{
          ...styles.sectionHeaderText,
          color: config.primaryColor,
          fontSize: props.size ? props.size : 30,
        }}>
        {props.title}
      </Text>
      <View style={styles.image}>
        <Logo
          size={props.size ? props.size : 30}
          color={config.secondaryColor}
        />
      </View>
    </View>
  )
}

/**
 * logo icon
 *
 * @memberof Components
 * @prop {number} size size value
 * @prop {string} color color value
 * @prop {object} props props
 */
const Logo = (props) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="prefix__feather prefix__feather-users"
      {...props}>
      <Path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-3 4v2" />
      <Circle cx={9} cy={7} r={4} />
      <Path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Svg>
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
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: config.primaryColor,
    padding: 6,
  },
})

export { LogoHorizontal, Logo }
