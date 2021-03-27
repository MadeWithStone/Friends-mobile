import React, { useEffect, useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native"
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { set } from "react-native-reanimated"
import { Button as Btn } from "react-native-elements"
import * as SecureStore from "expo-secure-store"
import config from "../../../../config"
import { Button } from "../../../../Components"
import User from "../../../../Data/User"
import { signOut } from "../../../../Firebase/UserFunctions"

const Settings = ({ navigation, route }) => {
  const dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
  const palletWidth = dims.width / 2 - 12
  const colorList = [
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
    {
      secondaryColor: "#fff",
      primaryColor: "#89cff0",
      textColor: "#515151",
    },
    {
      secondaryColor: "#000",
      primaryColor: "#89cff0",
      textColor: "#fff",
    },
  ]
  const [sel, setSel] = useState(0)
  React.useEffect(() => {
    colorList.forEach((l, i) => {
      if (l.secondaryColor === config.secondaryColor) {
        setSel(i)
      }
    })
  }, [])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Btn
          onPress={() => {
            navigation.goBack()
          }}
          icon={
            <FontAwesome5
              name="chevron-left"
              size={30}
              color={config.primaryColor}
            />
          }
          type="clear"
        />
      ),
    })
  }, [navigation])

  const setColorPallet = (colors, idx) => {
    setSel(idx)
    config.configData = colors
    config.save()
    config.changed()
    navigation.goBack()
  }
  const signOutUser = async () => {
    console.log("signing out")
    User.data = null
    console.log("deleted userdata")
    await SecureStore.deleteItemAsync("currentAuth")
    User.auth = null
    console.log("deleted authdata")
    await SecureStore.deleteItemAsync("credentials")
    await signOut()
    console.log("signed out")
    navigation.navigate("SignIn")
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
          selected={sel === 0}
          width={palletWidth}
          index={0}
          callback={() => setColorPallet(colorList[0], 0)}
        />
        <ColorPallet
          colors={colorList[1]}
          selected={sel === 1}
          width={palletWidth}
          index={1}
          callback={() => setColorPallet(colorList[1], 1)}
        />
        <ColorPallet
          colors={colorList[2]}
          selected={sel === 2}
          width={palletWidth}
          index={2}
          callback={() => setColorPallet(colorList[2], 2)}
        />
        <ColorPallet
          colors={colorList[3]}
          selected={sel === 3}
          width={palletWidth}
          index={3}
          callback={() => setColorPallet(colorList[3], 3)}
        />
      </View>
      <View style={{ margin: 8 }}>
        <Button text="Sign Out" onPressAction={() => signOutUser()} />
      </View>
    </KeyboardAvoidingScrollView>
  )
}

const ColorPallet = (props) => (
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

export default Settings
