const OptionsModal = (props) => {
  const reportOptions = props.reportOptions

  return (
    <Modal visible={props.showChooser} animationType="fade" transparent={true}>
      <View style={{ justifyContent: "flex-end", height: 100 + "%" }}>
        <View style={{ marginBottom: 100 }}>
          <View
            style={{
              margin: 8,
              borderRadius: 15,
            }}>
            {reportOptions.map((option, index) => {
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={1}
                  onPress={() => {
                    props.reportAction(index)
                  }}
                  style={{
                    ...styles.buttonContainer,
                    borderRadius: 0,
                    borderbottomColor: config.secondaryColor,

                    backgroundColor: config.primaryColor,
                    borderBottomWidth:
                      index != reportOptions.length - 1
                        ? StyleSheet.hairlineWidth
                        : 0,
                    borderBottomLeftRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderBottomRightRadius:
                      index == reportOptions.length - 1 ? 10 : 0,
                    borderTopLeftRadius: index == 0 ? 10 : 0,
                    borderTopRightRadius: index == 0 ? 10 : 0,
                  }}>
                  <Text
                    style={{ ...styles.button, color: config.secondaryColor }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setShowChooser(false)}
            style={{
              ...styles.buttonContainer,
              backgroundColor: config.primaryColor,
              margin: 8,
            }}>
            <Text style={{ ...styles.button, color: config.secondaryColor }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  button: {
    fontSize: 20,
    padding: 8,
    textAlign: "center",
  },
  buttonContainer: {
    borderRadius: 10,
  },
})

export { OptionsModal }
