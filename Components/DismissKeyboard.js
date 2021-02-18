import React from "react"
import { TouchableWithoutFeedback, Keyboard, View } from "react-native"

/**
 * touchable without feedback that dismisses the keyboard
 *
 * @memberof Components
 * @prop {object} properties
 * @prop {component} children
 */
const DismissKeyboardHOC = (Comp) => {
  return ({ children, ...props }) => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Comp {...props}>{children}</Comp>
    </TouchableWithoutFeedback>
  )
}
const DismissKeyboardView = DismissKeyboardHOC(View)
export default DismissKeyboardView
