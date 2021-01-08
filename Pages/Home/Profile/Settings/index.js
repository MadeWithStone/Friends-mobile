import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text, Dimensions } from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Feather from "react-native-vector-icons/Feather"
import config from "../../../../config"

const Settings = ({ navigation, route }) => {
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  let palletWidth = dims.width / 2 - 12
  return (
    <KeyboardAvoidingScrollView
      containerStyle={{ backgroundColor: config.secondaryColor }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}>
        <ColorPallet
          colors={{
            secondaryColor: "#fff",
            primaryColor: "#b16cd9",
            textColor: "#515151",
          }}
          selected={false}
          width={palletWidth}
          index={0}
        />
        <ColorPallet
          colors={{
            secondaryColor: "#000",
            primaryColor: "#b16cd9",
            textColor: "#fff",
          }}
          selected={true}
          width={palletWidth}
          index={1}
        />
      </View>
    </KeyboardAvoidingScrollView>
  )
}

const ColorPallet = (props) => {
  return (
    <View
      style={{
        backgroundColor: props.colors.secondaryColor,
        borderColor: props.colors.primaryColor,
        borderWidth: props.selected ? 2 : 0,
        width: props.width,
        margin: 8,
        marginRight: props.index % 2 === 0 ? 4 : 8,
        marginLeft: props.index % 2 === 1 ? 4 : 8,
        height: props.width,
        borderRadius: 10,
      }}>
      <View style={{ height: props.width / 2, justifyContent: "space-around" }}>
        <Text
          style={{
            color: props.colors.primaryColor,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}>
          Header
        </Text>
      </View>
      <View style={{ height: props.width / 2, justifyContent: "space-around" }}>
        <Text
          style={{
            color: props.colors.textColor,
            fontSize: 17,
            textAlign: "center",
          }}>
          Body text
        </Text>
      </View>
    </View>
  )
}

export default Settings
