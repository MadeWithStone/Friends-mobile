import React, { useEffect, useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Feather from "react-native-vector-icons/Feather"
import config from "../../../../config"
import { set } from "react-native-reanimated"
import { Button } from "../../../../Components"
import User from "../../../../Data/User"

const Settings = ({ navigation, route }) => {
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  let palletWidth = dims.width / 2 - 12
  let colorList = [
    {
      secondaryColor: "#fff",
      primaryColor: "#b16cd9",
      textColor: "#515151",
    },
    {
      secondaryColor: "#000",
      primaryColor: "#b16cd9",
      textColor: "#fff",
    },
  ]
  let [sel, setSel] = useState(0)
  React.useEffect(() => {
    colorList.forEach((l, i) => {
      if (l.secondaryColor === config.secondaryColor) {
        setSel(i)
      }
    })
  }, [])

  const setColorPallet = (colors, idx) => {
    setSel(idx)
    config.configData = colors
    config.save()
  }
  const signOutUser = () => {
    console.log("signing out")
    User.signOut().then(() => navigation.popToTop())
  }

  return (
    <KeyboardAvoidingScrollView
      containerStyle={{ backgroundColor: config.secondaryColor }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}>
        <ColorPallet
          colors={colorList[0]}
          selected={0 === sel}
          width={palletWidth}
          index={0}
          callback={() => setColorPallet(colorList[0], 0)}
        />
        <ColorPallet
          colors={colorList[1]}
          selected={1 === sel}
          width={palletWidth}
          index={1}
          callback={() => setColorPallet(colorList[1], 1)}
        />
      </View>
      <View style={{ margin: 8 }}>
        <Button text="Sign Out" onPressAction={() => signOutUser()} />
      </View>
    </KeyboardAvoidingScrollView>
  )
}

const ColorPallet = (props) => {
  return (
    <TouchableOpacity onPress={props.callback}>
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
          justifyContent: "space-around",
        }}>
        <View style={{ justifyContent: "space-around" }}>
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
        <View style={{ justifyContent: "space-around" }}>
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
    </TouchableOpacity>
  )
}

export default Settings
