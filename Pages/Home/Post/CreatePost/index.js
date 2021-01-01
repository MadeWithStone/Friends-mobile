import React, { useState } from "react"
import {
  Alert,
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Button,
  TouchableHighlight,
  ActivityIndicator,
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import Ionicons from "@expo/vector-icons/Ionicons"
import { IconButton, MultilineInput } from "../../../../Components"
import Feather from "@expo/vector-icons/Feather"
import config from "../../../../config"
import { Button as Btn } from "react-native-elements"
import { ProgressBar, Colors } from "react-native-paper"
import { uploadImage } from "../../../../Firebase/PostFunctions"
import uuid from "react-native-uuid"
let _this = null

class CreatePost extends React.Component {
  static navigationOptions = ({ navigate, navigation }) => ({
    headerRight: (
      <Btn
        onPress={(navigation) => {
          navigation.navigate("PostStack")
        }}
        icon={
          <Feather name="plus-square" size={30} color={config.secondaryColor} />
        }
        type="clear"
      />
    ),
  })

  constructor(props) {
    super(props)

    this.state = {
      image: this.props.route.params.image,
      maxChars: 140,
      description: "",
    }
    this.dims = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    }
  }

  async componentDidMount() {
    _this = this
    /*this.props.navigation.setOptions({
      headerRight: () => (
        <Btn
          onPress={(navigation) => navigation.navigate("PostStack")}
          icon={
            <Feather
              name="plus-square"
              size={30}
              color={config.secondaryColor}
            />
          }
          type="clear"
          onPress={() => {}}
        />
      ),
    })*/
  }

  post = () => {
    alert("posting")
    console.log("posting")
  }

  onChangeText = (text) => {
    if (text.split("").length < this.state.maxChars) {
      this.setState({ description: text })
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <Image
          source={{ uri: this.state.image }}
          style={{ width: this.dims.width, height: this.dims.width }}
        />
        <Text style={{ padding: 8 }}>
          {this.state.maxChars - this.state.description.split("").length}
        </Text>
        <MultilineInput
          placeholder={"Description"}
          onChangeText={(text) => this.onChangeText(text)}
          value={this.state.description}
          style={{
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: 4,
            borderBottomWidth: 0,
          }}
        />
      </KeyboardAwareScrollView>
    )
  }
}

export default function HomeScreen({ navigation, route }) {
  const [posting, post] = useState(false)
  let [image, setImage] = useState(route.params.image)
  let [description, setDescription] = useState("")
  let maxChars = 140
  let dims = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }

  const onChangeText = (text) => {
    if (text.split("").length < maxChars) {
      setDescription(text)
    }
  }

  const uploadPost = async () => {
    post(true)
    let postID = uuid.v1()

    const uploadUri =
      Platform.OS === "ios"
        ? image.replace("file://", "")
        : image.replace("file:", "")
    try {
      let file = new FileReader()
      file.readAsDataURL(uploadUri)
    } catch (err) {
      console.error(err)
    }
    console.warn("image path: " + uploadUri)
    let task = uploadImage(uploadUri, postID) //wait for image to upload
    task.on("state_changed", (snapshot) => {
      console.log(
        Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
      )
    })
    try {
      await task
    } catch (e) {
      console.error(e)
    }

    //wait for data to upload
    //send back to main screen
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Btn
          onPress={() => uploadPost()}
          icon={
            <Feather
              name="plus-square"
              size={30}
              color={config.secondaryColor}
            />
          }
          type="clear"
        />
      ),
    })
  }, [navigation, post])

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <Modal animationType="fade" transparent={true} visible={posting}>
        <View style={styles.modal}>
          <View style={styles.modalTitle}>
            <Text style={styles.modalTitleText}>Posting</Text>
            <ActivityIndicator animating={true} color={config.secondaryColor} />
          </View>
          <View>
            <Text style={styles.statusText}>Uploading Image</Text>
            <ProgressBar
              color={config.primaryColor}
              progress={0.36}
              style={{ marginLeft: 8, marginRight: 8, marginBottom: 16 }}
            />
          </View>
        </View>
      </Modal>
      <Image
        source={{ uri: image }}
        style={{ width: dims.width, height: dims.width }}
      />
      <Text style={{ padding: 8 }}>
        {maxChars - description.split("").length}
      </Text>
      <MultilineInput
        placeholder={"Description"}
        onChangeText={(text) => onChangeText(text)}
        value={description}
        style={{
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 4,
          borderBottomWidth: 0,
        }}
      />
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    marginTop: 100,
    marginBottom: 100,
    marginLeft: 50,
    marginRight: 50,
    backgroundColor: config.secondaryColor,
    borderRadius: 15,
  },
  modalTitle: {
    backgroundColor: config.primaryColor,
    padding: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  modalTitleText: {
    color: config.secondaryColor,
    fontSize: 17,
    textAlign: "center",
    paddingRight: 4,
  },
  statusText: {
    padding: 16,
    textAlign: "center",
    color: config.textColor,
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
