import React from "react"
import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import Ionicons from "@expo/vector-icons/Ionicons"
import { IconButton } from "../../../Components"
import config from "../../../config"

export default class Post extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasPermission: false,
      type: Camera.Constants.Type.back,
    }
    this.dims = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    }
  }

  async componentDidMount() {
    const { status } = await Camera.requestPermissionsAsync()
    this.setState({ hasPermission: status === "granted" })
  }

  snap = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Camera
          style={styles.camera}
          type={this.state.type}
          ref={(ref) => {
            this.camera = ref
          }}>
          <View
            style={{
              width: this.dims.width - 16,
              height: this.dims.width - 16,
              borderColor: config.primaryColor,
              borderWidth: 2,
              marginTop: 50 + "%",
              marginBottom: "auto",
              margin: 8,
              borderRadius: 5,
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity>
              <Image
                style={styles.library}
                source={{
                  uri:
                    "https://www.nationalgeographic.com/content/dam/photography/photos/000/000/6.ngsversion.1467942028599.adapt.1900.1.jpg",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.round} onPress={this.snap}/>
            <IconButton
              style={styles.button}
              onPressAction={() => {
                this.setState({
                  type:
                    this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                })
              }}
              icon={
                <Ionicons
                  name="camera-reverse-outline"
                  size={45}
                  color={config.primaryColor}
                />
              }
            />
          </View>
        </Camera>
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
