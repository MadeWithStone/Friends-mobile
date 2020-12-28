import React from "react"
import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import Ionicons from "@expo/vector-icons/Ionicons"
import { IconButton } from "../../../../Components"
import config from "../../../../config"

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      image: this.props.route.params.image,
    }
    this.dims = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    }
  }

  async componentDidMount() {}

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: this.state.image }}
          style={{ width: this.dims.width, height: this.dims.width }}
          height={this.dims.width}
          width={this.dims.width}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "center",
    margin: 20,
    justifyContent: "space-around",
    width: 100 + "%",
  },
  button: {
    //flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
    width: 60,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  round: {
    width: 70,
    height: 70,
    backgroundColor: "#ffffff",
    borderRadius: 35,
  },
  library: {
    width: 60,
    height: 60,
  },
  finder: {},
})
